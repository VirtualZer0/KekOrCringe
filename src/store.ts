import { defineStore } from 'pinia';

interface IVideoSettings {
  addVideoMethod: 'reward' | 'message' | 'bits';
  selectedRewardId: string | null;
  bitsCount: number;
  durationFrom: number;
  durationTo: number;
  viewCount: number;
  queueSize: number;
  banwordsFilter: boolean;
  skipCount: number;
  autoSwitch: boolean;
}

interface IVariant {
  name: string;
  words: {
    name: string;
    url?: string;
  }[];
  skipModifier: number;
  color: string;
  permanent?: boolean;
}

interface IStoreState {
  firstTime: boolean;
  channel: string;
  twitchId: string | null;
  rewardsCache: any[];
  videoSettings: IVideoSettings;
  variantsSettings: IVariant[];
  emotesCache: {
    bttv: any[];
    ffz: any[];
    stv: any[];
  };
  skipPoints: number;
}

export const useStore = defineStore('store', {
  state: (): IStoreState => ({
    firstTime: true,
    channel: '',
    twitchId: null,
    rewardsCache: [],
    videoSettings: {
      addVideoMethod: 'message',
      selectedRewardId: null,
      bitsCount: 1,
      durationFrom: 0,
      durationTo: 10,
      viewCount: 0,
      queueSize: 20,
      banwordsFilter: true,
      skipCount: 10,
      autoSwitch: true,
    },
    variantsSettings: [
      {
        name: 'kek',
        skipModifier: -1,
        words: [{ name: 'kek' }, { name: 'кек' }],
        color: '#2a9d8f',
        permanent: true,
      },
      {
        name: 'cringe',
        skipModifier: 1,
        words: [{ name: 'cringe' }, { name: 'кринж' }],
        color: '#e76f51',
        permanent: true,
      },
    ],
    emotesCache: {
      bttv: [],
      ffz: [],
      stv: [],
    },
    skipPoints: 10,
  }),

  actions: {
    setChannel(channel: string) {
      this.channel = channel;
    },

    setFirstTime(firstTime: boolean) {
      this.firstTime = firstTime;
    },

    setRewards(rewards: any[]) {
      this.rewardsCache = rewards;
    },

    setTwitchId(twitchId: string | null) {
      this.twitchId = twitchId;
    },

    setVideoSettings(videoSettings: IVideoSettings) {
      this.$patch({ videoSettings });
    },

    setVariantsSettings(variantsSettings: IVariant[]) {
      this.$patch({ variantsSettings });
    },

    setEmotes(emotes: { name: 'bttv' | 'ffz' | 'stv'; value: any[] }) {
      this.emotesCache[emotes.name] = emotes.value;
    },

    save() {
      localStorage['store'] = JSON.stringify(this.$state);
    },

    load() {
      if (localStorage['store']) {
        this.$patch(JSON.parse(localStorage['store']));
      }
    },
  },
});
