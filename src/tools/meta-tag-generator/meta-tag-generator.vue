<script setup lang="ts">
import { generateMeta } from '@it-tools/oggen';
import _ from 'lodash';
import { image, ogSchemas, twitter, website } from './og-schemas';
import type { OGSchemaType, OGSchemaTypeElementInput, OGSchemaTypeElementInputMultiple, OGSchemaTypeElementSelect } from './OGSchemaType.type';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import type { CSelectOption } from '@/ui/c-select/c-select.types';

// Since type guards do not work in template

const { t } = useI18n();

const metadata = ref<{ type: string; [k: string]: any }>({
  'type': 'website',
  'twitter:card': 'summary_large_image',
});

watch(
  () => ref(metadata.value.type),
  (_ignored, prevSection) => {
    const section = ogSchemas[prevSection.value];

    if (!section) {
      return;
    }

    section.elements.forEach(({ key }) => {
      metadata.value[key] = '';
    });
  },
);

const sections = computed(() => {
  const secs: OGSchemaType[] = [website, image, twitter];
  const additionalSchema = ogSchemas[metadata.value.type];

  if (additionalSchema) {
    secs.push(additionalSchema);
  }

  return secs;
});

interface OptionItem {
  label: string
  value?: string
  type?: string
  key?: string
  children?: OptionItem[]
}

function translateOptions(options: OptionItem[]): CSelectOption<string>[] {
  return options.flatMap((option) => {
    if (option.type === 'group' && option.children) {
      return translateOptions(option.children);
    }

    return [{
      label: t(option.label),
      value: option.value ?? option.label,
    }];
  });
}

type TranslatedElement =
  | OGSchemaTypeElementInput
  | OGSchemaTypeElementInputMultiple
  | (OGSchemaTypeElementSelect & { options: CSelectOption<string>[] });

type TranslatedSection = Omit<OGSchemaType, 'elements' | 'name'> & { name: string; elements: TranslatedElement[] };

const translatedSections = computed<TranslatedSection[]>(() => sections.value.map(section => ({
  ...section,
  name: t(section.name),
  elements: section.elements.map((element) => {
    if (element.type === 'select') {
      return {
        ...element,
        label: t(element.label),
        placeholder: element.placeholder ? t(element.placeholder) : element.placeholder,
        options: translateOptions((element as OGSchemaTypeElementSelect).options as OptionItem[]),
      } as TranslatedElement;
    }

    return {
      ...element,
      label: t(element.label),
      placeholder: element.placeholder ? t(element.placeholder) : element.placeholder,
    } as TranslatedElement;
  }),
})));

const metaTags = computed(() => {
  const twitterMeta = _.chain(metadata.value)
    .pickBy((_value, k) => k.startsWith('twitter:'))
    .mapKeys((_value, k) => k.replace(/^twitter:/, ''))
    .value();

  const otherMeta = _.pickBy(metadata.value, (_value, k) => !k.startsWith('twitter:'));

  return generateMeta({ ...otherMeta, twitter: twitterMeta }, { generateTwitterCompatibleMeta: true });
});
</script>

<template>
  <div>
    <div v-for="{ name, elements } of translatedSections" :key="name" style="margin-bottom: 15px">
      <div mb-5px>
        {{ name }}
      </div>

      <n-input-group v-for="element of elements" :key="element.key">
        <n-input-group-label style="flex: 0 0 110px">
          {{ element.label }}
        </n-input-group-label>

        <c-input-text v-if="element.type === 'input'" v-model:value="metadata[element.key]" :placeholder="element.placeholder" clearable />
        <n-dynamic-input
          v-else-if="element.type === 'input-multiple'"
          v-model:value="metadata[element.key]"
          :min="1"
          :placeholder="element.placeholder"
          :default-value="['']"
          :show-sort-button="true"
        />

        <c-select
          v-else-if="element.type === 'select'"
          v-model:value="metadata[element.key]"
          w-full
          :placeholder="element.placeholder"
          :options="element.options"
        />
      </n-input-group>
    </div>
  </div>
  <div>
    <n-form-item :label="$t('tools.og-meta-generator.outputLabel')">
      <TextareaCopyable :value="metaTags" language="html" />
    </n-form-item>
  </div>
</template>

<style lang="less" scoped>
.n-input-group {
  margin-bottom: 5px;
}

::v-deep(.n-form-item-blank) {
  min-height: 0 !important;
}
::v-deep(.n-dynamic-input-item) {
  margin-bottom: 5px;
}
</style>
