<script setup lang="ts">
import type { Colord } from 'colord';
import { colord, extend } from 'colord';
import _ from 'lodash';
import cmykPlugin from 'colord/plugins/cmyk';
import hwbPlugin from 'colord/plugins/hwb';
import namesPlugin from 'colord/plugins/names';
import lchPlugin from 'colord/plugins/lch';
import { buildColorFormat } from './color-converter.models';

extend([cmykPlugin, hwbPlugin, namesPlugin, lchPlugin]);

const { t } = useI18n();

const formats = {
  picker: buildColorFormat({
    label: t('tools.color-converter.labelPicker'),
    format: (v: Colord) => v.toHex(),
    type: 'color-picker',
  }),
  hex: buildColorFormat({
    label: t('tools.color-converter.labelHex'),
    format: (v: Colord) => v.toHex(),
    placeholder: t('tools.color-converter.placeholderHex'),
  }),
  rgb: buildColorFormat({
    label: t('tools.color-converter.labelRgb'),
    format: (v: Colord) => v.toRgbString(),
    placeholder: t('tools.color-converter.placeholderRgb'),
  }),
  hsl: buildColorFormat({
    label: t('tools.color-converter.labelHsl'),
    format: (v: Colord) => v.toHslString(),
    placeholder: t('tools.color-converter.placeholderHsl'),
  }),
  hwb: buildColorFormat({
    label: t('tools.color-converter.labelHwb'),
    format: (v: Colord) => v.toHwbString(),
    placeholder: t('tools.color-converter.placeholderHwb'),
  }),
  lch: buildColorFormat({
    label: t('tools.color-converter.labelLch'),
    format: (v: Colord) => v.toLchString(),
    placeholder: t('tools.color-converter.placeholderLch'),
  }),
  cmyk: buildColorFormat({
    label: t('tools.color-converter.labelCmyk'),
    format: (v: Colord) => v.toCmykString(),
    placeholder: t('tools.color-converter.placeholderCmyk'),
  }),
  name: buildColorFormat({
    label: t('tools.color-converter.labelName'),
    format: (v: Colord) => v.toName({ closest: true }) ?? t('tools.color-converter.unknown'),
    placeholder: t('tools.color-converter.placeholderName'),
  }),
};

updateColorValue(colord('#1ea54c'));

function updateColorValue(value: Colord | undefined, omitLabel?: string) {
  if (value === undefined) {
    return;
  }

  if (!value.isValid()) {
    return;
  }

  _.forEach(formats, ({ value: valueRef, format }, key) => {
    if (key !== omitLabel) {
      valueRef.value = format(value);
    }
  });
}
</script>

<template>
  <c-card>
    <template v-for="({ label, parse, placeholder, validation, type }, key) in formats" :key="key">
      <input-copyable
        v-if="type === 'text'"
        v-model:value="formats[key].value.value"
        :test-id="`input-${key}`"
        :label="`${label}:`"
        label-position="left"
        label-width="100px"
        label-align="right"
        :placeholder="placeholder"
        :validation="validation"
        raw-text
        clearable
        mt-2
        @update:value="(v:string) => updateColorValue(parse(v), key)"
      />

      <n-form-item v-else-if="type === 'color-picker'" :label="`${label}:`" label-width="100" label-placement="left" :show-feedback="false">
        <n-color-picker
          v-model:value="formats[key].value.value"
          placement="bottom-end"
          @update:value="(v:string) => updateColorValue(parse(v), key)"
        />
      </n-form-item>
    </template>
  </c-card>
</template>
