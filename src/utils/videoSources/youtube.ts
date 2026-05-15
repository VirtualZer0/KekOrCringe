import durationToSeconds from 'duration-to-seconds';
import { containsBadWord } from './badWords';
import type {
  IFetchMetadataOptions,
  IVideoDataResult,
  IVideoSourceAdapter,
} from './types';

const apiKey = 'Yx-IyfUymmc1!!y7uhQKvzsKjPbD5589AyS@zIA';

const API_TIMEOUT_MS = 8000;

const hostRegex = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i;

const ID_RE = /^[A-Za-z0-9_-]{6,15}$/;

const extractId = (url: string): string | null => {
  if (typeof url !== 'string') return null;
  let u: URL;
  try {
    u = new URL(url);
  } catch {
    return null;
  }
  const host = u.hostname.toLowerCase().replace(/^(www|m)\./, '');
  if (host === 'youtu.be') {
    const m = u.pathname.match(/^\/([A-Za-z0-9_-]{6,15})/);
    return m && ID_RE.test(m[1]) ? m[1] : null;
  }
  if (host === 'youtube.com') {
    // Only treat watch / embed / shorts / v / vi as video pages.
    // Reject /results?v=, /channel/, etc.
    if (u.pathname === '/watch' || u.pathname === '/watch/') {
      const v = u.searchParams.get('v');
      return v && ID_RE.test(v) ? v : null;
    }
    const m = u.pathname.match(
      /^\/(?:embed|shorts|v|vi)\/([A-Za-z0-9_-]{6,15})/,
    );
    return m && ID_RE.test(m[1]) ? m[1] : null;
  }
  return null;
};

const fetchMetadata = async (
  url: string,
  user: string,
  options: IFetchMetadataOptions,
): Promise<IVideoDataResult> => {
  const realApiKey = apiKey
    .replaceAll('@', 'a')
    .replaceAll('!', '0')
    .split('')
    .reverse()
    .join('');

  const id = extractId(url);
  if (!id) return { err: 'invalidUrl' };

  let res: any;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), API_TIMEOUT_MS);
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&part=statistics&part=snippet&part=status&id=${id}&key=${realApiKey}`,
      { signal: ac.signal },
    );
    if (!response.ok) return { err: 'apiError' };
    res = await response.json();
  } catch {
    return { err: 'apiError' };
  } finally {
    clearTimeout(timer);
  }

  const item = res?.items?.[0];
  if (!item) return { err: 'apiError' };

  if (!options.bypassChecks && !item.status?.embeddable)
    return { err: 'notEmbeddable' };

  // Live streams (`live` or `upcoming`) have no fixed duration and can run
  // forever — reject so duration limits stay meaningful.
  const live = item.snippet?.liveBroadcastContent;
  if (!options.bypassChecks && live && live !== 'none') {
    return { err: 'liveStream' };
  }

  if (!options.bypassChecks && options.filterBadwords) {
    if (containsBadWord(item.snippet?.title ?? '')) {
      return { err: 'badWords' };
    }
  }

  return {
    video: {
      id,
      platform: 'youtube',
      user,
      title: item.snippet?.title ?? '',
      viewCount: parseInt(item.statistics?.viewCount) || 0,
      publishedAt: item.snippet?.publishedAt
        ? new Date(item.snippet.publishedAt).getTime()
        : 0,
      preview: item.snippet?.thumbnails?.high?.url ?? '',
      duration: item.contentDetails?.duration
        ? durationToSeconds(item.contentDetails.duration)
        : 0,
      restricted:
        item.contentDetails?.contentRating?.ytRating == 'ytAgeRestricted',
    },
  };
};

const buildEmbedSrc = (id: string): string =>
  `https://www.youtube.com/watch?v=${id}`;

export const youtubeAdapter: IVideoSourceAdapter = {
  platform: 'youtube',
  hostRegex,
  extractId,
  fetchMetadata,
  buildEmbedSrc,
};
