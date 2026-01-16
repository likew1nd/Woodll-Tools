<script setup lang="ts">
import { generateLoremIpsum } from './lorem-ipsum-generator.service';
import { useCopy } from '@/composable/copy';
import { randIntFromInterval } from '@/utils/random';
import { computedRefreshable } from '@/composable/computedRefreshable';

const { t } = useI18n();

const paragraphs = ref(1);
const sentences = ref([3, 8]);
const words = ref([8, 15]);
const startWithLoremIpsum = ref(true);
const asHTML = ref(false);
const language = ref<'en' | 'zh'>('en');

const [loremIpsumText, refreshLoremIpsum] = computedRefreshable(() =>
  generateLoremIpsum({
    paragraphCount: paragraphs.value,
    asHTML: asHTML.value,
    sentencePerParagraph: randIntFromInterval(sentences.value[0], sentences.value[1]),
    wordCount: randIntFromInterval(words.value[0], words.value[1]),
    startWithLoremIpsum: startWithLoremIpsum.value,
    language: language.value,
  }),
);

const { copy } = useCopy({ source: loremIpsumText, text: t('tools.lorem-ipsum-generator.copied') });
</script>

<template>
  <c-card>
    <n-form-item :label="t('tools.lorem-ipsum-generator.paragraphsLabel')" :show-feedback="false" label-width="200" label-placement="left">
      <n-slider v-model:value="paragraphs" :step="1" :min="1" :max="20" />
    </n-form-item>
    <n-form-item :label="t('tools.lorem-ipsum-generator.sentencesLabel')" :show-feedback="false" label-width="200" label-placement="left">
      <n-slider v-model:value="sentences" range :step="1" :min="1" :max="50" />
    </n-form-item>
    <n-form-item :label="t('tools.lorem-ipsum-generator.wordsLabel')" :show-feedback="false" label-width="200" label-placement="left">
      <n-slider v-model:value="words" range :step="1" :min="1" :max="50" />
    </n-form-item>
    <n-form-item :label="t('tools.lorem-ipsum-generator.languageLabel')" :show-feedback="false" label-width="200" label-placement="left">
      <n-radio-group v-model:value="language" size="small">
        <n-radio value="en">{{ t('tools.lorem-ipsum-generator.languageOptions.english') }}</n-radio>
        <n-radio value="zh">{{ t('tools.lorem-ipsum-generator.languageOptions.chinese') }}</n-radio>
      </n-radio-group>
    </n-form-item>
    <n-form-item :label="t('tools.lorem-ipsum-generator.startWithLabel')" :show-feedback="false" label-width="200" label-placement="left">
      <n-switch v-model:value="startWithLoremIpsum" />
    </n-form-item>
    <n-form-item :label="t('tools.lorem-ipsum-generator.asHtmlLabel')" :show-feedback="false" label-width="200" label-placement="left">
      <n-switch v-model:value="asHTML" />
    </n-form-item>

    <c-input-text :value="loremIpsumText" multiline :placeholder="t('tools.lorem-ipsum-generator.outputPlaceholder')" readonly mt-5 rows="5" />

    <div mt-5 flex justify-center gap-3>
      <c-button autofocus @click="copy()">
        {{ t('tools.lorem-ipsum-generator.copy') }}
      </c-button>
      <c-button @click="refreshLoremIpsum">
        {{ t('tools.lorem-ipsum-generator.refresh') }}
      </c-button>
    </div>
  </c-card>
</template>
