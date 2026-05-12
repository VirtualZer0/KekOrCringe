import durationToSeconds from 'duration-to-seconds';
import { getUrlFromString } from './getUrlFromString';

// Simply encrypted youtube API key to prevent autoscrapping
const apiKey = 'Yx-IyfUymmc1!!y7uhQKvzsKjPbD5589AyS@zIA';

const badWords = [
  'nigger',
  'negr',
  'негр',
  'faggot',
  'пидр',
  'пидарас',
  'пидорас',
  'nude',
  'naked',
  'голый',
  'голая',
  'nazi',
  'breastfeeding',
  'кормление грудью',
  'грудное вскармливание',
  'lactation',
  'breast massage',
  'массаж груди',
];

export interface IVideoData {
  id: string;
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

export const getYTVideoId = (url: any): string | null => {
  if (typeof url !== 'string') return null;
  const parts = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/i);
  if (parts.length < 3) return null;
  const id = parts[2].split(/[^0-9a-z_\-]/i)[0];
  return id || null;
};

const ytHostRegex = /^https?:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i;

export const getYTLink = (msg: string): string | null => {
  const matches = getUrlFromString(msg);
  const candidates = matches != null ? matches : [msg];

  for (const candidate of candidates) {
    const link = candidate.split(' ')[0];
    if (ytHostRegex.test(link) && getYTVideoId(link)) {
      return link;
    }
  }
  return null;
};

export const getVideoStats = async (
  url: string,
  user: string,
  options: { bypassChecks?: boolean; filterBadwords: boolean }
): Promise<IVideoDataResult> => {
  const realApiKey = apiKey
    .replaceAll('@', 'a')
    .replaceAll('!', '0')
    .split('')
    .reverse()
    .join('');

  const id = getYTVideoId(url);
  if (!id) return { err: 'invalidUrl' };

  let res: any;
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&part=statistics&part=snippet&part=status&id=${id}&key=${realApiKey}`
    );
    if (!response.ok) return { err: 'apiError' };
    res = await response.json();
  } catch {
    return { err: 'apiError' };
  }

  const item = res?.items?.[0];
  if (!item) return { err: 'apiError' };

  if (!options.bypassChecks && !item.status?.embeddable)
    return { err: 'notEmbeddable' };

  if (!options.bypassChecks && options.filterBadwords) {
    const titleLower = (item.snippet?.title ?? '').toLowerCase();
    if (badWords.some((word) => titleLower.includes(word.toLowerCase()))) {
      return { err: 'badWords' };
    }
  }

  return {
    video: {
      id,
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
