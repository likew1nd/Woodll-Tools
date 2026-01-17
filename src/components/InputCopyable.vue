<script setup lang="ts">
import { computed, nextTick, ref, useAttrs, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVModel } from '@vueuse/core';
import { useCopy } from '@/composable/copy';

const props = defineProps<{ value: string; rows?: number; autosize?: boolean }>();
const emit = defineEmits(['update:value']);
const attrs = useAttrs();
const { t } = useI18n();
const value = useVModel(props, 'value', emit);
const { copy, isJustCopied } = useCopy({
  source: value,
  createToast: false,
});

const tooltipText = computed(() =>
  isJustCopied.value ? t('ui.copy.copied') : t('ui.copy.default'),
);
const computedRows = computed(() => props.rows ?? 3);
const computedAutosize = computed(() => props.autosize ?? false);
const btnRef = ref<HTMLElement>();
const tooltipStyle = ref<Record<string, string>>({});

watch(isJustCopied, async (val) => {
  if (!val) {
    return;
  }
  await nextTick();
  const rect = btnRef.value!.getBoundingClientRect();
  tooltipStyle.value = {
    position: 'fixed',
    left: `${rect.left + rect.width / 2}px`,
    top: `${rect.top - 8}px`,
    transform: 'translate(-50%, -100%)',
    zIndex: '9999',
  };
});
</script>

<template>
  <c-input-text
    v-model:value="value"
    class="copy-input"
    v-bind="attrs"
    multiline
    :rows="computedRows"
    :autosize="computedAutosize"
  >
    <template #suffix>
      <!-- 关键：用原生 span 包一层 -->
      <span ref="btnRef" class="copy-anchor">
        <c-button
          circle
          variant="text"
          size="small"
          @click="copy"
        >
          <icon-mdi-content-copy />
        </c-button>
      </span>
    </template>
  </c-input-text>

  <Teleport to="body">
    <div
      v-if="isJustCopied"
      class="copy-tooltip"
      :style="tooltipStyle"
    >
      {{ tooltipText }}
    </div>
  </Teleport>
</template>

<style scoped>
.copy-tooltip {
  white-space: nowrap;
  padding: 4px 8px;
  border-radius: 4px;
  background: #000;
  color: #fff;
  font-size: 12px;
  pointer-events: none;
}
.copy-anchor {
  display: inline-flex;
}
</style>
