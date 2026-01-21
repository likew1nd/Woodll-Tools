<script setup lang="ts">
import { useEventListener, useStorage } from '@vueuse/core';
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
  nextTick(updateMeasurements);
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

const menuRoot = ref<HTMLElement | null>(null);
const scrollContainer = ref<HTMLElement | null>(null);
const scrollTopValue = ref(0);
const bottomStackRef = ref<HTMLElement | null>(null);
const bottomStackHeight = ref(0);
const headerRefs = ref<Record<string, HTMLElement | null>>({});
const headerPositions = ref<Record<string, number>>({});
const viewportHeight = ref(0);
const siderRect = ref<{ left: number; width: number } | null>(null);
const showBottomStack = ref(true);
let bottomStackTimer: ReturnType<typeof setTimeout> | null = null;

function setHeaderRef(name: string) {
  return (el: Element | null) => {
    if (el instanceof HTMLElement) {
      headerRefs.value[name] = el;
    }
  };
}

function getOffsetTopToContainer(el: HTMLElement, container: HTMLElement) {
  const elRect = el.getBoundingClientRect();
  const containerRect = container.getBoundingClientRect();
  return elRect.top - containerRect.top + container.scrollTop;
}

function findScrollableParent(el: HTMLElement | null) {
  let node = el?.parentElement ?? null;
  while (node) {
    const style = getComputedStyle(node);
    if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && node.scrollHeight > node.clientHeight) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

function resolveScrollContainer() {
  const root = menuRoot.value;
  if (!root) {
    return;
  }

  updateSiderRect();
  const scrollable = findScrollableParent(root);
  const sider = root.closest('.n-layout-sider');
  const candidates = [
    sider?.querySelector<HTMLElement>('.n-scrollbar-container'),
    sider?.querySelector<HTMLElement>('.n-layout-sider-scroll-container'),
    sider?.querySelector<HTMLElement>('.n-layout-sider__content'),
    root.parentElement,
  ].filter(Boolean) as HTMLElement[];

  scrollContainer.value = scrollable ?? candidates[0] ?? null;
  updateMeasurements();
}

function updateMeasurements() {
  const container = scrollContainer.value;
  const root = menuRoot.value;
  if (!container || !root) {
    return;
  }

  viewportHeight.value = container.clientHeight;
  scrollTopValue.value = container.scrollTop;
  updateSiderRect();
  const nextPositions: Record<string, number> = {};
  Object.entries(headerRefs.value).forEach(([name, el]) => {
    if (!el) {
      return;
    }
    const offsetTop = getOffsetTopToContainer(el, container);
    nextPositions[name] = offsetTop - scrollTopValue.value;
  });
  headerPositions.value = nextPositions;

}

function scheduleBottomStackHide() {
  showBottomStack.value = true;
  if (bottomStackTimer) {
    clearTimeout(bottomStackTimer);
  }
  bottomStackTimer = setTimeout(() => {
    showBottomStack.value = false;
  }, 3000);
}

const bottomStackCategories = computed(() => {
  const height = viewportHeight.value || 0;
  const positions = headerPositions.value;

  return menuOptions.value
    .filter(({ name }) => {
      const pos = positions[name];
      return pos !== undefined && (pos < 0 || pos > height);
    })
    .map(({ name }) => name);
});

function updateBottomStackHeight() {
  bottomStackHeight.value = bottomStackRef.value?.offsetHeight ?? 0;
}

function updateSiderRect() {
  const root = menuRoot.value;
  const sider = root?.closest('.n-layout-sider') as HTMLElement | null;
  if (!sider) {
    siderRect.value = null;
    return;
  }
  const rect = sider.getBoundingClientRect();
  siderRect.value = { left: rect.left, width: rect.width };
}

function scrollToCategory(name: string) {
  const container = scrollContainer.value;
  const target = headerRefs.value[name];
  if (!container || !target) {
    return;
  }

  const doScroll = () => {
    const desiredTop = getOffsetTopToContainer(target, container) ;
    container.scrollTo({ top: Math.max(desiredTop, 0), behavior: 'smooth' });
  };

  if (collapsedCategories.value[name]) {
    collapsedCategories.value[name] = false;
    nextTick(() => {
      updateMeasurements();
      doScroll();
    });
    return;
  }

  doScroll();
}

onMounted(() => {
  nextTick(() => {
    resolveScrollContainer();
    updateMeasurements();
    updateBottomStackHeight();
    scheduleBottomStackHide();
  });
});

useEventListener(scrollContainer, 'scroll', () => {
  updateMeasurements();
  scheduleBottomStackHide();
});
useEventListener(window, 'resize', () => {
  updateMeasurements();
  updateBottomStackHeight();
});

useEventListener(window, 'scroll', () => {
  updateMeasurements();
  scheduleBottomStackHide();
});

onUnmounted(() => {
  if (bottomStackTimer) {
    clearTimeout(bottomStackTimer);
  }
});

watch(
  () => bottomStackCategories.value.join('|'),
  () => {
    nextTick(() => {
      updateBottomStackHeight();
      updateMeasurements();
    });
  },
);

</script>

<template>
  <div ref="menuRoot" class="tool-menu">
    <div v-for="{ name, tools, isCollapsed } of menuOptions" :key="name" class="category-block" :ref="setHeaderRef(name)">
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

    <div
      v-if="bottomStackCategories.length > 0"
      class="category-bottom-stack-wrapper"
      :class="{ 'is-hidden': !showBottomStack }"
      :style="siderRect ? { left: `${siderRect.left }px`, width: `${Math.max(siderRect.width - 100, 200)}px` } : undefined"
    >
      <div ref="bottomStackRef" class="category-bottom-stack">
        <button
          v-for="name in bottomStackCategories"
          :key="`bottom-${name}`"
          class="bottom-stack-item"
          type="button"
          @click="scrollToCategory(name)"
        >
          <span class="bottom-stack-label">{{ name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
.tool-menu {
  position: relative;
  --stack-item-height: 26px;
  --stack-gap: 1px;
}

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
  background: linear-gradient(90deg, var(--app-accent-primary), transparent);
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
  position: sticky;
  top: 6px;
  z-index: 2;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  transition: color 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease;
}

.category-header::before {
  content: '';
  position: absolute;
  left: 6px;
  width: 2px;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--app-accent-primary), rgba(34, 211, 238, 0.4));
  opacity: 0.7;
}

