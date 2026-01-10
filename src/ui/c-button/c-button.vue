<script lang="ts" setup>
import type { RouteLocationRaw } from 'vue-router';
import { useAppTheme } from '../theme/themes';
import { useTheme } from './c-button.theme';

const props = withDefaults(
  defineProps<{
    type?: 'default' | 'primary' | 'warning' | 'error'
    variant?: 'basic' | 'text'
    disabled?: boolean
    round?: boolean
    circle?: boolean
    href?: string
    to?: RouteLocationRaw
    size?: 'small' | 'medium' | 'large'
  }>(),
  {
    type: 'default',
    variant: 'basic',
    disabled: false,
    round: false,
    circle: false,
    href: undefined,
    to: undefined,
    size: 'medium',
  },
);
const emits = defineEmits(['click']);

const { variant, disabled, round, circle, href, type, to, size: sizeName } = toRefs(props);

function handleClick(event: MouseEvent) {
  if (!disabled.value) {
    emits('click', event);
  }
}

const theme = useTheme();
const variantTheme = computed(() => theme.value[variant.value][type.value]);
const tag = computed(() => {
  if (href.value) {
    return 'a';
  }
  if (to.value) {
    return 'router-link';
  }
  return 'button';
});
const appTheme = useAppTheme();

const size = computed(() => theme.value.size[sizeName.value]);
</script>

<template>
<component
  :is="tag"
  :href="href ?? to"
  class="c-button"
  :class="{ disabled, round, circle, 'is-text': variant === 'text', 'is-basic': variant === 'basic' }"
  :to="to"
  @click="handleClick"
>
    <slot />
  </component>
</template>

<style lang="less" scoped>
.c-button {
  line-height: 1;
  font-family: inherit;
  font-size: v-bind('size.fontSize');
  border: none;
  border: 1px solid transparent;
  text-align: center;
  cursor: pointer;
  text-decoration: none;
  height: v-bind('size.width');
  font-weight: 400;
  color: v-bind('variantTheme.textColor');
  padding: 0 14px;
  border-radius: 4px;
  transition: background-color 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease, transform 0.2s ease;

  background-color: v-bind('variantTheme.backgroundColor');
  display: inline-flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);

  // outline-offset: 1px;
  &.round {
    border-radius: 100px;
  }

  &.circle {
    border-radius: v-bind('size.width');
    width: v-bind('size.width');
    padding: 0;
  }

  &:not(.disabled) {
    &:hover {
      background-color: v-bind('variantTheme.hover.backgroundColor');
      transform: translateY(-1px);
      box-shadow: 0 12px 24px rgba(15, 23, 42, 0.12);
    }

    &:active {
      background-color: v-bind('variantTheme.pressed.backgroundColor');
      transform: translateY(0);
    }
  }

  &:focus {
    outline: 1px solid v-bind('appTheme.primary.color');
  }

  &.disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.c-button.is-text {
  box-shadow: none;
  border-color: transparent;
}

.c-button.is-basic:not(.disabled) {
  border-color: rgba(148, 163, 184, 0.3);
}

:global(.dark) .c-button.is-basic:not(.disabled) {
  border-color: rgba(148, 163, 184, 0.2);
}
</style>
