<template>
  <section class="settings-page page">
    <div class="content">
      <PageTitle
        :title="$t('settings.title')"
        :tagline="$t('settings.tagline')"
      />
      <div class="settings-container">
        <VideoSettingsPanel
          :video-settings-in="videoSettings"
          @change="videoSettings = $event"
        />
      </div>
      <div class="settings-container">
        <VariantsSettingsPanel
          :variants-settings-in="variantsSettings"
          @change="variantsSettings = $event"
        />
      </div>
      <div class="settings-container">
        <OtherSettingsPanel />
      </div>
    </div>
    <div class="run-area">
      <svg
        class="chevron left"
        viewBox="0 0 40 80"
        aria-hidden="true"
      >
        <line
          x1="4"
          y1="14"
          x2="36"
          y2="26"
        />
        <line
          x1="4"
          y1="40"
          x2="36"
          y2="40"
        />
        <line
          x1="4"
          y1="66"
          x2="36"
          y2="54"
        />
      </svg>
      <button
        type="button"
        class="run-button"
        @click="
          saveSettings();
          router.push('/run');
        "
      >
        <span class="run-text">{{ $t('settings.run') }}</span>
      </button>
      <svg
        class="chevron right"
        viewBox="0 0 40 80"
        aria-hidden="true"
      >
        <line
          x1="36"
          y1="14"
          x2="4"
          y2="26"
        />
        <line
          x1="36"
          y1="40"
          x2="4"
          y2="40"
        />
        <line
          x1="36"
          y1="66"
          x2="4"
          y2="54"
        />
      </svg>
    </div>
  </section>
</template>

<script setup lang="ts">
import VideoSettingsPanel from '@/components/VideoSettingsPanel.vue';
import VariantsSettingsPanel from '@/components/VariantsSettingsPanel.vue';
import OtherSettingsPanel from '@/components/OtherSettingsPanel.vue';
import PageTitle from '@/components/PageTitle.vue';

import { onMounted, ref } from 'vue';
import { getTwitchRewards } from '@/utils/getTwitchRewards';
import { useStore } from '@/store';

import { useRouter } from 'vue-router';
import { notify } from '@/utils/notify';
import { useI18n } from 'vue-i18n';

const router = useRouter();
const store = useStore();
const { t } = useI18n();

const videoSettings = ref(JSON.parse(JSON.stringify(store.videoSettings)));
const variantsSettings = ref(
  JSON.parse(JSON.stringify(store.variantsSettings)),
);

const loadBasicData = async () => {
  try {
    const rewardsReq = await getTwitchRewards(store.channel);
    if (
      Array.isArray(rewardsReq) &&
      rewardsReq.length > 0 &&
      rewardsReq[0]?.data?.community?.channel?.id != null
    ) {
      store.setTwitchId(rewardsReq[0]?.data?.community?.channel?.id);

      if (
        rewardsReq[0]?.data?.community?.channel?.communityPointsSettings
          ?.customRewards?.length > 0
      ) {
        store.setRewards(
          rewardsReq[0].data.community.channel.communityPointsSettings
            .customRewards,
        );
      }

      store.save();
    }
  } catch (e) {
    console.error(e);
  }
};

const loadBttvEmotes = async () => {
  try {
    const result = await (
      await fetch(
        `https://api.betterttv.net/3/cached/users/twitch/${store.twitchId}`,
      )
    ).json();
    const emotes = [];
    if (result.channelEmotes) {
      emotes.push(...result.channelEmotes);
    }

    if (result.sharedEmotes) {
      emotes.push(...result.sharedEmotes);
    }

    store.setEmotes({
      name: 'bttv',
      value: emotes.map((emote) => ({
        name: emote.code.toLowerCase(),
        url: `https://cdn.betterttv.net/emote/${emote.id}/2x.${
          emote.imageType ?? 'webp'
        }`,
      })),
    });
  } catch (e) {
    console.error(e);
    notify.error(`${t('errEmojiLoading')} BTTV`, { duration: 3000 });
  }
};

