<template>
  <Card class="settings-panel">
    <CardHeader>
      <CardTitle>{{ $t('settings.video') }}</CardTitle>
    </CardHeader>
    <CardContent>
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
        <Select v-model="videoSettings.addVideoMethod">
          <SelectTrigger class="w-56">
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
        class="row"
      >
        <div class="title">
          {{ $t('settings.bitsCount') }}
        </div>
        <NumberField
          v-model="videoSettings.bitsCount"
          :step="1"
          :min="1"
          class="w-32"
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
        class="row"
      >
        <div class="title">{{ $t('settings.reward') }}</div>
        <Button
          class="reward h-12 gap-4 font-bold"
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
      <div class="row">
        <div class="title">{{ $t('settings.duration') }}</div>
        <NumberField
          v-model="videoSettings.durationFrom"
          :step="0.1"
          :min="0"
          :format-options="{
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }"
          class="w-32"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
        <div>/</div>
        <NumberField
          v-model="videoSettings.durationTo"
          :step="0.1"
          :min="videoSettings.durationFrom"
          :format-options="{
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }"
          class="w-32"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
        <div>{{ $t('settings.mins') }}</div>
      </div>
      <div class="row">
        <div class="title">{{ $t('settings.viewCount') }}</div>
        <NumberField
          v-model="videoSettings.viewCount"
          :step="1"
          :min="0"
          class="w-32"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>
      <div class="row">
        <div class="title">{{ $t('settings.skipCount') }}</div>
        <NumberField
          v-model="videoSettings.skipCount"
          :step="1"
          :min="1"
          class="w-32"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>
      <div class="row">
        <div class="title">{{ $t('settings.queueSize') }}</div>
        <NumberField
          v-model="videoSettings.queueSize"
          :step="1"
          :min="5"
          class="w-32"
        >
          <NumberFieldContent>
            <NumberFieldDecrement />
            <NumberFieldInput />
            <NumberFieldIncrement />
          </NumberFieldContent>
        </NumberField>
      </div>
      <div class="row">
        <Checkbox
          id="banwordsFilter"
          v-model="videoSettings.banwordsFilter"
        />
        <Label for="banwordsFilter">{{ $t('settings.banwordsFilter') }}</Label>
      </div>
      <div
        v-if="false"
        class="row"
      >
        <Checkbox
          id="autoSwitch"
          v-model="videoSettings.autoSwitch"
        />
        <Label for="autoSwitch">{{ $t('settings.autoSwitch') }}</Label>
      </div>
    </CardContent>
  </Card>
</template>
<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
}
</style>
