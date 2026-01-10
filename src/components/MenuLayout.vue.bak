<script setup lang="ts">
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isMenuCollapsed, isSmallScreen } = toRefs(styleStore);
const siderPosition = computed(() => (isSmallScreen.value ? 'absolute' : 'static'));
</script>

<template>
  <n-layout class="menu-layout-root">
    <n-layout-header class="top-bar">
      <slot name="header" />
    </n-layout-header>

    <n-layout has-sider class="layout-body">
      <n-layout-sider
        bordered
        collapse-mode="width"
        :collapsed-width="0"
        :width="240"
        :collapsed="isMenuCollapsed"
        :show-trigger="false"
        :native-scrollbar="false"
        :position="siderPosition"
      >
        <slot name="sider" />
      </n-layout-sider>
      <n-layout class="content">
        <slot name="content" />
        <div v-show="isSmallScreen && !isMenuCollapsed" class="overlay" @click="isMenuCollapsed = true" />
      </n-layout>
    </n-layout>
  </n-layout>
</template>

<style lang="less" scoped>
:global(.menu-layout) {
  background: var(--app-bg);
}

:global(.menu-layout .n-layout) {
  background: transparent;
}

:global(.menu-layout .n-layout-sider) {
  background: var(--app-sider-bg);
  border-right: 1px solid var(--app-border);
}

:global(.menu-layout .n-layout-sider__content) {
  background: var(--app-sider-bg);
}

.menu-layout-root {
  height: 100vh;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--app-bg-elev);
  border-bottom: 1px solid var(--app-border);
  padding: 10px 22px;
}

.layout-body {
  height: calc(100vh - 60px);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(15, 23, 42, 0.5);
  cursor: pointer;
}

.content {
  background:
    radial-gradient(980px 520px at 92% -10%, rgba(124, 92, 255, 0.38), transparent 70%),
    radial-gradient(760px 460px at 6% 0%, rgba(34, 211, 238, 0.28), transparent 65%),
    var(--app-content-bg);

  ::v-deep(.n-layout-scroll-container) {
    padding: 26px;
  }
}

:global(.dark) .menu-layout .content {
  background:
    radial-gradient(980px 520px at 92% -10%, rgba(127, 43, 255, 0.6), transparent 70%),
    radial-gradient(760px 460px at 6% 0%, rgba(34, 211, 238, 0.38), transparent 65%),
    radial-gradient(620px 420px at 50% 30%, rgba(127, 43, 255, 0.2), transparent 70%),
    var(--app-content-bg);
}

@media (max-width: 700px) {
  .top-bar {
    padding: 10px 14px;
  }

  .layout-body {
    height: calc(100vh - 56px);
  }
}
</style>
