<template>
  <div class="debug-panel">
    <div class="debug-title">DEBUG · result anim</div>
    <button
      class="debug-btn"
      @click="emit('trigger', 'kek', false)"
    >
      kek
    </button>
    <button
      class="debug-btn debug-btn-strong"
      @click="emit('trigger', 'kek', true)"
    >
      kek · 100%
    </button>
    <button
      class="debug-btn"
      @click="emit('trigger', 'cringe', false)"
    >
      cringe
    </button>
    <button
      class="debug-btn debug-btn-strong"
      @click="emit('trigger', 'cringe', true)"
    >
      cringe · 100%
    </button>
    <button
      class="debug-btn"
      @click="emit('trigger', 'neutral', false)"
    >
      neutral
    </button>
    <template
      v-for="v in customVariants"
      :key="v.name"
    >
      <button
        class="debug-btn"
        :style="{ borderColor: v.color, color: v.color }"
        @click="emit('trigger', v.name, false)"
      >
        {{ v.name }}
      </button>
      <button
        class="debug-btn debug-btn-strong"
        @click="emit('trigger', v.name, true)"
      >
        {{ v.name }} · 100%
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useStore } from '@/store'

const emit = defineEmits<{
  trigger: [rate: string, strong: boolean]
}>()

const store = useStore()

const customVariants = computed(() =>
  store.variantsSettings.filter((v) => !v.permanent),
)
</script>

<style scoped>
.debug-panel {
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(20, 30, 40, 0.85);
  border: 2px dashed #ff66aa;
  border-radius: 10px;
  font-family: 'Courier New', Courier, monospace;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.35);
  min-width: 140px;
}

.debug-title {
  color: #ff66aa;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  text-align: center;
  margin-bottom: 2px;
  user-select: none;
}

.debug-btn {
  appearance: none;
  background: rgba(255, 102, 170, 0.12);
  border: 1px solid rgba(255, 102, 170, 0.6);
  border-radius: 6px;
  color: #fff;
  font-family: inherit;
  font-size: 12px;
  padding: 5px 10px;
  cursor: pointer;
  text-align: left;
  transition:
    background 0.12s ease,
    transform 0.08s ease;
}

.debug-btn:hover {
  background: rgba(255, 102, 170, 0.3);
}

.debug-btn:active {
  background: rgba(255, 102, 170, 0.55);
  transform: translateY(1px);
}

.debug-btn-strong {
  background: linear-gradient(
    90deg,
    rgba(255, 210, 80, 0.15),
    rgba(255, 102, 170, 0.15)
  );
  border-color: #ffd24a;
  color: #ffd24a;
}

.debug-btn-strong:hover {
  background: linear-gradient(
    90deg,
    rgba(255, 210, 80, 0.35),
    rgba(255, 102, 170, 0.3)
  );
}
</style>
