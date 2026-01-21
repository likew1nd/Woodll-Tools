<script setup lang="ts">
import { useThemeVars } from 'naive-ui';
import FavoriteButton from './FavoriteButton.vue';
import type { Tool } from '@/tools/tools.types';

const props = defineProps<{ tool: Tool & { category?: string } }>();
const { tool } = toRefs(props);
const theme = useThemeVars();
</script>

<template>
  <router-link :to="tool.path" class="decoration-none">
    <c-card class="tool-card h-full transition transition-duration-0.5s">
      <div flex items-center justify-between>
        <n-icon class="text-neutral-400 dark:text-neutral-600" size="40" :component="tool.icon" />

        <div flex items-center gap-8px>
          <div
            v-if="tool.isNew"
            class="rounded-full px-8px py-3px text-xs text-white dark:text-neutral-800"
            :style="{
              'background-color': theme.primaryColor,
            }"
          >
            {{ $t('toolCard.new') }}
          </div>

          <FavoriteButton :tool="tool" />
        </div>
      </div>

      <div class="truncat my-5px text-lg text-black dark:text-white">
        {{ tool.name }}
      </div>

      <div class="line-clamp-2 text-neutral-500 dark:text-neutral-400">
        {{ tool.description }}
      </div>
    </c-card>
  </router-link>
</template>

<style scoped>
.tool-card {
  position: relative;
  overflow: visible;
  border: 1px solid var(--app-border);
  background: var(--app-bg-elev);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.tool-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--app-accent-primary) 55%, transparent),
    color-mix(in srgb, var(--app-accent-cyan) 45%, transparent),
    color-mix(in srgb, var(--app-accent-lime) 38%, transparent)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.tool-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--app-accent-primary) 70%, transparent);
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.12);
}

.tool-card:hover::before {
  opacity: 1;
}

:global(.dark) .tool-card {
  background: rgba(18, 24, 38, 0.75);
  border-color: var(--app-border);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
}

:global(.dark) .tool-card:hover {
  border-color: color-mix(in srgb, var(--app-accent-primary) 70%, transparent);
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.6);
}
</style>
