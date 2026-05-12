<script setup lang="ts">
import type { CheckboxRootEmits, CheckboxRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { Check } from 'lucide-vue-next';
import { CheckboxIndicator, CheckboxRoot, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

const props = defineProps<
  CheckboxRootProps & { class?: HTMLAttributes['class'] }
>();
const emits = defineEmits<CheckboxRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CheckboxRoot
    v-slot="slotProps"
    data-slot="checkbox"
    v-bind="forwarded"
    :class="
      cn(
        'chunky-rim peer size-8 shrink-0 rounded-md border-[2.5px] border-c1 bg-white text-white outline-none cursor-pointer transition-[background,transform,box-shadow,border-color]',
        'hover:border-c1',
        'active:translate-y-[2px] active:chunky-rim-pressed',
        'data-[state=checked]:bg-c2 data-[state=checked]:border-c1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    "
  >
    <CheckboxIndicator
      data-slot="checkbox-indicator"
      class="grid place-content-center text-current"
    >
      <slot v-bind="slotProps">
        <Check class="size-5 stroke-[3.5]" />
      </slot>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
