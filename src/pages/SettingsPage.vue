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

import { onBeforeUnmount, onMounted, ref } from 'vue';
import { getTwitchRewards } from '@/utils/getTwitchRewards';
import { useStore } from '@/store';
import { createEmptyStatBlock, getStatistics } from '@/utils/statisticsUtils';

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

const isMounted = ref(true);

const clearStaleTwitchData = () => {
  // Drop cached values from the previous channel so a failed/empty lookup
  // doesn't leave the new run reading old IDs / rewards / emotes.
  store.setTwitchId(null);
  store.setRewards([]);
  store.setEmotes({ name: 'bttv', value: [] });
  store.setEmotes({ name: 'ffz', value: [] });
  store.setEmotes({ name: 'stv', value: [] });
};

const loadBasicData = async () => {
  try {
    const rewardsReq = await getTwitchRewards(store.channel);
    if (!isMounted.value) return;
    const channelData = rewardsReq?.[0]?.data?.community?.channel;
    if (
      Array.isArray(rewardsReq) &&
      rewardsReq.length > 0 &&
      channelData?.id != null
    ) {
      store.setTwitchId(channelData.id);
      store.setRewards(
        channelData.communityPointsSettings?.customRewards ?? [],
      );
      store.save();
    } else {
      clearStaleTwitchData();
      store.save();
    }
  } catch (e) {
    console.error(e);
    if (isMounted.value) {
      clearStaleTwitchData();
      store.save();
    }
  }
};

const loadBttvEmotes = async () => {
  try {
    const result = await (
      await fetch(
        `https://api.betterttv.net/3/cached/users/twitch/${store.twitchId}`,
      )
    ).json();
    if (!isMounted.value) return;
    const emotes: any[] = [];
    if (Array.isArray(result?.channelEmotes)) {
      emotes.push(...result.channelEmotes);
    }
    if (Array.isArray(result?.sharedEmotes)) {
      emotes.push(...result.sharedEmotes);
    }

    store.setEmotes({
      name: 'bttv',
      value: emotes
        .filter((emote: any) => emote?.id && typeof emote?.code === 'string')
        .map((emote: any) => ({
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
    if (!isMounted.value) return;

    const emotes = result?.emote_set?.emotes;
    if (Array.isArray(emotes)) {
      store.setEmotes({
        name: 'stv',
        value: emotes
          .filter((emote: any) => emote?.id && emote?.name)
          .map((emote: any) => ({
            name: String(emote.name).toLowerCase(),
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
    if (!isMounted.value) return;

    const emotes: any[] = [];
    if (result?.sets && typeof result.sets === 'object') {
      Object.values(result.sets).forEach((emoteSet: any) => {
        if (Array.isArray(emoteSet?.emoticons)) {
          emotes.push(...emoteSet.emoticons);
        }
      });
    }

    store.setEmotes({
      name: 'ffz',
      value: emotes
        .filter(
          (emote: any) =>
            typeof emote?.name === 'string' &&
            emote?.urls &&
            typeof emote.urls === 'object',
        )
        .map((emote: any) => ({
          name: emote.name.toLowerCase(),
          url:
            emote.urls[4] ??
            emote.urls[2] ??
            emote.urls[1] ??
            Object.values(emote.urls)[0] ??
            '',
        })),
    });
  } catch (e) {
    console.error(e);
    notify.error(`${t('errEmojiLoading')} FFZ`, { duration: 3000 });
  }
};

const RESERVED_VARIANT_NAMES = new Set(['kek', 'cringe', 'neutral']);

const normalizeVariants = (raw: any[]): any[] => {
  const seen = new Set<string>();
  // Reserve permanent variant names (kek, cringe) so customs can't shadow them.
  raw.forEach((v: any) => {
    if (v?.permanent && typeof v.name === 'string') {
      seen.add(v.name.toLowerCase());
    }
  });
  return raw.filter((v: any) => {
    if (!v) return false;
    if (v.permanent) return true;
    const trimmed = typeof v.name === 'string' ? v.name.trim() : '';
    if (!trimmed) return false;
    const lower = trimmed.toLowerCase();
    if (RESERVED_VARIANT_NAMES.has(lower)) return false;
    if (seen.has(lower)) return false;
    seen.add(lower);
    v.name = trimmed;
    return true;
  });
};

const saveSettings = () => {
  variantsSettings.value = normalizeVariants(variantsSettings.value);
  store.setVideoSettings(videoSettings.value);
  store.setVariantsSettings(variantsSettings.value);
  // Clicking Run = explicit "new run" — clear current stats so this session
  // starts clean. Reloads inside RunPage no longer wipe these.
  try {
    const stats = getStatistics(false);
    stats.current = createEmptyStatBlock();
    localStorage['statistics'] = JSON.stringify(stats);
  } catch (e) {
    console.error('Failed to reset current statistics', e);
  }
  store.save();
};

onMounted(async () => {
  await loadBasicData();
  if (!isMounted.value) return;
  if (store.twitchId) {
    await Promise.allSettled([
      loadBttvEmotes(),
      loadStvEmotes(),
      loadFfzEmotes(),
    ]);
    if (!isMounted.value) return;
    store.save();
  }
});

onBeforeUnmount(() => {
  isMounted.value = false;
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
