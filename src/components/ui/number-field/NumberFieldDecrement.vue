<script setup lang="ts">
import type { NumberFieldDecrementProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Minus } from 'lucide-vue-next';
import { NumberFieldDecrement, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  NumberFieldDecrementProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <NumberFieldDecrement
    data-slot="decrement"
    v-bind="forwarded"
    :class="
      cn(
        'absolute top-1/2 -translate-y-1/2 left-0 flex h-full items-center justify-center px-4 cursor-pointer text-c1 outline-none transition-transform',
        'active:scale-90',
        'disabled:cursor-not-allowed disabled:opacity-30',
        props.class,
      )
    "
  >
    <slot>
      <Minus class="size-5 stroke-[3]" />
    </slot>
  </NumberFieldDecrement>
</template>
