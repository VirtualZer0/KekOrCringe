<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="alert-dialog-footer"
    :class="cn('flex items-stretch justify-center gap-4 mt-1', props.class)"
  >
    <slot />
  </div>
</template>
