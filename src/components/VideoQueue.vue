<template>
  <Sheet
    :open="props.visible"
    @update:open="!$event && emits('close')"
  >
    <SheetContent
      side="right"
      class="queue-sheet"
    >
      <SheetHeader class="queue-header">
        <div class="header-row">
          <div class="header-icon">
            <Clapperboard class="size-7" />
          </div>
          <SheetTitle class="queue-title">{{ $t('videoQueue') }}</SheetTitle>
        </div>
        <SheetDescription class="sr-only">
          {{ $t('videoQueue') }}
        </SheetDescription>
        <div class="header-divider" />
        <div class="queue-subtitle">{{ $t('queueSubtitle') }}</div>
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
          <div class="thumbnail">
            <img
              :src="video.preview"
              :alt="video.title"
            />
            <span
              class="platform-pill"
              :class="`platform-${video.platform}`"
            >
              {{ platformLabel(video.platform) }}
            </span>
          </div>
          <div class="right">
            <div class="title">{{ video.title }}</div>
            <div class="stats">
              <div class="stat"><User class="size-4" /> {{ video.user }}</div>
              <div
                v-if="video.viewCount > 0"
                class="stat"
              >
                <Eye class="size-4" /> {{ video.viewCount }}
              </div>
              <div
                v-if="video.duration > 0"
                class="stat"
              >
                <Clock class="size-4" />
                {{ formatDuration(video.duration) }}
              </div>
            </div>
          </div>
          <div class="actions">
            <Button
              size="icon"
              class="open"
              @click="openVideo(video)"
            >
              <ExternalLink class="size-4" />
            </Button>
            <Button
              variant="destructive"
              size="icon"
              class="remove"
              @click="emits('remove', video.id)"
            >
              <Trash2 class="size-4" />
            </Button>
          </div>
        </div>
      </div>
      <Button
        variant="destructive"
        class="clear-all"
        @click="emits('clear')"
      >
        <Trash2 class="size-4" />
        {{ $t('clearAllQueue') }}
      </Button>
    </SheetContent>
  </Sheet>
</template>
<script lang="ts" setup>
import type { IVideoData, VideoPlatform } from '@/utils/videoSources/types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Trash2,
  Eye,
  Clock,
  User,
  Clapperboard,
  ExternalLink,
} from 'lucide-vue-next';
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

const platformLabel = (p: VideoPlatform): string =>
  p === 'youtube' ? 'YouTube' : p === 'tiktok' ? 'TikTok' : 'Twitch';

const pad2 = (n: number) => n.toString().padStart(2, '0');

const formatDuration = (seconds: number): string => {
  if (!isFinite(seconds) || seconds <= 0) return '00:00';
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h > 0 ? `${h}:${pad2(m)}:${pad2(s)}` : `${pad2(m)}:${pad2(s)}`;
};

const openVideo = (video: IVideoData) => {
  let url: string;
  let size: string;
  switch (video.platform) {
    case 'youtube':
      url = `https://www.youtube.com/watch?v=${video.id}`;
      size = 'width=720,height=480';
      break;
    case 'tiktok':
      url = `https://www.tiktok.com/share/video/${video.id}`;
      size = 'width=405,height=720';
      break;
    case 'twitch':
      url = `https://clips.twitch.tv/${video.id}`;
      size = 'width=720,height=480';
      break;
  }
  // Belt-and-suspenders against reverse tab-nabbing: the feature-string flags
  // are unreliable on some Safari versions, so null the opener after open too.
  const newWindow = window.open(
    url,
    '_blank',
    `noopener,noreferrer,popup,${size}`,
  );
  if (newWindow) newWindow.opener = null;
};
</script>
<style>
/* Non-scoped: SheetContent portals to document.body, losing the parent's scope attribute */
[data-slot='sheet-content'].queue-sheet {
  top: 16px;
  bottom: 16px;
  right: 16px;
  height: auto;
  width: 540px;
  max-width: none;
  padding: 22px;
  background: var(--c-surface);
  border: none;
  border-radius: 24px;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.45),
    0 8px 0 #1a1a1a,
    0 18px 26px rgba(0, 0, 0, 0.2);
  color: var(--c1);
  gap: 16px;
  overflow: hidden;
  --ring: #1a1a1a;
}

[data-slot='sheet-content'].queue-sheet,
[data-slot='sheet-content'].queue-sheet * {
  outline: none;
}

[data-slot='sheet-content'].queue-sheet > .absolute.top-4.right-4 {
  top: 20px;
  right: 20px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--c5);
  color: var(--c-surface);
  border: none;
  border-radius: 12px;
  opacity: 1;
  cursor: pointer;
  --bevel-color: color-mix(in srgb, var(--c5) 65%, black);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 3px 0 var(--bevel-color),
    0 6px 8px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.08s ease,
    box-shadow 0.15s ease;
}

