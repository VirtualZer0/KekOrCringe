<template>
  <section class="run-page page">
    <VideoResult
      v-if="result.show"
      :result="result.rate"
      :strong="result.strong"
      :combo="combo.count"
    />
    <VideoQueue
      :visible="showQueue"
      :queue="Object.values(videoList)"
      :current-playing="currentVote.videoId ?? ''"
      @close="showQueue = false"
      @remove="removeVideoFromList($event)"
      @clear="clearQueue()"
    />
    <div class="content">
      <div class="left-menu">
        <Button @click="showQueue = true">
          <Images />
          {{ $t('queue') }}
          <Badge class="queue-badge ml-1">
            {{ Object.keys(videoList).length }}
          </Badge>
        </Button>
        <Button
          variant="destructive"
          @click="router.push('/end')"
        >
          <Power />
          {{ $t('end') }}
        </Button>
        <div
          class="sfx-toggle"
          :class="{ 'is-off': store.sfxMuted }"
        >
          <Button
            class="sfx-btn"
            @click="setSfxMuted(!store.sfxMuted)"
          >
            <VolumeX
              v-if="store.sfxMuted"
              class="size-5"
            />
            <Volume2
              v-else
              class="size-5"
            />
          </Button>
          <span class="sfx-label">
            {{ store.sfxMuted ? $t('sfxOff') : $t('sfxOn') }}
          </span>
        </div>
      </div>
      <ResultDebugPanel
        v-if="isDev"
        @trigger="debugTriggerResult"
      />
      <div
        v-if="currentVote.videoId"
        class="title"
        :style="{
          width: `calc(${playerSizeW}vmax + 38px)`,
          maxWidth: `calc(${playerSizeW}vmax + 38px)`,
        }"
      >
        {{ videoList[currentVote.videoId as string]?.title }}
      </div>
      <div
        class="video-block"
        :style="{
          marginTop: currentVote.videoId ? 0 : '38px',
        }"
      >
        <div class="video-frame">
          <div
            class="video-container"
            :style="{
              width: `${playerSizeW}vmax`,
              height: `${playerSizeH}vmax`,
              maxWidth: `${playerSizeW}vmax`,
              maxHeight: `${playerSizeH}vmax`,
            }"
          >
            <div
              v-if="!currentVote.videoId"
              class="launch-block"
            >
              <img
                :src="awaitingImg"
                class="launch-bg"
                alt=""
              />
              <span class="launch-label">{{ $t('videoWait') }}</span>
            </div>
            <UniversalPlayer
              v-if="currentVideo"
              :video="currentVideo"
              class="yt-player"
              @durationchange="onPlayerDuration"
              @error="onPlayerError"
            />
            <div
              v-if="currentVote.videoId"
              class="next-container"
            >
              <Button
                class="next-button"
                :disabled="!currentVote.isActive"
                @click="launchResult()"
              >
                <FastForward class="size-7" />
                <span class="next-label">{{ $t('skip') }}</span>
              </Button>
              <div class="autoskip-block">
                <Badge
                  class="next-badge"
                  :class="autoskipDangerClass"
                >
                  {{ currentVote.skipCount }}
                </Badge>
                <span class="autoskip-label">{{ $t('autoskip') }}</span>
              </div>
            </div>
          </div>
          <RateBar
            :votes="currentVote.votes"
            :vote-count="currentVote.voteCount"
          />
        </div>
      </div>
      <RateBlock
        :votes="currentVote.votes"
        :is-active="currentVote.isActive"
        @init="setVariantRefs"
        @vote="addVote($event, 'me')"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  extractVideoLink,
  fetchVideoMetadata,
  tryExtractVideoId,
} from '@/utils/videoSources';
import type { IVideoData } from '@/utils/videoSources/types';
import UniversalPlayer from '@/components/UniversalPlayer.vue';
import { useVideoQueue } from '@/composables/useVideoQueue';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Images, Power, FastForward, Volume2, VolumeX } from 'lucide-vue-next';
import VideoResult from '@/components/VideoResult.vue';
import ResultDebugPanel from '@/components/dev/ResultDebugPanel.vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { getStatistics } from '@/utils/statisticsUtils';
import { useStore } from '@/store';
import { spawnFadeout } from '@/utils/spawnFadeout';
import { getRandItem } from '@/utils/getRandItem';
import RateBlock from '@/components/RateBlock.vue';
import RateBar from '@/components/RateBar.vue';
import VideoQueue from '@/components/VideoQueue.vue';
import { useChat } from '@/utils/useChat';
import { notify } from '@/utils/notify';
import { useI18n } from 'vue-i18n';
import { KEK_EMOJI, CRINGE_EMOJI, CUSTOM_EMOJI } from '@/utils/emojiSets';
import { setSfxMuted } from '@/utils/resultSounds';

