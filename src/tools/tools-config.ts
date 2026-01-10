import { toolsByCategory } from './index';

export type ToolsConfig = {
  version: 1
  categories: CategoryConfig[]
  tools: ToolConfig[]
  updatedAt?: string
};

export const UNCATEGORIZED_ID = 'uncategorized';

export type CategoryConfig = {
  id: string
  order: number
  enabled: boolean
};

export type ToolConfig = {
  path: string
  categoryId: string
  order: number
  enabled: boolean
  featured: boolean
};

export function buildDefaultToolsConfig(): ToolsConfig {
  const categories: CategoryConfig[] = toolsByCategory.map((category, index) => ({
    id: category.name,
    order: index,
    enabled: true,
  }));

  const tools: ToolConfig[] = toolsByCategory.flatMap((category) =>
    category.components.map((tool, index) => ({
      path: tool.path,
      categoryId: category.name,
      order: index,
      enabled: true,
      featured: false,
    })));

  return {
    version: 1,
    categories,
    tools,
  };
}

export function normalizeToolsConfig(config: ToolsConfig | null | undefined, defaults = buildDefaultToolsConfig()): ToolsConfig {
  if (!config) {
    return { ...defaults };
  }

  const categoryMap = new Map(defaults.categories.map(category => [category.id, { ...category }]));
  for (const category of config.categories ?? []) {
    categoryMap.set(category.id, {
      ...categoryMap.get(category.id),
      ...category,
      id: category.id,
    });
  }

  const toolMap = new Map(defaults.tools.map(tool => [tool.path, { ...tool }]));
  for (const tool of config.tools ?? []) {
    toolMap.set(tool.path, {
      ...toolMap.get(tool.path),
      ...tool,
      path: tool.path,
    });
  }

  return {
    version: 1,
    categories: Array.from(categoryMap.values()),
    tools: Array.from(toolMap.values()),
    updatedAt: config.updatedAt,
  };
}
