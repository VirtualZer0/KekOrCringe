<script setup lang="ts">
import type { AlertDialogCancelProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { AlertDialogCancel } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  AlertDialogCancelProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogCancel
    data-slot="alert-dialog-cancel"
    v-bind="delegatedProps"
    :class="cn('chunky-dialog-btn chunky-dialog-cancel', props.class)"
  >
    <slot />
  </AlertDialogCancel>
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
    box-shadow 0.15s ease;
}

.chunky-dialog-cancel {
  background: var(--c-surface);
  color: var(--c1);
  border: 3px solid var(--c1);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    inset 0 -4px 0 rgba(0, 0, 0, 0.12),
    0 4px 8px rgba(0, 0, 0, 0.15);
}

.chunky-dialog-cancel:hover {
  background: color-mix(in oklab, var(--c-surface), var(--c1) 6%);
}

.chunky-dialog-cancel:active {
  transform: translateY(2px);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    inset 0 -2px 0 rgba(0, 0, 0, 0.12),
    0 2px 4px rgba(0, 0, 0, 0.15);
}

.chunky-dialog-cancel:focus-visible {
  outline: 2px solid var(--c1);
  outline-offset: 3px;
}
</style>
