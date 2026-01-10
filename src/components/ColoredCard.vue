<script setup lang="ts">
import type { Component } from 'vue';

const props = defineProps<{ icon: Component; title: string }>();
const { icon, title } = toRefs(props);
</script>

<template>
  <c-card class="colored-card">
    <n-icon class="icon" size="40" :component="icon" />
    <n-h3 class="title">
      <n-ellipsis>{{ title }}</n-ellipsis>
    </n-h3>

    <div class="description">
      <n-ellipsis :line-clamp="2" :tooltip="false">
        <slot />
      </n-ellipsis>
    </div>
  </c-card>
</template>

<style lang="less" scoped>
.colored-card {
  position: relative;
  overflow: hidden;
  background: linear-gradient(120deg, rgba(59, 130, 246, 1) 0%, rgba(147, 51, 234, 1) 45%, rgba(16, 185, 129, 1) 100%);
  color: #fff;
  border: none;
  box-shadow: 0 22px 50px rgba(15, 23, 42, 0.28);

  &::before {
    content: '';
    position: absolute;
    inset: -30%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.35), transparent 60%);
    opacity: 0.45;
    transform: translateX(-35%);
    pointer-events: none;
  }

  .icon {
    opacity: 0.7;
  }

  .title {
    color: #fff;

    margin: 5px 0;
  }

  .description {
    opacity: 0.8;

    margin: 5px 0;

    ::v-deep(a) {
      color: inherit;
      text-decoration: underline;
      font-weight: bold;
      transition: color ease 0.2s;

      &:hover {
        color: rgb(10, 10, 14);
      }
    }
  }
}

:global(.dark) .colored-card {
  box-shadow: 0 26px 60px rgba(0, 0, 0, 0.55);
}
</style>
