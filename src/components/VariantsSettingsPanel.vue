<template>
  <Panel
    :header="$t('settings.variants')"
    class="settings-panel"
  >
    <div
      class="variant"
      v-for="(variant, num) in variantsSettings"
      :key="num"
    >
      <Button
        icon="pi pi-trash"
        class="delete"
        severity="danger"
        @click="variantsSettings.splice(num, 1)"
        v-if="!variant.permanent"
      />
      <div class="row">
        <div class="title">{{ $t('settings.name') }}</div>
        <InputText
          v-if="!variant.permanent"
          class="increased-height"
          v-model="variant.name"
        />
        <b
          style="height: 48px; display: flex; align-items: center"
          v-else
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
                (w: any) => w.name != word.name
              )
            "
          />
          <div>
            <Dropdown
              class="small-height"
              :modelValue="newVariant[num]?.name"
              @update:modelValue="
                newVariant[num] = ($event as any).name
                  ? $event
                  : { name: $event }
              "
              :options="triggerVariants"
              optionGroupLabel="label"
              optionGroupChildren="items"
              optionLabel="name"
              :placeholder="$t('settings.selectTrigger')"
              editable
            >
              <template #optiongroup="slotProps">
                <div>{{ slotProps.option.label }}</div>
              </template>
              <template #option="slotProps">
                <div style="display: flex; align-items: center; gap: 10px">
                  <img
                    v-if="slotProps.option.url"
                    :alt="slotProps.option.name"
                    :src="slotProps.option.url"
                    width="21"
                    height="21"
                    loading="lazy"
                  />
                  <div>{{ slotProps.option.name }}</div>
                </div>
              </template>
            </Dropdown>
            <Button
              class="save-trigger small-height"
              icon="pi pi-check"
              @click="
                variant.words.push(newVariant[num]);
                newVariant[num] = { name: '' };
              "
            />
          </div>
        </div>
      </div>
      <div class="row">
        <div class="title">{{ $t('settings.skipModifier') }}</div>
        <InputNumber
          class="small"
          showButtons
          :step="1"
          v-model="variant.skipModifier"
        />
      </div>
      <div
        class="row"
        v-if="!variant.permanent"
      >
        <div class="title">{{ $t('settings.color') }}</div>
        <ColorPicker
          :modelValue="variant.color.substring(1)"
          @update:modelValue="variant.color = `#${$event}`"
        />
      </div>
      <Divider />
    </div>
    <div class="center">
      <Button
        icon="pi pi-plus"
        :label="$t('settings.addCustomVariant')"
        @click="addCustomVariant()"
      />
    </div>
  </Panel>
</template>
<script lang="ts" setup>
import Panel from 'primevue/panel';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import Chip from 'primevue/chip';
import Button from 'primevue/button';
import Divider from 'primevue/divider';
import Dropdown from 'primevue/dropdown';
import ColorPicker from 'primevue/colorpicker';
import { useStore } from '@/store';
import { computed, ref, watch } from 'vue';

const store = useStore();
const props = defineProps({
  variantsSettingsIn: {
    type: Array,
    default: () => [],
  },
});

const emits = defineEmits(['change']);

const triggerVariants = computed(() => {
  const triggers: any[] = [
    {
      label: 'BTTV',
      items: store.emotesCache.bttv,
    },
    {
      label: '7TV',
      items: store.emotesCache.stv,
    },
    {
      label: 'FFZ',
      items: store.emotesCache.ffz,
    },
  ];
  return triggers;
});

const variantsSettings = ref<any>(props.variantsSettingsIn);
watch(variantsSettings, (newVal) => {
  emits('change', newVal);
});

const newVariant = ref<{ name: string; url?: string }[]>([]);
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
<style lang="scss" scoped>
.variant {
  position: relative;

  .delete {
    position: absolute;
    right: 16px;
    top: 0;
  }
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
    margin-bottom: 0px;

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

  .increased-height {
    height: 42px;
  }

  .small {
    :deep(.p-inputnumber-input) {
      width: 80px;
    }
  }

  .save-trigger {
    margin-left: 10px;
  }

  .small-height {
    height: 32px;
  }
}

.center {
  display: flex;
  justify-content: center;
}
</style>
