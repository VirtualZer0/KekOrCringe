<template>
  <ChunkyPanel
    icon="🎬"
    tone="c2"
    :title="$t('settings.video')"
  >
    <RewardsWindow
      :visible="showRewardsWindow"
      @close="showRewardsWindow = false"
      @select="
        videoSettings.selectedRewardId = $event;
        showRewardsWindow = false;
      "
    />

    <div class="form-grid">
      <div class="field">
        <Label>{{ $t('settings.addMethod') }}</Label>
        <Select v-model="videoSettings.addVideoMethod">
          <SelectTrigger class="w-full">
            <SelectValue :placeholder="$t('settings.selectMethod')" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem
              v-for="m in addMethods"
              :key="m.code"
              :value="m.code"
            >
              {{ m.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div
        v-if="videoSettings.addVideoMethod == 'bits'"
        class="field"
      >
        <Label>{{ $t('settings.bitsCount') }}</Label>
        <NumberField
          v-model="videoSettings.bitsCount"
          :step="1"
          :min="1"
          class="w-40"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <div
        v-if="videoSettings.addVideoMethod == 'reward'"
        class="field"
      >
        <Label>{{ $t('settings.reward') }}</Label>
        <Button
          class="reward h-11 gap-4 font-bold"
          :style="getRewardStyle(selectedReward)"
          @click="showRewardsWindow = true"
        >
          <img
            v-if="selectedReward"
            alt="reward"
            :src="
              selectedReward.image?.url ??
              selectedReward.defaultImage?.url ??
              ''
            "
          />
          <div>
            {{
              !selectedReward
                ? $t('settings.selectReward')
                : selectedReward.title
            }}
          </div>
        </Button>
      </div>

      <div class="field">
        <Label>
          {{ $t('settings.duration') }}
          <span class="label-hint">({{ $t('settings.mins') }})</span>
        </Label>
        <div class="duration-row">
          <NumberField
            v-model="videoSettings.durationFrom"
            :step="0.1"
            :min="0"
            :max="videoSettings.durationTo"
            :format-options="{
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }"
            class="w-40"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
          <span class="duration-separator">/</span>
          <NumberField
            v-model="videoSettings.durationTo"
            :step="0.1"
            :min="videoSettings.durationFrom"
            :format-options="{
              minimumFractionDigits: 1,
              maximumFractionDigits: 1,
            }"
            class="w-40"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>
      </div>

      <div class="field">
        <Label>
          {{ $t('settings.viewCount') }}
          <PlatformBadges :platforms="['youtube', 'twitch']" />
        </Label>
        <NumberField
          v-model="videoSettings.viewCount"
          :step="1"
          :min="0"
          class="w-40"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <div class="field">
        <Label>{{ $t('settings.skipCount') }}</Label>
        <NumberField
          v-model="videoSettings.skipCount"
          :step="1"
          :min="1"
          class="w-40"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <div class="field">
        <Label>{{ $t('settings.queueSize') }}</Label>
        <NumberField
          v-model="videoSettings.queueSize"
          :step="1"
          :min="5"
          class="w-40"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>

      <div class="field">
        <Label>{{ $t('settings.banwordsFilter') }}</Label>
        <div class="checkbox-row">
          <Checkbox
            id="banwordsFilter"
            v-model="videoSettings.banwordsFilter"
          />
          <Label
            for="banwordsFilter"
            class="cursor-pointer"
          >
            {{ $t('settings.enabled') }}
          </Label>
        </div>
      </div>

      <div class="field platforms-field">
        <Label>{{ $t('settings.platforms') }}</Label>
        <div class="checkbox-row">
          <Checkbox
            id="acceptYoutube"
            :model-value="acceptYoutube"
            @update:model-value="togglePlatform('youtube', $event === true)"
          />
          <Label
            for="acceptYoutube"
            class="cursor-pointer"
          >
            {{ $t('settings.acceptYoutube') }}
          </Label>
        </div>
        <div class="checkbox-row">
          <Checkbox
            id="acceptTiktok"
            :model-value="acceptTiktok"
            @update:model-value="togglePlatform('tiktok', $event === true)"
          />
          <Label
            for="acceptTiktok"
            class="cursor-pointer"
          >
            {{ $t('settings.acceptTiktok') }}
          </Label>
        </div>
        <div class="checkbox-row">
          <Checkbox
            id="acceptTwitch"
            :model-value="acceptTwitch"
            @update:model-value="togglePlatform('twitch', $event === true)"
          />
          <Label
            for="acceptTwitch"
            class="cursor-pointer"
          >
            {{ $t('settings.acceptTwitch') }}
          </Label>
        </div>
      </div>
    </div>
  </ChunkyPanel>
