<script setup lang="ts">
import type { AlertDialogDescriptionProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { AlertDialogDescription } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  AlertDialogDescriptionProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <div class="chunky-dialog-description-row">
    <span
      class="chunky-dialog-dots"
      aria-hidden="true"
    />
    <AlertDialogDescription
      data-slot="alert-dialog-description"
      v-bind="delegatedProps"
      :class="cn('chunky-dialog-description', props.class)"
    >
      <slot />
    </AlertDialogDescription>
    <span
      class="chunky-dialog-dots"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.chunky-dialog-description-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.chunky-dialog-description {
  flex: 0 1 auto;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--c1);
  line-height: 1.35;
  margin: 0 auto;
  max-width: 75%;
}

.chunky-dialog-dots {
  flex: 1;
  min-width: 28px;
  height: 6px;
  background-image: radial-gradient(
    circle at center,
    var(--c4) 1.75px,
    transparent 2.25px
  );
  background-size: 9px 6px;
  background-repeat: repeat-x;
  background-position: center;
}
</style>
