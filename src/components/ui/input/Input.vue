<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { useVModel } from '@vueuse/core';
import { cn } from '@/lib/utils';

const props = defineProps<{
  defaultValue?: string | number;
  modelValue?: string | number;
  class?: HTMLAttributes['class'];
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string | number): void;
}>();

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <input
    v-model="modelValue"
    data-slot="input"
    :class="
      cn(
        'chunky-rim h-11 w-full min-w-0 rounded-xl border-[2.5px] border-c1 bg-white text-c1 font-semibold px-4 py-1 text-base outline-none transition-[transform,box-shadow,border-color]',
        'placeholder:text-c1/45 selection:bg-c2 selection:text-white',
        'hover:border-c1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'file:text-c1 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium',
        props.class,
      )
    "
  />
</template>
