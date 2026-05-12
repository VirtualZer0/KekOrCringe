<template>
  <div class="start">
    <InputText
      class="p-inputtext-lg input"
      :placeholder="$t('twitchUrl')"
      v-model="url"
      @keypress.enter="start()"
    />
    <Button @click="start()">{{ $t('start') }}</Button>
    <Dialog
      v-model:visible="showFirstTime"
      modal
      :header="$t('firstTimeTitle')"
    >
      <p>
        {{ $t('firstTimeText') }}
      </p>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useStore } from '@/store';

const emits = defineEmits(['start']);

const toast = useToast();
const { t } = useI18n();
const store = useStore();

const url = ref(store.channel);
const showFirstTime = ref(store.firstTime);

watch(showFirstTime, (open) => {
  if (!open && store.firstTime) {
    store.setFirstTime(false);
    store.save();
  }
});

const showErr = () => {
  toast.add({
    severity: 'error',
    summary: t('error'),
    detail: t('nameErr'),
    life: 6000,
  });
};

const extractChannel = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.includes('/')) {
    try {
      const parsed = new URL(
        /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      );
      const segment = parsed.pathname.split('/').filter(Boolean)[0];
      return segment ? segment.toLowerCase() : null;
    } catch {
      const parts = trimmed.replace(/\/$/, '').split('/').filter(Boolean);
      return parts.length > 0 ? parts[parts.length - 1].toLowerCase() : null;
    }
  }

  return trimmed.toLowerCase();
};

const start = () => {
  const channel = extractChannel(url.value);
  if (!channel) {
    showErr();
    return;
  }

  store.setChannel(channel);
  store.save();
  emits('start', '/settings');
};
</script>

<style lang="scss" scoped>
.start {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 120px;
  .input {
    width: 500px;
  }
}
</style>
