<script setup lang="ts">
import { XIcon } from 'lucide-vue-next';

defineProps<{
  label: string;
  image?: string;
  removable?: boolean;
}>();

const emit = defineEmits<{ remove: [] }>();
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full bg-secondary text-secondary-foreground px-3 py-1 text-sm font-medium select-none"
  >
    <img
      v-if="image"
      :src="image"
      :alt="label"
      class="size-5 rounded-full"
      loading="lazy"
    />
    <span>{{ label }}</span>
    <button
      v-if="removable"
      type="button"
      class="-mr-1 inline-flex items-center justify-center rounded-full hover:bg-foreground/10 size-5 transition-colors"
      :aria-label="`Remove ${label}`"
      @click.stop="emit('remove')"
    >
      <XIcon class="size-3" />
    </button>
  </span>
</template>
