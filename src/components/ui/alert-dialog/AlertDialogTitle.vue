<script setup lang="ts">
import type { AlertDialogTitleProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { AlertDialogTitle } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  AlertDialogTitleProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <AlertDialogTitle
    data-slot="alert-dialog-title"
    v-bind="delegatedProps"
    :class="cn('chunky-dialog-title', props.class)"
  >
    <slot />
  </AlertDialogTitle>
</template>

<style scoped>
.chunky-dialog-title {
  margin: 0;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 28px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: var(--c1);
  line-height: 1.1;
  text-align: center;
}
</style>
