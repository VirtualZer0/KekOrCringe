<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { NumberFieldInput } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <NumberFieldInput
    data-slot="number-input"
    :class="
      cn(
        'chunky-rim flex h-11 w-full min-w-0 rounded-xl border-[2.5px] border-c1 bg-white text-c1 font-bold py-1 text-base text-center outline-none transition-[transform,box-shadow,border-color]',
        'hover:border-c1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  />
</template>
