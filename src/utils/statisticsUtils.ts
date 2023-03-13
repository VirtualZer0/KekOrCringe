export const getStatistics = () => {
  if (localStorage.getItem('statistics')) {
    return JSON.parse(localStorage.getItem('statistics') as string);
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
