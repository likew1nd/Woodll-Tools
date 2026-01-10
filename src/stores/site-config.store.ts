import { defineStore } from 'pinia';

interface SiteConfig {
  title: string
  titleDescription: string
  description: string
  logoUrl: string
  canonicalUrl: string
}

const defaultConfig: SiteConfig = {
  title: '',
  titleDescription: '',
  description: '',
  logoUrl: '',
  canonicalUrl: '',
};

export const useSiteConfigStore = defineStore('site-config', () => {
  const config = ref<SiteConfig>({ ...defaultConfig });
  const isLoaded = ref(false);

  async function fetchConfig() {
    try {
      const response = await fetch('/api/site-config');
      if (!response.ok) {
        isLoaded.value = true;
        return;
      }
      const data = await response.json();
      if (data?.config) {
        config.value = { ...defaultConfig, ...data.config };
      }
      isLoaded.value = true;
    }
    catch (_err) {
      // Ignore network errors (e.g. when API is not available in dev).
      isLoaded.value = true;
    }
  }

  return {
    config,
    isLoaded,
    fetchConfig,
  };
});
