<template>
  <Card class="settings-panel">
    <CardHeader>
      <CardTitle>{{ $t('settings.variants') }}</CardTitle>
    </CardHeader>
    <CardContent>
      <div
        v-for="(variant, num) in variantsSettings"
        :key="num"
        class="variant relative"
      >
        <Button
          v-if="!variant.permanent"
          variant="destructive"
          size="icon"
          class="absolute right-4 top-0"
          @click="variantsSettings.splice(num, 1)"
        >
          <Trash2 />
        </Button>
        <div class="row">
          <div class="title">{{ $t('settings.name') }}</div>
          <Input
            v-if="!variant.permanent"
            v-model="variant.name"
            class="w-80"
          />
          <b
            v-else
            class="flex items-center h-12"
          >
            {{ $t(variant.name).toUpperCase() }}
          </b>
        </div>
        <div class="row no-wrap">
          <div class="title">{{ $t('settings.triggers') }}</div>
          <div class="row">
            <Chip
              v-for="word in variant.words"
              :key="word.name"
              :label="word.name"
              :image="word.url"
              removable
              @remove="
                variant.words = variant.words.filter(
                  (w: any) => w.name != word.name,
                )
              "
            />
            <div class="flex items-center gap-2">
              <Popover v-model:open="pickerOpen[num]">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    class="h-8 min-w-[180px] justify-start gap-2"
                  >
                    <img
                      v-if="newVariant[num]?.url"
                      :src="newVariant[num]?.url"
                      class="size-5 rounded-full"
                    />
                    <span class="truncate">
                      {{
                        newVariant[num]?.name || $t('settings.selectTrigger')
                      }}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent class="w-80 p-0">
                  <div class="p-2 border-b">
                    <Input
                      v-model="search[num]"
                      :placeholder="$t('settings.selectTrigger')"
                      class="h-8"
                      @keydown.enter="commitText(num)"
                    />
                  </div>
                  <div class="max-h-72 overflow-y-auto">
                    <template
                      v-for="group in triggerVariants"
                      :key="group.label"
                    >
                      <div
                        v-if="filteredItems(group.items, search[num]).length"
                      >
                        <div
                          class="px-2 pt-2 text-xs text-muted-foreground font-medium"
                        >
                          {{ group.label }}
                        </div>
                        <button
                          v-for="emote in filteredItems(
                            group.items,
                            search[num],
                          )"
                          :key="emote.name"
                          type="button"
                          class="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent text-left text-sm"
                          @click="selectEmote(num, emote)"
                        >
                          <img
                            v-if="emote.url"
                            :src="emote.url"
                            class="size-5 rounded-full"
                            loading="lazy"
                          />
                          <span>{{ emote.name }}</span>
                        </button>
                      </div>
                    </template>
                    <button
                      v-if="search[num] && !exactMatchExists(search[num])"
                      type="button"
                      class="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-accent text-left text-sm border-t"
                      @click="commitText(num)"
                    >
                      <Plus class="size-4" />
                      <span
                        >{{ $t('settings.selectTrigger') }}: "{{
                          search[num]
                        }}"</span
                      >
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                size="icon"
                class="h-8 w-8"
                :disabled="!newVariant[num]?.name"
                @click="addTrigger(num, variant)"
              >
                <Check />
              </Button>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="title">{{ $t('settings.skipModifier') }}</div>
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
        <div
          v-if="!variant.permanent"
          class="row"
        >
          <div class="title">{{ $t('settings.color') }}</div>
          <ColorPicker v-model="variant.color" />
        </div>
        <Separator class="my-4" />
      </div>
      <div class="flex justify-center">
        <Button @click="addCustomVariant()">
          <Plus />
          {{ $t('settings.addCustomVariant') }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
<script lang="ts" setup>
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
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
import { Chip } from '@/components/ui/chip';
import { ColorPicker } from '@/components/ui/color-picker';
import { Trash2, Check, Plus } from 'lucide-vue-next';
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

const newVariant = ref<Emote[]>([]);
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

const selectEmote = (num: number, emote: Emote) => {
  newVariant.value[num] = { name: emote.name, url: emote.url };
  search.value[num] = '';
  pickerOpen.value[num] = false;
};

const commitText = (num: number) => {
  const text = search.value[num]?.trim();
  if (!text) return;
  newVariant.value[num] = { name: text };
  search.value[num] = '';
  pickerOpen.value[num] = false;
};

const addTrigger = (num: number, variant: any) => {
  const item = newVariant.value[num];
  if (!item?.name) return;
  variant.words.push(item);
  newVariant.value[num] = { name: '' };
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
</script>
<style scoped>
.variant {
  margin-bottom: 16px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  &.no-wrap {
    flex-wrap: nowrap;
    align-items: flex-start;
    margin-bottom: 0;

    .title {
      min-width: 160px;
      height: 32px;
      display: flex;
      align-items: center;
    }
  }

  .title {
    width: 160px;
  }
}
</style>
