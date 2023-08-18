<template>
  <section class="end-page page">
    <h1>{{ $t('statistics') }}</h1>

    <div
      class="winner"
      :class="winner"
      ref="winnerContainer"
    >
      <span class="title">{{ $t(`${winner}WinnerTitle`) }}</span>
      <span
        class="name"
        :class="winner"
      >
        {{ $t(`${winner}WinnerName`) }}
      </span>
      <div class="counter">
        <b class="red">{{ statistics.current.allCringeCount }}</b>
        vs
        <b class="green">{{ statistics.current.allKekCount }}</b>
      </div>
    </div>

    <div class="stat-block kek">
      <div class="title">{{ $t('mostKek') }}</div>
      <div class="item">
        <h2 class="item-title">{{ $t('today') }}</h2>
        <div
          class="item-video"
          v-if="statistics.current.mostKekVideo"
        >
          <div class="preview-container">
            <div class="stats">
              {{ statistics.current.mostKekVideo?.voteCount }} 😆
            </div>
            <a
              :href="`https://youtu.be/${statistics.current.mostKekVideo?.id}`"
              target="_blank"
            >
              <img
                class="preview"
                :src="statistics.current.mostKekVideo?.preview"
              />
            </a>
          </div>
          <div class="name">
            {{ statistics.current.mostKekVideo?.title }}
          </div>
        </div>
        <div
          v-else
          class="item-nodata"
        >
          {{ $t('noData') }}
        </div>
      </div>

      <div class="item">
        <h2 class="item-title">{{ $t('allTime') }}</h2>
        <div
          class="item-video"
          v-if="statistics.allTime.mostKekVideo"
        >
          <div class="preview-container">
            <div class="stats">
              {{ statistics.allTime.mostKekVideo?.voteCount }} 😆
            </div>
            <a
              :href="`https://youtu.be/${statistics.allTime.mostKekVideo?.id}`"
              target="_blank"
            >
              <img
                class="preview"
                :src="statistics.allTime.mostKekVideo?.preview"
              />
            </a>
          </div>
          <div class="name">
            {{ statistics.allTime.mostKekVideo?.title }}
          </div>
        </div>
        <div
          v-else
          class="item-nodata"
        >
          {{ $t('noData') }}
        </div>
      </div>
    </div>

    <div class="stat-block cringe">
      <div class="title">{{ $t('mostCringe') }}</div>
      <div class="item">
        <h2 class="item-title">{{ $t('today') }}</h2>
        <div
          class="item-video"
          v-if="statistics.current.mostCringeVideo"
        >
          <div class="preview-container">
            <div class="stats">
              {{ statistics.current.mostCringeVideo?.voteCount }} 😡
            </div>
            <a
              :href="`https://youtu.be/${statistics.current.mostCringeVideo?.id}`"
              target="_blank"
            >
              <img
                class="preview"
                :src="statistics.current.mostCringeVideo?.preview"
              />
            </a>
          </div>
          <div class="name">
            {{ statistics.current.mostCringeVideo?.title }}
          </div>
        </div>
        <div
          v-else
          class="item-nodata"
        >
          {{ $t('noData') }}
        </div>
      </div>

      <div class="item">
        <h2 class="item-title">{{ $t('allTime') }}</h2>
        <div
          class="item-video"
          v-if="statistics.allTime.mostCringeVideo"
        >
          <div class="preview-container">
            <div class="stats">
              {{ statistics.allTime.mostCringeVideo?.voteCount }} 😡
            </div>
            <a
              :href="`https://youtu.be/${statistics.allTime.mostCringeVideo?.id}`"
              target="_blank"
            >
              <img
                class="preview"
                :src="statistics.allTime.mostCringeVideo?.preview"
              />
            </a>
          </div>
          <div class="name">
            {{ statistics.allTime.mostCringeVideo?.title }}
          </div>
        </div>
        <div
          v-else
          class="item-nodata"
        >
          {{ $t('noData') }}
        </div>
      </div>
    </div>

    <div class="buttons">
      <Button
        :label="$t('repeat')"
        icon="pi pi-arrow-left"
        @click="router.back()"
      />

      <Button
        :label="$t('home')"
        icon="pi pi-home"
        severity="warning"
        @click="router.push('/')"
      />
    </div>
  </section>
