<script setup lang="ts">
import * as monaco from 'monaco-editor';
import { useStyleStore } from '@/stores/style.store';

const props = withDefaults(defineProps<{
  options?: monaco.editor.IDiffEditorOptions
  original?: string
  modified?: string
  language?: string
  enableFormatAction?: boolean
}>(), {
  options: () => ({}),
  original: 'original text',
  modified: 'modified text',
  language: 'txt',
  enableFormatAction: false,
});
const emit = defineEmits<{
  (event: 'update:original', value: string): void
  (event: 'update:modified', value: string): void
  (event: 'cursorChange', payload: { side: 'original' | 'modified'; offset: number }): void
  (event: 'splitRatioChange', payload: { leftWidth: number; rightWidth: number; ratio: number }): void
  (event: 'contextMenuAction', payload: { actionId: string; side: 'original' | 'modified' }): void
}>();
const { options, original, modified, language, enableFormatAction } = toRefs(props);

const rootRef = ref<HTMLElement | null>(null);
const editorContainer = ref<HTMLElement | null>(null);
let editor: monaco.editor.IStandaloneDiffEditor | null = null;
let originalModel: monaco.editor.ITextModel | null = null;
let modifiedModel: monaco.editor.ITextModel | null = null;
let originalEditorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let modifiedEditorInstance: monaco.editor.IStandaloneCodeEditor | null = null;
let isSyncingScroll = false;
let pendingSplitMeasure = false;
const contextMenu = ref<{ visible: boolean; x: number; y: number; side: 'original' | 'modified' | null }>({
  visible: false,
  x: 0,
  y: 0,
  side: null,
});
type ContextMenuItem = { type: 'action'; id: string; label: string } | { type: 'separator' };

const contextMenuItems = computed(() => {
  const items: ContextMenuItem[] = [];
  if (enableFormatAction.value) {
    items.push({ type: 'action', id: 'custom.format', label: 'Format document' });
    items.push({ type: 'separator' });
  }
  items.push(
    { type: 'action', id: 'custom.cut', label: 'Cut' },
    { type: 'action', id: 'custom.copy', label: 'Copy' },
    { type: 'action', id: 'custom.paste', label: 'Paste' },
    { type: 'separator' },
    { type: 'action', id: 'custom.selectAll', label: 'Select all' },
  );
  return items;
});

