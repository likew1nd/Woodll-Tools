<script setup lang="ts">
const { t } = useI18n();

const percentageX = ref();
const percentageY = ref();
const percentageResult = computed(() => {
  if (percentageX.value === undefined || percentageY.value === undefined) {
    return '';
  }
  return (percentageX.value / 100 * percentageY.value).toString();
});

const numberX = ref();
const numberY = ref();
const numberResult = computed(() => {
  if (numberX.value === undefined || numberY.value === undefined) {
    return '';
  }
  const result = 100 * numberX.value / numberY.value;
  return (!Number.isFinite(result) || Number.isNaN(result)) ? '' : result.toString();
});

const numberFrom = ref();
const numberTo = ref();
const percentageIncreaseDecrease = computed(() => {
  if (numberFrom.value === undefined || numberTo.value === undefined) {
    return '';
  }
  const result = (numberTo.value - numberFrom.value) / numberFrom.value * 100;
  return (!Number.isFinite(result) || Number.isNaN(result)) ? '' : result.toString();
});
</script>

<template>
  <div style="flex: 0 0 100%">
    <div style="margin: 0 auto; max-width: 600px">
      <c-card mb-3>
        <div mb-3 sm:hidden>
          {{ t('tools.percentage-calculator.whatIs') }}
        </div>
        <div flex gap-2>
          <div hidden pt-1 sm:block style="min-width: 48px;">
            {{ t('tools.percentage-calculator.whatIs') }}
          </div>
          <n-input-number v-model:value="percentageX" data-test-id="percentageX" :placeholder="t('tools.percentage-calculator.xPlaceholder')" />
          <div min-w-fit pt-1>
            {{ t('tools.percentage-calculator.percentOf') }}
          </div>
          <n-input-number v-model:value="percentageY" data-test-id="percentageY" :placeholder="t('tools.percentage-calculator.yPlaceholder')" />
          <input-copyable v-model:value="percentageResult" data-test-id="percentageResult" readonly :placeholder="t('tools.percentage-calculator.resultPlaceholder')" style="max-width: 150px;" />
        </div>
      </c-card>

      <c-card mb-3>
        <div mb-3 sm:hidden>
          {{ t('tools.percentage-calculator.xPercentOfY') }}
        </div>
        <div flex gap-2>
          <n-input-number v-model:value="numberX" data-test-id="numberX" :placeholder="t('tools.percentage-calculator.xPlaceholder')" />
          <div hidden min-w-fit pt-1 sm:block>
            {{ t('tools.percentage-calculator.isWhatPercentOf') }}
          </div>
          <n-input-number v-model:value="numberY" data-test-id="numberY" :placeholder="t('tools.percentage-calculator.yPlaceholder')" />
          <input-copyable v-model:value="numberResult" data-test-id="numberResult" readonly :placeholder="t('tools.percentage-calculator.resultPlaceholder')" style="max-width: 150px;" />
        </div>
      </c-card>

      <c-card mb-3>
        <div mb-3>
          {{ t('tools.percentage-calculator.increaseDecreaseTitle') }}
        </div>
        <div flex gap-2>
          <n-input-number v-model:value="numberFrom" data-test-id="numberFrom" :placeholder="t('tools.percentage-calculator.fromPlaceholder')" />
          <n-input-number v-model:value="numberTo" data-test-id="numberTo" :placeholder="t('tools.percentage-calculator.toPlaceholder')" />
          <input-copyable v-model:value="percentageIncreaseDecrease" data-test-id="percentageIncreaseDecrease" readonly :placeholder="t('tools.percentage-calculator.resultPlaceholder')" style="max-width: 150px;" />
        </div>
      </c-card>
    </div>
  </div>
</template>