const router = useRouter();
const store = useStore();
const chat = useChat();
const { t } = useI18n();
const isDev = import.meta.env.DEV;

const showQueue = ref(false);
let variantRefs: Record<string, any> = {};
const playerSizeW = 63;
const playerSizeH = playerSizeW / 1.7777777;
const awaitingImg = `${import.meta.env.BASE_URL}img/awaiting.jpg`;

const result = ref({
  show: false,
  rate: 'cringe',
  strong: false,
});

const combo = ref<{ result: string; count: number }>({
  result: '',
  count: 0,
});

const updateCombo = (winner: string) => {
  if (combo.value.result === winner) {
    combo.value = { result: winner, count: combo.value.count + 1 };
  } else {
    combo.value = { result: winner, count: 1 };
  }
};

const initialVotes: Record<string, string[]> = {};
store.variantsSettings.forEach((v) => {
  initialVotes[v.name] = [];
});

const currentVote = ref<{
  videoId: string | null;
  votes: Record<string, string[]>;
  voteCount: number;
  skipCount: number;
  isActive: boolean;
}>({
  videoId: null,
  votes: initialVotes,
  skipCount: 0,
  voteCount: 0,
  isActive: false,
});

const autoskipDangerClass = computed(() => {
  const c = currentVote.value.skipCount;
  if (c === 1) return 'autoskip-critical';
  if (c === 2) return 'autoskip-warning';
  if (c === 3) return 'autoskip-caution';
  return '';
});

const setVariantRefs = (vRefs: Record<string, any>) => (variantRefs = vRefs);

const recalcStatistics = (winner: 'cringe' | 'kek') => {
  (['current', 'allTime'] as const).forEach((statType) => {
    const capitalizedWinner = winner.charAt(0).toUpperCase() + winner.slice(1);
    statistics.value[statType][`all${capitalizedWinner}Count`]++;
    const percent =
      (currentVote.value.votes[winner].length / currentVote.value.voteCount) *
      100;
    if (
      statistics.value[statType][`most${capitalizedWinner}Video`] == null ||
      statistics.value[statType][`most${capitalizedWinner}Video`].percent <
        percent ||
      (statistics.value[statType][`most${capitalizedWinner}Video`].percent ==
        percent &&
        statistics.value[statType][`most${capitalizedWinner}Video`].voteCount <
          currentVote.value.voteCount)
    ) {
      statistics.value[statType][`most${capitalizedWinner}Video`] = {
        ...videoList.value[currentVote.value.videoId as string],
        percent,
        voteCount: currentVote.value.voteCount,
      };
    }
  });
};

const showErrToast = (msg: string) => {
  notify.error(t('error'), {
    description: msg,
    duration: 3000,
  });
};

const addVote = (variant: string, user: string) => {
  if (!currentVote.value.isActive) return;
  const varParams = store.variantsSettings.find((v) => v.name == variant);
  const emotes = varParams?.words.filter((w) => w.url);

  if (emotes && emotes.length > 0) {
    spawnFadeout(variantRefs[variant]?.$el, 'img', getRandItem(emotes).url);
  } else {
    switch (variant) {
      case 'kek':
        spawnFadeout(variantRefs[variant]?.$el, 'div', getRandItem(KEK_EMOJI));
        break;
      case 'cringe':
        spawnFadeout(
          variantRefs[variant]?.$el,
          'div',
          getRandItem(CRINGE_EMOJI),
        );
        break;

      default:
        spawnFadeout(
          variantRefs[variant]?.$el,
          'div',
          getRandItem(CUSTOM_EMOJI),
        );
        break;
    }
  }

  Object.entries(currentVote.value.votes).forEach((vote) => {
    if (vote[1].includes(user)) {
      currentVote.value.skipCount +=
        store.variantsSettings.find((v) => v.name == vote[0])?.skipModifier ??
        0;
      currentVote.value.votes[vote[0]] = vote[1].filter((v) => v != user);
      currentVote.value.voteCount--;
    }
  });

  currentVote.value.skipCount -=
    store.variantsSettings.find((v) => v.name == variant)?.skipModifier ?? 0;
  currentVote.value.votes[variant].push(user);
  currentVote.value.voteCount++;

  if (currentVote.value.skipCount <= 0) {
    launchResult();
  }
};

