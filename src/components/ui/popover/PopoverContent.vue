<script setup lang="ts">
import type { PopoverContentEmits, PopoverContentProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { PopoverContent, PopoverPortal, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(
  defineProps<PopoverContentProps & { class?: HTMLAttributes['class'] }>(),
  {
    align: 'center',
    sideOffset: 6,
  },
);
const emits = defineEmits<PopoverContentEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <PopoverPortal>
    <PopoverContent
      data-slot="popover-content"
      v-bind="{ ...$attrs, ...forwarded }"
      :class="
        cn(
          'z-50 w-80 rounded-xl border-[2.5px] border-c1 bg-[var(--c-surface)] text-c1 p-2 shadow-[0_4px_0_var(--c1),0_14px_22px_rgba(0,0,0,0.18)] outline-hidden origin-(--reka-popover-content-transform-origin)',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
          props.class,
        )
      "
    >
      <slot />
    </PopoverContent>
  </PopoverPortal>
</template>
