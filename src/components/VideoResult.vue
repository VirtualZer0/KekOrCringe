<template>
  <div class="video-result">
    <div class="lines">
      <div
        class="line line-1"
        :style="{ backgroundColor: getColor() }"
      />
      <div
        class="line line-2"
        :style="{ backgroundColor: getColor() }"
      />
      <div
        class="line line-3"
        :style="{ backgroundColor: getColor() }"
      />
    </div>
    <div class="text">{{ getText() }}</div>
  </div>
</template>
<script lang="ts" setup>
import { useStore } from '@/store';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const store = useStore();
const props = defineProps({
  result: {
    type: String,
    default: 'neutral',
  },
  strong: {
    type: Boolean,
    default: false,
  },
});

const variant: any = store.variantsSettings.find((v) => v.name == props.result);

const getColor = () => (props.result == 'neutral' ? '#93a8ac' : variant.color);
const getText = () => {
  if (['cringe', 'neutral', 'kek'].includes(props.result)) {
    return t(`${props.strong ? 'very' : ''}${props.result}`).toUpperCase();
  } else {
    return variant.name.toUpperCase();
  }
};
</script>
<style lang="scss" scoped>
.video-result {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 100;
  user-select: none;
  pointer-events: none;
  display: flex;
  align-items: center;

  .lines {
    .line {
      position: absolute;
      top: -50vh;
      left: 40vw;
      width: 10.8vw;
      height: 200vh;
      transform: rotate(25deg);
      animation: line-appear 3s ease-in-out forwards;
      transform: translateX(-100vw) rotate(25deg);
    }

    .line-1 {
      filter: brightness(0.7) hue-rotate(-15deg);
      left: 30vw;
      animation-delay: 0.6s;
    }

    .line-2 {
      animation-delay: 0.3s;
    }

    .line-3 {
      filter: brightness(1.3) hue-rotate(15deg);
      left: 50vw;
    }
  }

  .text {
    text-shadow: 1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191,
      1px 4px 1px #919191, 1px 5px 1px #919191, 1px 6px 1px #919191,
      1px 7px 1px #919191;
    font-size: 7vw;
    font-weight: bold;
    font-family: 'Courier New', Courier, monospace;
    position: absolute;
    margin-top: -4vw;
    width: 100vw;
    text-align: center;
    transform: translateX(100vw);
    animation: text-appear 2.8s ease-in-out forwards;
    letter-spacing: 0.4rem;
  }
}

@keyframes line-appear {
  0% {
    transform: translateX(-100vw) rotate(25deg);
  }

  10% {
    transform: translateX(-8vw) rotate(25deg);
  }

  90% {
    transform: translateX(0vw) rotate(25deg);
  }

  100% {
    transform: translateX(100vw) rotate(25deg);
  }
}

@keyframes text-appear {
  0% {
    transform: translateX(100vw);
  }

  10% {
    transform: translateX(8vw);
  }

  90% {
    transform: translateX(0vw);
  }

  100% {
    transform: translateX(-100vw);
  }
}
</style>
