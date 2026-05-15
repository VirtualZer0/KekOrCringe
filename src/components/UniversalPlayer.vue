<template>
  <div class="universal-player">
    <youtube-video
      v-if="video.platform === 'youtube'"
      :src="src"
      autoplay
      controls
      playsinline
      @error="onError"
    />
    <tiktok-video
      v-else-if="video.platform === 'tiktok'"
      :src="src"
      autoplay
      controls
      @durationchange="onDurationChange"
      @error="onError"
    />
    <TwitchClipPlayer
      v-else
      :src="src"
      @error="onError"
    />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import type { IVideoData } from '@/utils/videoSources/types';
import { adapters } from '@/utils/videoSources';
import TwitchClipPlayer from '@/components/TwitchClipPlayer.vue';

const props = defineProps<{ video: IVideoData }>();
const emit = defineEmits<{
  durationchange: [videoId: string, seconds: number];
  error: [videoId: string];
}>();

const src = computed(() =>
  adapters[props.video.platform].buildEmbedSrc(props.video.id),
);

const onDurationChange = (e: Event) => {
  const d = (e.target as HTMLMediaElement).duration;
  if (Number.isFinite(d) && d > 0) emit('durationchange', props.video.id, d);
};

const onError = () => {
  emit('error', props.video.id);
};
</script>

<style scoped>
.universal-player {
  width: 100%;
  height: 100%;
}

.universal-player youtube-video,
.universal-player tiktok-video,
.universal-player :deep(.twitch-frame) {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
