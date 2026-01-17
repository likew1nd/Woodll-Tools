<script setup lang="ts">
import {
  format,
  formatISO,
  formatISO9075,
  formatRFC3339,
  formatRFC7231,
  fromUnixTime,
  getTime,
  getUnixTime,
  isDate,
  isValid,
  parse,
  parseISO,
  parseJSON,
} from 'date-fns';
import type { DateFormat } from './date-time-converter.types';
import {
  dateToExcelFormat,
  excelFormatToDate,
  isExcelFormat,
  isISO8601DateTimeString,
  isISO9075DateString,
  isMongoObjectId,
  isRFC3339DateString,
  isRFC7231DateString,
  isTimestamp,
  isUTCDateString,
  isUnixTimestamp,
} from './date-time-converter.models';
import { withDefaultOnError } from '@/utils/defaults';
import { useValidation } from '@/composable/validation';

const { t } = useI18n();

const inputDate = ref('');

const formats: DateFormat[] = [
  {
    name: 'tools.date-converter.formatUnixTimestamp',
    fromDate: date => String(getUnixTime(date)),
    toDate: sec => fromUnixTime(+sec),
    formatMatcher: date => isUnixTimestamp(date),
  },
  {
    name: 'tools.date-converter.formatTimestamp',
    fromDate: date => String(getTime(date)),
    toDate: ms => parseJSON(+ms),
    formatMatcher: date => isTimestamp(date),
  },
  {
    name: 'tools.date-converter.formatIso9075',
    fromDate: formatISO9075,
    toDate: parseISO,
    formatMatcher: date => isISO9075DateString(date),
  },
  {
    name: 'tools.date-converter.formatChineseYmdHms',
    fromDate: date => format(date, 'yyyy年MM月dd日 HH时mm分ss秒'),
    toDate: value => parse(value, 'yyyy年MM月dd日 HH时mm分ss秒', new Date()),
    formatMatcher: date => /^\d{4}年\d{2}月\d{2}日 \d{2}时\d{2}分\d{2}秒$/.test(date),
  },
  // {
  //   name: 'tools.date-converter.formatUtc',
  //   fromDate: date => date.toUTCString(),
  //   toDate,
  //   formatMatcher: date => isUTCDateString(date),
  // },
  // {
  //   name: 'tools.date-converter.formatIso8601',
  //   fromDate: formatISO,
  //   toDate: parseISO,
  //   formatMatcher: date => isISO8601DateTimeString(date),
  // },
  // {
  //   name: 'tools.date-converter.formatRfc3339',
  //   fromDate: formatRFC3339,
  //   toDate,
  //   formatMatcher: date => isRFC3339DateString(date),
  // },
  // {
  //   name: 'tools.date-converter.formatJsLocale',
  //   fromDate: date => date.toString(),
  //   toDate,
  //   formatMatcher: () => false,
  // },
  // {
  //   name: 'tools.date-converter.formatRfc7231',
  //   fromDate: formatRFC7231,
  //   toDate,
  //   formatMatcher: date => isRFC7231DateString(date),
  // },
  // {
  //   name: 'tools.date-converter.formatMongoObjectId',
  //   fromDate: date => `${Math.floor(date.getTime() / 1000).toString(16)}0000000000000000`,
  //   toDate: objectId => new Date(Number.parseInt(objectId.substring(0, 8), 16) * 1000),
  //   formatMatcher: date => isMongoObjectId(date),
  // },
  // {
  //   name: 'tools.date-converter.formatExcel',
  //   fromDate: date => dateToExcelFormat(date),
  //   toDate: excelFormatToDate,
  //   formatMatcher: isExcelFormat,
  // },

];

const formatIndex = ref(6);
const now = useNow();

const normalizedDate = computed(() => {
  if (!inputDate.value) {
    return now.value;
  }

  const { toDate } = formats[formatIndex.value];

  try {
    return toDate(inputDate.value);
  }
  catch (_ignored) {
    return undefined;
  }
});

function onDateInputChanged(value: string) {
  const matchingIndex = formats.findIndex(({ formatMatcher }) => formatMatcher(value));
  if (matchingIndex !== -1) {
    formatIndex.value = matchingIndex;
  }
}

const validation = useValidation({
  source: inputDate,
  watch: [formatIndex],
  rules: [
    {
      message: t('tools.date-converter.invalidDate'),
      validator: value =>
        withDefaultOnError(() => {
          if (value === '') {
            return true;
          }

          const maybeDate = formats[formatIndex.value].toDate(value);
          return isDate(maybeDate) && isValid(maybeDate);
        }, false),
    },
  ],
});

function formatDateUsingFormatter(formatter: (date: Date) => string, date?: Date) {
  if (!date || !validation.isValid) {
    return '';
  }

  return withDefaultOnError(() => formatter(date), '');
}
</script>

<template>
  <div>
    <div flex gap-2>
      <c-input-text
        v-model:value="inputDate"
        autofocus
        :placeholder="$t('tools.date-converter.inputPlaceholder')"
        clearable
        test-id="date-time-converter-input"
        :validation="validation"
        @update:value="onDateInputChanged"
      />

      <c-select
        v-model:value="formatIndex"
        style="flex: 0 0 170px"
        :options="formats.map(({ name }, i) => ({ label: $t(name), value: i }))"
        :placeholder="$t('tools.date-converter.selectPlaceholder')"
        data-test-id="date-time-converter-format-select"
      />
    </div>

    <n-divider />

    <input-copyable
      v-for="{ name, fromDate } in formats"
      :key="name"
      :label="$t(name)"
      label-width="150px"
      label-position="left"
      label-align="right"
      rows="1"
      :value="formatDateUsingFormatter(fromDate, normalizedDate)"
      :placeholder="$t('tools.date-converter.invalidDatePlaceholder')"
      :test-id="name"
      readonly
      mt-2
    />
  </div>
</template>
