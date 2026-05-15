<template>
  <ChunkyPanel
    :icon="icon"
    :title="title"
    :tone="tone === 'kek' ? 'c2' : 'c5'"
    :class="['video-stat-panel', `tone-${tone}`]"
    :style="{ '--enter-delay': `${delay}s` }"
  >
    <div class="stat-items">
      <article
        v-for="item in items"
        :key="item.period"
        class="stat-item"
      >
        <div class="stat-period">{{ item.label }}</div>
        <a
          v-if="item.video"
          class="stat-video"
          :href="`https://youtu.be/${item.video.id}`"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div class="stat-preview">
            <img
              class="stat-preview-img"
              :src="item.video.preview"
              alt=""
            />
            <div class="stat-badge">
              <span class="stat-count">{{ item.video.voteCount }}</span>
              <span class="stat-emoji">{{ emoji }}</span>
            </div>
          </div>
          <h3 class="stat-name">{{ item.video.title }}</h3>
        </a>
        <div
          v-else
          class="stat-empty"
        >
          <div class="stat-empty-face">😐</div>
          <div class="stat-empty-label">{{ noDataLabel }}</div>
        </div>
      </article>
    </div>
  </ChunkyPanel>
</template>

<script lang="ts" setup>
import { ChunkyPanel } from '@/components/ui/chunky-panel';
import type { StatisticsVideo } from '@/utils/statisticsUtils';

export interface VideoStatItem {
  period: 'today' | 'allTime';
  label: string;
  video?: StatisticsVideo | null;
}

withDefaults(
  defineProps<{
    tone: 'kek' | 'cringe';
    title: string;
    icon: string;
    emoji: string;
    items: VideoStatItem[];
    noDataLabel: string;
    delay?: number;
  }>(),
  { delay: 0 },
);
</script>

<style scoped>
.video-stat-panel {
  width: 65%;
  max-width: 1120px;
  margin: 0 auto 40px;
  animation: panel-rise 0.75s ease backwards;
  animation-delay: var(--enter-delay, 0s);
}

.stat-items {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.stat-period {
  display: inline-block;
  padding: 6px 22px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.04em;
  color: var(--c-surface);
  border-radius: 999px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 2px 0 rgba(0, 0, 0, 0.18);
}

.tone-kek .stat-period {
  background: var(--c2);
}

.tone-cringe .stat-period {
  background: var(--c5);
}

.stat-video {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
  text-decoration: none;
  color: inherit;
}

.stat-preview {
  position: relative;
  width: 100%;
  max-width: 100%;
  transition: transform 0.2s ease;
}

.stat-preview:hover {
  transform: scale(1.04) rotate(-1deg);
}

.stat-preview-img {
  display: block;
  width: 100%;
  max-height: 280px;
  object-fit: cover;
  border-radius: 16px;
  border: 3px solid var(--c1);
  box-shadow: 0 4px 0 var(--c1);
}

.stat-badge {
  position: absolute;
  top: -14px;
  right: -14px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--c1);
  color: var(--c-surface);
  border-radius: 18px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 24px;
  line-height: 1;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 4px 0 rgba(0, 0, 0, 0.3);
  animation: badge-pop 0.5s var(--ease-fly) backwards;
}

.stat-item:nth-child(1) .stat-badge {
  animation-delay: calc(var(--enter-delay, 0s) + 0.8s);
}

.stat-item:nth-child(2) .stat-badge {
  animation-delay: calc(var(--enter-delay, 0s) + 0.9s);
}

.stat-emoji {
  font-size: 26px;
  line-height: 1;
}

.stat-name {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
  line-height: 1.3;
  color: var(--c1);
  text-align: center;
  max-width: 100%;
  word-break: break-word;
}

.stat-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  width: 100%;
  aspect-ratio: 4 / 3;
  max-height: 280px;
  padding: 24px;
  border: 3px dashed var(--c1);
  border-radius: 16px;
  opacity: 0.55;
}

.tone-kek .stat-empty {
  border-color: var(--c2);
}

.tone-cringe .stat-empty {
  border-color: var(--c5);
}

.stat-empty-face {
  font-size: 56px;
  line-height: 1;
  filter: grayscale(0.4);
}

.stat-empty-label {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
  color: var(--c1);
  text-align: center;
}
</style>