[data-slot='sheet-content'].queue-sheet > .absolute.top-4.right-4:active {
  transform: translateY(2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.2),
    0 1px 0 var(--bevel-color),
    0 2px 4px rgba(0, 0, 0, 0.18);
}

[data-slot='sheet-content'].queue-sheet > .absolute.top-4.right-4 svg {
  width: 18px;
  height: 18px;
  stroke-width: 3;
}
</style>
<style scoped>
.queue-header {
  gap: 8px;
  padding: 0;

  .header-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .header-icon {
    flex-shrink: 0;
    width: 52px;
    height: 52px;
    border-radius: 14px;
    border: none;
    background: var(--c2);
    color: var(--c-surface);
    display: flex;
    align-items: center;
    justify-content: center;
    --bevel-color: #0a0a0a;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.3),
      0 4px 0 var(--bevel-color),
      0 7px 10px rgba(0, 0, 0, 0.2);
  }

  .queue-title {
    margin: 0;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 28px;
    line-height: 1;
    color: var(--c1);
  }

  .header-divider {
    height: 2px;
    background: var(--c4);
    border-radius: 999px;
    opacity: 0.85;
    margin-top: 4px;
  }

  .queue-subtitle {
    font-weight: 700;
    font-size: 15px;
    color: var(--c1);
    opacity: 0.85;
  }
}

.queue-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  flex: 1;
  padding-right: 4px;
  margin-right: -4px;

  .queue-item {
    position: relative;
    display: flex;
    align-items: stretch;
    gap: 14px;
    padding: 12px;
    background: var(--c1);
    color: var(--c-surface);
    border: none;
    border-radius: 18px;
    --bevel-color: #0a0a0a;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 4px 0 var(--bevel-color),
      0 7px 10px rgba(0, 0, 0, 0.18);

    &.current {
      background: var(--c3);
      color: var(--c1);
      border-color: transparent;
      --bevel-color: color-mix(in srgb, var(--c3) 60%, black);
    }

    .thumbnail {
      position: relative;
      width: 132px;
      flex-shrink: 0;
      align-self: center;
    }

    .thumbnail img {
      width: 100%;
      display: block;
      border-radius: 10px;
      object-fit: cover;
      border: none;
    }

    .platform-pill {
      position: absolute;
      top: 6px;
      right: 6px;
      padding: 3px 9px;
      color: #fff;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      line-height: 1;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        0 2px 0 var(--bevel-color),
        0 4px 6px rgba(0, 0, 0, 0.25);
    }

    .platform-pill.platform-youtube {
      background: #ff0033;
      --bevel-color: #99001f;
    }

    .platform-pill.platform-tiktok {
      background: #111;
      --bevel-color: #000;
    }

    .platform-pill.platform-twitch {
      background: #9146ff;
      --bevel-color: #5a1ab3;
    }

    .right {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .title {
      font-weight: 800;
      font-size: 15px;
      line-height: 1.25;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .stats {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 13px;
      font-weight: 600;
      margin-top: auto;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0.95;
    }

    .actions {
      flex-shrink: 0;
      align-self: flex-end;
      display: flex;
      gap: 8px;
    }

    .open,
    .remove {
      width: 38px;
      height: 38px;
      border-radius: 10px;
      border: none;
      color: var(--c-surface);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        0 3px 0 var(--bevel-color),
        0 5px 8px rgba(0, 0, 0, 0.2);

      &:active {
        transform: translateY(2px);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          0 1px 0 var(--bevel-color),
          0 2px 4px rgba(0, 0, 0, 0.18);
      }
    }

    .open {
      background: var(--c2);
      --bevel-color: color-mix(in srgb, var(--c2) 65%, black);
    }

    .remove {
      background: var(--c5);
      --bevel-color: color-mix(in srgb, var(--c5) 65%, black);
    }
  }
}

.clear-all {
  height: 52px;
  width: 100%;
  font-size: 18px;
  font-weight: 800;
  background: var(--c5);
  color: var(--c-surface);
  border: none;
  border-radius: 14px;
  --bevel-color: color-mix(in srgb, var(--c5) 65%, black);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.25),
    0 5px 0 var(--bevel-color),
    0 9px 14px rgba(0, 0, 0, 0.22);

  &:active {
    transform: translateY(3px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 2px 0 var(--bevel-color),
      0 4px 6px rgba(0, 0, 0, 0.18);
  }

  & :deep(svg) {
    width: 20px;
    height: 20px;
    stroke-width: 2.4;
  }
}
</style>
