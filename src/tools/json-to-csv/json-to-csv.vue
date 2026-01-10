<script setup lang="ts">
import JSON5 from 'json5';
import { convertArrayToCsv } from './json-to-csv.service';
import type { UseValidationRule } from '@/composable/validation';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

function transformer(value: string) {
  return withDefaultOnError(() => {
    if (value === '') {
      return '';
    }
    return convertArrayToCsv({ array: JSON5.parse(value) });
  }, '');
}

const rules: UseValidationRule<string>[] = [
  {
    validator: (v: string) => v === '' || JSON5.parse(v),
    message: t('tools.json-to-csv.invalidJson'),
  },
];
</script>

<template>
  <format-transformer
    :input-label="$t('tools.json-to-csv.inputLabel')"
    :input-placeholder="$t('tools.json-to-csv.inputPlaceholder')"
    :output-label="$t('tools.json-to-csv.outputLabel')"
    :input-validation-rules="rules"
    :transformer="transformer"
  />
</template>