const {
  videoList,
  add: queueAdd,
  remove: queueRemove,
  updateDuration: queueUpdateDuration,
  clear: queueClear,
} = useVideoQueue();

const currentVideo = computed<IVideoData | null>(() =>
  currentVote.value.videoId
    ? (videoList.value[currentVote.value.videoId] ?? null)
    : null,
);

// Use `clearCurrent: false` — current stats are cleared by SettingsPage's
// Run button (= explicit "new run"), not by an accidental page reload.
const statistics = ref(getStatistics(false));

const persistStatistics = () => {
  try {
    localStorage['statistics'] = JSON.stringify(statistics.value);
  } catch (e) {
    console.error('Failed to persist statistics', e);
  }
};

const pendingFetches = new Set<string>();
let isMounted = true;

/** Check user message and add video or vote */
const handleUserMessage = async (
  type: 'bits' | 'reward' | 'message',
  user: string,
  msg: string,
) => {
  // Check if msg contains video
  if (type == store.videoSettings.addVideoMethod) {
    const match = extractVideoLink(msg, store.videoSettings.enabledPlatforms);
    if (match) {
      // Dedup by platform:id when we can extract it synchronously; otherwise
      // fall back to the URL string. This collapses YT alias submissions
      // (youtu.be/X vs youtube.com/watch?v=X) into one pending slot.
      const earlyId = tryExtractVideoId(match.url, match.platform);
      const pendingKey = earlyId
        ? `${match.platform}:${earlyId}`
        : `url:${match.url}`;

      const reservedCount =
        Object.keys(videoList.value).length + pendingFetches.size;
      if (reservedCount >= store.videoSettings.queueSize)
        return showErrToast(`${user}: ${t('queueIsFull')}`);

      if (earlyId && videoList.value[earlyId])
        return showErrToast(`${user}: ${t('alreadyExistsVideo')}`);

      if (pendingFetches.has(pendingKey))
        return showErrToast(`${user}: ${t('alreadyExistsVideo')}`);

      pendingFetches.add(pendingKey);
      try {
        const data = await fetchVideoMetadata(match.url, match.platform, user, {
          filterBadwords: store.videoSettings.banwordsFilter,
        });

        if (!isMounted) return;

        if (data.err) {
          const err = t(`${data.err}Video`);
          return showErrToast(`${user}: ${err}`);
        }

        const video = data.video as IVideoData;

        if (videoList.value[video.id])
          return showErrToast(`${user}: ${t('alreadyExistsVideo')}`);

        if (video.duration > 0) {
          if (video.duration > store.videoSettings.durationTo * 60)
            return showErrToast(`${user}: ${t('tooLongVideo')}`);
          if (video.duration < store.videoSettings.durationFrom * 60)
            return showErrToast(`${user}: ${t('tooShortVideo')}`);
        }

        if (
          (video.platform === 'youtube' || video.platform === 'twitch') &&
          // viewCount === 0 is also the "missing statistics" sentinel — skip
          // the floor check when we don't actually have a known view count.
          video.viewCount > 0 &&
          video.viewCount < store.videoSettings.viewCount
        )
          return showErrToast(`${user}: ${t('notEnoughViewsVideo')}`);

        return addVideoToList(video);
      } finally {
        pendingFetches.delete(pendingKey);
      }
    }
  }

  const foundedVariant = store.variantsSettings.find((v) =>
    v.words.find((w) => w?.name && w.name.toLowerCase() == msg.toLowerCase()),
  );

  if (foundedVariant) {
    addVote(foundedVariant.name, user);
  }
};

