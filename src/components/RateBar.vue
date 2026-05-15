<template>
  <div class="ratebar">
    <div
      class="ratebar-item"
      :style="{
        backgroundColor: variantColor['kek'],
        width: barWidth('kek'),
      }"
    />
    <div
      v-for="vote in Object.keys(props.votes).filter(
        (k) => k != 'kek' && k != 'cringe',
      )"
      :key="vote"
      class="ratebar-item"
      :style="{
        backgroundColor: variantColor[vote],
        width: barWidth(vote),
      }"
    />
    <div
      class="ratebar-item"
      :style="{
        backgroundColor: variantColor['cringe'],
        width: barWidth('cringe'),
      }"
    />
  </div>
</template>
<script lang="ts" setup>
import { useStore } from '@/store';
import { computed } from 'vue';

const store = useStore();

const props = defineProps({
  votes: {
    type: Object,
    default: () => ({}),
  },
  voteCount: {
    type: Number,
    default: 0,
  },
});

const variantColor = computed(() => {
  const voteParams: Record<string, string> = {};
  store.variantsSettings.forEach((v) => {
    voteParams[v.name] = v.color;
  });
  return voteParams;
});

// When there are zero votes, show each variant at an equal share so the bar
// doesn't render blank. Once any vote lands, switch to true proportions —
// avoiding the previous bug where 1 kek vote rendered as ~67% kek / 33% cringe.
const barWidth = (name: string): string => {
  const variantCount = Object.keys(props.votes).length || 1;
  if (props.voteCount <= 0) {
    return `${100 / variantCount}%`;
  }
  const count = props.votes[name]?.length ?? 0;
  return `${(count / props.voteCount) * 100}%`;
};
</script>
<style scoped>
.ratebar {
  display: flex;
  width: 100%;
  min-width: 720px;
  border-radius: 12px;
  overflow: hidden;
  animation: ratebar-appear 0.3s ease-out;
}

.ratebar-item {
  height: 22px;
  transition: width 0.2s ease;
}
</style>
