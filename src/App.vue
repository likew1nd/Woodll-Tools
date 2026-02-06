<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { NGlobalStyle, NMessageProvider, NNotificationProvider, darkTheme, zhCN, dateZhCN } from 'naive-ui';
import { useHead } from '@vueuse/head';
import { storeToRefs } from 'pinia';
import { darkThemeOverrides, lightThemeOverrides } from './themes';
import { layouts } from './layouts';
import { useStyleStore } from './stores/style.store';
import { useToolsConfigStore } from './stores/tools-config.store';
import { useSiteConfigStore } from './stores/site-config.store';

const route = useRoute();
const layout = computed(() => route?.meta?.layout ?? layouts.base);
const styleStore = useStyleStore();
const toolsConfigStore = useToolsConfigStore();
const siteConfigStore = useSiteConfigStore();
const { config: siteConfig, isLoaded: siteConfigLoaded } = storeToRefs(siteConfigStore);

const theme = computed(() => (styleStore.isDarkTheme ? darkTheme : null));
const themeOverrides = computed(() => (styleStore.isDarkTheme ? darkThemeOverrides : lightThemeOverrides));
const naiveLocale = zhCN;
const naiveDateLocale = dateZhCN;

const { locale } = useI18n();

syncRef(
  locale,
  useStorage('locale', locale),
);

// --- 新增：全局防崩溃补丁 ---
// 拦截浏览器扩展（如 LastPass, Bitwarden 等）引起的 DOM 错误，防止页面白屏或自动刷新
const suppressExtensionError = (event: ErrorEvent | PromiseRejectionEvent) => {
  const msg = event instanceof ErrorEvent ? event.message : (event.reason instanceof Error ? event.reason.message : String(event.reason));
  if (msg && (msg.includes("insertBefore") || msg.includes("child of this node"))) {
    event.preventDefault();
    console.warn('已拦截浏览器扩展引起的 DOM 错误，防止页面崩溃');
  }
};

onMounted(() => {
  toolsConfigStore.fetchConfig();
  if (!siteConfigLoaded.value) {
    siteConfigStore.fetchConfig();
  }

  window.addEventListener('error', suppressExtensionError);
  window.addEventListener('unhandledrejection', suppressExtensionError);
});

onUnmounted(() => {
  window.removeEventListener('error', suppressExtensionError);
  window.removeEventListener('unhandledrejection', suppressExtensionError);
});

useHead(() => {
  if (!siteConfigLoaded.value) {
    return {};
  }
  const links = [];
  if (siteConfig.value.logoUrl) {
    links.push({ rel: 'icon', href: siteConfig.value.logoUrl });
  }
  if (siteConfig.value.canonicalUrl) {
    links.push({ rel: 'canonical', href: siteConfig.value.canonicalUrl });
  }

  const titleSuffix = siteConfig.value.titleDescription ? ` - ${siteConfig.value.titleDescription}` : '';
  return {
    title: `${siteConfig.value.title}${titleSuffix}`,
    meta: [
      { name: 'description', content: siteConfig.value.description },
      { property: 'og:title', content: siteConfig.value.title },
      { property: 'og:description', content: siteConfig.value.description },
      ...(siteConfig.value.canonicalUrl ? [{ property: 'og:url', content: siteConfig.value.canonicalUrl }] : []),
      { name: 'twitter:title', content: siteConfig.value.title },
      { name: 'twitter:description', content: siteConfig.value.description },
    ],
    link: links,
  };
});
</script>

<template>
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides" :locale="naiveLocale" :date-locale="naiveDateLocale">
    <NGlobalStyle />
    <NMessageProvider placement="bottom">
      <NNotificationProvider placement="bottom-right">
        <component :is="layout">
          <RouterView />
        </component>
      </NNotificationProvider>
    </NMessageProvider>
  </n-config-provider>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

:root {
  --app-bg: #fdf2f8;
  --app-bg-elev: rgba(255, 255, 255, 0.78);
  --app-content-bg: rgba(255, 255, 255, 0.6);
  --app-sider-bg: rgba(255, 255, 255, 0.7);
  --app-text: #3b0a2a;
  --app-text-muted: #6b3952;
  --app-border: rgba(236, 72, 153, 0.28);
  --app-glow: rgba(34, 211, 238, 0.3);
  --app-accent-pink: #ec4899;
  --app-accent-cyan: #22d3ee;
  --app-accent-lime: #34d399;
  --app-accent-primary: #ec4899;
}

.dark {
  --app-bg: #0a0c16;
  --app-bg-elev: rgba(18, 24, 38, 0.72);
  --app-content-bg: rgba(15, 23, 42, 0.62);
  --app-sider-bg: rgba(17, 24, 39, 0.7);
  --app-text: #e6f6ff;
  --app-text-muted: #9fb3c8;
  --app-border: rgba(56, 189, 248, 0.32);
  --app-glow: rgba(236, 72, 153, 0.4);
  --app-accent-primary: #22d3ee;
}

body {
  min-height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;
  color: var(--app-text);
}

/* 优化：使用伪元素作为背景层，避免 background-attachment: fixed 带来的滚动重绘性能问题 */
body::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(1100px 600px at 12% -15%, rgba(236, 72, 153, 0.28), transparent 60%),
    radial-gradient(900px 520px at 85% -10%, rgba(34, 211, 238, 0.25), transparent 58%),
    radial-gradient(800px 520px at 50% 110%, rgba(52, 211, 153, 0.2), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0.35)),
    var(--app-bg);
}

.dark body::before {
  background:
    radial-gradient(900px 540px at 15% -20%, rgba(236, 72, 153, 0.35), transparent 60%),
    radial-gradient(900px 540px at 85% -20%, rgba(34, 211, 238, 0.3), transparent 60%),
    radial-gradient(800px 520px at 50% 120%, rgba(52, 211, 153, 0.25), transparent 60%),
    linear-gradient(180deg, rgba(5, 8, 16, 0.9), rgba(10, 12, 22, 0.9)),
    var(--app-bg);
}

.perf-mode body::before {
  background:
    radial-gradient(900px 520px at 20% -10%, rgba(236, 72, 153, 0.2), transparent 60%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.4)),
    var(--app-bg);
}

.perf-mode.dark body::before {
  background:
    radial-gradient(900px 520px at 20% -10%, rgba(236, 72, 153, 0.2), transparent 60%),
    linear-gradient(180deg, rgba(5, 8, 16, 0.85), rgba(10, 12, 22, 0.85)),
    var(--app-bg);
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  height: 100%;
  overflow: hidden;
}

* {
  box-sizing: border-box;
}
</style>
