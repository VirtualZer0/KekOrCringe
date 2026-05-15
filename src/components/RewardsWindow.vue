<template>
  <Dialog
    :open="props.visible"
    @update:open="!$event && emit('close')"
  >
    <DialogContent
      class="w-[60vw] sm:max-w-[60vw] max-h-[85vh] overflow-y-auto"
    >
      <DialogHeader>
        <DialogTitle>{{ $t('settings.selectReward') }}</DialogTitle>
        <DialogDescription class="sr-only">
          {{ $t('settings.selectReward') }}
        </DialogDescription>
      </DialogHeader>
      <div class="flex flex-wrap justify-center gap-8">
        <Button
          v-for="reward in store.rewardsCache"
          :key="reward.id"
          class="reward w-80 h-12 flex gap-4 font-bold"
          :style="getRewardStyle(reward)"
          @click="emit('select', reward.id)"
        >
          <img
            alt="reward"
            :src="reward.image?.url ?? reward.defaultImage?.url ?? ''"
            loading="lazy"
          />
          <div>{{ reward.title }}</div>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>
<script lang="ts" setup>
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store';
import { getRewardStyle } from '@/utils/getRewardStyle';

const emit = defineEmits(['close', 'select']);

const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
});

const store = useStore();
</script>
