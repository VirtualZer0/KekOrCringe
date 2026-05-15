<template>
  <header class="page-header">
    <h1 class="page-title">{{ title }}</h1>
    <p
      v-if="tagline"
      class="page-tagline"
    >
      {{ tagline }}
    </p>
  </header>
</template>

<script lang="ts" setup>
defineProps<{
  title: string;
  tagline?: string;
}>();
</script>

<style scoped>
.page-header {
  text-align: center;
  padding-top: 40px;
  margin-bottom: 36px;
  user-select: none;
}

.page-title {
  margin: 0;
  padding: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 64px;
  letter-spacing: 0.02em;
  line-height: 1;
  text-transform: uppercase;
  color: var(--c-surface);
  -webkit-text-stroke: 3px var(--c1);
  paint-order: stroke fill;
  text-shadow:
    0 1px 0 var(--c1),
    0 2px 0 var(--c1),
    0 3px 0 var(--c1),
    0 4px 0 var(--c1),
    0 5px 0 var(--c5),
    0 6px 0 var(--c5),
    0 7px 0 var(--c5),
    0 8px 0 var(--c4),
    0 9px 0 var(--c4),
    0 10px 0 var(--c4),
    0 14px 10px rgba(0, 0, 0, 0.25);
  transform: rotate(-1deg);
  display: inline-block;
  animation: drop-in 0.5s var(--ease-drop) backwards;
  animation-delay: var(--enter-1);
}

.page-tagline {
  margin: 24px 0 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  color: var(--c1);
  animation: rise-in 0.5s ease backwards;
  animation-delay: var(--enter-3);
}
</style>
