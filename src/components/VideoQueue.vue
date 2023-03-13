<template>
  <Sidebar
    class="queue-sidebar"
    :visible="props.visible"
    @update:visible="emits('close')"
    :style="{ width: '25vw' }"
  >
    <h2>{{ $t('videoQueue') }}</h2>
    <div class="queue-list">
      <div
        class="queue-item"
        v-for="video in props.queue"
        :key="video.id"
        :class="{
          current: video.id == props.currentPlaying,
        }"
      >
        <Button
          icon="pi pi-trash"
          class="remove"
          severity="danger"
          @click="emits('remove', video.id)"
        />
        <img
          :src="video.preview"
          :alt="video.title"
        />
        <div class="right">
          <div class="title">{{ video.title }}</div>
          <div class="stats">
            <div class="stat">
              <span class="pi pi-eye" /> {{ video.viewCount }}
            </div>
            <div class="stat">
              <span class="pi pi-clock" />
              {{
                new Date(video.duration * 1000).toISOString().substring(14, 19)
              }}
            </div>
            <div class="stat">
              <span class="pi pi-user" />
              {{ video.user }}
            </div>
          </div>
        </div>
      </div>
      <div
        class="clear-all"
        @click="emits('clear')"
      >
        {{ $t('clearAllQueue') }}
      </div>
    </div>
  </Sidebar>
</template>
<script lang="ts" setup>
import { IVideoData } from '@/utils/YTUtils';
import Button from 'primevue/button';
import Sidebar from 'primevue/sidebar';
import { PropType } from 'vue';

const emits = defineEmits(['close', 'remove', 'clear']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },

  queue: {
    type: Array as PropType<IVideoData[]>,
    default: () => [],
  },

  currentPlaying: {
    type: String,
    default: '',
  },
});
</script>
<style lang="scss" scoped>
.queue-list {
  h2 {
    margin-top: 0;
    padding-top: 0;
  }

  .queue-item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 8px;
    background: var(--c1);
    width: 100%;
    color: #fff;
    border-radius: 12px;
    margin-bottom: 8px;

    .remove {
      position: absolute;
      width: 32px;
      height: 32px;
      right: 8px;
      bottom: 8px;
    }

    &.current {
      background: var(--c5);
    }

    img {
      width: 25%;
      border-radius: 12px;
    }

    .right {
      width: calc(75% - 16px);
    }

    .stats {
      display: flex;
      flex-wrap: wrap-reverse;
      gap: 6px 0;
      padding-top: 8px;
      width: 100%;
    }

    .stat {
      width: calc(50% - 8px);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .title {
      font-weight: bold;
      margin-bottom: 8px;
    }
  }

  .clear-all {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--c5);
    color: #fff;
    font-weight: bold;
    transition: filter 0.2s ease;

    &:hover {
      filter: brightness(1.1);
      cursor: pointer;
    }
  }
}
</style>
