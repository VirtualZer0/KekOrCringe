import { containsBadWord } from './badWords';
import type {
  IFetchMetadataOptions,
  IVideoDataResult,
  IVideoSourceAdapter,
} from './types';

const hostRegex = /^https?:\/\/(clips\.twitch\.tv|(?:www\.|m\.)?twitch\.tv)\//i;

const TWITCH_CLIENT_ID = 'kimne78kx3ncx6brgo4mv6wki5h1ko';

const API_TIMEOUT_MS = 8000;

const IP_HOST_RE = /^(\d{1,3}\.){3}\d{1,3}$/;

const extractSlug = (rawUrl: string): string | null => {
  try {
    const u = new URL(rawUrl);
    const host = u.hostname.toLowerCase();
    const path = u.pathname.replace(/\/+$/, '');

    if (host === 'clips.twitch.tv') {
      const m = path.match(/^\/([A-Za-z0-9_-]+)/);
      return m ? m[1] : null;
    }
    if (host === 'twitch.tv' || host === 'www.twitch.tv') {
      const m = path.match(/^\/[^/]+\/clip\/([A-Za-z0-9_-]+)/);
      return m ? m[1] : null;
    }
    if (host === 'm.twitch.tv') {
      const m = path.match(/^\/clip\/([A-Za-z0-9_-]+)/);
      return m ? m[1] : null;
    }
    return null;
  } catch {
    return null;
  }
};

interface IClipNode {
  id?: string;
  slug?: string;
  title?: string;
  durationSeconds?: number;
  viewCount?: number;
  thumbnailURL?: string;
  createdAt?: string;
  broadcaster?: { displayName?: string; login?: string } | null;
}

const query = `query GetClip($slug: ID!) {
  clip(slug: $slug) {
    id
    slug
    title
    durationSeconds
    viewCount
    thumbnailURL
    createdAt
    broadcaster { displayName login }
  }
}`;

const fetchClip = async (slug: string): Promise<IClipNode | null> => {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), API_TIMEOUT_MS);
  try {
    const r = await fetch('https://gql.twitch.tv/gql', {
      method: 'POST',
      headers: {
        'Client-Id': TWITCH_CLIENT_ID,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables: { slug } }),
      signal: ac.signal,
    });
    if (!r.ok) return null;
    const data = await r.json();
    return (data?.data?.clip as IClipNode) ?? null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const fetchMetadata = async (
  url: string,
  user: string,
  options: IFetchMetadataOptions,
): Promise<IVideoDataResult> => {
  const slug = extractSlug(url);
  if (!slug) return { err: 'invalidUrl' };

  const clip = await fetchClip(slug);
  if (!clip) return { err: 'apiError' };

  const title = clip.title ?? '';
  if (!options.bypassChecks && options.filterBadwords) {
    if (containsBadWord(title)) return { err: 'badWords' };
  }

  return {
    video: {
      id: slug,
      platform: 'twitch',
      user,
      title,
      viewCount: clip.viewCount ?? 0,
      publishedAt: clip.createdAt ? new Date(clip.createdAt).getTime() : 0,
      preview: clip.thumbnailURL ?? '',
      duration: clip.durationSeconds ?? 0,
      restricted: false,
    },
  };
};

const buildEmbedSrc = (slug: string): string => {
  const parent = window.location.hostname || 'localhost';
  if (IP_HOST_RE.test(parent)) {
    console.warn(
      `Twitch embeds may not work with IP-based hosts (parent=${parent}). Use a domain name like localhost.`,
    );
  }
  return `https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}&parent=${encodeURIComponent(parent)}&autoplay=true&muted=false`;
};

export const twitchAdapter: IVideoSourceAdapter = {
  platform: 'twitch',
  hostRegex,
  extractId: extractSlug,
  fetchMetadata,
  buildEmbedSrc,
};
