<template>
  <ChunkyPanel
    icon="⭐"
    tone="c4"
    :title="$t('settings.variants')"
  >
    <div class="variants-list">
      <div
        v-for="(variant, num) in variantsSettings"
        :key="num"
        class="variant-card"
      >
        <div
          class="number-badge"
          :style="{ background: variant.color }"
        >
          {{ num + 1 }}
        </div>

        <div class="field name-field">
          <Label>{{ $t('settings.name') }}</Label>
          <Input
            v-if="!variant.permanent"
            v-model="variant.name"
          />
          <div
            v-else
            class="static-name"
          >
            {{ $t(variant.name).toUpperCase() }}
          </div>
        </div>

        <div class="field triggers-field">
          <Label>{{ $t('settings.triggers') }}</Label>
          <div class="trigger-chips">
            <Chip
              v-for="word in variant.words"
              :key="word.name.toLowerCase()"
              :label="word.name"
              :image="word.url"
              removable
              @remove="
                variant.words = variant.words.filter(
                  (w: any) => w.name.toLowerCase() != word.name.toLowerCase(),
                )
              "
            />
            <Popover v-model:open="pickerOpen[num]">
              <PopoverTrigger as-child>
                <button
                  type="button"
                  class="add-trigger-btn"
                  :aria-label="$t('settings.selectTrigger')"
                >
                  <Plus class="size-4 stroke-[3]" />
                </button>
              </PopoverTrigger>
              <PopoverContent class="p-0">
                <div class="p-2">
                  <Input
                    v-model="search[num]"
                    :placeholder="$t('settings.selectTrigger')"
                    class="h-9 text-sm"
                    @keydown.enter="commitText(num, variant)"
                  />
                </div>
                <div class="max-h-72 overflow-y-auto px-1 pb-2">
                  <template
                    v-for="group in triggerVariants"
                    :key="group.label"
                  >
                    <div v-if="filteredItems(group.items, search[num]).length">
                      <div
                        class="px-2 pt-2 pb-1 text-xs font-bold text-c1/60 uppercase tracking-wider"
                      >
                        {{ group.label }}
                      </div>
                      <button
                        v-for="emote in filteredItems(group.items, search[num])"
                        :key="emote.name"
                        type="button"
                        class="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[color-mix(in_oklab,var(--c4)_30%,transparent)] text-left text-sm font-bold text-c1 cursor-pointer transition-colors"
                        @click="addEmote(num, variant, emote)"
                      >
                        <img
                          v-if="emote.url"
                          :src="emote.url"
                          class="size-5 rounded-md"
                          loading="lazy"
                        />
                        <span>{{ emote.name }}</span>
                      </button>
                    </div>
                  </template>
                  <button
                    v-if="search[num] && !exactMatchExists(search[num])"
                    type="button"
                    class="w-full mt-2 flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[color-mix(in_oklab,var(--c4)_30%,transparent)] text-left text-sm font-bold text-c1 cursor-pointer transition-colors border-t-2 border-c1/15 pt-2"
                    @click="commitText(num, variant)"
                  >
                    <Plus class="size-4 stroke-[3]" />
                    <span
                      >{{ $t('settings.selectTrigger') }}: "{{
                        search[num]
                      }}"</span
                    >
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div class="field modifier-field">
          <Label>{{ $t('settings.skipModifier') }}</Label>
          <NumberField
            v-model="variant.skipModifier"
            :step="1"
            class="w-32"
          >
            <NumberFieldContent>
              <NumberFieldDecrement />
              <NumberFieldInput />
              <NumberFieldIncrement />
            </NumberFieldContent>
          </NumberField>
        </div>

        <div class="field color-field">
          <Label>{{ $t('settings.color') }}</Label>
          <ColorPicker v-model="variant.color" />
        </div>

        <div
          v-if="!variant.permanent"
          class="delete-col"
        >
          <Label
            class="invisible"
            aria-hidden="true"
          >
            &nbsp;
          </Label>
          <button
            type="button"
            class="delete-btn"
            :aria-label="$t('settings.delete')"
            @click="removeVariant(num)"
          >
            <Trash2 class="size-5 stroke-[2.5]" />
          </button>
        </div>
      </div>
    </div>

    <div class="add-variant-row">
      <button
        type="button"
        class="add-variant-btn"
        @click="addCustomVariant()"
      >
        <Plus class="size-5 stroke-[3]" />
        {{ $t('settings.addCustomVariant') }}
      </button>
    </div>
  </ChunkyPanel>
