<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router';
import { NGlobalStyle, NMessageProvider, NNotificationProvider, darkTheme } from 'naive-ui';
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

const { locale } = useI18n();

syncRef(
  locale,
  useStorage('locale', locale),
);

onMounted(() => {
  toolsConfigStore.fetchConfig();
  siteConfigStore.fetchConfig();
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
  <n-config-provider :theme="theme" :theme-overrides="themeOverrides">
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
  --app-bg: #f6f7fb;
  --app-bg-elev: #ffffff;
  --app-content-bg: #f6f7fb;
  --app-sider-bg: #ffffff;
  --app-text: #0f172a;
  --app-text-muted: #64748b;
  --app-border: rgba(148, 163, 184, 0.35);
  --app-glow: rgba(99, 102, 241, 0.18);
}

.dark {
  --app-bg: #0b0f15;
  --app-bg-elev: #121627;
  --app-content-bg: #0b0f15;
  --app-sider-bg: #0f172a;
  --app-text: #e2e8f0;
  --app-text-muted: #9aa4b2;
  --app-border: rgba(124, 92, 255, 0.28);
  --app-glow: rgba(127, 43, 255, 0.32);
}

body {
  min-height: 100%;
  margin: 0;
  padding: 0;
  font-family: 'Space Grotesk', 'Noto Sans SC', sans-serif;
  background: var(--app-bg);
  color: var(--app-text);
}

html {
  height: 100%;
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}
</style>
