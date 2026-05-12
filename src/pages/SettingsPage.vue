<template>
  <section class="settings-page page">
    <div class="content">
      <h1>{{ $t('settings.title') }}</h1>
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
    <Button
      class="run-button"
      @click="
        saveSettings();
        router.push('/run');
      "
    >
      {{ $t('settings.run') }}
    </Button>
  </section>
</template>

<script setup lang="ts">
import VideoSettingsPanel from '@/components/VideoSettingsPanel.vue';
import VariantsSettingsPanel from '@/components/VariantsSettingsPanel.vue';
import OtherSettingsPanel from '@/components/OtherSettingsPanel.vue';

import { onMounted, ref } from 'vue';
import { getTwitchRewards } from '@/utils/getTwitchRewards';
import { useStore } from '@/store';

import { Button } from '@/components/ui/button';
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
  width: calc(100vw - 8px);
  min-height: 100vh;
  padding-bottom: 100px;
  background: #264653;

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

.run-button {
  display: block;
  margin: 0 auto;
  width: 300px;
  height: 80px;
  font-size: 40px;
  background: var(--c5);
  border-color: var(--c5);
}
</style>
