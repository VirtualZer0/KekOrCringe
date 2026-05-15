import type { IVideoData } from './YTUtils';

export interface StatisticsVideo extends IVideoData {
  percent: number;
  voteCount: number;
}

export const createEmptyStatBlock = () => ({
  mostCringeVideo: null as StatisticsVideo | null,
  mostKekVideo: null as StatisticsVideo | null,
  mostCringeUser: null,
  mostKekUser: null,
  allCringeCount: 0,
  allKekCount: 0,
  allVideos: 0,
});

const normalizeBlock = (block: any) => ({
  ...createEmptyStatBlock(),
  ...(block && typeof block === 'object' ? block : {}),
});

export const getStatistics = (clearCurrent = true) => {
  const raw = localStorage.getItem('statistics');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      return {
        allTime: normalizeBlock(parsed?.allTime),
        current: clearCurrent
          ? createEmptyStatBlock()
          : normalizeBlock(parsed?.current),
      };
    } catch {
      // Fall through and rebuild a clean statistics object
    }
  }

  const statistics = {
    allTime: createEmptyStatBlock(),
    current: createEmptyStatBlock(),
  };

  localStorage.setItem('statistics', JSON.stringify(statistics));
  return statistics;
};
