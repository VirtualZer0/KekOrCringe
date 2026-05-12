<template>
  <div class="flex justify-center gap-4 mt-[120px]">
    <Input
      v-model="url"
      class="w-[500px] h-12 text-lg"
      :placeholder="$t('twitchUrl')"
      @keypress.enter="start()"
    />
    <Button
      class="h-12 px-6"
      @click="start()"
    >
      {{ $t('start') }}
    </Button>
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
import { Input } from '@/components/ui/input';
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
import { toast } from 'vue-sonner';
import { useStore } from '@/store';

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
  toast.error(t('error'), {
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
