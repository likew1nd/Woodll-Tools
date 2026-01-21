<script lang="ts" setup>
import _ from 'lodash';
import { diff } from '../json-diff.models';
import { DiffRootViewer } from './diff-viewer.models';
import { useAppTheme } from '@/ui/theme/themes';

const { t } = useI18n();

const props = defineProps<{ leftJson: unknown; rightJson: unknown }>();
const onlyShowDifferences = ref(false);
const { leftJson, rightJson } = toRefs(props);
const appTheme = useAppTheme();
const diffContainer = ref<HTMLElement | null>(null);
const diffMarkers = ref<{ top: number; status: string }[]>([]);

const result = computed(() =>
  diff(leftJson.value, rightJson.value, { onlyShowDifferences: onlyShowDifferences.value }),
);

const jsonAreTheSame = computed(() => _.isEqual(leftJson.value, rightJson.value));
const showResults = computed(() => !_.isUndefined(leftJson.value) && !_.isUndefined(rightJson.value));

function updateMarkers() {
  const container = diffContainer.value;

  if (!container) {
    diffMarkers.value = [];
    return;
  }

  const items = container.querySelectorAll<HTMLElement>('[data-diff-status]');
  const scrollHeight = container.scrollHeight;
  const containerRect = container.getBoundingClientRect();
  const containerTop = containerRect.top;
  const scrollTop = container.scrollTop;
  const scrollRange = Math.max(1, scrollHeight - container.clientHeight);

  if (!items.length || scrollHeight <= 0) {
    diffMarkers.value = [];
    return;
  }

  const markers: { top: number; status: string }[] = [];

  items.forEach((item) => {
    const status = item.dataset.diffStatus;

    if (!status || status === 'unchanged') {
      return;
    }

    const itemRect = item.getBoundingClientRect();
    const itemTop = itemRect.top - containerTop + scrollTop;
    const top = Math.min(100, Math.max(0, (itemTop / scrollRange) * 100));

    markers.push({ top, status });
  });

  diffMarkers.value = markers;
}

watch([leftJson, rightJson, onlyShowDifferences, showResults], () => {
  nextTick(updateMarkers);
});

useResizeObserver(diffContainer, () => nextTick(updateMarkers));
</script>

<template>
  <div v-if="showResults">
    <div flex justify-center>
      <n-form-item :label="$t('tools.json-diff.onlyDifferences')" label-placement="left">
        <n-switch v-model:value="onlyShowDifferences" />
      </n-form-item>
    </div>

    <c-card class="diff-result-card" data-test-id="diff-result">
      <div v-if="jsonAreTheSame" text-center op-70>
        {{ $t('tools.json-diff.sameJson') }}
      </div>
      <div v-else class="diff-scroll-wrapper">
        <div ref="diffContainer" class="diff-scroll-container">
          <DiffRootViewer :diff="result" />
        </div>
        <div v-if="diffMarkers.length > 0" class="diff-scrollbar" aria-hidden="true">
          <span
            v-for="(marker, index) in diffMarkers"
            :key="index"
            class="diff-scrollbar-marker"
            :class="marker.status"
            :style="{ top: `${marker.top}%` }"
          />
        </div>
      </div>
    </c-card>
  </div>
</template>

<style lang="less" scoped>
::v-deep(.diffs-viewer) {
  color: v-bind('appTheme.text.mutedColor');
  width: 100%;
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;

  & > ul {
    padding-left: 0 !important;
  }

  ul {
    list-style: none;
    padding-left: 20px;
    margin: 0;

    li {
      .updated-line {
        padding: 3px 0;
      }

      .result,
      .array,
      .object,
      .value {
        &:not(:last-child) {
          margin-right: 4px;
        }

        &.added {
          padding: 3px 5px;
          border-radius: 4px;
          background-color: v-bind('appTheme.success.colorFaded');
          color: v-bind('appTheme.success.color');
          .key {
            color: inherit;
          }
        }

        &.removed {
          padding: 3px 5px;
          border-radius: 4px;
          background-color: v-bind('appTheme.error.colorFaded');
          color: v-bind('appTheme.error.color');

          .key {
            color: inherit;
          }
        }
      }

      .value {
        cursor: pointer;
        border: 1px solid transparent;
        transition: border-color 0.2s ease-in-out;

        &.added:hover {
          border-color: v-bind('appTheme.success.color');
        }

        &.removed:hover {
          border-color: v-bind('appTheme.error.color');
        }
      }

      .added .added,
      .removed .removed {
        background-color: transparent;
        color: inherit;
      }

      .key {
        font-weight: 500;
        color: v-bind('appTheme.text.baseColor');
      }
    }
  }
}

.diff-result-card {
  width: 100%;
  max-width: 100%;
  overflow: hidden;
}

.diff-scroll-wrapper {
  position: relative;
}

.diff-scroll-container {
  position: relative;
  max-height: 60vh;
  overflow: auto;
  padding-right: 28px;
}

.diff-scrollbar {
  position: absolute;
  top: 8px;
  right: 14px;
  bottom: 8px;
  width: 8px;
  border-radius: 999px;
  background-color: v-bind('appTheme.default.color');
  pointer-events: none;
  z-index: 2;
}

.diff-scrollbar-marker {
  position: absolute;
  left: 0;
  right: 0;
  height: 4px;
  border-radius: 999px;
  opacity: 1;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.diff-scrollbar-marker.added {
  background-color: v-bind('appTheme.success.color');
}

.diff-scrollbar-marker.removed {
  background-color: v-bind('appTheme.error.color');
}

.diff-scrollbar-marker.updated,
.diff-scrollbar-marker.children-updated {
  background-color: v-bind('appTheme.warning.color');
}
</style>
