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
import { ref } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useStore } from '@/store';

const emits = defineEmits(['start']);

const toast = useToast();
const { t } = useI18n();
const store = useStore();

const url = ref('');
const showFirstTime = ref(false);

const showErr = () => {
  toast.add({
    severity: 'error',
    summary: t('error'),
    detail: t('nameErr'),
    life: 6000,
  });
};

const start = () => {
  if (url.value.includes('https://') || url.value.includes('/')) {
    const filteredName = url.value.replace(/\/$/, '').split('/').pop();
    if (filteredName) {
      store.setChannel(filteredName);
    } else {
      showErr();
      return;
    }
  } else if (url.value) {
    store.setChannel(url.value);
  } else {
    showErr();
    return;
  }

  store.save();
  emits('start', '/settings');
};

url.value = store.channel;
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
