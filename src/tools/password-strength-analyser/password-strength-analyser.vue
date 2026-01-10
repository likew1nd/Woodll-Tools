<script setup lang="ts">
import { getPasswordCrackTimeEstimation } from './password-strength-analyser.service';

const { t } = useI18n();

const password = ref('');
const crackTimeEstimation = computed(() => getPasswordCrackTimeEstimation({ password: password.value }));

function prettifyExponentialNotation(exponentialNotation: number) {
  const [base, exponent] = exponentialNotation.toString().split('e');
  const baseAsNumber = Number.parseFloat(base);
  const prettyBase = baseAsNumber % 1 === 0 ? baseAsNumber.toLocaleString() : baseAsNumber.toFixed(2);
  return exponent ? `${prettyBase}e${exponent}` : prettyBase;
}

function getHumanFriendlyDuration(seconds: number) {
  if (seconds <= 0.001) {
    return t('tools.password-strength-analyser.durationInstant');
  }

  if (seconds <= 1) {
    return t('tools.password-strength-analyser.durationLessThanSecond');
  }

  const timeUnits = [
    { unitKey: 'tools.password-strength-analyser.durationMillennium', secondsInUnit: 31536000000, format: prettifyExponentialNotation },
    { unitKey: 'tools.password-strength-analyser.durationCentury', secondsInUnit: 3153600000 },
    { unitKey: 'tools.password-strength-analyser.durationDecade', secondsInUnit: 315360000 },
    { unitKey: 'tools.password-strength-analyser.durationYear', secondsInUnit: 31536000 },
    { unitKey: 'tools.password-strength-analyser.durationMonth', secondsInUnit: 2592000 },
    { unitKey: 'tools.password-strength-analyser.durationWeek', secondsInUnit: 604800 },
    { unitKey: 'tools.password-strength-analyser.durationDay', secondsInUnit: 86400 },
    { unitKey: 'tools.password-strength-analyser.durationHour', secondsInUnit: 3600 },
    { unitKey: 'tools.password-strength-analyser.durationMinute', secondsInUnit: 60 },
    { unitKey: 'tools.password-strength-analyser.durationSecond', secondsInUnit: 1 },
  ];

  return timeUnits
    .map(({ unitKey, secondsInUnit, format = (value: number) => value.toLocaleString() }) => {
      const quantity = Math.floor(seconds / secondsInUnit);
      seconds %= secondsInUnit;

      if (quantity <= 0) {
        return undefined;
      }

      const formattedQuantity = format(quantity);
      return `${formattedQuantity}${t(unitKey)}`;
    })
    .filter(Boolean)
    .slice(0, 2)
    .join('，');
}

const crackDurationLabel = computed(() => getHumanFriendlyDuration(crackTimeEstimation.value.secondsToCrack));

const details = computed(() => [
  {
    label: t('tools.password-strength-analyser.detailLength'),
    value: crackTimeEstimation.value.passwordLength,
  },
  {
    label: t('tools.password-strength-analyser.detailEntropy'),
    value: Math.round(crackTimeEstimation.value.entropy * 100) / 100,
  },
  {
    label: t('tools.password-strength-analyser.detailCharset'),
    value: crackTimeEstimation.value.charsetLength,
  },
  {
    label: t('tools.password-strength-analyser.detailScore'),
    value: `${Math.round(crackTimeEstimation.value.score * 100)} / 100`,
  },
]);
</script>

<template>
  <div flex flex-col gap-3>
    <c-input-text
      v-model:value="password"
      type="password"
      :placeholder="$t('tools.password-strength-analyser.inputPlaceholder')"
      clearable
      autofocus
      raw-text
      test-id="password-input"
    />

    <c-card text-center>
      <div op-60>
        {{ $t('tools.password-strength-analyser.crackDurationLabel') }}
      </div>
      <div text-2xl data-test-id="crack-duration">
        {{ crackDurationLabel }}
      </div>
    </c-card>
    <c-card>
      <div v-for="({ label, value }) of details" :key="label" flex gap-3>
        <div flex-1 text-right op-60>
          {{ label }}
        </div>
        <div flex-1 text-left>
          {{ value }}
        </div>
      </div>
    </c-card>
    <div op-70>
      <span font-bold>{{ $t('tools.password-strength-analyser.noteLabel') }}</span>
      {{ $t('tools.password-strength-analyser.noteText') }}
    </div>
  </div>
</template>
