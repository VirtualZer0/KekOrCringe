<template>
  <main class="palette-std">
    <Toaster
      close-button
      position="top-right"
    />
    <PageWipe
      v-if="outAnim.enable"
      :key="`out-${outAnim.key}`"
      :emoji="outAnim.emoji"
      phase="enter"
      :is-top="outAnim.isTop"
    />
    <PageWipe
      v-if="inAnim.enable"
      :key="`in-${inAnim.key}`"
      :emoji="inAnim.emoji"
      phase="exit"
      :is-top="inAnim.isTop"
    />
    <router-view />
  </main>
</template>
<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import PageWipe from './components/PageWipe.vue';
import { Toaster } from '@/components/ui/sonner';

const ROUTE_ANIM_MS = 340;

const router = useRouter();
const inAnim = ref({
  enable: false,
  emoji: '',
  isTop: false,
  key: 0,
});

const outAnim = ref({
  enable: false,
  emoji: '',
  isTop: true,
  key: 0,
});

// Track navigation timers so a fast re-navigation supersedes the previous
// animation's pending state changes instead of letting stale timeouts fire
// against the newer route.
let beforeEachTimer: number | null = null;
let afterEachTimer: number | null = null;

router.beforeEach((to, _from, next) => {
  if (to.name == 'Main') {
    next();
    return;
  }
  const toEmoji = (to.meta.emoji as string) || '';
  outAnim.value.emoji = toEmoji;
  outAnim.value.isTop = true;
  outAnim.value.key += 1;
  outAnim.value.enable = true;
  inAnim.value.emoji = toEmoji;
  if (beforeEachTimer !== null) clearTimeout(beforeEachTimer);
  nextTick(() => {
    beforeEachTimer = window.setTimeout(() => {
      beforeEachTimer = null;
      next();
    }, ROUTE_ANIM_MS);
  });
});

router.afterEach((to) => {
  if (to.name == 'Main') return;
  // Drop the cover iris and bring the reveal iris to the top so the
  // contraction plays above the new page's chrome.
  outAnim.value.enable = false;
  inAnim.value.isTop = true;
  inAnim.value.key += 1;
  inAnim.value.enable = true;

  if (afterEachTimer !== null) clearTimeout(afterEachTimer);
  nextTick(() => {
    afterEachTimer = window.setTimeout(() => {
      afterEachTimer = null;
      inAnim.value.enable = false;
    }, ROUTE_ANIM_MS);
  });
});
</script>
<style></style>
