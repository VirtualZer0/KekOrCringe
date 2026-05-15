<template>
  <div class="ratebar">
    <div
      class="ratebar-item"
      :style="{
        backgroundColor: variantColor['kek'],
        width:
          ((votes['kek'].length + 1) /
            (voteCount + Object.keys(props.votes).length)) *
            100 +
          '%',
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
        width:
          ((votes[vote].length + 1) /
            (voteCount + Object.keys(props.votes).length)) *
            100 +
          '%',
      }"
    />
    <div
      class="ratebar-item"
      :style="{
        backgroundColor: variantColor['cringe'],
        width:
          ((votes['cringe'].length + 1) /
            (voteCount + Object.keys(props.votes).length)) *
            100 +
          '%',
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
