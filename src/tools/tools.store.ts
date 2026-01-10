import { type MaybeRef, get, useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';
import type { Ref } from 'vue';
import _ from 'lodash';
import type { Tool, ToolCategory, ToolWithCategory } from './tools.types';
import { toolsWithCategory } from './index';
import { buildDefaultToolsConfig, type ToolsConfig, UNCATEGORIZED_ID } from './tools-config';
import { useToolsConfigStore } from '@/stores/tools-config.store';

export const useToolStore = defineStore('tools', () => {
  const favoriteToolsName = useStorage('favoriteToolsName', []) as Ref<string[]>;
  const { t } = useI18n();
  const toolsConfigStore = useToolsConfigStore();
  const defaultConfig = buildDefaultToolsConfig();

  const tools = computed<(ToolWithCategory & { categoryId: string })[]>(() => toolsWithCategory.map((tool) => {
    const toolI18nKey = tool.path.replace(/\//g, '');

    return ({
      ...tool,
      path: tool.path,
      name: t(`tools.${toolI18nKey}.title`, tool.name),
      description: t(`tools.${toolI18nKey}.description`, tool.description),
      category: t(`tools.categories.${tool.category.toLowerCase()}`, tool.category),
      categoryId: tool.category,
    });
  }));

  const toolsByCategory = computed<ToolCategory[]>(() => {
    const config: ToolsConfig = toolsConfigStore.config ?? defaultConfig;
    const categoryConfigMap = new Map(config.categories.map(category => [category.id, category]));
    const toolConfigMap = new Map(config.tools.map(tool => [tool.path, tool]));
    const uncategorizedConfig = {
      id: UNCATEGORIZED_ID,
      order: Number.MAX_SAFE_INTEGER,
      enabled: true,
    };
    if (!categoryConfigMap.has(UNCATEGORIZED_ID)) {
      categoryConfigMap.set(UNCATEGORIZED_ID, uncategorizedConfig);
    }

    const defaultCategoryOrder = new Map(defaultConfig.categories.map((category, index) => [category.id, index]));
    const defaultToolOrder = new Map(defaultConfig.tools.map((tool) => [tool.path, tool.order]));

    const visibleTools = tools.value
      .map((tool) => {
        const toolConfig = toolConfigMap.get(tool.path);
        const categoryId = toolConfig?.categoryId ?? tool.categoryId;
        const resolvedCategoryId = categoryConfigMap.has(categoryId) ? categoryId : UNCATEGORIZED_ID;
        const categoryConfig = categoryConfigMap.get(resolvedCategoryId);
        const enabled = (toolConfig?.enabled ?? true) && (categoryConfig?.enabled ?? true);

        return {
          ...tool,
          categoryId: resolvedCategoryId,
          order: toolConfig?.order ?? defaultToolOrder.get(tool.path) ?? 0,
          featured: toolConfig?.featured ?? false,
          enabled,
        };
      })
      .filter(tool => tool.enabled);

    return _.chain(visibleTools)
      .groupBy('categoryId')
      .map((components, categoryId) => ({
        name: t(`tools.categories.${categoryId.toLowerCase()}`, categoryId),
        components: components.sort((a, b) => a.order - b.order),
        order: categoryConfigMap.get(categoryId)?.order ?? defaultCategoryOrder.get(categoryId) ?? 0,
      }))
      .sortBy('order')
      .map(({ name, components }) => ({ name, components }))
      .value();
  });

  const visibleTools = computed(() => toolsByCategory.value.flatMap(({ components }) => components));

  const favoriteTools = computed(() => {
    return favoriteToolsName.value
      .map(favoriteName => visibleTools.value.find(({ name, path }) => name === favoriteName || path === favoriteName))
      .filter(Boolean) as ToolWithCategory[]; // cast because .filter(Boolean) does not remove undefined from type
  });

  return {
    tools: visibleTools,
    favoriteTools,
    toolsByCategory,
    newTools: computed(() => visibleTools.value.filter(({ isNew }) => isNew)),

    addToolToFavorites({ tool }: { tool: MaybeRef<Tool> }) {
      const toolPath = get(tool).path;
      if (toolPath) {
        favoriteToolsName.value.push(toolPath);
      }
    },

    removeToolFromFavorites({ tool }: { tool: MaybeRef<Tool> }) {
      favoriteToolsName.value = favoriteToolsName.value.filter(name => get(tool).name !== name && get(tool).path !== name);
    },

    isToolFavorite({ tool }: { tool: MaybeRef<Tool> }) {
      return favoriteToolsName.value.includes(get(tool).name)
        || favoriteToolsName.value.includes(get(tool).path);
    },

    updateFavoriteTools(newOrder: ToolWithCategory[]) {
      favoriteToolsName.value = newOrder.map(tool => tool.path);
    },
  };
});
