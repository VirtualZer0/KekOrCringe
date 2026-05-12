<template>
  <div
    class="lang-switcher bevel-extrude-sm"
    :style="{ '--n': LANGS.length, '--idx': activeIndex }"
  >
    <div class="indicator bevel-inset-sm" />
    <button
      v-for="(lang, i) in LANGS"
      :key="lang"
      :class="['item', { active: i === activeIndex }]"
      @click="setLang(lang)"
    >
      {{ lang.toUpperCase() }}
    </button>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { LANGS, type Lang, getInitialLang } from '@/utils/locale';

const i18n = useI18n();
const activeLang = ref<Lang>(getInitialLang());

const activeIndex = computed(() => {
  const idx = LANGS.indexOf(activeLang.value);
  return idx === -1 ? 0 : idx;
});

const setLang = (lang: Lang) => {
  localStorage['lang'] = lang;
  activeLang.value = lang;
  i18n.locale.value = lang;
};
</script>

<style scoped>
.lang-switcher {
  position: relative;
  display: inline-flex;
  background: var(--c-surface);
  border: var(--rim-border);
  border-radius: 12px;
  padding: var(--switch-pad);
  gap: var(--switch-gap);
  font-family: var(--font-display);
}

.indicator {
  position: absolute;
  top: var(--switch-pad);
  left: var(--switch-pad);
  height: calc(100% - 2 * var(--switch-pad));
  width: calc(
    (100% - 2 * var(--switch-pad) - (var(--n, 1) - 1) * var(--switch-gap)) /
      var(--n, 1)
  );
  background: var(--c1);
  border-radius: 8px;
  z-index: 0;
  transform: translateX(
    calc(var(--idx, 0) * (100% + var(--switch-gap)))
  );
  transition: transform 0.3s var(--ease-switch);
}

.item {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 14px;
  font-weight: 800;
  font-size: 15px;
  line-height: 1;
  color: var(--c1);
  font-family: inherit;
  letter-spacing: 0.5px;
  transition: color 0.3s var(--ease-switch);
}

.item.active {
  color: #fff;
}
</style>
