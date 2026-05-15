<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    :class="
      cn(
        'relative [&>[data-slot=number-input]]:has-[[data-slot=increment]]:pr-12 [&>[data-slot=number-input]]:has-[[data-slot=decrement]]:pl-12',
        props.class,
      )
    "
  >
    <slot />
  </div>
</template>
