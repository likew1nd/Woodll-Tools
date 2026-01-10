<script setup lang="ts">
import { useStorage } from '@vueuse/core';
import { useThemeVars } from 'naive-ui';
import { RouterLink, useRoute } from 'vue-router';
import MenuIconItem from './MenuIconItem.vue';
import type { Tool, ToolCategory } from '@/tools/tools.types';

const props = withDefaults(defineProps<{ toolsByCategory?: ToolCategory[] }>(), { toolsByCategory: () => [] });
const { toolsByCategory } = toRefs(props);
const route = useRoute();

const makeLabel = (tool: Tool) => () => h(RouterLink, { to: tool.path }, { default: () => tool.name });
const makeIcon = (tool: Tool) => () => h(MenuIconItem, { tool });

const collapsedCategories = useStorage<Record<string, boolean>>(
  'menu-tool-option:collapsed-categories',
  {},
  undefined,
  {
    deep: true,
    serializer: {
      read: v => (v ? JSON.parse(v) : null),
      write: v => JSON.stringify(v),
    },
  },
);

function toggleCategoryCollapse({ name }: { name: string }) {
  collapsedCategories.value[name] = !collapsedCategories.value[name];
}

const menuOptions = computed(() =>
  toolsByCategory.value.map(({ name, components }) => ({
    name,
    isCollapsed: collapsedCategories.value[name],
    tools: components.map(tool => ({
      label: makeLabel(tool),
      icon: makeIcon(tool),
      key: tool.path,
    })),
  })),
);

const themeVars = useThemeVars();
</script>

<template>
  <div v-for="{ name, tools, isCollapsed } of menuOptions" :key="name" class="category-block">
    <div class="category-header" @click="toggleCategoryCollapse({ name })">
      <span class="category-chevron" :class="{ 'rotate-0': isCollapsed, 'rotate-90': !isCollapsed }">
        <icon-mdi-chevron-right />
      </span>

      <span class="category-label">
        {{ name }}
      </span>
    </div>

    <n-collapse-transition :show="!isCollapsed">
      <div class="menu-wrapper">
        <div class="toggle-bar" @click="toggleCategoryCollapse({ name })" />

        <n-menu
          class="menu"
          :value="route.path"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          :options="tools"
          :indent="8"
          :default-expand-all="true"
        />
      </div>
    </n-collapse-transition>
  </div>
</template>

<style scoped lang="less">
.category-block {
  position: relative;
  padding-bottom: 14px;
  margin-bottom: 8px;
}

.category-block::after {
  content: '';
  position: absolute;
  left: 10px;
  right: 12px;
  bottom: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(124, 92, 255, 0.35), transparent);
  opacity: 0.6;
}

.category-header {
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 12px 6px 0;
  padding: 6px 8px;
  opacity: 0.85;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--app-text);
  border-radius: 10px;
  position: relative;
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.category-header::before {
  content: '';
  position: absolute;
  left: 6px;
  width: 2px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(180deg, #7f2bff, #22d3ee);
  opacity: 0.7;
}

.category-header:hover {
  background-color: rgba(124, 92, 255, 0.12);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.12);
}

.category-chevron {
  font-size: 16px;
  line-height: 1;
  opacity: 0.7;
  transition: transform 0.2s ease;
}

.category-label {
  margin-left: 10px;
  font-size: 12px;
}

:global(.dark) .category-header {
  color: #e2e8f0;
}

:global(.dark) .category-header:hover {
  background-color: rgba(124, 92, 255, 0.22);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
}

:global(.dark) .category-block::after {
  background: linear-gradient(90deg, rgba(124, 92, 255, 0.45), transparent);
}

.menu-wrapper {
  display: flex;
  flex-direction: row;
  .menu {
    flex: 1;
    margin-bottom: 5px;

    ::v-deep(.n-menu-item-content::before) {
      left: 0;
      right: 13px;
    }
  }

  .toggle-bar {
    width: 24px;
    opacity: 0.15;
    transition: opacity ease 0.2s;
    position: relative;
    cursor: pointer;

    &::before {
      width: 2px;
      height: 100%;
      content: ' ';
      background-color: v-bind('themeVars.textColor3');
      border-radius: 2px;
      position: absolute;
      top: 0;
      left: 14px;
    }

    &:hover {
      opacity: 0.5;
    }
  }
}
</style>
