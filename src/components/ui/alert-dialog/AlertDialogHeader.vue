<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="alert-dialog-header"
    :class="cn('flex flex-col items-stretch gap-3 text-center', props.class)"
  >
    <slot />
  </div>
</template>
