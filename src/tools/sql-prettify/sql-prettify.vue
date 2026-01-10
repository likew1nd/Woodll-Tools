<script setup lang="ts">
import { type FormatOptionsWithLanguage, format as formatSQL } from 'sql-formatter';
import TextareaCopyable from '@/components/TextareaCopyable.vue';
import { useStyleStore } from '@/stores/style.store';

const { t } = useI18n();

const inputElement = ref<HTMLElement>();
const styleStore = useStyleStore();
const config = reactive<FormatOptionsWithLanguage>({
  keywordCase: 'upper',
  useTabs: false,
  language: 'sql',
  indentStyle: 'standard',
  tabulateAlias: true,
});

const rawSQL = ref('select field1,field2,field3 from my_table where my_condition;');
const prettySQL = computed(() => formatSQL(rawSQL.value, config));
</script>

<template>
  <div style="flex: 0 0 100%">
    <div style="max-width: 600px" :class="{ 'flex-col': styleStore.isSmallScreen }" mx-auto mb-5 flex gap-2>
      <c-select
        v-model:value="config.language"
        flex-1
        :label="$t('tools.sql-prettify.dialectLabel')"
        :options="[
          { label: t('tools.sql-prettify.dialect.bigquery'), value: 'bigquery' },
          { label: t('tools.sql-prettify.dialect.db2'), value: 'db2' },
          { label: t('tools.sql-prettify.dialect.hive'), value: 'hive' },
          { label: t('tools.sql-prettify.dialect.mariadb'), value: 'mariadb' },
          { label: t('tools.sql-prettify.dialect.mysql'), value: 'mysql' },
          { label: t('tools.sql-prettify.dialect.n1ql'), value: 'n1ql' },
          { label: t('tools.sql-prettify.dialect.plsql'), value: 'plsql' },
          { label: t('tools.sql-prettify.dialect.postgresql'), value: 'postgresql' },
          { label: t('tools.sql-prettify.dialect.redshift'), value: 'redshift' },
          { label: t('tools.sql-prettify.dialect.spark'), value: 'spark' },
          { label: t('tools.sql-prettify.dialect.sql'), value: 'sql' },
          { label: t('tools.sql-prettify.dialect.sqlite'), value: 'sqlite' },
          { label: t('tools.sql-prettify.dialect.tsql'), value: 'tsql' },
        ]"
      />
      <c-select
        v-model:value="config.keywordCase" :label="$t('tools.sql-prettify.keywordCaseLabel')"
        flex-1
        :options="[
          { label: t('tools.sql-prettify.keywordCase.upper'), value: 'upper' },
          { label: t('tools.sql-prettify.keywordCase.lower'), value: 'lower' },
          { label: t('tools.sql-prettify.keywordCase.preserve'), value: 'preserve' },
        ]"
      />
      <c-select
        v-model:value="config.indentStyle" :label="$t('tools.sql-prettify.indentStyleLabel')"
        flex-1
        :options="[
          { label: t('tools.sql-prettify.indentStyle.standard'), value: 'standard' },
          { label: t('tools.sql-prettify.indentStyle.tabularLeft'), value: 'tabularLeft' },
          { label: t('tools.sql-prettify.indentStyle.tabularRight'), value: 'tabularRight' },
        ]"
      />
    </div>
  </div>

  <n-form-item :label="$t('tools.sql-prettify.inputLabel')">
    <c-input-text
      ref="inputElement"
      v-model:value="rawSQL"
      :placeholder="$t('tools.sql-prettify.inputPlaceholder')"
      rows="20"
      multiline
      autocomplete="off"
      autocorrect="off"
      autocapitalize="off"
      spellcheck="false"
      monospace
    />
  </n-form-item>
  <n-form-item :label="$t('tools.sql-prettify.outputLabel')">
    <TextareaCopyable :value="prettySQL" language="sql" :follow-height-of="inputElement" />
  </n-form-item>
</template>

<style lang="less" scoped>
.result-card {
  position: relative;
  .copy-button {
    position: absolute;
    top: 10px;
    right: 10px;
  }
}
</style>
