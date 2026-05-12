<script setup lang="ts">
import type { SelectTriggerProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ChevronDown } from 'lucide-vue-next';
import { SelectIcon, SelectTrigger, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<
    SelectTriggerProps & {
      class?: HTMLAttributes['class'];
      size?: 'sm' | 'default';
    }
  >(),
  { size: 'default' },
);

const delegatedProps = reactiveOmit(props, 'class', 'size');
const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectTrigger
    data-slot="select-trigger"
    :data-size="size"
    v-bind="forwardedProps"
    :class="
      cn(
        'chunky-rim flex w-fit items-center justify-between gap-2 rounded-xl border-[2.5px] border-c1 bg-white px-5 text-c1 font-bold whitespace-nowrap cursor-pointer outline-none transition-[transform,box-shadow,border-color]',
        'data-[size=default]:h-11 data-[size=sm]:h-9',
        'hover:border-c1 active:translate-y-[2px] active:chunky-rim-pressed',
        'data-[placeholder]:text-c1/55',
        'disabled:cursor-not-allowed disabled:opacity-50',
        '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-5 [&_svg]:text-c1 [&_svg]:stroke-[3]',
        props.class,
      )
    "
  >
    <slot />
    <SelectIcon as-child>
      <ChevronDown class="size-5" />
    </SelectIcon>
  </SelectTrigger>
</template>
