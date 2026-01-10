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
  overflow: hidden;
  border: 1px solid var(--app-border);
  background: var(--app-bg-elev);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.tool-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(34, 211, 238, 0.25), rgba(16, 185, 129, 0.2));
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.tool-card:hover {
  transform: translateY(-4px);
  border-color: rgba(99, 102, 241, 0.5);
  box-shadow: 0 22px 44px rgba(15, 23, 42, 0.12);
}

.tool-card:hover::before {
  opacity: 1;
}

:global(.dark) .tool-card {
  background: rgba(18, 24, 38, 0.95);
  border-color: rgba(148, 163, 184, 0.18);
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.5);
}

:global(.dark) .tool-card:hover {
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 22px 44px rgba(0, 0, 0, 0.6);
}
</style>
