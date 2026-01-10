<script setup lang="ts">
import cronstrue from 'cronstrue';
import { isValidCron } from 'cron-validator';
import { useStyleStore } from '@/stores/style.store';

const { t } = useI18n();

function isCronValid(v: string) {
  return isValidCron(v, { allowBlankDay: true, alias: true, seconds: true });
}

const styleStore = useStyleStore();

const cron = ref('40 * * * *');
const cronstrueConfig = reactive({
  verbose: true,
  dayOfWeekStartIndexZero: true,
  use24HourTimeFormat: true,
  throwExceptionOnParseError: true,
});

const baseHelpers = [
  {
    symbol: '*',
    meaningKey: 'tools.crontab-generator.helper.any',
    example: '* * * *',
    equivalentKey: 'tools.crontab-generator.helper.everyMinute',
  },
  {
    symbol: '-',
    meaningKey: 'tools.crontab-generator.helper.range',
    example: '1-10 * * *',
    equivalentKey: 'tools.crontab-generator.helper.rangeExample',
  },
  {
    symbol: ',',
    meaningKey: 'tools.crontab-generator.helper.list',
    example: '1,10 * * *',
    equivalentKey: 'tools.crontab-generator.helper.listExample',
  },
  {
    symbol: '/',
    meaningKey: 'tools.crontab-generator.helper.step',
    example: '*/10 * * *',
    equivalentKey: 'tools.crontab-generator.helper.stepExample',
  },
  {
    symbol: '@yearly',
    meaningKey: 'tools.crontab-generator.helper.yearly',
    example: '@yearly',
    equivalentKey: '0 0 1 1 *',
  },
  {
    symbol: '@annually',
    meaningKey: 'tools.crontab-generator.helper.annually',
    example: '@annually',
    equivalentKey: '0 0 1 1 *',
  },
  {
    symbol: '@monthly',
    meaningKey: 'tools.crontab-generator.helper.monthly',
    example: '@monthly',
    equivalentKey: '0 0 1 * *',
  },
  {
    symbol: '@weekly',
    meaningKey: 'tools.crontab-generator.helper.weekly',
    example: '@weekly',
    equivalentKey: '0 0 * * 0',
  },
  {
    symbol: '@daily',
    meaningKey: 'tools.crontab-generator.helper.daily',
    example: '@daily',
    equivalentKey: '0 0 * * *',
  },
  {
    symbol: '@midnight',
    meaningKey: 'tools.crontab-generator.helper.midnight',
    example: '@midnight',
    equivalentKey: '0 0 * * *',
  },
  {
    symbol: '@hourly',
    meaningKey: 'tools.crontab-generator.helper.hourly',
    example: '@hourly',
    equivalentKey: '0 * * * *',
  },
  {
    symbol: '@reboot',
    meaningKey: 'tools.crontab-generator.helper.reboot',
    example: '',
    equivalentKey: '',
  },
];

const helpers = computed(() => baseHelpers.map(({ meaningKey, equivalentKey, ...rest }) => ({
  ...rest,
  meaning: t(meaningKey),
  equivalent: equivalentKey.startsWith('tools.') ? t(equivalentKey) : equivalentKey,
})));

const cronString = computed(() => {
  if (isCronValid(cron.value)) {
    return cronstrue.toString(cron.value, cronstrueConfig);
  }
  return ' ';
});

const cronValidationRules = [
  {
    validator: (value: string) => isCronValid(value),
    message: t('tools.crontab-generator.invalidCron'),
  },
];
</script>

<template>
  <c-card>
    <div mx-auto max-w-sm>
      <c-input-text
        v-model:value="cron"
        size="large"
        placeholder="* * * * *"
        :validation-rules="cronValidationRules"
        mb-3
      />
    </div>

    <div class="cron-string">
      {{ cronString }}
    </div>

    <n-divider />

    <div flex justify-center>
      <n-form :show-feedback="false" label-width="170" label-placement="left">
        <n-form-item :label="$t('tools.crontab-generator.verbose')">
          <n-switch v-model:value="cronstrueConfig.verbose" />
        </n-form-item>
        <n-form-item :label="$t('tools.crontab-generator.use24Hour')">
          <n-switch v-model:value="cronstrueConfig.use24HourTimeFormat" />
        </n-form-item>
        <n-form-item :label="$t('tools.crontab-generator.dayStartZero')">
          <n-switch v-model:value="cronstrueConfig.dayOfWeekStartIndexZero" />
        </n-form-item>
      </n-form>
    </div>
  </c-card>
  <c-card>
    <pre>
┌──────────── [optional] seconds (0 - 59)
| ┌────────── minute (0 - 59)
| | ┌──────── hour (0 - 23)
| | | ┌────── day of month (1 - 31)
| | | | ┌──── month (1 - 12) OR jan,feb,mar,apr ...
| | | | | ┌── day of week (0 - 6, sunday=0) OR sun,mon ...
| | | | | |
* * * * * * command</pre>

    <div v-if="styleStore.isSmallScreen">
      <c-card v-for="{ symbol, meaning, example, equivalent } in helpers" :key="symbol" mb-3 important:border-none>
        <div>
          {{ $t('tools.crontab-generator.symbol') }} <strong>{{ symbol }}</strong>
        </div>
        <div>
          {{ $t('tools.crontab-generator.meaning') }} <strong>{{ meaning }}</strong>
        </div>
        <div>
          {{ $t('tools.crontab-generator.example') }}
          <strong><code>{{ example }}</code></strong>
        </div>
        <div>
          {{ $t('tools.crontab-generator.equivalent') }} <strong>{{ equivalent }}</strong>
        </div>
      </c-card>
    </div>

    <c-table v-else :data="helpers" />
  </c-card>
</template>

<style lang="less" scoped>
::v-deep(input) {
  font-size: 30px;
  font-family: monospace;
  padding: 5px;
  text-align: center;
}

.cron-string {
  text-align: center;
  font-size: 22px;
  opacity: 0.8;
  margin: 5px 0 15px;
}

pre {
  overflow: auto;
  padding: 10px 0;
}
</style>
