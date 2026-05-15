import { containsBadWord } from './badWords';
import type {
  IFetchMetadataOptions,
  IVideoDataResult,
  IVideoSourceAdapter,
} from './types';

const hostRegex =
  /^https?:\/\/((?:www\.|m\.)?tiktok\.com|(?:vm|vt)\.tiktok\.com)\//i;

const shortlinkHostRegex =
  /^https?:\/\/(?:(?:vm|vt)\.tiktok\.com\/|(?:www\.)?tiktok\.com\/t\/)/i;

const shortlinkCache = new Map<string, string>();

const PROXY_TIMEOUT_MS = 4000;

const isTikTokHostname = (hostname: string): boolean =>
  /^(?:(?:www|m|vm|vt)\.)?tiktok\.com$/i.test(hostname);

const buildCanonicalUrl = (
  id: string,
  username?: string,
  kind: 'video' | 'photo' = 'video',
): string =>
  username
    ? `https://www.tiktok.com/${username}/${kind}/${id}`
    : `https://www.tiktok.com/share/video/${id}`;

const extractCanonical = (
  rawUrl: string,
): { id: string; canonical: string } | null => {
  try {
    const u = new URL(rawUrl);
    if (!isTikTokHostname(u.hostname)) return null;
    const userMatch = u.pathname.match(/^\/(@[^/]+)\/(video|photo)\/(\d+)/);
    if (userMatch) {
      return {
        id: userMatch[3],
        canonical: buildCanonicalUrl(
          userMatch[3],
          userMatch[1],
          userMatch[2] as 'video' | 'photo',
        ),
      };
    }
    const shareMatch = u.pathname.match(/^\/share\/video\/(\d+)/);
    if (shareMatch) {
      return { id: shareMatch[1], canonical: buildCanonicalUrl(shareMatch[1]) };
    }
    return null;
  } catch {
    return null;
  }
};

