<script setup lang="ts">
import { useCopy } from '@/composable/copy';

const props = withDefaults(defineProps<{ value?: string }>(), { value: '' });
const { value } = toRefs(props);

const initialText = '复制到剪贴板';

const { copy, isJustCopied } = useCopy({ source: value, createToast: false });
const tooltipText = computed(() => isJustCopied.value ? '已复制！' : initialText);
</script>

<template>
  <c-tooltip :tooltip="tooltipText">
    <span cursor-pointer font-mono @click="copy()">{{ value }}</span>
  </c-tooltip>
</template>