.category-header:hover {
  background-color: color-mix(in srgb, var(--app-accent-primary) 18%, transparent);
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
  background-color: color-mix(in srgb, var(--app-accent-primary) 24%, transparent);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.4);
}

:global(.dark) .category-block::after {
  background: linear-gradient(90deg, var(--app-accent-primary), transparent);
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

.category-bottom-stack-wrapper {
  position: fixed;
  bottom: 18px;
  z-index: 6;
  height: auto;
  pointer-events: none;
  visibility: visible;
  transition: opacity 1.0s ease, transform 1.0s ease;
}

.category-bottom-stack-wrapper:global(.n-layout-sider--collapsed),
:global(.n-layout-sider--collapsed) .category-bottom-stack-wrapper {
  display: none;
}

.category-bottom-stack-wrapper.is-hidden {
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
  visibility: hidden;
}

.category-bottom-stack {
  position: relative;
  left: 10px;
  right: 6px;
  display: flex;
  flex-direction: column;
  gap: var(--stack-gap);
  pointer-events: auto;
  min-width: 220px;
}

.bottom-stack-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  height: var(--stack-item-height);
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--app-accent-primary) 45%, var(--app-border));
  background: color-mix(in srgb, var(--app-bg-elev) 88%, transparent);
  color: var(--app-text);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  box-shadow: 0 14px 26px rgba(15, 23, 42, 0.22);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.bottom-stack-item:hover {
  border-color: color-mix(in srgb, var(--app-accent-primary) 70%, transparent);
  background: color-mix(in srgb, var(--app-bg-elev) 96%, transparent);
  box-shadow: 0 18px 32px rgba(15, 23, 42, 0.26);
}

.bottom-stack-label {
  pointer-events: none;
}
</style>
