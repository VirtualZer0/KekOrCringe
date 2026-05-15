<template>
  <div
    ref="wrapRef"
    :class="['float-wrap', `side-${side}`]"
    :style="{ '--mx': mx, '--my': my }"
    aria-hidden="true"
  >
    <div
      :class="[
        'float-block',
        'bevel-extrude-lg',
        `tone-${tone}`,
        `tilt-${side}`,
      ]"
      @click="spawn"
    >
      <span class="emoji">{{ emoji }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { spawnRandomParticle } from '@/utils/spawnParticle';
import { getRandItem } from '@/utils/getRandItem';
import { KEK_EMOJI, CRINGE_EMOJI } from '@/utils/emojiSets';

const props = defineProps<{
  tone: 'kek' | 'cringe';
  side: 'left' | 'right';
  emoji: string;
}>();

const wrapRef = ref<HTMLElement>();
const mx = ref(0);
const my = ref(0);
let rafId = 0;
let spawnTimers: number[] = [];

const emojiSets: Record<'kek' | 'cringe', readonly string[]> = {
  kek: KEK_EMOJI,
  cringe: CRINGE_EMOJI,
};

const spawn = () => {
  if (!wrapRef.value) return;
  const set = emojiSets[props.tone];
  for (let i = 0; i < 6; i++) {
    const id = window.setTimeout(() => {
      spawnTimers = spawnTimers.filter((t) => t !== id);
      if (!wrapRef.value) return;
      const p = spawnRandomParticle([props.tone], wrapRef.value, 1.8);
      p.innerText = getRandItem(set);
    }, i * 50);
    spawnTimers.push(id);
  }
};

const onMove = (e: MouseEvent) => {
  cancelAnimationFrame(rafId);
  rafId = requestAnimationFrame(() => {
    mx.value = e.clientX / window.innerWidth - 0.5;
    my.value = e.clientY / window.innerHeight - 0.5;
  });
};

onMounted(() => {
  window.addEventListener('mousemove', onMove, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMove);
  cancelAnimationFrame(rafId);
  spawnTimers.forEach(window.clearTimeout);
  spawnTimers = [];
});
</script>

<style scoped>
.float-wrap {
  position: absolute;
  top: 38vh;
  z-index: 2;
  pointer-events: none;
  transition: transform 0.35s cubic-bezier(0.2, 0.7, 0.2, 1);
  transform: translate(
    calc(var(--mx, 0) * var(--px, 0px)),
    calc(var(--my, 0) * var(--py, 0px))
  );
}

.float-wrap :deep(.particle) {
  pointer-events: none;
}

.side-left {
  left: 7vw;
  --px: 44px;
  --py: 28px;
}

.side-right {
  right: 7vw;
  --px: -32px;
  --py: 18px;
}

.float-block {
  width: 8.5vw;
  height: 8.5vw;
  min-width: 96px;
  min-height: 96px;
  max-width: 150px;
  max-height: 150px;
  border-radius: 26%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  will-change: transform;
  pointer-events: auto;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.tilt-left:active {
  transform: rotate(-10deg) translateY(var(--press-shift-lg)) scale(0.95);
}

.tilt-right:active {
  transform: rotate(10deg) translateY(var(--press-shift-lg)) scale(0.95);
}

.tone-kek {
  background: var(--c2);
  --bevel-color: oklch(0.42 0.084 178.84);
}

.tone-cringe {
  background: var(--c5);
  --bevel-color: oklch(0.48 0.14 36.34);
}

.tilt-left {
  transform: rotate(-10deg);
  animation: fly-in-left 0.8s var(--ease-fly) backwards;
  animation-delay: var(--enter-6);
}

.tilt-right {
  transform: rotate(10deg);
  animation: fly-in-right 0.8s var(--ease-fly) backwards;
  animation-delay: var(--enter-7);
}

.emoji {
  font-size: 4.2vw;
  line-height: 1;
  filter: drop-shadow(0 3px 2px rgba(0, 0, 0, 0.18));
}

</style>
