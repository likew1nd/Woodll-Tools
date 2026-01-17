<script setup lang="ts">
import { computed } from 'vue';
import { useVModel } from '@vueuse/core';
import { useCopy } from '@/composable/copy';

const props = defineProps<{ value: string; rows?: number; autosize?: boolean }>();
const emit = defineEmits(['update:value']);

const value = useVModel(props, 'value', emit);
const { copy, isJustCopied } = useCopy({ source: value, createToast: false });
const tooltipText = computed(() => isJustCopied.value ? 'Copied!' : 'Copy to clipboard');
const computedRows = computed(() => props.rows ?? 3);
const computedAutosize = computed(() => props.autosize ?? false);
</script>

<template>
  <c-input-text
    v-model:value="value"
    multiline
    :rows="computedRows"
    :autosize="computedAutosize"
  >
    <template #suffix>
      <c-tooltip :tooltip="tooltipText">
        <c-button circle variant="text" size="small" @click="copy()">
          <icon-mdi-content-copy />
        </c-button>
      </c-tooltip>
    </template>
  </c-input-text>
</template>
