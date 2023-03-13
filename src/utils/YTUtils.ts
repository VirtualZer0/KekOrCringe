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

export const getYTVideoId = (url: any) => {
  url = url.split(/(vi\/|v%3D|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  return undefined !== url[2] ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
};

export const getYTLink = (msg: string) => {
  const res = getUrlFromString(msg);
  if (res != null) {
    msg = res[0];
  }
  if (
    msg.startsWith('https://youtube.com') ||
    msg.startsWith('https://youtu.be/') ||
    msg.startsWith('https://www.youtu.be/') ||
    msg.startsWith('https://www.youtube.com')
  ) {
    return msg.split(' ')[0];
  } else {
    return null;
  }
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
  const res = await (
    await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&part=statistics&part=snippet&part=status&id=${id}&key=${realApiKey}`
    )
  ).json();

  if (!options.bypassChecks && !res.items[0].status.embeddable)
    return { err: 'notEmbeddable' };

  if (!options.bypassChecks && options.filterBadwords) {
    badWords.forEach((word) => {
      if (res.items[0].snippet.title.includes(word)) {
        return { err: 'badWords' };
      }
    });
  }

  return {
    video: {
      id,
      user,
      title: res.items[0].snippet.title,
      viewCount: parseInt(res.items[0].statistics.viewCount),
      publishedAt: new Date(res.items[0].snippet.publishedAt).getTime(),
      preview: res.items[0].snippet.thumbnails.high.url,
      duration: durationToSeconds(res.items[0].contentDetails.duration),
      restricted:
        res.items[0].contentDetails.contentRating?.ytRating ==
        'ytAgeRestricted',
    },
  };
};
