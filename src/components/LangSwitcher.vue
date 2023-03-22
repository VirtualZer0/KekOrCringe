<template>
  <div class="lang-switcher">
    <div
      v-for="(lang, i) in langs"
      class="item"
      :key="lang"
      @click="setLang(lang)"
      :class="{ active: activeLang.includes(lang) }"
    >
      {{ lang.toUpperCase() }}
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const langs = ['ru', 'en'];
const i18n = useI18n();

const activeLang = ref<string>(localStorage['lang'] ?? navigator.language);

const setLang = (lang: string) => {
  localStorage['lang'] = lang;
  activeLang.value = lang;
  i18n.locale.value = lang;
};
</script>
<style lang="scss" scoped>
.lang-switcher {
  display: flex;
  font-size: 21px;
  margin-left: -12px;

  .item {
    cursor: pointer;
    padding-right: 12px;
    margin-left: 12px;
    border-right: 2px #fff solid;
    height: 21px;
    line-height: 100%;

    &:last-child {
      border: none;
    }

    &.active {
      font-weight: bold;
    }
  }
}
</style>
