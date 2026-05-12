<template>
  <section class="run-page page">
    <VideoResult
      v-if="result.show"
      :result="result.rate"
      :strong="result.strong"
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
      </div>
      <div
        v-if="currentVote.videoId"
        class="title"
        :style="{
          width: `${playerSizeW}vmax`,
          maxWidth: `${playerSizeW}vmax`,
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
            {{ $t('videoWait') }}
          </div>
          <YouTube
            v-show="currentVote.videoId"
            ref="ytPlayer"
            :width="playerSize.width"
            :height="playerSize.height"
            :src="`https://www.youtube.com/watch?v=${currentVote.videoId}`"
            :vars="{
              modestbranding: 1,
              iv_load_policy: 3,
            }"
            @ready="onPlayerReady"
          />
          <RateBar
            v-if="currentVote.videoId"
            :votes="currentVote.votes"
            :vote-count="currentVote.voteCount"
            :width="playerSize.width"
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
              <FastForward />
            </Button>
            <Badge class="next-badge">
              {{ currentVote.skipCount }}
            </Badge>
          </div>
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
  getVideoStats,
  getYTLink,
  getYTVideoId,
  IVideoData,
} from '@/utils/YTUtils';
import YouTube from 'vue3-youtube';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Images, Power, FastForward } from 'lucide-vue-next';
import VideoResult from '@/components/VideoResult.vue';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createEmptyStatBlock, getStatistics } from '@/utils/statisticsUtils';
import { useStore } from '@/store';
import { spawnFadeout } from '@/utils/spawnFadeout';
import { getRandItem } from '@/utils/getRandItem';
import RateBlock from '@/components/RateBlock.vue';
import RateBar from '@/components/RateBar.vue';
import VideoQueue from '@/components/VideoQueue.vue';
import { useChat } from '@/utils/useChat';
import { notify } from '@/utils/notify';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const store = useStore();
const chat = useChat();
const { t } = useI18n();

const showQueue = ref(false);
let variantRefs: Record<string, any> = {};
const playerSizeW = 68;
const playerSizeH = playerSizeW / 1.7777777;
const playerSize = ref({ width: 0, height: 0 });
const ytPlayer = ref<any>();

const result = ref({
  show: false,
  rate: 'cringe',
  strong: false,
});

const currentVote = ref<{
  videoId: string | null;
  votes: Record<string, string[]>;
  voteCount: number;
  skipCount: number;
  isActive: boolean;
}>({
  videoId: null,
  votes: {},
  skipCount: 0,
  voteCount: 0,
  isActive: false,
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

  localStorage['statistics'] = JSON.stringify(statistics.value);
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
    spawnFadeout(variantRefs[variant].$el, 'img', getRandItem(emotes).url);
  } else {
    switch (variant) {
      case 'kek':
        spawnFadeout(
          variantRefs[variant]?.$el,
          'div',
          getRandItem(['😁', '😆', '😃', '👍']),
        );
        break;
      case 'cringe':
        spawnFadeout(
          variantRefs[variant]?.$el,
          'div',
          getRandItem(['👎', '💩', '😡', '☹️']),
        );
        break;

      default:
        spawnFadeout(
          variantRefs[variant]?.$el,
          'div',
          getRandItem(['👀', '✌️', '✨', '⚡️']),
        );
        break;
    }
  }

  Object.entries(currentVote.value.votes).forEach((vote) => {
    if (vote[1].includes(user)) {
      currentVote.value.skipCount += store.variantsSettings.find(
        (v) => v.name == vote[0],
      )?.skipModifier as number;
      currentVote.value.votes[vote[0]] = vote[1].filter((v) => v != user);
      currentVote.value.voteCount--;
    }
  });

  currentVote.value.skipCount -= store.variantsSettings.find(
    (v) => v.name == variant,
  )?.skipModifier as number;
  currentVote.value.votes[variant].push(user);
  currentVote.value.voteCount++;

  if (currentVote.value.skipCount <= 0) {
    launchResult();
  }
};

const onPlayerReady = () => {
  ytPlayer.value.playVideo();
};

const videoList = ref<Record<string, IVideoData>>({});
if (localStorage.getItem('videoList')) {
  videoList.value = JSON.parse(localStorage.getItem('videoList') as string);
}

const statistics = ref(getStatistics());
statistics.value.current = createEmptyStatBlock();
localStorage['statistics'] = JSON.stringify(statistics.value);

const pendingVideoIds = new Set<string>();

