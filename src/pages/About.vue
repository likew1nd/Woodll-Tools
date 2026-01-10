<script setup lang="ts">
import { useHead } from '@vueuse/head';
import { storeToRefs } from 'pinia';
import { useSiteConfigStore } from '@/stores/site-config.store';

const siteConfigStore = useSiteConfigStore();
const { config: siteConfig, isLoaded: siteConfigLoaded } = storeToRefs(siteConfigStore);

useHead(() => {
  if (!siteConfigLoaded.value) {
    return {};
  }
  const suffix = siteConfig.value.titleDescription ? ` - ${siteConfig.value.titleDescription}` : '';
  return {
    title: `About - ${siteConfig.value.title}${suffix}`,
  };
});
</script>

<template>
  <c-markdown :markdown="$t('about.content')" mx-auto mt-50px max-w-600px />
</template>
