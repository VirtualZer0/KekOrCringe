<script setup lang="ts">
import type { AlertDialogActionProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { inject } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { AlertDialogAction } from 'reka-ui';
import { cn } from '@/lib/utils';

type Tone = 'c1' | 'c2' | 'c3' | 'c4' | 'c5';

const props = defineProps<
  AlertDialogActionProps & { class?: HTMLAttributes['class'] }
>();

const tone = inject<Tone>('alert-dialog-tone', 'c5');

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogAction
    data-slot="alert-dialog-action"
    :data-tone="tone"
    v-bind="delegatedProps"
    :class="cn('chunky-dialog-btn chunky-dialog-action', props.class)"
  >
    <slot />
  </AlertDialogAction>
</template>

<style scoped>
.chunky-dialog-btn {
  flex: 1 1 0;
  min-width: 0;
  height: 56px;
  padding: 0 24px;
  border-radius: 999px;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 18px;
  letter-spacing: 0.01em;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.08s ease,
    box-shadow 0.15s ease,
    filter 0.15s ease;
}

.chunky-dialog-action {
  color: white;
  border: 3px solid var(--c1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -5px 0 rgba(0, 0, 0, 0.25),
    0 5px 12px rgba(0, 0, 0, 0.22);
}

.chunky-dialog-action[data-tone='c1'] {
  background: var(--c1);
}
.chunky-dialog-action[data-tone='c2'] {
  background: var(--c2);
}
.chunky-dialog-action[data-tone='c3'] {
  background: var(--c3);
}
.chunky-dialog-action[data-tone='c4'] {
  background: var(--c4);
}
.chunky-dialog-action[data-tone='c5'] {
  background: var(--c5);
}

.chunky-dialog-action:hover {
  filter: brightness(0.94);
}

.chunky-dialog-action:active {
  transform: translateY(2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.25),
    0 2px 6px rgba(0, 0, 0, 0.22);
}

.chunky-dialog-action:focus-visible {
  outline: 2px solid var(--c1);
  outline-offset: 3px;
}
</style>