/** Check user message and add video or vote */
const handleUserMessage = async (
  type: 'bits' | 'reward' | 'message',
  user: string,
  msg: string,
) => {
  // Check if msg contains video
  if (type == store.videoSettings.addVideoMethod) {
    const vid = getYTLink(msg);
    if (vid) {
      const id = getYTVideoId(vid);
      if (!id) return;

      if (Object.keys(videoList.value).length >= store.videoSettings.queueSize)
        return showErrToast(`${user}: ${t('queueIsFull')}`);

      if (videoList.value[id] || pendingVideoIds.has(id))
        return showErrToast(`${user}: ${t('alreadyExistsVideo')}`);

      pendingVideoIds.add(id);
      try {
        const data = await getVideoStats(vid, user, {
          filterBadwords: store.videoSettings.banwordsFilter,
        });

        if (data.err) {
          const err = t(`${data.err}Video`);
          return showErrToast(`${user}: ${err}`);
        }

        if (
          (data.video?.duration as number) >
          store.videoSettings.durationTo * 60
        )
          return showErrToast(`${user}: ${t('tooLongVideo')}`);

        if (
          (data.video?.duration as number) <
          store.videoSettings.durationFrom * 60
        )
          return showErrToast(`${user}: ${t('tooShortVideo')}`);

        if ((data.video?.viewCount as number) < store.videoSettings.viewCount)
          return showErrToast(`${user}: ${t('notEnoughViewsVideo')}`);

        return addVideoToList(data.video as IVideoData);
      } finally {
        pendingVideoIds.delete(id);
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
  videoList.value[video.id] = video;

  if (!currentVote.value.videoId) {
    setActiveVideo(video.id);
  }

  localStorage['videoList'] = JSON.stringify(videoList.value);
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

    if (
      !Object.entries(currentVote.value.votes)
        .filter((pair) => pair[0] != 'kek' && pair[0] != 'cringe')
        .some((pair) => pair[1].length > 0) &&
      (kekCount == 0 || cringeCount == 0) &&
      kekCount != cringeCount
    ) {
      result.value.strong = true;
    } else {
      result.value.strong = false;
    }
  }

  result.value.show = true;

  if (resultTimer !== null) clearTimeout(resultTimer);
  resultTimer = window.setTimeout(() => {
    result.value.show = false;
    removeVideoFromList(currentVote.value.videoId ?? '');
    if (Object.keys(videoList.value).length > 0) {
      setActiveVideo(Object.values(videoList.value)[0].id);
    } else {
      setActiveVideo(null);
    }
    resultTimer = null;
  }, 3700);
};

const clearQueue = () => {
  videoList.value = {};
  localStorage['videoList'] = JSON.stringify(videoList.value);
  setActiveVideo(null);
};

/** Remove selected video from queue */
const removeVideoFromList = (videoId: string) => {
  delete videoList.value[videoId];
  localStorage['videoList'] = JSON.stringify(videoList.value);

  if (videoId == currentVote.value.videoId) {
    if (Object.keys(videoList.value).length > 0) {
      setActiveVideo(Object.values(videoList.value)[0].id);
    } else {
      setActiveVideo(null);
    }
  }
};

/** Set correct size for video player */
const resizePlayer = () => {
  playerSize.value = {
    width:
      (window.innerWidth * playerSizeW) / 100 < 720
        ? 720
        : window.innerWidth * (playerSizeW / 100),
    height:
      (window.innerWidth * playerSizeH) / 100 < 480
        ? 480
        : window.innerWidth * (playerSizeH / 100),
  };

  if (ytPlayer.value?.$el?.children[0]?.style?.width) {
    ytPlayer.value.$el.children[0].style.width = playerSize.value.width + 'px';
    ytPlayer.value.$el.children[0].style.height =
      playerSize.value.height + 'px';
  }
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
  resizePlayer();
  window.addEventListener('resize', resizePlayer);

  store.variantsSettings.forEach((v) => {
    currentVote.value.votes[v.name] = [];
  });

  validateRewardSetting();

  chat.create(store.channel);
  chat.connect();

  if (Object.keys(videoList.value).length > 0) {
    setActiveVideo(Object.values(videoList.value)[0].id);
  }
});

onBeforeUnmount(() => {
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
  window.removeEventListener('resize', resizePlayer);
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
    margin: 0 auto;
    padding: 0 16px;
    padding-top: 4px;
    text-align: center;
    background: var(--c1);
    border-radius: 12px 12px 0 0;
    min-width: 720px;
    height: 38px;
    font-size: 24px;
    overflow: hidden;
    text-overflow: ellipsis;
    animation: title-appear 0.3s ease-in;
    white-space: nowrap;
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

  .launch-block {
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.6);
    background: linear-gradient(
      145deg,
      var(--c3) 0% 29.95%,
      var(--c1) 30% 39.95%,
      var(--c2) 40% 49.95%,
      var(--c4) 50% 59.95%,
      var(--c5) 60% 69.95%,
      var(--c3) 70% 100%
    );
  }

  .left-menu {
    display: flex;
    flex-direction: column;
    gap: 8px;
    position: absolute;
    left: 16px;
  }

  .next-container {
    position: absolute;
    right: -96px;
    top: calc(50% - 72px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    animation: next-appear 0.3s ease forwards;
  }

  .next-button {
    height: 128px;
    width: 64px;
  }

  .next-badge {
    background: var(--c5);
    border-radius: 12px;
    font-size: 18px;
    padding: 6px 12px;
  }
}

@keyframes title-appear {
  0% {
    transform: translateY(36px);
  }

  100% {
    transform: translateY(0);
  }
}

@keyframes next-appear {
  0% {
    transform: translateX(-96px);
  }

  100% {
    transform: translateX(0);
  }
}
</style>
