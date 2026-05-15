<template>
  <main class="palette-std">
    <Toaster
      close-button
      position="top-right"
    />
    <CircleAnim
      v-show="outAnim.enable"
      v-bind="outAnim"
    />
    <CircleAnim
      v-show="inAnim.enable"
      v-bind="inAnim"
    />
    <router-view />
  </main>
</template>
<script lang="ts" setup>
import { nextTick, ref } from 'vue';
import { useRouter } from 'vue-router';
import CircleAnim from './components/CircleAnim.vue';
import { Toaster } from '@/components/ui/sonner';

const ROUTE_ANIM_MS = 210;
const DEFAULT_ANIM_COLOR = '#e9c46a';

const router = useRouter();
const inAnim = ref({
  enable: false,
  color: '#264653',
  isTop: false,
});

const outAnim = ref({
  enable: false,
  color: '#e76f51',
  isTop: true,
});

// Track navigation timers so a fast re-navigation supersedes the previous
// animation's pending state changes instead of letting stale timeouts fire
// against the newer route.
let beforeEachTimer: number | null = null;
let afterEachTimer: number | null = null;

router.beforeEach((to, from, next) => {
  if (to.name == 'Main') {
    next();
    return;
  }
  outAnim.value.color = (from.meta.color as string) || DEFAULT_ANIM_COLOR;
  outAnim.value.isTop = true;
  outAnim.value.enable = true;
  inAnim.value.color = (to.meta.color as string) || DEFAULT_ANIM_COLOR;
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
  outAnim.value.isTop = false;
  inAnim.value.enable = true;
  document.body.style.backgroundColor =
    (to.meta.color as string) || DEFAULT_ANIM_COLOR;

  if (afterEachTimer !== null) clearTimeout(afterEachTimer);
  nextTick(() => {
    afterEachTimer = window.setTimeout(() => {
      afterEachTimer = null;
      outAnim.value.enable = false;
      inAnim.value.enable = false;
    }, ROUTE_ANIM_MS);
  });
});
</script>
<style></style>
