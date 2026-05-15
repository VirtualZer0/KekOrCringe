import { getUrlFromString } from '@/utils/getUrlFromString';
import { youtubeAdapter } from './youtube';
import { tiktokAdapter } from './tiktok';
import { twitchAdapter } from './twitch';
import type {
  IFetchMetadataOptions,
  IVideoDataResult,
  IVideoSourceAdapter,
  VideoPlatform,
} from './types';

export const adapters: Record<VideoPlatform, IVideoSourceAdapter> = {
  youtube: youtubeAdapter,
  tiktok: tiktokAdapter,
  twitch: twitchAdapter,
};

export interface IVideoLinkMatch {
  url: string;
  platform: VideoPlatform;
}

export const extractVideoLink = (
  msg: string,
  enabledPlatforms: VideoPlatform[],
): IVideoLinkMatch | null => {
  const platforms =
    Array.isArray(enabledPlatforms) && enabledPlatforms.length > 0
      ? enabledPlatforms
      : (Object.keys(adapters) as VideoPlatform[]);
  const matches = getUrlFromString(msg);
  const candidates = matches != null ? matches : [msg.trim()];

  for (const candidate of candidates) {
    const link = candidate.split(/\s/)[0];
    // Normalize bare URLs (www.foo.com/x, youtu.be/x, ...) to https://...
    const normalized = /^https?:\/\//i.test(link)
      ? link
      : `https://${link.replace(/^\/+/, '')}`;
    for (const platform of platforms) {
      if (adapters[platform].hostRegex.test(normalized)) {
        return { url: normalized, platform };
      }
    }
  }
  return null;
};

export const fetchVideoMetadata = (
  url: string,
  platform: VideoPlatform,
  user: string,
  options: IFetchMetadataOptions,
): Promise<IVideoDataResult> =>
  adapters[platform].fetchMetadata(url, user, options);

// Best-effort synchronous ID extraction. Returns null when the URL needs
// network resolution first (e.g., TikTok shortlinks).
export const tryExtractVideoId = (
  url: string,
  platform: VideoPlatform,
): string | null => adapters[platform].extractId?.(url) ?? null;

export type {
  IVideoData,
  IVideoDataResult,
  IVideoSourceAdapter,
  VideoPlatform,
} from './types';
