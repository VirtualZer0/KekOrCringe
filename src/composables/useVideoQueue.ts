import { ref } from 'vue';
import type { IVideoData } from '@/utils/videoSources/types';

const STORAGE_KEY = 'videoList';

const loadInitial = (): Record<string, IVideoData> => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {};
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {};
  }
  const result: Record<string, IVideoData> = {};
  for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as Partial<IVideoData>;
    if (typeof v.id !== 'string') continue;
    if (!v.platform) v.platform = 'youtube';
    result[id] = v as IVideoData;
  }
  return result;
};

export const useVideoQueue = () => {
  const videoList = ref<Record<string, IVideoData>>(loadInitial());

  const persist = () => {
    try {
      localStorage[STORAGE_KEY] = JSON.stringify(videoList.value);
    } catch (e) {
      console.error('Failed to persist video queue', e);
    }
  };

  const add = (video: IVideoData) => {
    videoList.value[video.id] = video;
    persist();
  };

  const remove = (id: string) => {
    delete videoList.value[id];
    persist();
  };

  const updateDuration = (id: string, duration: number) => {
    if (videoList.value[id]) {
      videoList.value[id].duration = duration;
      persist();
    }
  };

  const clear = () => {
    videoList.value = {};
    persist();
  };

  return { videoList, add, remove, updateDuration, clear };
};
