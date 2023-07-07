<template>
  <section class="settings-page page">
    <div class="content">
      <h1>{{ $t('settings.title') }}</h1>
      <div class="settings-container">
        <VideoSettingsPanel
          :videoSettingsIn="videoSettings"
          @change="videoSettings = $event"
        />
      </div>
      <div class="settings-container">
        <VariantsSettingsPanel
          :variantsSettingsIn="variantsSettings"
          @change="variantsSettings = $event"
        />
      </div>
      <div class="settings-container">
        <OtherSettingsPanel />
      </div>
    </div>
    <Button
      class="run-button p-button-lg"
      :label="$t('settings.run')"
      @click="
        saveSettings();
        router.push('/run');
      "
    ></Button>
  </section>
</template>

<script setup lang="ts">
import VideoSettingsPanel from '@/components/VideoSettingsPanel.vue';
import VariantsSettingsPanel from '@/components/VariantsSettingsPanel.vue';
import OtherSettingsPanel from '@/components/OtherSettingsPanel.vue';

import { onMounted, ref } from 'vue';
import { getTwitchRewards } from '@/utils/getTwitchRewards';
import { useStore } from '@/store';

import Button from 'primevue/button';
import { useRouter } from 'vue-router';

const router = useRouter();
const store = useStore();

const videoSettings = ref({ ...store.videoSettings });
const variantsSettings = ref([...store.variantsSettings]);

const loadBasicData = async () => {
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
          .customRewards
      );
    }

    store.save();
  }
};

const loadBttvEmotes = async () => {
  const result = await (
    await fetch(
      `https://api.betterttv.net/3/cached/users/twitch/${store.twitchId}`
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
      url: `https://cdn.betterttv.net/emote/${emote.id}/2x.${emote.imageType}`,
    })),
  });
};

const loadStvEmotes = async () => {
  const result = await (
    await fetch(`https://api.7tv.app/v2/users/${store.twitchId}/emotes`)
  ).json();

  if (Array.isArray(result)) {
    store.setEmotes({
      name: 'stv',
      value: result.map((emote) => ({
        name: emote.name.toLowerCase(),
        url: emote.urls.length > 1 ? emote.urls[1][1] : emote.urls[0][1],
      })),
    });
  }
};

const loadFfzEmotes = async () => {
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
};

const saveSettings = () => {
  store.setVideoSettings(videoSettings as any);
  store.setVariantsSettings(variantsSettings as any);
  store.save();
};

onMounted(async () => {
  await loadBasicData();
  if (store.twitchId) {
    await Promise.all([loadBttvEmotes(), loadStvEmotes(), loadFfzEmotes()]);
    store.save();
  }
});
</script>

<style lang="scss" scoped>
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
