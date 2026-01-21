<script setup lang="ts">
import { useTheme } from './c-modal.theme';

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<{ open?: boolean; centered?: boolean }>(), {
  open: false,
  centered: true,
});

const emit = defineEmits(['update:open']);

const isOpen = useVModel(props, 'open', emit, { passive: true });

const { centered } = toRefs(props);

function close() {
  isOpen.value = false;
}

function open() {
  isOpen.value = true;
}

function toggle() {
  isOpen.value = !isOpen.value;
}

defineExpose({
  close,
  open,
  toggle,
  isOpen,
});

const theme = useTheme();
const modal = ref();

onClickOutside(modal, () => {
  if (isOpen.value) {
    close();
  }
});
</script>

<template>
  <teleport to="body">
    <transition>
      <div v-if="isOpen" class="c-modal--overlay" fixed inset-0 z-10 h-screen w-screen flex justify-center px-2 :class="{ 'items-center': centered }">
        <div ref="modal" class="c-modal--container" v-bind="$attrs" max-w-xl w-full flex-grow rounded-md pa-24px>
          <slot />
        </div>
      </div>
    </transition>
  </teleport>
</template>

<style scoped lang="less">
.c-modal--overlay {
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(6px);
  width: 100vw;
  height: 100vh;
}

.c-modal--container {
  background-color: v-bind('theme.background');
  border: 1px solid var(--app-border);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.25);
  border-radius: 16px;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.3s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