/** Add new video to queue */
const addVideoToList = (video: IVideoData) => {
  queueAdd(video);

  if (!currentVote.value.videoId) {
    setActiveVideo(video.id);
  }
};

/** Launch  selected video or stop current if videoId is null */
const setActiveVideo = (videoId: string | null) => {
  currentVote.value.videoId = videoId;
  currentVote.value.isActive = videoId ? true : false;
  currentVote.value.voteCount = 0;
  currentVote.value.skipCount = store.videoSettings.skipCount;
  Object.keys(currentVote.value.votes).forEach(
    (vote) => (currentVote.value.votes[vote] = []),
  );
};

let resultTimer: number | null = null;

/** Launch final rate animation */
const launchResult = () => {
  if (!currentVote.value.isActive) return;
  currentVote.value.isActive = false;
  statistics.value.allTime.allVideos++;
  statistics.value.current.allVideos++;

  const kekCount = currentVote.value.votes['kek']?.length ?? 0;
  const cringeCount = currentVote.value.votes['cringe']?.length ?? 0;
  const maxCustomCount = Math.max(
    0,
    ...Object.entries(currentVote.value.votes)
      .filter((pair) => pair[0] != 'kek' && pair[0] != 'cringe')
      .map((pair) => pair[1].length),
  );

  let winner: string;
  if (kekCount === cringeCount && maxCustomCount <= cringeCount) {
    winner = 'neutral';
  } else {
    winner = Object.entries(currentVote.value.votes).sort(
      (a, b) => b[1].length - a[1].length,
    )[0][0];
  }

  result.value.rate = winner;

  if (winner == 'kek' || winner == 'cringe') {
    recalcStatistics(winner);
  }
  // Persist for every round so allVideos increments survive reloads even
  // on neutral/custom-winner rounds (not just kek/cringe).
  persistStatistics();

  if (winner !== 'neutral') {
    const winnerVoteCount = currentVote.value.votes[winner]?.length ?? 0;
    const isShutout = Object.entries(currentVote.value.votes)
      .filter(([name]) => name !== winner)
      .every(([, votes]) => votes.length === 0);
    result.value.strong = winnerVoteCount > 0 && isShutout;
  } else {
    result.value.strong = false;
  }

  updateCombo(winner);

  result.value.show = true;

  // Capture the video that just finished. If the user manually removes /
  // skips during the 3.7 s result overlay, `currentVote.videoId` will have
  // moved on, and we must not delete that next video by accident.
  const finishedVideoId = currentVote.value.videoId;

  if (resultTimer !== null) clearTimeout(resultTimer);
  resultTimer = window.setTimeout(() => {
    result.value.show = false;
    resultTimer = null;
    // No-op if the user already advanced past this video.
    if (finishedVideoId === null) return;
    if (currentVote.value.videoId !== finishedVideoId) return;
    removeVideoFromList(finishedVideoId);
  }, 3700);
};

const debugTriggerResult = (rate: string, strong: boolean) => {
  updateCombo(rate);
  result.value.rate = rate;
  result.value.strong = strong;
  result.value.show = true;
  if (resultTimer !== null) clearTimeout(resultTimer);
  resultTimer = window.setTimeout(() => {
    result.value.show = false;
    resultTimer = null;
  }, 3700);
};

const clearQueue = () => {
  queueClear();
  setActiveVideo(null);
};

/** Remove selected video from queue */
const removeVideoFromList = (videoId: string) => {
  queueRemove(videoId);

  if (videoId == currentVote.value.videoId) {
    if (Object.keys(videoList.value).length > 0) {
      setActiveVideo(Object.values(videoList.value)[0].id);
    } else {
      setActiveVideo(null);
    }
  }
};

const onPlayerDuration = (sourceId: string, seconds: number) => {
  if (sourceId !== currentVote.value.videoId) return;
  const video = videoList.value[sourceId];
  if (!video || video.platform !== 'tiktok') return;
  if (video.duration === seconds) return;

  queueUpdateDuration(sourceId, seconds);

  if (!currentVote.value.isActive) return;

  const maxSec = store.videoSettings.durationTo * 60;
  const minSec = store.videoSettings.durationFrom * 60;
  if (seconds > maxSec) {
    showErrToast(`${video.user}: ${t('tooLongVideo')}`);
    removeVideoFromList(sourceId);
  } else if (seconds < minSec) {
    showErrToast(`${video.user}: ${t('tooShortVideo')}`);
    removeVideoFromList(sourceId);
  }
};

