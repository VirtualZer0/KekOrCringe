<script setup lang="ts">
const modelValue = defineModel<string>({ default: '#000000' })
</script>

<template>
  <label
    class="chunky-rim inline-block size-11 rounded-md border-[2.5px] border-c1 cursor-pointer overflow-hidden transition-transform active:translate-y-[2px] active:chunky-rim-pressed"
    :style="{ background: modelValue }"
    :title="modelValue"
  >
    <input
      v-model="modelValue"
      type="color"
      class="sr-only"
    />
  </label>
</template>
