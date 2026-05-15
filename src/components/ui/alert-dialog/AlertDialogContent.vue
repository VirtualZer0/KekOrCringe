<script setup lang="ts">
import type { AlertDialogContentEmits, AlertDialogContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { provide } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogPortal,
  useForwardPropsEmits,
} from 'reka-ui';
import { X } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

type Tone = 'c1' | 'c2' | 'c3' | 'c4' | 'c5';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<
    AlertDialogContentProps & {
      class?: HTMLAttributes['class'];
      tone?: Tone;
      showClose?: boolean;
    }
  >(),
  {
    tone: 'c5',
    showClose: true,
  },
);
const emits = defineEmits<AlertDialogContentEmits>();

provide('alert-dialog-tone', props.tone);

const delegatedProps = reactiveOmit(props, 'class', 'tone', 'showClose');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <AlertDialogPortal>
    <AlertDialogOverlay
      data-slot="alert-dialog-overlay"
      class="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
    />
    <AlertDialogContent
      data-slot="alert-dialog-content"
      :data-tone="tone"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'chunky-dialog data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 duration-200 sm:max-w-md',
          props.class,
        )
      "
    >
      <div
        v-if="$slots.icon || showClose"
        class="chunky-dialog-top"
      >
        <div
          v-if="$slots.icon"
          :class="['chunky-dialog-icon', `tone-${tone}`]"
        >
          <slot name="icon" />
        </div>
        <AlertDialogCancel
          v-if="showClose"
          class="chunky-dialog-close"
          aria-label="Close"
        >
          <X class="size-5" />
        </AlertDialogCancel>
      </div>
      <slot />
    </AlertDialogContent>
  </AlertDialogPortal>
</template>

<style scoped>
.chunky-dialog {
  background: var(--c-surface);
  border: 3px solid var(--c1);
  border-radius: 28px;
  padding: 22px 28px 28px;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.45),
    0 8px 0 var(--c1),
    0 18px 28px rgba(0, 0, 0, 0.35);
  color: var(--c1);
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.chunky-dialog-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  min-height: 58px;
}

.chunky-dialog-icon {
  flex-shrink: 0;
  width: 58px;
  height: 58px;
  border-radius: 16px;
  border: 3px solid var(--c1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow:
    inset 0 2px 0 rgba(255, 255, 255, 0.35),
    inset 0 -3px 0 rgba(0, 0, 0, 0.18),
    0 4px 0 var(--c1),
    0 8px 10px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}

.chunky-dialog-icon.tone-c1 {
  background: var(--c1);
}
.chunky-dialog-icon.tone-c2 {
  background: var(--c2);
}
.chunky-dialog-icon.tone-c3 {
  background: var(--c3);
}
.chunky-dialog-icon.tone-c4 {
  background: var(--c4);
}
.chunky-dialog-icon.tone-c5 {
  background: var(--c5);
}

.chunky-dialog-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: transparent;
  color: var(--c1);
  cursor: pointer;
  margin-left: auto;
  transition: background 0.15s ease;
  border: none;
  padding: 0;
}

.chunky-dialog-close:hover {
  background: rgba(0, 0, 0, 0.08);
}

.chunky-dialog-close:focus-visible {
  outline: 2px solid var(--c1);
  outline-offset: 2px;
}
</style>
