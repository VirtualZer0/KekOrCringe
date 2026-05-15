<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

type Tone = 'c1' | 'c2' | 'c3' | 'c4' | 'c5';

const props = withDefaults(
  defineProps<{
    icon?: string;
    title?: string;
    tone?: Tone;
    class?: HTMLAttributes['class'];
  }>(),
  {
    tone: 'c2',
  },
);
</script>

<template>
  <section :class="cn('chunky-panel', props.class)">
    <header class="chunky-header">
      <div
        v-if="icon"
        :class="['chunky-icon', `tone-${tone}`]"
      >
        <span class="chunky-icon-emoji">{{ icon }}</span>
      </div>
      <div class="chunky-title-column">
        <div class="chunky-title-row">
          <h3
            v-if="title"
            class="chunky-title"
          >
            {{ title }}
          </h3>
          <div class="chunky-header-extra">
            <slot name="header" />
          </div>
        </div>
        <div class="chunky-divider" />
      </div>
    </header>
    <div class="chunky-content">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.chunky-panel {
  position: relative;
  background: var(--c-surface);
  border: 3px solid var(--c1);
  border-radius: 28px;
  padding: 22px 28px 28px;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.45),
    0 8px 0 var(--c1),
    0 18px 24px rgba(0, 0, 0, 0.18);
  color: var(--c1);
}

.chunky-header {
  display: flex;
  align-items: stretch;
  gap: 18px;
  margin-bottom: 22px;
}

.chunky-title-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px 0 2px;
}

.chunky-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.chunky-icon {
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  border-radius: 16px;
  border: 3px solid var(--c1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    inset 0 -3px 0 rgba(0, 0, 0, 0.18),
    0 4px 0 var(--c1),
    0 8px 10px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}

.chunky-icon.tone-c1 {
  background: var(--c1);
}
.chunky-icon.tone-c2 {
  background: var(--c2);
}
.chunky-icon.tone-c3 {
  background: var(--c3);
}
.chunky-icon.tone-c4 {
  background: var(--c4);
}
.chunky-icon.tone-c5 {
  background: var(--c5);
}

.chunky-icon-emoji {
  font-size: 30px;
  line-height: 1;
  filter: drop-shadow(0 2px 1px rgba(0, 0, 0, 0.25));
  user-select: none;
}

.chunky-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 32px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--c1);
  line-height: 1;
}

.chunky-header-extra {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.chunky-header-extra:empty {
  display: none;
}

.chunky-divider {
  height: 2px;
  background: var(--c4);
  border-radius: 999px;
  opacity: 0.85;
}

.chunky-content {
  position: relative;
}
</style>
