const createEmptyStatBlock = () => ({
  mostCringeVideo: null,
  mostKekVideo: null,
  mostCringeUser: null,
  mostKekUser: null,
  allCringeCount: 0,
  allKekCount: 0,
  allVideos: 0,
});

export const getStatistics = (clearCurrent = true) => {
  if (localStorage.getItem('statistics')) {
    const stats = JSON.parse(localStorage.getItem('statistics') as string);
    if (clearCurrent) {
      stats.current = createEmptyStatBlock();
    }
    return stats;
  } else {
    const statistics = {
      allTime: {
        mostCringeVideo: null,
        mostKekVideo: null,
        allCringeCount: 0,
        allKekCount: 0,
        allVideos: 0,
      },
      current: {
        mostCringeVideo: null,
        mostKekVideo: null,
        mostCringeUser: null,
        mostKekUser: null,
        allCringeCount: 0,
        allKekCount: 0,
        allVideos: 0,
      },
    };

    localStorage.setItem('statistics', JSON.stringify(statistics));
    return statistics;
  }
};
