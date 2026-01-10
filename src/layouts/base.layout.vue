<script lang="ts" setup>
import { NIcon } from 'naive-ui';

import { RouterLink } from 'vue-router';
import { Home2, Menu2 } from '@vicons/tabler';

import { storeToRefs } from 'pinia';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';
import { useSiteConfigStore } from '@/stores/site-config.store';

const styleStore = useStyleStore();
const siteConfigStore = useSiteConfigStore();
const { config: siteConfig } = storeToRefs(siteConfigStore);
const commitSha = config.app.lastCommitSha.slice(0, 7);

const { t } = useI18n();

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0 ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }] : []),
  ...toolsByCategory.value,
]);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #header>
      <div class="top-bar">
        <div class="top-left">
          <c-button
            circle
            variant="text"
            :aria-label="$t('home.toggleMenu')"
            @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
          >
            <NIcon size="22" :component="Menu2" />
          </c-button>

          <RouterLink to="/" class="brand">
            <img v-if="siteConfig.logoUrl" :src="siteConfig.logoUrl" class="brand-logo" alt="logo">
            <span v-else class="brand-mark">IT</span>
            <span class="brand-name">{{ siteConfig.title }}</span>
          </RouterLink>
        </div>

        <div class="top-center">
          <command-palette />
        </div>

        <div class="top-right">
          <c-tooltip :tooltip="$t('home.home')" position="bottom">
            <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
              <NIcon size="22" :component="Home2" />
            </c-button>
          </c-tooltip>

          <NavbarButtons v-if="!styleStore.isSmallScreen" />
        </div>
      </div>
    </template>

    <template #sider>
      <div class="sider-content">
        <div v-if="styleStore.isSmallScreen" flex flex-col items-center>
          <locale-selector w="90%" />

          <div flex justify-center>
            <NavbarButtons />
          </div>
        </div>

        <CollapsibleToolMenu :tools-by-category="tools" />

        <div class="footer">
          <div>
            基于 <c-link target="_blank" rel="noopener" href="https://github.com/CorentinTh/it-tools/">
              IT-Tools
            </c-link> 的二次开发<br>
            <template v-if="commitSha && commitSha.length > 0">
              -
              <c-link
                target="_blank"
                rel="noopener"
                type="primary"
                :href="`https://github.com/CorentinTh/it-tools/tree/${commitSha}`"
              >
                {{ commitSha }}
              </c-link>
            </template>
          </div>
          <div>
            © {{ new Date().getFullYear() }}
            <c-link target="_blank" rel="noopener" href="https://corentin.tech?utm_source=it-tools&utm_medium=footer">
              Corentin Thomasset
            </c-link>
          </div>
        </div>
      </div>
    </template>

    <template #content>
      <slot />
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
// ::v-deep(.n-layout-scroll-container) {
//     @percent: 4%;
//     @position: 25px;
//     @size: 50px;
//     @color: #eeeeee25;
//     background-image: radial-gradient(@color @percent, transparent @percent),
//         radial-gradient(@color @percent, transparent @percent);
//     background-position: 0 0, @position @position;
//     background-size: @size @size;
// }

.support-button {
  background: rgb(37, 99, 108);
  background: linear-gradient(48deg, rgba(37, 99, 108, 1) 0%, rgba(59, 149, 111, 1) 60%, rgba(20, 160, 88, 1) 100%);
  color: #fff !important;
  transition: padding ease 0.2s !important;

  &:hover {
    color: #fff;
    padding-left: 30px;
    padding-right: 30px;
  }
}

.footer {
  text-align: center;
  color: #838587;
  margin-top: 20px;
  padding: 20px 0;
}

.sider-content {
  padding-top: 24px;
  padding-bottom: 200px;
}

.top-bar {
  display: grid;
  grid-template-columns: minmax(200px, 260px) minmax(0, 1fr) minmax(200px, 260px);
  align-items: center;
  gap: 16px;
}

.top-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.top-center {
  display: flex;
  justify-content: center;
}

.top-right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--app-text);
  font-weight: 700;
  letter-spacing: 0.1em;
}

.brand-mark {
  background: linear-gradient(135deg, #7f2bff, #22d3ee);
  color: #fff;
  font-size: 12px;
  padding: 4px 6px;
  border-radius: 6px;
}

.brand-logo {
  width: 26px;
  height: 26px;
  object-fit: contain;
  border-radius: 6px;
}

.brand-name {
  font-size: 14px;
  text-transform: uppercase;
}

@media (max-width: 700px) {
  .top-bar {
    grid-template-columns: auto 1fr;
  }

  .top-center {
    justify-content: flex-start;
  }

  .top-right {
    display: none;
  }
}
</style>
