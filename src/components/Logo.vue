<template>
  <div class="logo">
    <div class="left text-xxl">{{ $t('kek').toUpperCase() }}</div>
    <div class="delimiter">{{ $t('or') }}</div>
    <div class="right text-xxl">{{ $t('cringe').toUpperCase() }}</div>
  </div>
</template>
<style lang="scss" scoped>
.logo {
  padding-top: 100px;
  user-select: none;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;

  .left,
  .right {
    font-family: 'Courier New', Courier, monospace;
    z-index: 2;
    font-weight: bold;
    text-shadow: 1px 1px 1px #919191, 1px 2px 1px #919191, 1px 3px 1px #919191,
      1px 4px 1px #919191, 1px 5px 1px #919191, 1px 6px 1px #919191,
      1px 7px 1px #919191, 1px 8px 1px #919191, 1px 9px 1px #919191,
      1px 10px 1px #919191;

    animation: drop-from-above 0.3s ease-in backwards;
  }

  .left {
    animation-delay: 0.6s;
  }

  .delimiter {
    animation: drop-from-above 0.3s ease-in backwards;
    animation-delay: 0.3s;
    background: var(--fg);
    width: 8vw;
    height: 3vw;
    font-size: 2vw;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--bg);
    font-weight: bold;
    font-family: 'Segoe Script';
    z-index: 0;
  }

  @keyframes drop-from-above {
    0% {
      transform: translateY(-450px);
    }

    100% {
      transform: translateY(0);
    }
  }

  @keyframes fade-in {
    0% {
      transform: scale(0);
    }

    100% {
      transform: scale(1);
    }
  }
}
</style>