</template>
<script lang="ts" setup>
import { ChunkyPanel } from '@/components/ui/chunky-panel';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { computed, onMounted, ref, watch } from 'vue';
import { getRewardStyle } from '@/utils/getRewardStyle';
import RewardsWindow from './RewardsWindow.vue';
import { notify } from '@/utils/notify';
import type { VideoPlatform } from '@/utils/videoSources/types';
import PlatformBadges from '@/components/PlatformBadges.vue';

const store = useStore();
const { t } = useI18n();
const showRewardsWindow = ref(false);

const props = defineProps({
  videoSettingsIn: {
    type: Object,
    default: () => ({}),
  },
});

const emits = defineEmits(['change']);

const videoSettings = ref(props.videoSettingsIn);
watch(
  videoSettings,
  (newVal) => {
    emits('change', newVal);
  },
  { deep: true },
);

// Computed so labels update when the user switches locales mid-page.
const addMethods = computed(() => [
  {
    name: t('settings.addMethodSimple'),
    code: 'message',
  },
  {
    name: t('settings.addMethodReward'),
    code: 'reward',
  },
  {
    name: t('settings.addMethodBits'),
    code: 'bits',
  },
]);

// Keep durationFrom ≤ durationTo even if user types a higher value directly.
watch(
  () => videoSettings.value.durationFrom,
  (val) => {
    if (typeof val === 'number' && val > videoSettings.value.durationTo) {
      videoSettings.value.durationFrom = videoSettings.value.durationTo;
    }
  },
);

const selectedReward = computed(() => {
  return (
    store.rewardsCache.find(
      (reward) => reward.id == videoSettings.value.selectedRewardId,
    ) ?? null
  );
});

onMounted(() => {
  if (
    !Array.isArray(videoSettings.value.enabledPlatforms) ||
    videoSettings.value.enabledPlatforms.length === 0
  ) {
    videoSettings.value.enabledPlatforms = ['youtube', 'tiktok', 'twitch'];
  }
});

const acceptYoutube = computed(() =>
  (videoSettings.value.enabledPlatforms ?? []).includes('youtube'),
);

const acceptTiktok = computed(() =>
  (videoSettings.value.enabledPlatforms ?? []).includes('tiktok'),
);

const acceptTwitch = computed(() =>
  (videoSettings.value.enabledPlatforms ?? []).includes('twitch'),
);

const togglePlatform = (platform: VideoPlatform, val: boolean) => {
  const next = new Set<VideoPlatform>(
    videoSettings.value.enabledPlatforms ?? [],
  );
  if (val) next.add(platform);
  else next.delete(platform);
  if (next.size === 0) {
    notify.warning(t('settings.atLeastOnePlatform'));
    return;
  }
  videoSettings.value.enabledPlatforms = Array.from(next);
};
</script>
<style scoped>
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 64px;
  row-gap: 28px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.label-hint {
  font-weight: 500;
  opacity: 0.8;
  margin-left: 2px;
}

.duration-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.duration-separator {
  font-weight: 800;
  font-size: 22px;
  color: var(--c1);
}

.checkbox-row {
  display: flex;
  align-items: center;
  gap: 14px;
  height: 44px;
}

.platforms-field {
  grid-column: span 2;
}

.platforms-field .checkbox-row {
  height: 32px;
}
</style>
