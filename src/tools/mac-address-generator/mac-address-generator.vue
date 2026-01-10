<script setup lang="ts">
import _ from 'lodash';
import { generateRandomMacAddress } from './mac-adress-generator.models';
import { computedRefreshable } from '@/composable/computedRefreshable';
import { useCopy } from '@/composable/copy';
import { usePartialMacAddressValidation } from '@/utils/macAddress';

const { t } = useI18n();

const amount = useStorage('mac-address-generator-amount', 1);
const macAddressPrefix = useStorage('mac-address-generator-prefix', '64:16:7F');

const prefixValidation = usePartialMacAddressValidation(macAddressPrefix);

const casesTransformers = [
  { labelKey: 'tools.mac-address-generator.case.uppercase', value: (value: string) => value.toUpperCase() },
  { labelKey: 'tools.mac-address-generator.case.lowercase', value: (value: string) => value.toLowerCase() },
];
const caseTransformer = ref(casesTransformers[0].value);
const caseOptions = computed(() => casesTransformers.map(({ labelKey, value }) => ({ label: t(labelKey), value })));

const separators = [
  {
    labelKey: 'tools.mac-address-generator.separator.colon',
    value: ':',
  },
  {
    labelKey: 'tools.mac-address-generator.separator.dash',
    value: '-',
  },
  {
    labelKey: 'tools.mac-address-generator.separator.dot',
    value: '.',
  },
  {
    labelKey: 'tools.mac-address-generator.separator.none',
    value: '',
  },
];
const separator = useStorage('mac-address-generator-separator', separators[0].value);
const separatorOptions = computed(() => separators.map(({ labelKey, value }) => ({ label: t(labelKey), value })));

const [macAddresses, refreshMacAddresses] = computedRefreshable(() => {
  if (!prefixValidation.isValid) {
    return '';
  }

  const ids = _.times(amount.value, () => caseTransformer.value(generateRandomMacAddress({
    prefix: macAddressPrefix.value,
    separator: separator.value,
  })));
  return ids.join('\n');
});

const { copy } = useCopy({ source: macAddresses, text: t('tools.mac-address-generator.copied') });
</script>

<template>
  <div flex flex-col justify-center gap-2>
    <div flex items-center>
      <label w-150px pr-12px text-right>{{ t('tools.mac-address-generator.quantityLabel') }}</label>
      <n-input-number v-model:value="amount" min="1" max="100" flex-1 />
    </div>

    <c-input-text
      v-model:value="macAddressPrefix"
      :label="t('tools.mac-address-generator.prefixLabel')"
      :placeholder="t('tools.mac-address-generator.prefixPlaceholder')"
      clearable
      label-position="left"
      spellcheck="false"
      :validation="prefixValidation"
      raw-text
      label-width="150px"
      label-align="right"
    />

    <c-buttons-select
      v-model:value="caseTransformer"
      :options="caseOptions"
      :label="t('tools.mac-address-generator.caseLabel')"
      label-width="150px"
      label-align="right"
    />

    <c-buttons-select
      v-model:value="separator"
      :options="separatorOptions"
      :label="t('tools.mac-address-generator.separatorLabel')"
      label-width="150px"
      label-align="right"
    />

    <c-card mt-5 flex data-test-id="ulids">
      <pre m-0 m-x-auto>{{ macAddresses }}</pre>
    </c-card>

    <div flex justify-center gap-2>
      <c-button data-test-id="refresh" @click="refreshMacAddresses()">
        {{ t('tools.mac-address-generator.refresh') }}
      </c-button>
      <c-button @click="copy()">
        {{ t('tools.mac-address-generator.copy') }}
      </c-button>
    </div>
  </div>
</template>
