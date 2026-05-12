<template>
  <Sheet
    :open="props.visible"
    @update:open="!$event && emits('close')"
  >
    <SheetContent
      side="right"
      class="w-[25vw] min-w-[460px] sm:max-w-none p-4"
    >
      <SheetHeader class="px-0 pt-0">
        <SheetTitle>{{ $t('videoQueue') }}</SheetTitle>
        <SheetDescription class="sr-only">
          {{ $t('videoQueue') }}
        </SheetDescription>
      </SheetHeader>
      <div class="queue-list">
        <div
          v-for="video in props.queue"
          :key="video.id"
          class="queue-item"
          :class="{
            current: video.id == props.currentPlaying,
          }"
        >
          <Button
            variant="destructive"
            size="icon"
            class="remove size-8"
            @click="emits('remove', video.id)"
          >
            <Trash2 />
          </Button>
          <img
            :src="video.preview"
            :alt="video.title"
          />
          <div class="right">
            <div class="title">{{ video.title }}</div>
            <div class="stats">
              <div class="stat">
                <Eye class="size-4" /> {{ video.viewCount }}
              </div>
              <div class="stat">
                <Clock class="size-4" />
                {{
                  new Date(video.duration * 1000)
                    .toISOString()
                    .substring(14, 19)
                }}
              </div>
              <div class="stat">
                <User class="size-4" />
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
    </SheetContent>
  </Sheet>
</template>
<script lang="ts" setup>
import { IVideoData } from '@/utils/YTUtils';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Trash2, Eye, Clock, User } from 'lucide-vue-next';
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
<style scoped>
.queue-list {
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
