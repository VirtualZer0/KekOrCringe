<template>
  <ChunkyPanel
    icon="⚙️"
    tone="c5"
    :title="$t('settings.other')"
  >
    <div class="flex flex-wrap justify-center gap-4">
      <Button
        class="other-btn"
        @click="exportSettings()"
      >
        <Upload class="size-6 stroke-[2.5]" />
        {{ $t('settings.exportSettings') }}
      </Button>
      <Button
        class="other-btn"
        @click="importSettings()"
      >
        <Download class="size-6 stroke-[2.5]" />
        {{ $t('settings.importSettings') }}
      </Button>
      <Button
        class="other-btn bg-c3 hover:bg-c3/90"
        @click="showClearStats = true"
      >
        <BarChart class="size-6 stroke-[2.5]" />
        {{ $t('settings.clearStatistic') }}
      </Button>
      <Button
        class="other-btn bg-c5 hover:bg-c5/90 text-white"
        @click="showResetSettings = true"
      >
        <Trash2 class="size-6 stroke-[2.5]" />
        {{ $t('settings.resetSettings') }}
      </Button>
    </div>
  </ChunkyPanel>

  <AlertDialog v-model:open="showResetSettings">
    <AlertDialogContent tone="c5">
      <template #icon>
        <RotateCcw class="size-7 stroke-[2.5]" />
      </template>
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
    <AlertDialogContent tone="c3">
      <template #icon>
        <BarChart class="size-7 stroke-[2.5]" />
      </template>
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
import { ChunkyPanel } from '@/components/ui/chunky-panel';
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
import { Upload, Download, BarChart, Trash2, RotateCcw } from 'lucide-vue-next';
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
            const parsed = JSON.parse(content as string);

            // Strict shape validation — must be a plain object
            if (
              !parsed ||
              typeof parsed !== 'object' ||
              Array.isArray(parsed)
            ) {
              throw new Error('Settings file must contain a plain object');
            }

            // Per-field type checks: every field that exists in the payload
            // must have the right type. Reject the whole import on mismatch
            // so we don't half-patch the store into a corrupted state.
            const isPlainObject = (v: unknown) =>
              v !== null && typeof v === 'object' && !Array.isArray(v);
            const fieldChecks: Record<string, (v: unknown) => boolean> = {
              channel: (v) => typeof v === 'string',
              twitchId: (v) => v === null || typeof v === 'string',
              rewardsCache: (v) => Array.isArray(v),
              videoSettings: isPlainObject,
              variantsSettings: (v) => Array.isArray(v),
              emotesCache: isPlainObject,
              skipPoints: (v) => typeof v === 'number',
              sfxMuted: (v) => typeof v === 'boolean',
            };
            for (const [key, check] of Object.entries(fieldChecks)) {
              if (key in parsed && !check((parsed as any)[key])) {
                throw new Error(`Invalid type for field "${key}"`);
              }
            }

            // Variants must each be a plain object with a string name
            if (Array.isArray(parsed.variantsSettings)) {
              for (const variant of parsed.variantsSettings) {
                if (
                  !isPlainObject(variant) ||
                  typeof variant.name !== 'string'
                ) {
                  throw new Error('Invalid variant entry');
                }
              }
            }

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

            store.$patch(parsed);

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
<style scoped>
.other-btn {
  flex: 1 1 auto;
  min-width: max-content;
  height: 60px;
  padding: 0 20px;
  padding-top: 0;
  padding-bottom: 0;
  font-size: 17px;
  font-weight: 800;
  gap: 10px;
  border-radius: 14px;
}
</style>
