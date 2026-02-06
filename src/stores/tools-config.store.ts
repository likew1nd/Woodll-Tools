import { defineStore } from 'pinia';
import { buildDefaultToolsConfig, normalizeToolsConfig, type ToolsConfig } from '@/tools/tools-config';

export const useToolsConfigStore = defineStore('tools-config', () => {
  const defaultConfig = buildDefaultToolsConfig();
  const config = ref<ToolsConfig>(defaultConfig);
  const isLoading = ref(false);
  const hasLoaded = ref(false);
  const error = ref<string | null>(null);
  let fetchPromise: Promise<void> | null = null;

  async function fetchConfig(options: { force?: boolean; timeoutMs?: number } = {}) {
    const { force = false, timeoutMs = 2500 } = options;

    if (fetchPromise) {
      return fetchPromise;
    }

    if (hasLoaded.value && !force) {
      return;
    }

    isLoading.value = true;
    error.value = null;

    fetchPromise = (async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch('/api/tools-config', { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.status}`);
        }

        const data = await response.json();
        config.value = normalizeToolsConfig(data?.config ?? null, defaultConfig);
      }
      catch (err) {
        const isAbort = err instanceof DOMException && err.name === 'AbortError';
        error.value = isAbort
          ? `Request timed out after ${timeoutMs}ms`
          : err instanceof Error ? err.message : 'Unknown error';
        config.value = defaultConfig;
      }
      finally {
        clearTimeout(timeoutId);
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
