<template>
  <Panel
    :header="$t('settings.other')"
    class="settings-panel"
  >
    <div class="other-settings">
      <Button
        :label="$t('settings.exportSettings')"
        icon="pi pi-upload"
        @click="exportSettings()"
      />
      <Button
        :label="$t('settings.importSettings')"
        icon="pi pi-download"
        @click="importSettings()"
      />
      <Button
        :label="$t('settings.clearStatistic')"
        severity="warning"
        icon="pi pi-chart-bar"
      />
      <Button
        :label="$t('settings.resetSettings')"
        severity="danger"
        icon="pi pi-trash"
        @click="resetSettings"
      />
    </div>
  </Panel>
</template>
<script lang="ts" setup>
import Panel from 'primevue/panel';
import Button from 'primevue/button';
import { useStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { saveAs } from 'file-saver';

const store = useStore();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const { t } = useI18n();

const resetSettings = (ev: Event) => {
  confirm.require({
    target: ev.currentTarget as HTMLElement,
    message: t('settings.resetSettingsConfirm'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('settings.yes'),
    rejectLabel: t('settings.no'),
    accept: () => {
      store.$reset();
      store.save();
      router.push('/');
      toast.add({
        severity: 'warn',
        detail: t('settings.resetSettingsDone'),
        summary: t('settings.resetSettings'),
        life: 3000,
      });
    },
  });
};

const exportSettings = () => {
  const blob = new Blob([JSON.stringify(store.$state)], {
    type: 'application/json;charset=utf-8',
  });
  saveAs(blob, 'KekOrCringe-settings.json');
};

const showImportError = (ex: unknown) => {
  toast.add({
    detail: t('settings.importSettingsError'),
    summary: t('settings.importSettings'),
    life: 3000,
    severity: 'error',
  });

  console.error(ex);
};

const importSettings = () => {
  const input: HTMLInputElement = document.createElement('input');
  input.type = 'file';

  input.onchange = (e: Event) => {
    try {
      const fileList = (e.target as HTMLInputElement).files;

      if (fileList && fileList.length == 1) {
        const file = fileList[0];

        const reader = new FileReader();
        reader.readAsText(file, 'UTF-8');

        reader.onload = (readerEvent) => {
          try {
            const content = (readerEvent.target as FileReader).result;
            store.$reset();
            store.$patch(JSON.parse(content as string));
            toast.add({
              detail: t('settings.importSettingsDone'),
              summary: t('settings.importSettings'),
              life: 3000,
              severity: 'success',
            });
            store.save();

            setTimeout(() => window.location.reload(), 1000);
          } catch (ex) {
            showImportError(ex);
          }
        };
      }
    } catch (ex) {
      showImportError(ex);
    }
  };

  input.click();
};
</script>
<style lang="scss" scoped>
.other-settings {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px;
}
</style>
