<script setup lang="ts">
import type { SelectItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Check } from 'lucide-vue-next';
import {
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  useForwardProps,
} from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  SelectItemProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = reactiveOmit(props, 'class');

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex w-full cursor-pointer items-center gap-2 rounded-lg py-2 pr-8 pl-3 text-sm font-bold text-c1 outline-hidden select-none transition-colors',
        'focus:bg-[color-mix(in_oklab,var(--c4)_30%,transparent)] data-[highlighted]:bg-[color-mix(in_oklab,var(--c4)_30%,transparent)]',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        '[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4 [&_svg]:text-c1 [&_svg]:stroke-[3]',
        '*:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
        props.class,
      )
    "
  >
    <span class="absolute right-2 flex size-4 items-center justify-center">
      <SelectItemIndicator>
        <slot name="indicator-icon">
          <Check class="size-4" />
        </slot>
      </SelectItemIndicator>
    </span>

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
