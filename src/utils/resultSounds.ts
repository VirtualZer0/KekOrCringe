import { Howl } from 'howler';
import { useStore } from '@/store';

const SOUND_KEYS = [
  'kek',
  'strongKek',
  'cringe',
  'strongCringe',
  'neutral',
  'custom',
  'strongCustom',
] as const;

export type ResultSoundKey = (typeof SOUND_KEYS)[number];

const VOLUME = 0.2;

const sounds = SOUND_KEYS.reduce(
  (acc, key) => {
    acc[key] = new Howl({
      src: [`${import.meta.env.BASE_URL}sfx/${key}.wav`],
      volume: VOLUME,
      preload: true,
    });
    return acc;
  },
  {} as Record<ResultSoundKey, Howl>,
);

let activeKey: ResultSoundKey | null = null;

export const playResultSound = (key: ResultSoundKey) => {
  if (useStore().sfxMuted) return;
  if (activeKey) sounds[activeKey].stop();
  sounds[key].stop();
  sounds[key].play();
  activeKey = key;
};

export const stopResultSound = () => {
  if (activeKey) {
    sounds[activeKey].stop();
    activeKey = null;
  }
};

export const setSfxMuted = (muted: boolean) => {
  const store = useStore();
  store.sfxMuted = muted;
  store.save();
  if (muted) stopResultSound();
};