const onPlayerError = (sourceId: string) => {
  if (sourceId !== currentVote.value.videoId) return;
  if (!currentVote.value.isActive) return;
  showErrToast(t('embedFailedVideo'));
  removeVideoFromList(sourceId);
};

// Chat events
const tryUseBits = async (user: string, msg: string, bits: number) => {
  if (
    store.videoSettings.addVideoMethod == 'bits' &&
    store.videoSettings.bitsCount <= bits
  ) {
    await handleUserMessage('bits', user, msg);
  }
};

const tryUseReward = async (user: string, msg: string, rewardId: string) => {
  if (
    store.videoSettings.addVideoMethod == 'reward' &&
    store.videoSettings.selectedRewardId == rewardId
  ) {
    await handleUserMessage('reward', user, msg);
  }
};

const tryUseMessage = async (user: string, msg: string) =>
  await handleUserMessage('message', user, msg);

const onChatConnected = () => {
  notify.success(t('chatConnected'), { duration: 2500 });
};

const onChatError = (message: string) => {
  notify.error(t('chatError'), {
    description: message,
    duration: 5000,
  });
};

chat.on('Bits', tryUseBits);
chat.on('Reward', tryUseReward);
chat.on('Message', tryUseMessage);
chat.on('Connected', onChatConnected);
chat.on('Error', onChatError);

const validateRewardSetting = () => {
  if (store.videoSettings.addVideoMethod !== 'reward') return;
  const selectedId = store.videoSettings.selectedRewardId;
  if (!selectedId) {
    notify.warning(t('warning'), {
      description: t('rewardNotSelected'),
      duration: 5000,
    });
    return;
  }
  if (!store.rewardsCache.find((r) => r.id === selectedId)) {
    notify.warning(t('warning'), {
      description: t('rewardNotFound'),
      duration: 5000,
    });
  }
};

onMounted(() => {
  // Direct `#/run` entry with no channel configured would create a TMI
  // client for "" and produce a confusing chat-error toast. Send the user
  // back to the start instead.
  if (!store.channel || !store.channel.trim()) {
    router.push('/');
    return;
  }

  validateRewardSetting();

  chat.create(store.channel);
  chat.connect();

  if (Object.keys(videoList.value).length > 0) {
    setActiveVideo(Object.values(videoList.value)[0].id);
  }
});

onBeforeUnmount(() => {
  isMounted = false;
  chat.off('Bits', tryUseBits);
  chat.off('Reward', tryUseReward);
  chat.off('Message', tryUseMessage);
  chat.off('Connected', onChatConnected);
  chat.off('Error', onChatError);
  chat.destroy();
  if (resultTimer !== null) {
    clearTimeout(resultTimer);
    resultTimer = null;
  }
});
</script>

