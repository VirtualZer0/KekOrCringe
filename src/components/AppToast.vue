<template>
  <div :class="['app-toast', 'bevel-extrude', `tone-${type}`]">
    <div class="icon-box bevel-inset">
      <component
        :is="iconComp"
        class="size-5"
      />
    </div>
    <div class="content">
      <div class="title">{{ title }}</div>
      <div
        v-if="description"
        class="description"
      >
        {{ description }}
      </div>
    </div>
    <button
      v-if="action"
      class="action-btn bevel-inset"
      @click="onActionClick"
    >
      {{ action.label }}
    </button>
    <button
      class="close-btn"
      aria-label="Close"
      @click="onCloseToast"
    >
      <XIcon class="size-4" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  CircleCheckIcon,
  InfoIcon,
  OctagonXIcon,
  TriangleAlertIcon,
  XIcon,
} from 'lucide-vue-next';
import type { ToastTone } from '@/utils/notify';

const props = withDefaults(
  defineProps<{
    type: ToastTone;
    title: string;
    description?: string;
    action?: { label: string; onClick: () => void };
    onCloseToast?: () => void;
  }>(),
  {
    description: undefined,
    action: undefined,
    onCloseToast: undefined,
  },
);

const TONE_ICONS = {
  success: CircleCheckIcon,
  error: OctagonXIcon,
  warning: TriangleAlertIcon,
  info: InfoIcon,
};

const iconComp = computed(() => TONE_ICONS[props.type]);

const onActionClick = () => {
  props.action?.onClick();
  props.onCloseToast?.();
};
</script>

<style scoped>
.app-toast {
  --bevel-color: var(--tone-color, var(--c1));
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  background: var(--c-surface);
  border-radius: 18px;
  border: 2px solid var(--tone-color, var(--c1));
  padding: 14px 18px;
  font-family: var(--font-display);
  margin-bottom: 7px;
}

.tone-success,
.tone-info {
  --tone-color: var(--c2);
}
.tone-error {
  --tone-color: var(--c5);
}
.tone-warning {
  --tone-color: var(--c4);
}

.icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding-bottom: 4px;
  color: #fff;
  background: var(--tone-color, var(--c1));
}

.content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.title {
  color: var(--c1);
  font-weight: 700;
  font-size: 15px;
  line-height: 1.25;
}

.description {
  color: var(--c1);
  opacity: 0.7;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.action-btn {
  background: var(--tone-color, var(--c2));
  color: #fff;
  border: none;
  padding: 0 16px;
  height: 36px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 13px;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--c1);
  cursor: pointer;
  opacity: 0.5;
  flex-shrink: 0;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s ease;
}

.close-btn:hover {
  opacity: 1;
}
</style>
