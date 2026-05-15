export type VideoPlatform = 'youtube' | 'tiktok' | 'twitch';

export interface IVideoData {
  id: string;
  platform: VideoPlatform;
  user: string;
  title: string;
  viewCount: number;
  publishedAt: number;
  preview: string;
  duration: number;
  restricted: boolean;
}

export interface IVideoDataResult {
  err?: string;
  video?: IVideoData;
}

export interface IFetchMetadataOptions {
  bypassChecks?: boolean;
  filterBadwords: boolean;
}

export interface IVideoSourceAdapter {
  platform: VideoPlatform;
  hostRegex: RegExp;
  // Synchronously extracts the canonical video ID from a URL when possible.
  // Returns null if the URL needs network resolution first (e.g., TikTok shortlinks).
  extractId?(url: string): string | null;
  fetchMetadata(
    url: string,
    user: string,
    options: IFetchMetadataOptions,
  ): Promise<IVideoDataResult>;
  buildEmbedSrc(id: string): string;
}
