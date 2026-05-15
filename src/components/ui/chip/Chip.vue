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
    class="inline-flex items-center gap-2 rounded-lg border-[2px] border-c1 bg-white text-c1 px-3 h-9 text-sm font-bold select-none shadow-[0_2px_0_var(--c1)]"
  >
    <img
      v-if="image"
      :src="image"
      :alt="label"
      class="size-5 rounded-md"
      loading="lazy"
    />
    <span>{{ label }}</span>
    <button
      v-if="removable"
      type="button"
      class="-mr-1 inline-flex items-center justify-center rounded-md size-5 text-c1 hover:bg-c1/10 transition-colors cursor-pointer"
      :aria-label="`Remove ${label}`"
      @click.stop="emit('remove')"
    >
      <XIcon class="size-3.5 stroke-[3]" />
    </button>
  </span>
</template>
