<template>
  <section class="main-page page">
    <div class="content">
      <Logo />
      <Start @start="router.push('/settings')" />
    </div>
    <a
      href="https://github.com/VirtualZer0/KekOrCringe"
      target="_blank"
      class="credits"
    >
      <div class="pi pi-github" />
      {{ $t('createdBy') }}
    </a>
    <LangSwitcher class="lang" />
  </section>
</template>

<script setup lang="ts">
import LangSwitcher from '@/components/LangSwitcher.vue';
import Logo from '@/components/Logo.vue';
import Start from '@/components/Start.vue';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style lang="scss" scoped>
.main-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(
    145deg,
    var(--c1) 0 19.95%,
    var(--c2) 20% 39.95%,
    var(--c5) 40% 59.95%,
    var(--c4) 60% 79.95%,
    var(--c3) 80% 100%
  );

  .credits {
    position: absolute;
    bottom: 32px;
    display: flex;
    align-items: center;
    font-size: 21px;
    gap: 12px;
    text-decoration: none;
    font-weight: bold;
    color: #fff;
    text-shadow: 1px 1px 3px rgba($color: #000000, $alpha: 0.3);
    left: 50%;
    transform: translateX(-50%);

    .pi {
      font-size: 32px;
    }
  }

  .lang {
    position: absolute;
    left: 32px;
    bottom: 32px;
  }
}
</style>