const loadStvEmotes = async () => {
  try {
    const result = await (
      await fetch(`https://7tv.io/v3/users/twitch/${store.twitchId}`)
    ).json();

    const emotes = result?.emote_set?.emotes;
    if (Array.isArray(emotes)) {
      store.setEmotes({
        name: 'stv',
        value: emotes
          .filter((emote: any) => emote?.id && emote?.name)
          .map((emote: any) => ({
            name: emote.name.toLowerCase(),
            url: `https://cdn.7tv.app/emote/${emote.id}/2x.webp`,
          })),
      });
    }
  } catch (e) {
    console.error(e);
    notify.warning(`${t('errEmojiLoading')} 7TV`, { duration: 5000 });
  }
};

const loadFfzEmotes = async () => {
  try {
    const result = await (
      await fetch(`https://api.frankerfacez.com/v1/room/id/${store.twitchId}`)
    ).json();

    const emotes: any[] = [];
    if (result.sets && Object.values(result.sets).length > 0) {
      Object.values(result.sets).forEach((emoteSet: any) => {
        emotes.push(...emoteSet.emoticons);
      });
    }

    store.setEmotes({
      name: 'ffz',
      value: emotes.map((emote) => ({
        name: emote.name.toLowerCase(),
        url: emote.urls[2],
      })),
    });
  } catch (e) {
    console.error(e);
    notify.error(`${t('errEmojiLoading')} FFZ`, { duration: 3000 });
  }
};

const saveSettings = () => {
  store.setVideoSettings(videoSettings.value);
  store.setVariantsSettings(variantsSettings.value);
  store.save();
};

onMounted(async () => {
  await loadBasicData();
  if (store.twitchId) {
    await Promise.allSettled([
      loadBttvEmotes(),
      loadStvEmotes(),
      loadFfzEmotes(),
    ]);

    store.save();
  }
});
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  padding-bottom: 100px;
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

  .settings-container {
    width: 50vw;
    min-width: 800px;
    margin: 0 auto;
    margin-bottom: 32px;
  }

  .content {
    animation: page-appear 0.25s backwards;
    animation-delay: 0.3s;
  }
}

.run-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 28px;
  margin-top: 56px;
  user-select: none;
  animation: rise-in 0.5s ease backwards;
  animation-delay: var(--enter-3);
}

.chevron {
  width: 40px;
  height: 80px;
  flex-shrink: 0;
  overflow: visible;
}

.chevron line {
  stroke: var(--c1);
  stroke-width: 4;
  stroke-linecap: round;
}

.run-button {
  position: relative;
  width: 360px;
  height: 96px;
  border: none;
  outline: none;
  border-radius: 36px;
  background: var(--c5);
  cursor: pointer;
  padding: 0;
  box-shadow:
    inset 0 3px 0 rgba(255, 255, 255, 0.4),
    inset 0 -8px 0 rgba(0, 0, 0, 0.2),
    0 12px 0 var(--c1),
    0 22px 28px rgba(0, 0, 0, 0.32);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.run-button:hover {
  transform: translateY(-3px) rotate(-0.6deg);
  box-shadow:
    inset 0 3px 0 rgba(255, 255, 255, 0.45),
    inset 0 -8px 0 rgba(0, 0, 0, 0.2),
    0 15px 0 var(--c1),
    0 26px 32px rgba(0, 0, 0, 0.34);
}

.run-button:active {
  transform: translateY(8px) rotate(0deg);
  box-shadow:
    inset 0 3px 0 rgba(255, 255, 255, 0.35),
    inset 0 -4px 0 rgba(0, 0, 0, 0.22),
    0 4px 0 var(--c1),
    0 10px 14px rgba(0, 0, 0, 0.22);
  transition:
    transform 0.08s ease,
    box-shadow 0.08s ease;
}

.run-text {
  display: block;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 54px;
  line-height: 1;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-surface);
  -webkit-text-stroke: 4px var(--c1);
  paint-order: stroke fill;
  text-shadow:
    0 2px 0 var(--c1),
    0 4px 0 var(--c1),
    0 8px 6px rgba(0, 0, 0, 0.25);
}
</style>
