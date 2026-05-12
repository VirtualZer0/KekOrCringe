<template>
  <Panel
    :header="$t('settings.video')"
    class="settings-panel"
  >
    <RewardsWindow
      :visible="showRewardsWindow"
      @close="showRewardsWindow = false"
      @select="
        videoSettings.selectedRewardId = $event;
        showRewardsWindow = false;
      "
    />

    <div class="row">
      <div class="title">{{ $t('settings.addMethod') }}</div>
      <Select
        v-model="videoSettings.addVideoMethod"
        :options="addMethods"
        option-label="name"
        option-value="code"
        :placeholder="$t('settings.selectMethod')"
      />
    </div>
    <div
      v-if="videoSettings.addVideoMethod == 'bits'"
      class="row"
    >
      <div class="title">
        {{ $t('settings.bitsCount') }}
      </div>
      <InputNumber
        v-model="videoSettings.bitsCount"
        class="small"
        show-buttons
        :step="1"
        :min="1"
      />
    </div>
    <div
      v-if="videoSettings.addVideoMethod == 'reward'"
      class="row"
    >
      <div class="title">{{ $t('settings.reward') }}</div>
      <Button
        class="reward"
        :style="getRewardStyle(selectedReward)"
        @click="showRewardsWindow = true"
      >
        <img
          v-if="selectedReward"
          alt="reward"
          :src="
            selectedReward.image?.url ?? selectedReward.defaultImage?.url ?? ''
          "
        />
        <div>
          {{
            !selectedReward ? $t('settings.selectReward') : selectedReward.title
          }}
        </div></Button
      >
    </div>
    <div class="row">
      <div class="title">{{ $t('settings.duration') }}</div>
      <InputNumber
        v-model="videoSettings.durationFrom"
        class="small"
        show-buttons
        :step="0.1"
        :min="0"
      />
      <div>/</div>
      <InputNumber
        v-model="videoSettings.durationTo"
        class="small"
        show-buttons
        :step="0.1"
        :min="videoSettings.durationFrom"
      />
      <div>{{ $t('settings.mins') }}</div>
    </div>
    <div class="row">
      <div class="title">{{ $t('settings.viewCount') }}</div>
      <InputNumber v-model="videoSettings.viewCount" />
    </div>
    <div class="row">
      <div class="title">{{ $t('settings.skipCount') }}</div>
      <InputNumber
        v-model="videoSettings.skipCount"
        class="small"
        show-buttons
        :step="1"
        :min="1"
      />
    </div>
    <div class="row">
      <div class="title">{{ $t('settings.queueSize') }}</div>
      <InputNumber
        v-model="videoSettings.queueSize"
        class="small"
        show-buttons
        :step="1"
        :min="5"
      />
    </div>
    <div class="row">
      <Checkbox
        v-model="videoSettings.banwordsFilter"
        :binary="true"
        input-id="banwordsFilter"
      />
      <label for="banwordsFilter">{{ $t('settings.banwordsFilter') }}</label>
    </div>
    <div
      v-if="false"
      class="row"
    >
      <Checkbox
        v-model="videoSettings.autoSwitch"
        :binary="true"
        input-id="autoSwitch"
      />
      <label for="autoSwitch">{{ $t('settings.autoSwitch') }}</label>
    </div>
  </Panel>
</template>
<script lang="ts" setup>
import Panel from 'primevue/panel';
import InputNumber from 'primevue/inputnumber';
import Checkbox from 'primevue/checkbox';
import Select from 'primevue/select';
import Button from 'primevue/button';
import { useStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { computed, ref, watch } from 'vue';
import { getRewardStyle } from '@/utils/getRewardStyle';
import RewardsWindow from './RewardsWindow.vue';

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
watch(videoSettings, (newVal) => {
  emits('change', newVal);
});

const addMethods = [
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
];

const selectedReward = computed(() => {
  return (
    store.rewardsCache.find(
      (reward) => reward.id == videoSettings.value.selectedRewardId,
    ) ?? null
  );
});
</script>
<style scoped>
.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  .title {
    width: 160px;
  }

  .increased-height {
    height: 42px;
  }

  .small {
    :deep(.p-inputnumber-input) {
      width: 80px;
    }
  }
}

.reward {
  display: flex;
  gap: 16px;
  font-weight: bold;
  height: 48px;
}
</style>
