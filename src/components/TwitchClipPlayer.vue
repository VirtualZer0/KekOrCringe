<template>
  <iframe
    :src="src"
    class="twitch-frame"
    allow="autoplay; fullscreen"
    allowfullscreen
    @error="emit('error')"
  />
</template>

<script lang="ts" setup>
defineProps<{ src: string }>();
const emit = defineEmits<{ error: [] }>();
</script>

<style scoped>
.twitch-frame {
  display: block;
  width: 100%;
  height: 100%;
  border: none;
  background: #000;
}
</style>