<style scoped>
.run-page {
  overflow: hidden;
  width: 100vw;
  height: 100vh;
  background: #e9c46a;
  .content {
    padding-top: 16px;
    animation: page-appear 0.25s backwards;
    animation-delay: 0.3s;
  }

  .video-block {
    display: flex;
    justify-content: center;
    width: auto;
  }

  .title {
    display: block;
    margin: 0 auto 6px;
    padding: 0 18px;
    text-align: center;
    background: var(--c1);
    color: var(--c-surface);
    border-radius: 16px;
    min-width: 758px;
    height: 32px;
    line-height: 32px;
    font-size: 20px;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    animation: title-appear 0.3s ease-out;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      inset 0 -3px 0 rgba(0, 0, 0, 0.25),
      0 4px 8px rgba(0, 0, 0, 0.22);
  }

  .video-frame {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 14px;
    width: fit-content;
    background: var(--c-surface);
    border: 3px solid var(--c1);
    border-radius: 28px;
    padding: 16px;
    box-shadow:
      inset 0 2px 0 rgba(255, 255, 255, 0.45),
      0 8px 0 var(--c1),
      0 18px 24px rgba(0, 0, 0, 0.18);
  }

  .video-container {
    position: relative;
    transition: margin-top 0.3s ease-in;
    min-width: 720px;
    min-height: 480px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
  }

  .yt-player {
    display: block;
    width: 100%;
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
  }

  .launch-block {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: 12px;
  }

  .launch-bg {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .launch-label {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 6%;
    z-index: 1;
    text-align: center;
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 64px;
    line-height: 1;
    letter-spacing: 0.02em;
    color: var(--c-surface);
    -webkit-text-stroke: 4px var(--c1);
    paint-order: stroke fill;
    text-shadow:
      0 2px 0 var(--c1),
      0 4px 0 var(--c1),
      0 8px 6px rgba(0, 0, 0, 0.25);
  }

  .left-menu {
    display: flex;
    flex-direction: column;
    gap: 14px;
    position: absolute;
    left: 16px;

    [data-slot='button'] {
      height: 44px;
      padding: 0 18px;
      font-size: 16px;
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.25),
        0 4px 0 var(--bevel-color),
        0 7px 12px rgba(0, 0, 0, 0.22);
    }

    [data-slot='button'][data-variant='default'] {
      --bevel-color: color-mix(in srgb, var(--primary) 65%, black);
    }

    [data-slot='button'][data-variant='destructive'] {
      --bevel-color: color-mix(in srgb, var(--destructive) 65%, black);
    }

    [data-slot='button']:active {
      transform: translateY(3px);
      box-shadow:
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        0 1px 0 var(--bevel-color),
        0 3px 5px rgba(0, 0, 0, 0.18);
    }

    .queue-badge {
      background: var(--c1);
      color: var(--c-surface);
      padding: 2px 8px;
      min-width: 24px;
      font-weight: 700;
    }

    .sfx-toggle {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 16px;
    }

    .sfx-btn,
    .sfx-btn:hover {
      width: 36px;
      height: 36px;
      padding: 0;
      background: var(--c2);
      color: var(--c-surface);
      --bevel-color: color-mix(in srgb, var(--c2) 65%, black);
    }

    .sfx-toggle.is-off .sfx-btn,
    .sfx-toggle.is-off .sfx-btn:hover {
      background: var(--c5);
      --bevel-color: color-mix(in srgb, var(--c5) 65%, black);
    }

    .sfx-label {
      font-size: 14px;
      font-weight: 700;
      color: var(--c1);
      letter-spacing: 0.02em;
    }
  }

  .next-container {
    position: absolute;
    right: -128px;
    top: calc(50% - 80px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    animation: next-appear 0.3s ease forwards;
  }

  .next-button {
    height: 144px;
    width: 72px;
    padding: 18px 4px;
    flex-direction: column;
    gap: 8px;
    --bevel-color: color-mix(in srgb, var(--c2) 65%, black);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.25),
      0 5px 0 var(--bevel-color),
      0 9px 14px rgba(0, 0, 0, 0.22);
  }

  .next-button:active {
    transform: translateY(4px);
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2),
      0 1px 0 var(--bevel-color),
      0 3px 5px rgba(0, 0, 0, 0.18);
  }

  .next-label {
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.02em;
  }

  .autoskip-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .next-badge {
    --bevel-color: color-mix(in srgb, var(--c5) 65%, black);
    --badge-base-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 3px 0 var(--bevel-color),
      0 5px 8px rgba(0, 0, 0, 0.18);
    background: var(--c5);
    color: var(--c-surface);
    border-radius: 11px;
    font-size: 20px;
    font-weight: 700;
    padding: 7px 16px;
    box-shadow: var(--badge-base-shadow);
    transform-origin: center;
  }

  .next-badge.autoskip-caution {
    --shake-x: 1;
    --shake-rot: 1.5;
    animation: autoskip-shake 0.85s ease-in-out infinite;
  }

  .next-badge.autoskip-warning {
    --shake-x: 2;
    --shake-rot: 3;
    animation: autoskip-shake 0.5s ease-in-out infinite;
  }

  .next-badge.autoskip-critical {
    --shake-x: 3;
    --shake-rot: 5;
    animation:
      autoskip-shake 0.28s ease-in-out infinite,
      autoskip-pulse-red 0.55s ease-in-out infinite;
  }

  .autoskip-label {
    font-size: 15px;
    font-weight: 700;
    color: var(--c1);
    letter-spacing: 0.02em;
  }
}
</style>
