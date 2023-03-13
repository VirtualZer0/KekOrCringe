<template>
  <Dialog
    :visible="props.visible"
    @update:visible="emit('close')"
    modal
    :header="$t('settings.selectReward')"
    :style="{ width: '60vw' }"
  >
    <div class="rewards">
      <Button
        class="reward"
        v-for="reward in store.rewardsCache"
        :key="reward.id"
        :style="getRewardStyle(reward)"
        @click="emit('select', reward.id)"
      >
        <img
          alt="reward"
          :src="reward.image ? reward.image.url : reward.defaultImage.url"
          loading="lazy"
        />
        <div>{{ reward.title }}</div>
      </Button>
    </div>
  </Dialog>
</template>
<script lang="ts" setup>
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
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
<style lang="scss" scoped>
.rewards {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;

  .reward {
    width: 320px;
    display: flex;
    gap: 16px;
    font-weight: bold;
  }
}
</style>
