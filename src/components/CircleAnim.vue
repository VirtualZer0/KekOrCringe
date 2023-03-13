<template>
  <div
    class="circle-anim"
    :style="{ zIndex: isTop ? 10000 : 0 }"
  >
    <div
      class="circle"
      :style="{ backgroundColor: color }"
    />
  </div>
</template>
<script lang="ts" setup>
defineProps({
  color: {
    type: String,
    default: '#e76f51',
  },
  isTop: {
    type: Boolean,
    default: false,
  },
});
</script>
<style lang="scss">
.circle-anim {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  max-width: 100vw;
  max-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffeab7;
  transform: translateZ(0);
  backface-visibility: hidden;

  .circle {
    position: absolute;
    border-radius: 100%;
    animation: circle-appear 0.2s ease-in forwards;
    transform: translateZ(0);
    will-change: width, height;
    backface-visibility: hidden;
  }

  @keyframes circle-appear {
    0% {
      height: 0;
      width: 0;
    }

    100% {
      height: 150vmax;
      width: 150vmax;
    }
  }
}
</style>
