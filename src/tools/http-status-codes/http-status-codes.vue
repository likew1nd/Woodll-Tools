<script setup lang="ts">
import { codesByCategories } from './http-status-codes.constants';
import { useFuzzySearch } from '@/composable/fuzzySearch';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const search = ref('');

const { searchResult } = useFuzzySearch({
  search,
  data: codesByCategories.flatMap(({ codes, category }) => codes.map(code => ({ ...code, category }))),
  options: {
    keys: [{ name: 'code', weight: 3 }, { name: 'name', weight: 2 }, 'description', 'category'],
  },
});

const categoryLabelMap = computed<Record<string, string>>(() => ({
  '1xx informational response': t('tools.http-status-codes.category.informational'),
  '2xx success': t('tools.http-status-codes.category.success'),
  '3xx redirection': t('tools.http-status-codes.category.redirection'),
  '4xx client error': t('tools.http-status-codes.category.clientError'),
  '5xx server error': t('tools.http-status-codes.category.serverError'),
}));

function getCategoryLabel(category: string) {
  return categoryLabelMap.value[category] ?? category;
}

const codesByCategoryFiltered = computed(() => {
  if (!search.value) {
    return codesByCategories;
  }

  return [{ category: t('tools.http-status-codes.searchResults'), codes: searchResult.value }];
});

const translationNamespace = 'tools.http-status-codes.codes';

function translateCodeField(code: number, field: 'name' | 'description', fallback: string) {
  const key = `${translationNamespace}.${code}.${field}`;
  const translated = t(key);
  return translated === key ? fallback : translated;
}

function getCodeName(code: number, fallback: string) {
  return translateCodeField(code, 'name', fallback);
}

function getCodeDescription(code: number, fallback: string) {
  return translateCodeField(code, 'description', fallback);
}
</script>

<template>
  <div>
    <c-input-text
      v-model:value="search"
      :placeholder="$t('tools.http-status-codes.searchPlaceholder')"
      autofocus raw-text mb-10
    />

    <div v-for="{ codes, category } of codesByCategoryFiltered" :key="category" mb-8>
      <div mb-2 text-xl>
        {{ getCategoryLabel(category) }}
      </div>

      <c-card v-for="{ code, description, name, type } of codes" :key="code" mb-2>
        <div text-lg font-bold>
          {{ code }} {{ getCodeName(code, name) }}
        </div>
        <div op-70>
          {{ getCodeDescription(code, description) }} {{ type !== 'HTTP' ? $t('tools.http-status-codes.forType', { type }) : '' }}
        </div>
      </c-card>
    </div>
  </div>
</template>
