<script lang="ts" setup>
import type { ToasterProps } from 'vue-sonner';
import { Toaster as Sonner } from 'vue-sonner';
import { cn } from '@/lib/utils';

const props = defineProps<ToasterProps>();
</script>

<template>
  <Sonner
    :class="cn('toaster group', props.class)"
    :style="{
      '--normal-bg': 'var(--popover)',
      '--normal-text': 'var(--popover-foreground)',
      '--normal-border': 'var(--border)',
      '--border-radius': 'var(--radius)',
    }"
    v-bind="props"
  />
</template>
