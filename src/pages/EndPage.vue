<template>
  <section class="end-page page">
    <div class="content">
      <PageTitle
        :title="$t('statistics')"
        :tagline="$t('statisticsTagline')"
      />

      <ChunkyPanel class="winner-panel">
        <div
          ref="winnerContainer"
          class="winner-content"
        >
          <span class="title">{{ $t(`${winner}WinnerTitle`) }}</span>
          <span
            class="name"
            :class="winner"
          >
            {{ $t(`${winner}WinnerName`) }}
          </span>
          <div class="counter">
            <b class="red">{{ displayCringeCount }}</b>
            <span class="vs">vs</span>
            <b class="green">{{ displayKekCount }}</b>
          </div>
        </div>
      </ChunkyPanel>

      <VideoStatPanel
        tone="kek"
        :title="$t('mostKek')"
        icon="⭐"
        emoji="😆"
        :items="[
          {
            period: 'today',
            label: $t('today'),
            video: statistics.current.mostKekVideo,
          },
          {
            period: 'allTime',
            label: $t('allTime'),
            video: statistics.allTime.mostKekVideo,
          },
        ]"
        :no-data-label="$t('noData')"
        :delay="1.6"
      />

      <VideoStatPanel
        tone="cringe"
        :title="$t('mostCringe')"
        icon="😡"
        emoji="😡"
        :items="[
          {
            period: 'today',
            label: $t('today'),
            video: statistics.current.mostCringeVideo,
          },
          {
            period: 'allTime',
            label: $t('allTime'),
            video: statistics.allTime.mostCringeVideo,
          },
        ]"
        :no-data-label="$t('noData')"
        :delay="1.85"
      />

      <div
        :class="['buttons', { 'is-interactive': buttonsInteractive }]"
        @animationend="buttonsInteractive = true"
      >
        <Button
          class="action-btn"
          @click="router.back()"
        >
          <ArrowLeft class="size-6" />
          {{ $t('repeat') }}
        </Button>

        <Button
          class="action-btn home-btn"
          @click="router.push('/')"
        >
          <Home class="size-6" />
          {{ $t('home') }}
        </Button>
      </div>
    </div>
  </section>
</template>
<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import { ChunkyPanel } from '@/components/ui/chunky-panel';
import { ArrowLeft, Home } from 'lucide-vue-next';
import PageTitle from '@/components/PageTitle.vue';
import VideoStatPanel from '@/components/VideoStatPanel.vue';
import { getStatistics } from '@/utils/statisticsUtils';
import { useRouter } from 'vue-router';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { spawnRandomParticle } from '@/utils/spawnParticle';
import { getRandItem } from '@/utils/getRandItem';
import { KEK_EMOJI, CRINGE_EMOJI, NEUTRAL_EMOJI } from '@/utils/emojiSets';

const statistics = getStatistics(false);
const router = useRouter();

const score =
  statistics.current.allKekCount - statistics.current.allCringeCount;
const winner = ref('kek');
const winnerContainer = ref<HTMLElement>();
const buttonsInteractive = ref(false);
const emojis = {
  kek: KEK_EMOJI,
  cringe: CRINGE_EMOJI,
  nothing: NEUTRAL_EMOJI,
};

if (score > 0) {
  winner.value = 'kek';
} else if (score < 0) {
  winner.value = 'cringe';
} else {
  winner.value = 'nothing';
}

let particleTimeout: number | null = null;
let particleInterval: number | null = null;

const displayKekCount = ref(0);
const displayCringeCount = ref(0);
let counterStartTimer: number | null = null;
let kekRafId: number | null = null;
let cringeRafId: number | null = null;

const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

const tickTo = (
  target: number,
  duration: number,
  setter: (v: number) => void,
  storeRaf: (id: number | null) => void,
) => {
  const targetNum = Number(target) || 0;
  if (targetNum <= 0) {
    setter(0);
    storeRaf(null);
    return;
  }
  const start = performance.now();
  const step = (now: number) => {
    const progress = Math.min((now - start) / duration, 1);
    setter(Math.round(targetNum * easeOutQuart(progress)));
    if (progress < 1) {
      storeRaf(requestAnimationFrame(step));
    } else {
      storeRaf(null);
    }
  };
  storeRaf(requestAnimationFrame(step));
};

onMounted(() => {
  if (winnerContainer.value !== undefined) {
    particleTimeout = window.setTimeout(() => {
      particleTimeout = null;
      particleInterval = window.setInterval(() => {
        if (!winnerContainer.value) {
          if (particleInterval !== null) {
            clearInterval(particleInterval);
            particleInterval = null;
          }
          return;
        }
        spawnRandomParticle(
          [winner.value],
          winnerContainer.value as any,
          2,
        ).innerText = getRandItem(
          emojis[winner.value as 'kek' | 'cringe' | 'nothing'],
        );
      }, 300);
    }, 600);
  }

  counterStartTimer = window.setTimeout(() => {
    counterStartTimer = null;
    tickTo(
      statistics.current.allKekCount,
      1100,
      (v) => (displayKekCount.value = v),
      (id) => (kekRafId = id),
    );
    tickTo(
      statistics.current.allCringeCount,
      1100,
      (v) => (displayCringeCount.value = v),
      (id) => (cringeRafId = id),
    );
  }, 1500);
});