</template>
<script lang="ts" setup>
import { ChunkyPanel } from '@/components/ui/chunky-panel';
import { Input } from '@/components/ui/input';
import {
  NumberField,
  NumberFieldContent,
  NumberFieldDecrement,
  NumberFieldIncrement,
  NumberFieldInput,
} from '@/components/ui/number-field';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Chip } from '@/components/ui/chip';
import { ColorPicker } from '@/components/ui/color-picker';
import { Trash2, Plus } from 'lucide-vue-next';
import { useStore } from '@/store';
import { computed, ref, watch } from 'vue';

interface Emote {
  name: string;
  url?: string;
}

const store = useStore();
const props = defineProps({
  variantsSettingsIn: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(['change']);

const triggerVariants = computed(() => [
  { label: 'BTTV', items: store.emotesCache.bttv as Emote[] },
  { label: '7TV', items: store.emotesCache.stv as Emote[] },
  { label: 'FFZ', items: store.emotesCache.ffz as Emote[] },
]);

const variantsSettings = ref<any>(props.variantsSettingsIn);
watch(variantsSettings, (newVal) => {
  emits('change', newVal);
});

const search = ref<string[]>([]);
const pickerOpen = ref<boolean[]>([]);

const filteredItems = (items: Emote[], q: string) => {
  if (!q) return items;
  const needle = q.toLowerCase();
  return items.filter((e) => e.name.toLowerCase().includes(needle));
};

const exactMatchExists = (q: string) => {
  const needle = q.toLowerCase();
  return triggerVariants.value.some((g) =>
    g.items.some((e) => e.name.toLowerCase() === needle),
  );
};

const wordExists = (variant: any, name: string) =>
  variant.words.some((w: any) => w.name.toLowerCase() === name.toLowerCase());

const addEmote = (num: number, variant: any, emote: Emote) => {
  if (!wordExists(variant, emote.name)) {
    variant.words.push({ name: emote.name, url: emote.url });
  }
  search.value[num] = '';
  pickerOpen.value[num] = false;
};

const commitText = (num: number, variant: any) => {
  const text = search.value[num]?.trim();
  if (!text) return;
  if (!wordExists(variant, text)) {
    variant.words.push({ name: text });
  }
  search.value[num] = '';
  pickerOpen.value[num] = false;
};

const addCustomVariant = () => {
  variantsSettings.value?.push({
    name: '',
    skipModifier: 0,
    words: [],
    permanent: false,
    color: '#90e0ef',
  });
};

const removeVariant = (num: number) => {
  variantsSettings.value.splice(num, 1);
  search.value.splice(num, 1);
  pickerOpen.value.splice(num, 1);
};
</script>
<style scoped>
.variants-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.variant-card {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 14px 18px 16px 18px;
  background: color-mix(in oklab, var(--c-surface) 60%, white);
  border: 2px solid color-mix(in oklab, var(--c1) 20%, transparent);
  border-radius: 16px;
}

.number-badge {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 2.5px solid var(--c1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 16px;
  box-shadow: var(--rim-shadow);
  margin-top: 28px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.name-field {
  width: 200px;
  flex-shrink: 0;
}

.triggers-field {
  flex: 1;
  min-width: 0;
}

.modifier-field,
.color-field {
  flex-shrink: 0;
}

.static-name {
  display: flex;
  align-items: center;
  height: 44px;
  font-family: var(--font-display);
  font-weight: 900;
  font-size: 22px;
  color: var(--c1);
  letter-spacing: 0.04em;
}

.trigger-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  min-height: 44px;
}

.add-trigger-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 2px dashed var(--c1);
  border-radius: 10px;
  background: transparent;
  color: var(--c1);
  cursor: pointer;
  transition:
    background 0.12s ease,
    transform 0.08s ease;
}

.add-trigger-btn:hover {
  background: color-mix(in oklab, var(--c1) 8%, transparent);
}

.add-trigger-btn:active {
  transform: translateY(1px);
}

.delete-col {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.delete-btn {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 2.5px solid var(--c1);
  border-radius: 10px;
  background: var(--c5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: var(--rim-shadow);
  transition:
    transform 0.08s ease,
    box-shadow 0.15s ease;
}

.delete-btn:hover {
  background: color-mix(in oklab, var(--c5) 90%, black);
}

.delete-btn:active {
  transform: translateY(2px);
  box-shadow: var(--rim-shadow-pressed);
}

.add-variant-row {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.add-variant-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 24px;
  border: 2.5px solid var(--c1);
  border-radius: 12px;
  background: var(--c2);
  color: white;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  box-shadow: var(--rim-shadow-md);
  transition:
    transform 0.08s ease,
    box-shadow 0.15s ease;
}

.add-variant-btn:active {
  transform: translateY(2px);
  box-shadow: 0 2px 0 var(--c1);
}
</style>
