<template>
  <div class="start-area">
    <div class="search-bar">
      <Twitch class="twitch-icon size-7" />
      <input
        v-model="url"
        class="field"
        type="text"
        :placeholder="$t('twitchUrl')"
        @keypress.enter="start()"
      />
      <Button
        class="shrink-0"
        @click="start()"
      >
        {{ $t('start') }}
      </Button>
    </div>
    <Dialog v-model:open="showFirstTime">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{{ $t('firstTimeTitle') }}</DialogTitle>
          <DialogDescription>{{ $t('firstTimeText') }}</DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script lang="ts" setup>
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useI18n } from 'vue-i18n';
import { ref, watch } from 'vue';
import { notify } from '@/utils/notify';
import { useStore } from '@/store';
import { Twitch } from 'lucide-vue-next';

const emits = defineEmits(['start']);

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
  notify.error(t('error'), {
    description: t('nameErr'),
    duration: 6000,
  });
};

const extractChannel = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.includes('/')) {
    try {
      const parsed = new URL(
        /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`,
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

<style scoped>
.start-area {
  display: flex;
  justify-content: center;
  margin-top: 4vw;
}

.search-bar {
  display: flex;
  align-items: center;
  width: 640px;
  background: linear-gradient(180deg, #23252f 0%, #181a23 100%);
  border-radius: 16px;
  padding: 10px 10px 10px 22px;
  gap: 14px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.09),
    inset 0 -2px 0 rgba(0, 0, 0, 0.55),
    0 12px 28px rgba(0, 0, 0, 0.35);
  transition: box-shadow 0.2s ease;
  animation: rise-in 0.5s ease backwards;
  animation-delay: var(--enter-5);
}

.twitch-icon {
  color: #9146ff;
  flex-shrink: 0;
}

.field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 18px;
  font-weight: 500;
  padding: 0;
  min-width: 0;
  font-family: inherit;
}

.field::placeholder {
  color: #8b8f9a;
}
</style>
