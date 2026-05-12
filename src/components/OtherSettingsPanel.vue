<template>
  <Card class="settings-panel">
    <CardHeader>
      <CardTitle>{{ $t('settings.other') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div class="flex flex-wrap justify-center gap-4">
        <Button @click="exportSettings()">
          <Upload />
          {{ $t('settings.exportSettings') }}
        </Button>
        <Button @click="importSettings()">
          <Download />
          {{ $t('settings.importSettings') }}
        </Button>
        <Button
          class="bg-amber-500 hover:bg-amber-600 text-white"
          @click="showClearStats = true"
        >
          <BarChart />
          {{ $t('settings.clearStatistic') }}
        </Button>
        <Button
          variant="destructive"
          @click="showResetSettings = true"
        >
          <Trash2 />
          {{ $t('settings.resetSettings') }}
        </Button>
      </div>
    </CardContent>
  </Card>

  <AlertDialog v-model:open="showResetSettings">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t('settings.resetSettings') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ $t('settings.resetSettingsConfirm') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ $t('settings.no') }}</AlertDialogCancel>
        <AlertDialogAction @click="doResetSettings">
          {{ $t('settings.yes') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>

  <AlertDialog v-model:open="showClearStats">
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{{ $t('settings.clearStatistic') }}</AlertDialogTitle>
        <AlertDialogDescription>
          {{ $t('settings.clearStatisticConfirm') }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>{{ $t('settings.no') }}</AlertDialogCancel>
        <AlertDialogAction @click="doClearStatistic">
          {{ $t('settings.yes') }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Upload, Download, BarChart, Trash2 } from 'lucide-vue-next';
import { useStore } from '@/store';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { notify } from '@/utils/notify';
import { saveAs } from 'file-saver';

const store = useStore();
const router = useRouter();
const { t } = useI18n();

const showResetSettings = ref(false);
const showClearStats = ref(false);

const doResetSettings = () => {
  store.$reset();
  store.save();
  router.push('/');
  notify.warning(t('settings.resetSettings'), {
    description: t('settings.resetSettingsDone'),
    duration: 3000,
  });
};

const doClearStatistic = () => {
  localStorage.removeItem('statistics');
  notify.warning(t('settings.clearStatistic'), {
    description: t('settings.clearStatisticDone'),
    duration: 3000,
  });
};

const exportSettings = () => {
  const blob = new Blob([JSON.stringify(store.$state)], {
    type: 'application/json;charset=utf-8',
  });
  saveAs(blob, 'KekOrCringe-settings.json');
};

const showImportError = (ex: unknown) => {
  notify.error(t('settings.importSettings'), {
    description: t('settings.importSettingsError'),
    duration: 3000,
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

            // Snapshot defaults so we can restore kek/cringe if the import drops them
            const defaultKek = JSON.parse(
              JSON.stringify(
                store.variantsSettings.find((v) => v.name === 'kek'),
              ),
            );
            const defaultCringe = JSON.parse(
              JSON.stringify(
                store.variantsSettings.find((v) => v.name === 'cringe'),
              ),
            );

            store.$patch(JSON.parse(content as string));

            // Enforce permanent invariants for kek/cringe regardless of import shape
            const kekEntry = store.variantsSettings.find(
              (v) => v.name === 'kek',
            );
            const cringeEntry = store.variantsSettings.find(
              (v) => v.name === 'cringe',
            );
            if (kekEntry) {
              kekEntry.permanent = true;
            } else if (defaultKek) {
              store.variantsSettings.unshift(defaultKek);
            }
            if (cringeEntry) {
              cringeEntry.permanent = true;
            } else if (defaultCringe) {
              store.variantsSettings.push(defaultCringe);
            }

            notify.success(t('settings.importSettings'), {
              description: t('settings.importSettingsDone'),
              duration: 3000,
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
