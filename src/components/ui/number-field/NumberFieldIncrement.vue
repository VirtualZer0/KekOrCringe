<script setup lang="ts">
import type { NumberFieldIncrementProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Plus } from 'lucide-vue-next';
import { NumberFieldIncrement, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  NumberFieldIncrementProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <NumberFieldIncrement
    data-slot="increment"
    v-bind="forwarded"
    :class="
      cn(
        'absolute top-1/2 -translate-y-1/2 right-0 flex h-full items-center justify-center px-4 cursor-pointer text-c1 outline-none transition-transform',
        'active:scale-90',
        'disabled:cursor-not-allowed disabled:opacity-30',
        props.class,
      )
    "
  >
    <slot>
      <Plus class="size-5 stroke-[3]" />
    </slot>
  </NumberFieldIncrement>
</template>
