<script setup lang="ts">
import { getStringSizeInBytes } from './text-statistics.service';
import { formatBytes } from '@/utils/convert';

const { t } = useI18n();

const text = ref('');
</script>

<template>
  <c-card>
    <c-input-text v-model:value="text" multiline :placeholder="t('tools.text-statistics.inputPlaceholder')" rows="5" />

    <div mt-5 flex>
      <n-statistic :label="t('tools.text-statistics.charactersLabel')" :value="text.length" flex-1 />
      <n-statistic :label="t('tools.text-statistics.wordsLabel')" :value="text === '' ? 0 : text.split(/\s+/).length" flex-1 />
      <n-statistic :label="t('tools.text-statistics.linesLabel')" :value="text === '' ? 0 : text.split(/\r\n|\r|\n/).length" flex-1 />
      <n-statistic :label="t('tools.text-statistics.bytesLabel')" :value="formatBytes(getStringSizeInBytes(text))" flex-1 />
    </div>
  </c-card>
</template>
