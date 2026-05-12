<script setup lang="ts">
const modelValue = defineModel<string>({ default: '#000000' })
</script>

<template>
  <label
    class="inline-block size-9 rounded-md border border-input shadow-xs cursor-pointer overflow-hidden"
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
