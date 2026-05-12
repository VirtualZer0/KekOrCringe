<template>
  <main class="palette-std">
    <Toaster
      rich-colors
      close-button
      position="bottom-right"
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

router.beforeEach((to, from, next) => {
  if (to.name == 'Main') {
    next();
    return;
  }
  outAnim.value.color = from.meta.color as string;
  outAnim.value.isTop = true;
  outAnim.value.enable = true;
  inAnim.value.color = to.meta.color as string;
  nextTick(() => {
    setTimeout(() => next(), 210);
  });
});

router.afterEach((to) => {
  if (to.name == 'Main') return;
  outAnim.value.isTop = false;
  inAnim.value.enable = true;
  document.body.style.backgroundColor = to.meta.color as string;

  nextTick(() => {
    setTimeout(() => {
      outAnim.value.enable = false;
      inAnim.value.enable = false;
    }, 210);
  });
});
</script>
<style></style>