onBeforeUnmount(() => {
  if (particleTimeout !== null) {
    clearTimeout(particleTimeout);
    particleTimeout = null;
  }
  if (particleInterval !== null) {
    clearInterval(particleInterval);
    particleInterval = null;
  }
  if (counterStartTimer !== null) {
    clearTimeout(counterStartTimer);
    counterStartTimer = null;
  }
  if (kekRafId !== null) {
    cancelAnimationFrame(kekRafId);
    kekRafId = null;
  }
  if (cringeRafId !== null) {
    cancelAnimationFrame(cringeRafId);
    cringeRafId = null;
  }
});
</script>
<style scoped>
.end-page {
  min-height: 100vh;
  padding-bottom: 64px;
  background:
    linear-gradient(
      135deg,
      var(--c1) 0% 5%,
      var(--c2) 5% 10%,
      var(--c4) 10% 15%,
      transparent 15% 85%,
      var(--c4) 85% 90%,
      var(--c5) 90% 95%,
      var(--c1) 95% 100%
    ),
    radial-gradient(circle, rgba(90, 55, 0, 0.07) 1.4px, transparent 1.6px) 0
      0 / 18px 18px,
    var(--c3);
  background-attachment: fixed, scroll, scroll;

  .winner-panel {
    width: 65%;
    max-width: 1120px;
    margin: 16px auto 56px;
    animation: panel-rise 0.75s ease backwards;
    animation-delay: 0.5s;
  }

  .winner-content {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 14px;

    .title {
      position: relative;
      z-index: 1;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 22px;
      color: var(--c1);
      text-align: center;
      letter-spacing: 0.02em;
      animation: fade-rise 0.45s ease backwards;
      animation-delay: 0.9s;
    }

    .name {
      position: relative;
      z-index: 1;
      display: inline-block;
      font-family: var(--font-display);
      font-weight: 900;
      font-size: 88px;
      letter-spacing: 0.02em;
      line-height: 1;
      text-transform: uppercase;
      -webkit-text-stroke: 4px var(--c1);
      paint-order: stroke fill;
      text-shadow:
        0 1px 0 var(--c1),
        0 2px 0 var(--c1),
        0 3px 0 var(--c1),
        0 4px 0 var(--c1),
        0 5px 0 var(--c1),
        0 6px 0 var(--c1),
        0 7px 0 var(--c1),
        0 14px 10px rgba(0, 0, 0, 0.25);
      animation: winner-name-pop 0.7s var(--ease-fly) backwards;
      animation-delay: 1s;

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

    .counter {
      position: relative;
      z-index: 1;
      display: flex;
      align-items: baseline;
      gap: 14px;
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 30px;
      animation: fade-rise 0.45s ease backwards;
      animation-delay: 1.4s;

      .vs {
        font-size: 16px;
        font-weight: 700;
        color: var(--c1);
        opacity: 0.55;
        letter-spacing: 0.1em;
        text-transform: uppercase;
      }

      .green {
        color: var(--c2);
      }

      .red {
        color: var(--c5);
      }
    }
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 24px;
    margin-top: 32px;
    pointer-events: none;
    animation: rise-in 0.5s ease backwards;
    animation-delay: 2.6s;
  }

  .buttons.is-interactive {
    pointer-events: auto;
  }

  .action-btn {
    height: 64px;
    padding: 0 36px;
    font-size: 22px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    border-radius: 18px;
    gap: 14px;
    --bevel-color: color-mix(in srgb, var(--c2) 65%, black);
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.32),
      0 6px 0 var(--bevel-color),
      0 13px 20px rgba(0, 0, 0, 0.26);
    transition:
      transform 0.12s ease,
      box-shadow 0.15s ease,
      background-color 0.15s ease;
  }

  .action-btn:hover {
    transform: translateY(-1px);
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.36),
      0 7px 0 var(--bevel-color),
      0 15px 22px rgba(0, 0, 0, 0.28);
  }

  .action-btn:active {
    transform: translateY(4px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.22),
      0 2px 0 var(--bevel-color),
      0 5px 10px rgba(0, 0, 0, 0.22);
  }

  .home-btn {
    background: var(--c4);
    color: var(--c-surface);
    --bevel-color: color-mix(in srgb, var(--c4) 65%, black);
  }

  .home-btn:hover {
    background: color-mix(in srgb, var(--c4) 92%, black);
  }
}
</style>