monaco.editor.defineTheme('it-tools-dark', {
  base: 'vs-dark',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

monaco.editor.defineTheme('it-tools-light', {
  base: 'vs',
  inherit: true,
  rules: [],
  colors: {
    'editor.background': '#00000000',
  },
});

const styleStore = useStyleStore();

const resolvedOptions = computed(() => ({
  originalEditable: true,
  contextmenu: false,
  ...options.value,
  minimap: {
    enabled: false,
    ...(options.value.minimap ?? {}),
  },
}));
const childEditorOptions = computed(
  () => options.value as monaco.editor.IStandaloneEditorConstructionOptions,
);
const modelOptions = computed<monaco.editor.ITextModelUpdateOptions>(() => ({
  tabSize: childEditorOptions.value.tabSize,
  insertSpaces: childEditorOptions.value.insertSpaces,
}));

watch(
  () => styleStore.isDarkTheme,
  isDarkTheme => monaco.editor.setTheme(isDarkTheme ? 'it-tools-dark' : 'it-tools-light'),
  { immediate: true },
);

watch(
  () => resolvedOptions.value,
  resolved => editor?.updateOptions(resolved),
  { immediate: true, deep: true },
);

watch(
  () => childEditorOptions.value,
  (resolved) => {
    editor?.getOriginalEditor().updateOptions(resolved);
    editor?.getModifiedEditor().updateOptions(resolved);
  },
  { immediate: true, deep: true },
);

watch(
  () => modelOptions.value,
  (resolved) => {
    originalModel?.updateOptions(resolved);
    modifiedModel?.updateOptions(resolved);
  },
  { immediate: true, deep: true },
);

useResizeObserver(editorContainer, () => {
  editor?.layout();
  if (!editor) {
    return;
  }
  const leftWidth = editor.getOriginalEditor().getLayoutInfo().width;
  const rightWidth = editor.getModifiedEditor().getLayoutInfo().width;
  const total = leftWidth + rightWidth;
  if (total > 0) {
    emit('splitRatioChange', { leftWidth, rightWidth, ratio: leftWidth / total });
  }
});

onMounted(() => {
  if (!editorContainer.value) {
    return;
  }

  editor = monaco.editor.createDiffEditor(editorContainer.value, resolvedOptions.value);

  originalModel = monaco.editor.createModel(original.value, language.value);
  modifiedModel = monaco.editor.createModel(modified.value, language.value);

  editor.setModel({
    original: originalModel,
    modified: modifiedModel,
  });

  const originalEditor = editor.getOriginalEditor();
  const modifiedEditor = editor.getModifiedEditor();
  originalEditorInstance = originalEditor;
  modifiedEditorInstance = modifiedEditor;

  originalEditor.updateOptions(childEditorOptions.value);
  modifiedEditor.updateOptions(childEditorOptions.value);
  originalModel.updateOptions(modelOptions.value);
  modifiedModel.updateOptions(modelOptions.value);

  function emitSplitRatio() {
    const leftWidth = originalEditor.getLayoutInfo().width;
    const rightWidth = modifiedEditor.getLayoutInfo().width;
    const total = leftWidth + rightWidth;
    if (total <= 0) {
      return;
    }
    emit('splitRatioChange', { leftWidth, rightWidth, ratio: leftWidth / total });
  }

  function scheduleSplitMeasure() {
    if (pendingSplitMeasure) {
      return;
    }
    pendingSplitMeasure = true;
    requestAnimationFrame(() => {
      pendingSplitMeasure = false;
      emitSplitRatio();
    });
  }

  originalEditor.onDidLayoutChange(scheduleSplitMeasure);
  modifiedEditor.onDidLayoutChange(scheduleSplitMeasure);
  scheduleSplitMeasure();

  originalEditor.onDidChangeCursorPosition((event) => {
    if (!originalModel) {
      return;
    }

    emit('cursorChange', {
      side: 'original',
      offset: originalModel.getOffsetAt(event.position),
    });
  });

  modifiedEditor.onDidChangeCursorPosition((event) => {
    if (!modifiedModel) {
      return;
    }

    emit('cursorChange', {
      side: 'modified',
      offset: modifiedModel.getOffsetAt(event.position),
    });
  });

  function showContextMenu(side: 'original' | 'modified', mouseEvent: monaco.editor.IEditorMouseEvent) {
    mouseEvent.event.preventDefault();
    mouseEvent.event.stopPropagation?.();

    const root = rootRef.value;
    if (!root) {
      return;
    }
    const rect = root.getBoundingClientRect();
    const posx = 'posx' in mouseEvent.event ? mouseEvent.event.posx : 0;
    const posy = 'posy' in mouseEvent.event ? mouseEvent.event.posy : 0;
    contextMenu.value = {
      visible: true,
      x: posx - rect.left,
      y: posy - rect.top,
      side,
    };
  }

  originalEditor.onContextMenu(event => showContextMenu('original', event));
  modifiedEditor.onContextMenu(event => showContextMenu('modified', event));

  originalEditor.onDidScrollChange((event) => {
    if (isSyncingScroll) {
      return;
    }
    isSyncingScroll = true;
    modifiedEditor.setScrollTop(event.scrollTop);
    modifiedEditor.setScrollLeft(event.scrollLeft);
    isSyncingScroll = false;
  });

  modifiedEditor.onDidScrollChange((event) => {
    if (isSyncingScroll) {
      return;
    }
    isSyncingScroll = true;
    originalEditor.setScrollTop(event.scrollTop);
    originalEditor.setScrollLeft(event.scrollLeft);
    isSyncingScroll = false;
  });

  originalModel.onDidChangeContent(() => {
    emit('update:original', originalModel?.getValue() ?? '');
  });

  modifiedModel.onDidChangeContent(() => {
    emit('update:modified', modifiedModel?.getValue() ?? '');
  });
});

function hideContextMenu() {
  if (!contextMenu.value.visible) {
    return;
  }
  contextMenu.value = { visible: false, x: 0, y: 0, side: null };
}

async function runContextMenuAction(actionId: string) {
  const target = contextMenu.value.side === 'modified' ? modifiedEditorInstance : originalEditorInstance;
  if (!target) {
    hideContextMenu();
    return;
  }
  if (actionId === 'custom.format') {
    if (contextMenu.value.side) {
      emit('contextMenuAction', { actionId, side: contextMenu.value.side });
    }
    hideContextMenu();
    return;
  }

  const model = target.getModel();

  if (actionId === 'custom.selectAll') {
    if (model) {
      target.setSelection(model.getFullModelRange());
    }
    hideContextMenu();
    return;
  }

  if (actionId === 'custom.format') {
    const action = target.getAction('editor.action.formatDocument');
    if (action) {
      await action.run();
    }
    hideContextMenu();
    return;
  }

  if (!model) {
    hideContextMenu();
    return;
  }

  const selection = target.getSelection();
  if (!selection) {
    hideContextMenu();
    return;
  }

  const selectedText = model.getValueInRange(selection);

  if (actionId === 'custom.copy' || actionId === 'custom.cut') {
    if (selectedText) {
      try {
        await navigator.clipboard.writeText(selectedText);
      }
      catch {
        // Ignore clipboard failures.
      }
    }
    if (actionId === 'custom.cut') {
      target.executeEdits('cut', [{ range: selection, text: '' }]);
    }
    hideContextMenu();
    return;
  }

  if (actionId === 'custom.paste') {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText !== undefined) {
        target.executeEdits('paste', [{ range: selection, text: clipText }]);
      }
    }
    catch {
      // Ignore clipboard failures.
    }
  }

  hideContextMenu();
}