</template>
<script lang="ts" setup>
import Button from 'primevue/button';
import { getStatistics } from '@/utils/statisticsUtils';
import { useRouter } from 'vue-router';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { spawnRandomParticle } from '@/utils/spawnParticle';
import { getRandItem } from '@/utils/getRandItem';

const statistics = getStatistics(false);
const router = useRouter();

const score =
  statistics.current.allKekCount - statistics.current.allCringeCount;
const winner = ref('kek');
const winnerContainer = ref<HTMLElement>();
const emojis = {
  kek: ['😸', '🤩', '😁', '🤣', '✨', '🌸', '❤️'],
  cringe: ['💔', '💢', '🚽', '👎', '😡', '😭', '💩'],
  nothing: ['😶', '🤔', '😒', '👀', '💫', '☁️', '🌌'],
};

if (score > 0) {
  winner.value = 'kek';
} else if (score < 0) {
  winner.value = 'cringe';
} else {
  winner.value = 'nothing';
}

let timer: number | null = null;

onMounted(() => {
  if (winnerContainer.value !== undefined) {
    setTimeout(() => {
      timer = setInterval(() => {
        spawnRandomParticle(
          [winner.value],
          winnerContainer.value as any,
          2
        ).innerText = getRandItem(
          emojis[winner.value as 'kek' | 'cringe' | 'nothing']
        );
      }, 300);
    }, 600);
  }
});

onBeforeUnmount(() => clearInterval(timer as number));
</script>
<style lang="scss" scoped>
.end-page {
  overflow: hidden;
  width: 100vw;
  background: var(--c1);
  padding-bottom: 32px;

  .winner {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    flex-direction: column;
    margin: 0 auto;
    margin-bottom: 64px;
    margin-top: 64px;
    padding-bottom: 12px;
    padding-top: 12px;
    font-size: 21px;
    width: 65%;
    border-top: 2px solid #fff;
    border-bottom: 2px solid #fff;
    animation: winner-appear 0.7s ease backwards;
    animation-delay: 0.3s;

    .title,
    .name,
    .counter {
      z-index: 1;
    }

    &.kek {
      border-color: var(--c2);
    }

    &.cringe {
      border-color: var(--c5);
    }

    &.nothing {
      border-color: var(--c3);
    }

    .name {
      &.kek,
      &.nothing,
      &.cringe {
        font-weight: bold;
        font-size: 52px;
        text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
      }

      &.kek {
        color: var(--c2);
      }

      &.cringe {
        color: var(--c5);
      }

      &.nothing {
        color: var(--c3);
      }
    }

    .green {
      color: var(--c2);
    }
    .red {
      color: var(--c5);
    }
  }

  .stat-block {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    gap: 21px;
    width: 65%;
    border-radius: 8px;
    overflow: hidden;
    margin: 0 auto;
    padding-bottom: 21px;
    margin-bottom: 48px;

    &.kek {
      .title {
        background: var(--c3);
      }

      background: var(--c2);
    }

    &.cringe {
      .title {
        background: var(--c4);
      }

      background: var(--c5);
    }

    .title {
      width: 100%;
      font-weight: bold;
      margin-bottom: 0;
      padding: 8px 0;
      padding-left: 18px;
      font-size: 26px;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
    }

    .item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;

      &-nodata {
        margin-top: -20px;
        height: 320px;
        width: 480px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 52px;
        transform: rotate(-23deg);
        color: #fff;
        opacity: 0.4;
      }

      &-title {
        border-bottom: 3px solid #fff;
        padding-bottom: 6px;
        width: 30%;
        text-align: center;
      }
    }

    .name {
      text-align: center;
      font-weight: bold;
      max-width: 480px;
    }

    .preview {
      border-radius: 8px;
      max-height: 360px;
      max-width: 480px;

      &-container {
        position: relative;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.1) rotate(4deg);
        }
      }

      margin-bottom: 10px;
    }

    .stats {
      position: absolute;
      top: -24px;
      right: -24px;
      background: var(--c1);
      padding: 12px;
      border-radius: 18px;
      font-size: 21px;
      font-weight: bold;
    }
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 16px;
  }
}

@keyframes winner-appear {
  0% {
    transform: scaleX(0);
  }
  100% {
    transform: scaleX(1);
  }
}
</style>
