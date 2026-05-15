<template>
  <div
    class="video-result"
    :class="rootClasses"
    :style="resultStyle"
  >
    <div class="result-backdrop" />

    <div class="result-stage">
      <div class="result-rays result-rays-primary" />
      <div class="result-rays result-rays-secondary" />
      <div
        v-if="isStrong"
        class="result-rays result-rays-gold"
      />
      <div class="result-halo" />
      <div
        ref="emojiLayer"
        class="result-emoji-layer"
      />
      <div class="result-text">
        <div
          v-if="strongPrefix"
          class="result-prefix"
        >
          {{ strongPrefix }}
        </div>
        <div class="result-main">{{ mainText }}</div>
        <div
          v-if="comboVisible"
          class="result-combo"
        >
          ×{{ combo }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from '@/store';
import {
  playResultSound,
  stopResultSound,
  type ResultSoundKey,
} from '@/utils/resultSounds';
import {
  KEK_EMOJI,
  CRINGE_EMOJI,
  NEUTRAL_EMOJI,
  CUSTOM_EMOJI,
} from '@/utils/emojiSets';
import { getRandItem } from '@/utils/getRandItem';

const { t } = useI18n();
const store = useStore();

const props = defineProps({
  result: {
    type: String,
    default: 'neutral',
  },
  strong: {
    type: Boolean,
    default: false,
  },
  combo: {
    type: Number,
    default: 0,
  },
});

const NEUTRAL_COLOR = '#93a8ac';

const variant = computed(() =>
  store.variantsSettings.find((v) => v.name === props.result),
);

const variantColor = computed(() => {
  if (props.result === 'neutral') return NEUTRAL_COLOR;
  return variant.value?.color ?? NEUTRAL_COLOR;
});

const isStandard = computed(
  () =>
    props.result === 'kek' ||
    props.result === 'cringe' ||
    props.result === 'neutral',
);

const isStrong = computed(() => props.strong && props.result !== 'neutral');

const comboVisible = computed(() => props.combo >= 2);

const mainText = computed(() => {
  if (isStandard.value) return t(props.result).toUpperCase();
  return (variant.value?.name ?? '').toUpperCase();
});

const strongPrefix = computed(() => {
  if (!isStrong.value) return null;
  if (props.result === 'kek') return t('kekPrefix');
  if (props.result === 'cringe') return t('cringePrefix');
  return t('omegaPrefix');
});

const rootClasses = computed(() => ({
  'is-strong': isStrong.value,
  'is-neutral': props.result === 'neutral',
  'is-long': mainText.value.length > 7,
}));

const resultStyle = computed(() => ({
  '--variant-color': variantColor.value,
  '--variant-deep': `color-mix(in srgb, ${variantColor.value} 28%, #0c1820)`,
  '--variant-bright': `color-mix(in srgb, ${variantColor.value} 60%, white)`,
  '--variant-soft': `color-mix(in srgb, ${variantColor.value} 75%, white)`,
}));

const EMOJI_PALETTE: Record<string, readonly string[]> = {
  kek: KEK_EMOJI,
  cringe: CRINGE_EMOJI,
  neutral: NEUTRAL_EMOJI,
};
const STRONG_BONUS = ['💥', '🔥', '💯', '🎆', '⚔️', '🚀'];

const emojiPalette = computed(() => {
  const base = EMOJI_PALETTE[props.result] ?? CUSTOM_EMOJI;
  return isStrong.value ? [...base, ...STRONG_BONUS] : base;
});

const emojiLayer = ref<HTMLDivElement | null>(null);

const SPAWN_INTERVAL = 165;
const SPAWN_DURATION = 2500;
const EMOJI_LIFETIME = 1500;
const SLOTS = 16;

let spawnInterval: number | null = null;
let spawnStopTimeout: number | null = null;
const initialBurstTimeouts: number[] = [];
let slotIndex = Math.floor(Math.random() * SLOTS);

const getSoundKey = (): ResultSoundKey => {
  if (props.result === 'neutral') return 'neutral';
  let base: 'kek' | 'cringe' | 'custom';
  if (props.result === 'kek') base = 'kek';
  else if (props.result === 'cringe') base = 'cringe';
  else base = 'custom';
  if (!isStrong.value) return base;
  return `strong${base.charAt(0).toUpperCase()}${base.slice(1)}` as ResultSoundKey;
};

const spawnEmoji = () => {
  if (!emojiLayer.value) return;

  slotIndex = (slotIndex + 7 + Math.floor(Math.random() * 3)) % SLOTS;
  const baseAngle = (slotIndex / SLOTS) * 360;
  const angle = baseAngle + (Math.random() - 0.5) * 14;
  const radius = 30 + Math.random() * 18;
  const radians = (angle * Math.PI) / 180;
  const x = 50 + Math.cos(radians) * radius;
  const y = 50 + Math.sin(radians) * radius;

  const size = 52 + Math.floor(Math.random() * 32);
  const rotation = (Math.random() - 0.5) * 28;
  const drift = 18 + Math.random() * 22;

  const el = document.createElement('div');
  el.className = 'result-emoji';
  if (isStrong.value && Math.random() < 0.35) {
    el.classList.add('result-emoji-gold');
  }
  el.style.left = `${x}%`;
  el.style.top = `${y}%`;
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.setProperty('--emoji-rot', `${rotation}deg`);
  el.style.setProperty('--emoji-drift', `${drift}px`);

  const glyph = document.createElement('span');
  glyph.className = 'result-emoji-glyph';
  glyph.style.fontSize = `${Math.floor(size * 0.55)}px`;
  glyph.textContent = getRandItem(emojiPalette.value);
  el.appendChild(glyph);

  emojiLayer.value.appendChild(el);
  window.setTimeout(() => el.remove(), EMOJI_LIFETIME + 80);
};

onMounted(() => {
  for (let i = 0; i < 3; i++) {
    initialBurstTimeouts.push(window.setTimeout(spawnEmoji, i * 70));
  }
  spawnInterval = window.setInterval(spawnEmoji, SPAWN_INTERVAL);
  spawnStopTimeout = window.setTimeout(() => {
    if (spawnInterval !== null) {
      window.clearInterval(spawnInterval);
      spawnInterval = null;
    }
  }, SPAWN_DURATION);

  playResultSound(getSoundKey());
});

onBeforeUnmount(() => {
  if (spawnInterval !== null) {
    window.clearInterval(spawnInterval);
    spawnInterval = null;
  }
  if (spawnStopTimeout !== null) {
    window.clearTimeout(spawnStopTimeout);
    spawnStopTimeout = null;
  }
  initialBurstTimeouts.forEach((id) => window.clearTimeout(id));
  initialBurstTimeouts.length = 0;
  if (emojiLayer.value) emojiLayer.value.replaceChildren();
  stopResultSound();
});
</script>

<style scoped>
.video-result {
  position: fixed;
  inset: 0;
  z-index: 100;
  user-select: none;
  pointer-events: none;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: var(--variant-color);
}

.result-backdrop {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at center,
    color-mix(in srgb, var(--variant-deep) 55%, transparent) 0%,
    color-mix(in srgb, var(--variant-deep) 78%, transparent) 55%,
    color-mix(in srgb, var(--variant-deep) 92%, transparent) 100%
  );
  backdrop-filter: blur(7px) saturate(1.2);
  -webkit-backdrop-filter: blur(7px) saturate(1.2);
  opacity: 0;
  animation: backdrop-fade 3.7s ease-out forwards;
}