const fetchWithTimeout = async <T>(
  url: string,
  ms: number,
  read: (r: Response) => Promise<T | null>,
): Promise<T | null> => {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), ms);
  try {
    const r = await fetch(url, { signal: ac.signal });
    if (!r.ok) return null;
    return await read(r);
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

const extractCanonicalFromHtml = (html: string): string | null => {
  const og = html.match(
    /<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i,
  );
  if (og?.[1]) {
    const extracted = extractCanonical(og[1]);
    if (extracted) return extracted.canonical;
  }
  const userVideoMatch = html.match(
    /https?:\/\/(?:www\.|m\.)?tiktok\.com\/(@[^/"<>\s)]+)\/(video|photo)\/(\d{10,})/,
  );
  if (userVideoMatch) {
    return buildCanonicalUrl(
      userVideoMatch[3],
      userVideoMatch[1],
      userVideoMatch[2] as 'video' | 'photo',
    );
  }
  const idOnly = html.match(
    /tiktok\.com\/(?:@[^/"<>\s]+\/)?(?:video|photo|share\/video)\/(\d{10,})/,
  );
  if (idOnly) {
    return buildCanonicalUrl(idOnly[1]);
  }
  return null;
};

type Resolver = (shortUrl: string) => Promise<string | null>;

const resolveViaAllOrigins: Resolver = (shortUrl) =>
  fetchWithTimeout(
    `https://api.allorigins.win/get?url=${encodeURIComponent(shortUrl)}`,
    PROXY_TIMEOUT_MS,
    async (r) => {
      const data = await r.json();
      const finalUrl = data?.status?.url;
      if (typeof finalUrl === 'string') {
        const extracted = extractCanonical(finalUrl);
        if (extracted) return extracted.canonical;
      }
      if (typeof data?.contents === 'string') {
        return extractCanonicalFromHtml(data.contents);
      }
      return null;
    },
  );

const resolveViaCorsproxyIo: Resolver = (shortUrl) =>
  fetchWithTimeout(
    `https://corsproxy.io/?url=${encodeURIComponent(shortUrl)}`,
    PROXY_TIMEOUT_MS,
    async (r) => extractCanonicalFromHtml(await r.text()),
  );

const resolveViaCodetabs: Resolver = (shortUrl) =>
  fetchWithTimeout(
    `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(shortUrl)}`,
    PROXY_TIMEOUT_MS,
    async (r) => extractCanonicalFromHtml(await r.text()),
  );

const resolveViaCorsLol: Resolver = (shortUrl) =>
  fetchWithTimeout(
    `https://api.cors.lol/?url=${encodeURIComponent(shortUrl)}`,
    PROXY_TIMEOUT_MS,
    async (r) => extractCanonicalFromHtml(await r.text()),
  );

const resolvers: Resolver[] = [
  resolveViaAllOrigins,
  resolveViaCorsproxyIo,
  resolveViaCodetabs,
  resolveViaCorsLol,
];

const resolveShortlink = async (shortUrl: string): Promise<string | null> => {
  const cached = shortlinkCache.get(shortUrl);
  if (cached) return cached;

  for (const resolver of resolvers) {
    try {
      const canonical = await resolver(shortUrl);
      if (canonical) {
        shortlinkCache.set(shortUrl, canonical);
        return canonical;
      }
    } catch {
      // try next resolver
    }
  }
  return null;
};

const oembedBackoffsMs = [0, 500, 1500, 3000];

interface OembedResponse {
  title?: string;
  thumbnail_url?: string;
  author_name?: string;
}

const fetchOembed = async (
  canonicalUrl: string,
): Promise<OembedResponse | null> => {
  for (const delay of oembedBackoffsMs) {
    if (delay) await new Promise((r) => setTimeout(r, delay));
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), PROXY_TIMEOUT_MS);
    try {
      const r = await fetch(
        `https://www.tiktok.com/oembed?url=${encodeURIComponent(canonicalUrl)}`,
        { signal: ac.signal },
      );
      if (r.ok) return (await r.json()) as OembedResponse;
      if (r.status >= 400 && r.status < 500 && r.status !== 429) return null;
    } catch {
      // retry
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
};

const fetchMetadata = async (
  url: string,
  user: string,
  options: IFetchMetadataOptions,
): Promise<IVideoDataResult> => {
  let id: string | null = null;
  let canonicalUrl: string | null = null;

  const direct = extractCanonical(url);
  if (direct) {
    id = direct.id;
    canonicalUrl = direct.canonical;
  } else if (shortlinkHostRegex.test(url)) {
    const resolved = await resolveShortlink(url);
    if (!resolved) return { err: 'invalidUrl' };
    const extracted = extractCanonical(resolved);
    if (!extracted) return { err: 'invalidUrl' };
    id = extracted.id;
    canonicalUrl = extracted.canonical;
  }

  if (!id || !canonicalUrl) return { err: 'invalidUrl' };

  const oembed = await fetchOembed(canonicalUrl);
  if (!oembed) return { err: 'apiError' };

  const title = oembed.title ?? '';
  if (!options.bypassChecks && options.filterBadwords) {
    if (containsBadWord(title)) {
      return { err: 'badWords' };
    }
  }

  return {
    video: {
      id,
      platform: 'tiktok',
      user,
      title,
      viewCount: 0,
      publishedAt: 0,
      preview: oembed.thumbnail_url ?? '',
      duration: 0,
      restricted: false,
    },
  };
};

const buildEmbedSrc = (id: string): string =>
  `https://www.tiktok.com/player/v1/${id}`;

// Synchronously extracts a TikTok video id from a direct URL. Returns null
// for shortlinks (vm/vt.tiktok.com, tiktok.com/t/...) since those require
// network resolution to canonicalize.
const extractIdSync = (url: string): string | null => {
  const direct = extractCanonical(url);
  return direct ? direct.id : null;
};

export const tiktokAdapter: IVideoSourceAdapter = {
  platform: 'tiktok',
  hostRegex,
  extractId: extractIdSync,
  fetchMetadata,
  buildEmbedSrc,
};