onMounted(() => {
  window.addEventListener('click', hideContextMenu);
});

onBeforeUnmount(() => {
  window.removeEventListener('click', hideContextMenu);
});

watch([original, modified], ([nextOriginal, nextModified]) => {
  if (originalModel && originalModel.getValue() !== nextOriginal) {
    originalModel.setValue(nextOriginal);
  }

  if (modifiedModel && modifiedModel.getValue() !== nextModified) {
    modifiedModel.setValue(nextModified);
  }
}, { immediate: true });

watch(language, (nextLanguage) => {
  if (originalModel) {
    monaco.editor.setModelLanguage(originalModel, nextLanguage);
  }
  if (modifiedModel) {
    monaco.editor.setModelLanguage(modifiedModel, nextLanguage);
  }
});

onBeforeUnmount(() => {
  originalModel?.dispose();
  modifiedModel?.dispose();
  editor?.dispose();
});
</script>

<template>
  <div ref="rootRef" class="diff-editor-root">
    <div ref="editorContainer" class="diff-editor-container" />
    <div
      v-if="contextMenu.visible"
      class="diff-context-menu"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      @click.stop
    >
      <template v-for="(item, index) in contextMenuItems" :key="index">
        <div v-if="item.type === 'separator'" class="diff-context-separator" />
        <button
          v-else
          type="button"
          class="diff-context-item"
          @click="runContextMenuAction(item.id)"
        >
          {{ item.label }}
        </button>
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
.diff-editor-root {
  position: relative;
  height: 460px;
}

.diff-editor-container {
  height: 100%;
}

.diff-context-menu {
  position: absolute;
  z-index: 50;
  min-width: 220px;
  background-color: rgba(15, 23, 42, 0.96);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  padding: 6px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.4);
}

.diff-context-item {
  width: 100%;
  text-align: left;
  background: transparent;
  border: 0;
  color: #e2e8f0;
  font-size: 13px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

.diff-context-item:hover {
  background-color: rgba(148, 163, 184, 0.2);
}

.diff-context-separator {
  height: 1px;
  margin: 6px 4px;
  background-color: rgba(148, 163, 184, 0.2);
}
</style>
