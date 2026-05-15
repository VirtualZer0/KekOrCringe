<template>
  <div
    class="page-wipe"
    :class="`phase-${phase}`"
    :style="{ zIndex: isTop ? 10000 : 2 }"
    aria-hidden="true"
  >
    <div class="iris" />
    <div
      v-if="emoji"
      class="tile"
    >
      <span class="tile-emoji">{{ emoji }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue';

defineProps({
  phase: {
    type: String as PropType<'enter' | 'exit'>,
    default: 'enter',
  },
  isTop: { type: Boolean, default: false },
  emoji: { type: String, default: '' },
});
</script>

<style scoped>
.page-wipe {
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  contain: strict;
}

/* The iris is a single orange stage that masks the page-swap moment.
   Using one fixed color across both phases removes the FROM→TO color
   strobe the previous design produced. The brand orange ties the iris
   to the corner-stripe decoration the static pages use. */
.iris {
  position: absolute;
  inset: 0;
  background: var(--c4);
  will-change: clip-path;
}

.phase-enter .iris {
  animation: iris-open 0.34s cubic-bezier(0.32, 0, 0.18, 1) both;
}

.phase-exit .iris {
  animation: iris-close 0.34s cubic-bezier(0.55, 0, 0.65, 1) both;
}

@keyframes iris-open {
  from {
    clip-path: circle(0% at 50% 50%);
  }
  to {
    clip-path: circle(150% at 50% 50%);
  }
}

@keyframes iris-close {
  from {
    clip-path: circle(150% at 50% 50%);
  }
  to {
    clip-path: circle(0% at 50% 50%);
  }
}

/* Stamp tile — chunky rounded badge holding the destination emoji.
   Single pop-in / hold / pop-out — no drop, no squash, no flash. The
   thick c1 border + cream surface gives strong contrast on the dark
   iris so the emoji is the only thing the eye tracks. */
.tile {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 22vmax;
  height: 22vmax;
  min-width: 208px;
  min-height: 208px;
  max-width: 320px;
  max-height: 320px;
  border-radius: 26%;
  background: var(--c-surface);
  border: 6px solid var(--c1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 5px 0 rgba(255, 255, 255, 0.55),
    inset 0 -8px 0 rgba(0, 0, 0, 0.18),
    0 12px 0 var(--c1),
    0 22px 32px rgba(0, 0, 0, 0.34);
  will-change: transform, opacity;
}

.phase-enter .tile {
  animation: tile-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) both;
  animation-delay: 0.08s;
}

.phase-exit .tile {
  animation: tile-out 0.2s cubic-bezier(0.5, 0, 0.75, 0) both;
  animation-delay: 0.14s;
}

@keyframes tile-in {
  0% {
    transform: translate(-50%, -50%) scale(0.3) rotate(-12deg);
    opacity: 0;
  }
  55% {
    transform: translate(-50%, -50%) scale(1.1) rotate(5deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
}

@keyframes tile-out {
  0% {
    transform: translate(-50%, -50%) scale(1) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(0.5) rotate(14deg);
    opacity: 0;
  }
}

.tile-emoji {
  font-size: 12vmax;
  line-height: 1;
  filter: drop-shadow(0 5px 3px rgba(0, 0, 0, 0.3));
  user-select: none;
}
</style>
