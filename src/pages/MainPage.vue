<template>
  <section class="main-page page">
    <FloatBlock
      tone="kek"
      side="left"
      emoji="😄"
    />
    <FloatBlock
      tone="cringe"
      side="right"
      emoji="😠"
    />
    <div class="content">
      <Logo />
      <Start @start="router.push('/settings')" />
    </div>
    <a
      href="https://github.com/VirtualZer0/KekOrCringe"
      target="_blank"
      class="credits"
    >
      <Github class="size-8" />
      {{ $t('createdBy') }}
    </a>
    <LangSwitcher class="lang" />
  </section>
</template>

<script setup lang="ts">
import FloatBlock from '@/components/FloatBlock.vue';
import LangSwitcher from '@/components/LangSwitcher.vue';
import Logo from '@/components/Logo.vue';
import Start from '@/components/Start.vue';
import { Github } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<style scoped>
.main-page {
  width: 100vw;
  height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      var(--c1) 0% 5%,
      var(--c2) 5% 10%,
      var(--c4) 10% 15%,
      transparent 15% 85%,
      var(--c4) 85% 90%,
      var(--c5) 90% 95%,
      var(--c1) 95% 100%
    ),
    radial-gradient(circle, rgba(90, 55, 0, 0.07) 1.4px, transparent 1.6px) 0
      0 / 18px 18px,
    var(--c3);

  .credits {
    position: absolute;
    bottom: 32px;
    display: flex;
    align-items: center;
    font-size: 21px;
    gap: 12px;
    text-decoration: none;
    font-weight: 700;
    color: var(--c1);
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }

  .lang {
    position: absolute;
    left: 32px;
    bottom: 32px;
    z-index: 2;
  }
}
</style>
