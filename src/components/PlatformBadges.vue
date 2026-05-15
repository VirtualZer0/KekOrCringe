<template>
  <span class="platform-badges">
    <span
      v-for="p in platforms"
      :key="p"
      class="platform-badge"
      :class="`platform-${p}`"
    >
      {{ p === 'youtube' ? 'YouTube' : p === 'tiktok' ? 'TikTok' : 'Twitch' }}
    </span>
  </span>
</template>

<script lang="ts" setup>
import type { VideoPlatform } from '@/utils/videoSources/types';

defineProps<{ platforms: readonly VideoPlatform[] }>();
</script>

<style scoped>
.platform-badges {
  display: inline-flex;
  gap: 4px;
  margin-left: 4px;
  vertical-align: middle;
}

.platform-badge {
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 8px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 8px;
  color: white;
  line-height: 1;
  white-space: nowrap;
}

.platform-badge.platform-youtube {
  background: #ff0033;
}

.platform-badge.platform-tiktok {
  background: #111;
}

.platform-badge.platform-twitch {
  background: #9146ff;
}
</style>
