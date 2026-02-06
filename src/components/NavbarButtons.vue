<script setup lang="ts">
import { defineComponent, h } from 'vue';
import { IconMoon, IconSun } from '@tabler/icons-vue';
import { useStyleStore } from '@/stores/style.store';

const styleStore = useStyleStore();
const { isDarkTheme } = toRefs(styleStore);

function wrapIcon(IconComponent: any) {
  return defineComponent({
    name: 'WrappedTablerIcon',
    render: () => h(IconComponent),
  });
}

const IconSunWrapped = wrapIcon(IconSun);
const IconMoonWrapped = wrapIcon(IconMoon);
</script>

<template>
  <!-- <c-tooltip :tooltip="$t('home.nav.github')" position="bottom">
    <c-button
      circle
      variant="text"
      href="https://github.com/CorentinTh/it-tools"
      target="_blank"
      rel="noopener noreferrer"
      :aria-label="$t('home.nav.githubRepository')"
    >
      <n-icon size="25" :component="IconBrandGithubWrapped" />
    </c-button>
  </c-tooltip>

  <c-tooltip :tooltip="$t('home.nav.twitterX')" position="bottom">
    <c-button
      circle
      variant="text"
      href="https://x.com/ittoolsdottech"
      rel="noopener"
      target="_blank"
      :aria-label="$t('home.nav.twitterXAccount')"
    >
      <n-icon size="25" :component="IconBrandXWrapped" />
    </c-button>
  </c-tooltip> -->

  <!-- <c-tooltip :tooltip="$t('home.nav.about')" position="bottom">
    <c-button circle variant="text" to="/about" :aria-label="$t('home.nav.aboutLabel')">
      <n-icon size="25" :component="IconInfoCircleWrapped" />
    </c-button>
  </c-tooltip> -->
  <c-tooltip :tooltip="isDarkTheme ? $t('home.nav.lightMode') : $t('home.nav.darkMode')" position="bottom">
    <c-button circle variant="text" :aria-label="$t('home.nav.mode')" @click="() => styleStore.toggleDark()">
      <n-icon v-if="isDarkTheme" size="25" :component="IconSunWrapped" />
      <n-icon v-else size="25" :component="IconMoonWrapped" />
    </c-button>
  </c-tooltip>
</template>

<style lang="less" scoped>
.n-button {
  &:not(:last-child) {
    margin-right: 5px;
  }
}
</style>
