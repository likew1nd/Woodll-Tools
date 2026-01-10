import { defineStore } from 'pinia';
import { buildDefaultToolsConfig, normalizeToolsConfig, type ToolsConfig } from '@/tools/tools-config';

export const useToolsConfigStore = defineStore('tools-config', () => {
  const defaultConfig = buildDefaultToolsConfig();
  const config = ref<ToolsConfig>(defaultConfig);
  const isLoading = ref(false);
  const hasLoaded = ref(false);
  const error = ref<string | null>(null);
  let fetchPromise: Promise<void> | null = null;

  async function fetchConfig() {
    if (fetchPromise) {
      return fetchPromise;
    }

    isLoading.value = true;
    error.value = null;

    fetchPromise = (async () => {
      try {
        const response = await fetch('/api/tools-config');
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.status}`);
        }

        const data = await response.json();
        config.value = normalizeToolsConfig(data?.config ?? null, defaultConfig);
      }
      catch (err) {
        error.value = err instanceof Error ? err.message : 'Unknown error';
        config.value = defaultConfig;
      }
      finally {
        isLoading.value = false;
        hasLoaded.value = true;
        fetchPromise = null;
      }
    })();

    return fetchPromise;
  }

  return {
    config,
    isLoading,
    hasLoaded,
    error,
    fetchConfig,
  };
});