.result-stage {
  position: relative;
  width: 88vmin;
  height: 88vmin;
  max-width: 1080px;
  max-height: 1080px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: stage-pop 3.7s var(--ease-fly) forwards;
}

.result-rays {
  position: absolute;
  inset: -28%;
  border-radius: 50%;
  mask-image: radial-gradient(
    circle,
    rgba(0, 0, 0, 1) 4%,
    rgba(0, 0, 0, 1) 16%,
    rgba(0, 0, 0, 0.9) 28%,
    rgba(0, 0, 0, 0.65) 44%,
    rgba(0, 0, 0, 0.38) 60%,
    rgba(0, 0, 0, 0.16) 76%,
    rgba(0, 0, 0, 0) 94%
  );
  -webkit-mask-image: radial-gradient(
    circle,
    rgba(0, 0, 0, 1) 4%,
    rgba(0, 0, 0, 1) 16%,
    rgba(0, 0, 0, 0.9) 28%,
    rgba(0, 0, 0, 0.65) 44%,
    rgba(0, 0, 0, 0.38) 60%,
    rgba(0, 0, 0, 0.16) 76%,
    rgba(0, 0, 0, 0) 94%
  );
  pointer-events: none;
  transform-origin: center;
}

.result-rays-primary {
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg,
    color-mix(in srgb, var(--variant-color) 75%, white) 5deg,
    color-mix(in srgb, var(--variant-color) 75%, white) 11deg,
    transparent 16deg,
    transparent 30deg
  );
  filter: brightness(1.05);
  opacity: 0;
  animation: rays-primary 3.7s ease-out forwards;
}

.result-rays-secondary {
  background: repeating-conic-gradient(
    from 6deg,
    transparent 0deg,
    color-mix(in srgb, var(--variant-color) 95%, white) 2.5deg,
    color-mix(in srgb, var(--variant-color) 95%, white) 4.5deg,
    transparent 7deg,
    transparent 30deg
  );
  filter: brightness(0.95);
  opacity: 0;
  animation: rays-secondary 3.7s ease-out forwards;
}

.result-rays-gold {
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg,
    #ffd24a 4deg,
    #ffd24a 9deg,
    transparent 13deg,
    transparent 36deg
  );
  filter: brightness(1.1);
  mix-blend-mode: screen;
  opacity: 0;
  animation: rays-gold 3.7s ease-out forwards;
}

.result-halo {
  position: absolute;
  width: 70%;
  height: 70%;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--variant-soft) 85%, transparent) 0%,
    color-mix(in srgb, var(--variant-bright) 55%, transparent) 28%,
    color-mix(in srgb, var(--variant-color) 25%, transparent) 55%,
    transparent 75%
  );
  filter: blur(2px);
  opacity: 0;
  animation: halo-fade 3.7s ease-out forwards;
}

