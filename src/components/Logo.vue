<template>
  <div class="logo">
    <div class="row">
      <span class="word kek">{{ $t('kek').toUpperCase() }}</span>
      <span class="badge">{{ $t('or') }}</span>
    </div>
    <div class="row">
      <span class="word cringe">{{ $t('cringe').toUpperCase() }}</span>
    </div>
    <p class="tagline">{{ $t('tagline') }}</p>
  </div>
</template>

<style scoped>
.logo {
  user-select: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 64px;
  gap: 0.4vw;

  .row {
    display: flex;
    align-items: center;
    gap: 1.6vw;
  }

  .word {
    font-family: var(--font-display);
    font-weight: 900;
    font-size: 8.6vw;
    line-height: 1;
    letter-spacing: 0.01em;
    -webkit-text-stroke: 4px var(--c1);
    paint-order: stroke fill;
    text-shadow:
      0 1px 0 var(--c1),
      0 2px 0 var(--c1),
      0 3px 0 var(--c1),
      0 4px 0 var(--c1),
      0 5px 0 var(--c1),
      0 6px 0 var(--c1),
      0 7px 0 var(--c1),
      0 8px 0 var(--c1),
      0 9px 0 var(--c1),
      0 10px 0 var(--c1),
      0 11px 0 var(--c1),
      0 14px 14px rgba(0, 0, 0, 0.28);
  }

  .kek,
  .cringe,
  .badge {
    transform: rotate(var(--rot, 0deg));
    animation: drop-in 0.5s var(--ease-drop) backwards;
  }

  .kek {
    --rot: -2deg;
    color: var(--c2);
    animation-delay: var(--enter-1);
  }

  .cringe {
    --rot: 1.5deg;
    color: var(--c5);
    animation-delay: var(--enter-3);
  }

  .badge {
    --rot: 5deg;
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 2.6vw;
    line-height: 1;
    color: var(--c1);
    background: var(--c-surface);
    border: 4px solid var(--c1);
    padding: 0.45em 0.7em;
    border-radius: 0.45em;
    box-shadow: 0 8px 0 var(--c1);
    animation-duration: 0.45s;
    animation-delay: var(--enter-2);
  }

  .tagline {
    font-family: var(--font-display);
    font-weight: 800;
    color: var(--c1);
    font-size: 1.5vw;
    margin: 1.6vw 0 0 0;
    animation: rise-in 0.5s ease backwards;
    animation-delay: var(--enter-4);
  }
}
</style>
