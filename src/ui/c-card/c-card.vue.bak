<script lang="ts" setup>
import { useTheme } from './c-card.theme';

const props = defineProps<{
  title?: string
}>();

const { title } = toRefs(props);

const theme = useTheme();
</script>

<template>
  <div class="c-card">
    <div v-if="title" class="c-card-title">
      {{ title }}
    </div>
    <slot />
  </div>
</template>

<style lang="less" scoped>
.c-card {
  background-color: v-bind('theme.backgroundColor');
  border: 1px solid v-bind('theme.borderColor');
  border-radius: 14px;
  padding: 20px 24px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);

  &-title {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 20px;
  }
}
</style>
