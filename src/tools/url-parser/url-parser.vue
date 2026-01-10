<script setup lang="ts">
import InputCopyable from '../../components/InputCopyable.vue';
import { isNotThrowing } from '@/utils/boolean';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const urlToParse = ref('https://me:pwd@it-tools.tech:3000/url-parser?key1=value&key2=value2#the-hash');

const urlParsed = computed(() => withDefaultOnError(() => new URL(urlToParse.value), undefined));
const urlValidationRules = [
  {
    validator: (value: string) => isNotThrowing(() => new URL(value)),
    message: t('tools.url-parser.invalidUrl'),
  },
];

const properties: { titleKey: string; key: keyof URL }[] = [
  { titleKey: 'tools.url-parser.protocol', key: 'protocol' },
  { titleKey: 'tools.url-parser.username', key: 'username' },
  { titleKey: 'tools.url-parser.password', key: 'password' },
  { titleKey: 'tools.url-parser.hostname', key: 'hostname' },
  { titleKey: 'tools.url-parser.port', key: 'port' },
  { titleKey: 'tools.url-parser.path', key: 'pathname' },
  { titleKey: 'tools.url-parser.params', key: 'search' },
];
</script>

<template>
  <c-card>
    <c-input-text
      v-model:value="urlToParse"
      :label="$t('tools.url-parser.inputLabel')"
      :placeholder="$t('tools.url-parser.inputPlaceholder')"
      raw-text
      :validation-rules="urlValidationRules"
    />

    <n-divider />

    <InputCopyable
      v-for="{ titleKey, key } in properties"
      :key="key"
      :label="$t(titleKey)"
      :value="(urlParsed?.[key] as string) ?? ''"
      readonly
      label-position="left"
      label-width="110px"
      mb-2
      placeholder=" "
    />

    <div
      v-for="[k, v] in Object.entries(Object.fromEntries(urlParsed?.searchParams.entries() ?? []))"
      :key="k"
      mb-2
      w-full
      flex
    >
      <div style="flex: 1 0 110px">
        <icon-mdi-arrow-right-bottom />
      </div>

      <InputCopyable :value="k" readonly />
      <InputCopyable :value="v" readonly />
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.n-input-group-label {
  text-align: right;
}
.n-input-group {
  margin: 2px 0;
}
</style>