.video-result.is-strong .result-halo {
  background: radial-gradient(
    circle,
    rgba(255, 232, 160, 0.9) 0%,
    rgba(255, 200, 90, 0.55) 22%,
    color-mix(in srgb, var(--variant-bright) 45%, transparent) 45%,
    color-mix(in srgb, var(--variant-color) 25%, transparent) 65%,
    transparent 78%
  );
}

.result-text {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25em;
  text-align: center;
  z-index: 3;
  animation: text-pop 3.7s var(--ease-drop) forwards;
}

.result-combo {
  position: absolute;
  bottom: -0.8em;
  right: -2.4em;
  display: inline-flex;
  align-items: center;
  padding: 0.3em 0.75em 0.35em;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 3.2vmin;
  letter-spacing: 0.04em;
  line-height: 1;
  color: #fff;
  background: var(--variant-color);
  border: 3px solid var(--variant-deep);
  border-radius: 999px;
  -webkit-text-stroke: 2px var(--variant-deep);
  paint-order: stroke fill;
  text-shadow:
    0 2px 0 var(--variant-deep),
    0 4px 6px rgba(0, 0, 0, 0.3);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    inset 0 -2px 0 rgba(0, 0, 0, 0.18),
    0 4px 0 var(--variant-deep),
    0 7px 12px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
  transform-origin: center;
  animation:
    combo-stamp 1.2s var(--ease-fly) forwards,
    combo-rock 1.8s ease-in-out 1.2s infinite alternate;
}

.video-result.is-strong .result-combo {
  background: linear-gradient(180deg, #ffe49b 0%, #ffc134 100%);
  color: #fff;
  -webkit-text-stroke: 2px var(--variant-deep);
  text-shadow:
    0 2px 0 var(--variant-deep),
    0 4px 6px rgba(0, 0, 0, 0.4);
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.6),
    inset 0 -2px 0 rgba(0, 0, 0, 0.18),
    0 4px 0 var(--variant-deep),
    0 7px 12px rgba(0, 0, 0, 0.45);
}

.result-prefix {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 5.5vmin;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  line-height: 1;
  color: #ffd24a;
  -webkit-text-stroke: 4px #2a1a06;
  paint-order: stroke fill;
  text-shadow:
    0 3px 0 #2a1a06,
    0 6px 0 #2a1a06,
    0 12px 18px rgba(0, 0, 0, 0.5);
  filter: drop-shadow(0 0 12px rgba(255, 210, 80, 0.95));
  animation: prefix-bounce 1.6s ease-in-out infinite alternate;
}

.result-main {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 15vmin;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  line-height: 1;
  color: var(--variant-color);
  -webkit-text-stroke: 8px var(--variant-deep);
  paint-order: stroke fill;
  text-shadow:
    0 4px 0 var(--variant-deep),
    0 8px 0 var(--variant-deep),
    0 12px 0 var(--variant-deep),
    0 24px 28px rgba(0, 0, 0, 0.45);
  filter: drop-shadow(
      0 0 10px color-mix(in srgb, var(--variant-color) 65%, transparent)
    )
    drop-shadow(
      0 0 18px color-mix(in srgb, var(--variant-color) 35%, transparent)
    );
  animation: main-pulse 1.4s ease-in-out infinite alternate;
}

.video-result.is-long .result-main {
  font-size: 11.5vmin;
}

.video-result.is-neutral .result-main {
  font-size: 12vmin;
}

.video-result.is-strong .result-main {
  filter: drop-shadow(0 0 16px rgba(255, 215, 100, 0.95))
    drop-shadow(0 0 30px rgba(255, 180, 50, 0.6))
    drop-shadow(
      0 0 8px color-mix(in srgb, var(--variant-color) 80%, transparent)
    );
}

.result-emoji-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.result-emoji-layer :deep(.result-emoji) {
  position: absolute;
  border-radius: 50%;
  background: color-mix(in srgb, var(--variant-color) 22%, var(--c-surface));
  border: 4px solid #14202c;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 3px 0 rgba(255, 255, 255, 0.55),
    inset 0 -3px 0 rgba(0, 0, 0, 0.18),
    0 6px 0 #14202c,
    0 12px 18px rgba(0, 0, 0, 0.4);
  transform: translate(-50%, -50%) rotate(var(--emoji-rot, 0deg)) scale(0.2);
  animation: emoji-pop 1.5s var(--ease-fly) forwards;
  will-change: transform, opacity;
}

.result-emoji-layer :deep(.result-emoji-gold) {
  background: color-mix(in srgb, #ffd24a 32%, var(--c-surface));
  border-color: #5a3a08;
  box-shadow:
    inset 0 3px 0 rgba(255, 255, 255, 0.6),
    inset 0 -3px 0 rgba(0, 0, 0, 0.18),
    0 6px 0 #5a3a08,
    0 12px 18px rgba(0, 0, 0, 0.4);
}

.result-emoji-layer :deep(.result-emoji-glyph) {
  line-height: 1;
  filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.25));
}

</style>
