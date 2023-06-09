<template>
  <div
    class="rate-block"
    :class="{ inactive: !props.isActive }"
  >
    <Button
      class="rate-variant"
      :ref="(el) => (variantRefs['kek'] = el)"
      :style="{
        backgroundColor: '#2a9d8f',
        borderColor: '#2a9d8f',
        paddingLeft: variantEmote['kek'] ? '74px' : '32px',
      }"
      @click="emits('vote', 'kek')"
    >
      <img
        v-if="variantEmote['kek']"
        :src="variantEmote['kek']"
        width="42"
        height="42"
      />
      {{ $t('kek') }}
      <div class="count">{{ votes['kek']?.length }}</div>
    </Button>
    <Button
      class="rate-variant"
      :ref="(el) => (variantRefs[variant.name] = el)"
      v-for="(variant, num) in store.variantsSettings.filter(
        (v) => !v.permanent
      )"
      :key="num"
      :style="{
        backgroundColor: variant.color,
        borderColor: variant.color,
        color: getCorrectFgColor(variant.color),
        paddingLeft: variantEmote[variant.name] ? '74px' : '32px',
      }"
      @click="emits('vote', variant.name)"
    >
      <img
        v-if="variantEmote[variant.name]"
        :src="(variantEmote[variant.name] as string)"
        width="42"
        height="42"
      />
      {{ variant.name }}
      <div class="count">{{ votes[variant.name]?.length }}</div>
    </Button>
    <Button
      class="rate-variant"
      :ref="(el) => (variantRefs['cringe'] = el)"
      :style="{
        backgroundColor: '#e76f51',
        borderColor: '#e76f51',
        paddingLeft: variantEmote['cringe'] ? '74px' : '32px',
      }"
      @click="emits('vote', 'cringe')"
    >
      <img
        v-if="variantEmote['cringe']"
        :src="variantEmote['cringe']"
        width="42"
        height="42"
      />
      {{ $t('cringe') }}
      <div class="count">{{ votes['cringe']?.length }}</div>
    </Button>
  </div>
</template>
<script lang="ts" setup>
import { computed, onBeforeUpdate, onMounted, onUpdated } from 'vue';
import { getCorrectFgColor } from '@/utils/getCorrectFgColor';
import { useStore } from '@/store';

import Button from 'primevue/button';

const props = defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
  votes: {
    type: Object,
    default: () => ({}),
  },
});

const store = useStore();
let variantRefs: Record<string, any> = {};

const emits = defineEmits(['init', 'vote']);

const variantEmote = computed(() => {
  const voteParams: Record<string, string | null> = {};
  store.variantsSettings.forEach((v) => {
    voteParams[v.name] = v.words.find((w) => w.url)?.url ?? null;
  });
  return voteParams;
});

onMounted(() => emits('init', variantRefs));

onBeforeUpdate(() => {
  variantRefs = [];
});

onUpdated(() => emits('init', variantRefs));
</script>
<style lang="scss" scoped>
.rate-block {
  position: fixed;
  width: 100vw;
  bottom: 12px;
  display: flex;
  justify-content: center;
  gap: 4vw;
  padding: 16px;

  .rate-variant {
    position: relative;
    overflow: visible;
    display: block;
    min-width: 110px;
    height: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 32px;
    border-radius: 100px;
    padding: 0 32px;
    font-weight: bold;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
    transition: all 0.2s ease;
    text-transform: capitalize;

    img {
      position: absolute;
      left: 8px;
      border-radius: 100%;
    }

    .count {
      position: absolute;
      right: -7px;
      top: -7px;
      min-width: 32px;
      height: 32px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 19px;
      font-weight: normal;
      text-shadow: none;
      background: var(--c1);
      padding: 4px;
      border-radius: 16px;
    }

    &:hover {
      transform: scale(1.2);
    }

    &:focus {
      box-shadow: none;
    }
  }

  &.inactive {
    pointer-events: none;
    opacity: 0.5;
  }
}
</style>
