<script setup lang="ts">
import JSON5 from 'json5';
import type { editor } from 'monaco-editor';

import { isNotThrowing } from '@/utils/boolean';

const { t } = useI18n();

const rawLeftJson = ref('');
const rawRightJson = ref('');

const leftHasValue = computed(() => rawLeftJson.value.trim().length > 0);
const rightHasValue = computed(() => rawRightJson.value.trim().length > 0);
const leftInvalid = computed(() => leftHasValue.value && !isNotThrowing(() => JSON5.parse(rawLeftJson.value)));
const rightInvalid = computed(() => rightHasValue.value && !isNotThrowing(() => JSON5.parse(rawRightJson.value)));
const hasInvalidJson = computed(() => leftInvalid.value || rightInvalid.value);
const diffOptions = computed<editor.IDiffEditorOptions>(() => ({
  renderSideBySide: true,
  splitViewDefaultRatio: 0.5,
  wordWrap: 'off',
  lineNumbers: 'on',
  lineNumbersMinChars: 2,
  folding: true,
  showFoldingControls: 'always',
  glyphMargin: true,
  foldingStrategy: 'auto',
  foldingHighlight: true,
  tabSize: 2,
  indentSize: 2,
  insertSpaces: true,
  detectIndentation: false,
  wrappingIndent: 'same',
  scrollbar: {
    horizontal: 'visible',
    vertical: 'auto',
  },
  scrollBeyondLastLine: false,
}));
const leftSelection = ref<{ path: string; value: string } | null>(null);
const rightSelection = ref<{ path: string; value: string } | null>(null);
const leftAst = ref<JsonNode | null>(null);
const rightAst = ref<JsonNode | null>(null);
const splitRatio = ref(0.5);

interface JsonNode {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null'
  start: number
  end: number
  value?: unknown
  properties?: JsonProperty[]
  items?: JsonNode[]
}

interface JsonProperty {
  key: string
  keyStart: number
  keyEnd: number
  start: number
  end: number
  value: JsonNode
}

function formatJson() {
  if (!hasInvalidJson.value) {
    rawLeftJson.value = JSON.stringify(JSON5.parse(rawLeftJson.value), null, 2);
    rawRightJson.value = JSON.stringify(JSON5.parse(rawRightJson.value), null, 2);
  }
}

watch(rawLeftJson, () => {
  leftAst.value = null;
});

watch(rawRightJson, () => {
  rightAst.value = null;
});

function parseJsonAst(text: string): JsonNode {
  let index = 0;

  const length = text.length;

  function skipWhitespace() {
    while (index < length) {
      const char = text[index];
      if (char === ' ' || char === '\n' || char === '\r' || char === '\t') {
        index += 1;
      }
      else {
        break;
      }
    }
  }

  function parseString(): { node: JsonNode; raw: string } {
    const start = index;
    if (text[index] !== '"') {
      throw new Error('Expected string');
    }
    index += 1;
    while (index < length) {
      const char = text[index];
      if (char === '\\') {
        index += 2;
        continue;
      }
      if (char === '"') {
        index += 1;
        break;
      }
      index += 1;
    }
    const raw = text.slice(start, index);
    return {
      raw,
      node: {
        type: 'string',
        start,
        end: index,
        value: JSON.parse(raw),
      },
    };
  }

  function parseNumber(): JsonNode {
    const start = index;
    const match = text.slice(index).match(/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/);
    if (!match) {
      throw new Error('Expected number');
    }
    index += match[0].length;
    return {
      type: 'number',
      start,
      end: index,
      value: Number(match[0]),
    };
  }

  function parseLiteral(literal: 'true' | 'false' | 'null'): JsonNode {
    const start = index;
    if (!text.startsWith(literal, index)) {
      throw new Error(`Expected ${literal}`);
    }
    index += literal.length;
    return {
      type: literal === 'null' ? 'null' : 'boolean',
      start,
      end: index,
      value: literal === 'null' ? null : literal === 'true',
    };
  }

  function parseArray(): JsonNode {
    const start = index;
    index += 1;
    const items: JsonNode[] = [];
    skipWhitespace();
    if (text[index] === ']') {
      index += 1;
      return { type: 'array', start, end: index, items };
    }
    while (index < length) {
      const value = parseValue();
      items.push(value);
      skipWhitespace();
      if (text[index] === ',') {
        index += 1;
        skipWhitespace();
        continue;
      }
      if (text[index] === ']') {
        index += 1;
        break;
      }
      throw new Error('Expected , or ]');
    }
    return { type: 'array', start, end: index, items };
  }

  function parseObject(): JsonNode {
    const start = index;
    index += 1;
    const properties: JsonProperty[] = [];
    skipWhitespace();
    if (text[index] === '}') {
      index += 1;
      return { type: 'object', start, end: index, properties };
    }
    while (index < length) {
      skipWhitespace();
      const keyStart = index;
      const { node: keyNode, raw } = parseString();
      const key = JSON.parse(raw) as string;
      const keyEnd = keyNode.end;
      skipWhitespace();
      if (text[index] !== ':') {
        throw new Error('Expected :');
      }
      index += 1;
      const valueNode = parseValue();
      const prop: JsonProperty = {
        key,
        keyStart,
        keyEnd,
        start: keyStart,
        end: valueNode.end,
        value: valueNode,
      };
      properties.push(prop);
      skipWhitespace();
      if (text[index] === ',') {
        index += 1;
        skipWhitespace();
        continue;
      }
      if (text[index] === '}') {
        index += 1;
        break;
      }
      throw new Error('Expected , or }');
    }
    return { type: 'object', start, end: index, properties };
  }

  function parseValue(): JsonNode {
    skipWhitespace();
    const char = text[index];
    if (char === '{') {
      return parseObject();
    }
    if (char === '[') {
      return parseArray();
    }
    if (char === '"') {
      return parseString().node;
    }
    if (char === '-' || (char >= '0' && char <= '9')) {
      return parseNumber();
    }
    if (text.startsWith('true', index)) {
      return parseLiteral('true');
    }
    if (text.startsWith('false', index)) {
      return parseLiteral('false');
    }
    if (text.startsWith('null', index)) {
      return parseLiteral('null');
    }
    throw new Error('Unexpected token');
  }

  const root = parseValue();
  skipWhitespace();
  return root;
}

function formatPath(segments: Array<string | number>): string {
  if (segments.length === 0) {
    return '';
  }
  return segments.reduce<string>((result, segment) => {
    if (typeof segment === 'number') {
      return `${result}[${segment}]`;
    }
    if (/^[A-Za-z_$][\w$]*$/.test(segment)) {
      return result ? `${result}.${segment}` : segment;
    }
    return `${result}["${segment.replace(/"/g, '\\"')}"]`;
  }, '');
}

function extractValue(text: string, node: JsonNode) {
  if (node.type === 'object' || node.type === 'array') {
    return text.slice(node.start, node.end).trim();
  }
  if (node.type === 'string') {
    return JSON.stringify(node.value);
  }
  if (node.type === 'null') {
    return 'null';
  }
  return String(node.value);
}

function findPathAtOffset(node: JsonNode, offset: number, segments: Array<string | number>): { node: JsonNode; path: string } | null {
  if (offset < node.start || offset > node.end) {
    return null;
  }

  if (node.type === 'object' && node.properties) {
    for (const prop of node.properties) {
      if (offset >= prop.start && offset <= prop.end) {
        const nextSegments = [...segments, prop.key];
        const deeper = findPathAtOffset(prop.value, offset, nextSegments);
        return deeper ?? { node: prop.value, path: formatPath(nextSegments) };
      }
    }
    return { node, path: formatPath(segments) };
  }

  if (node.type === 'array' && node.items) {
    for (let i = 0; i < node.items.length; i += 1) {
      const child = node.items[i];
      if (offset >= child.start && offset <= child.end) {
        const nextSegments = [...segments, i];
        const deeper = findPathAtOffset(child, offset, nextSegments);
        return deeper ?? { node: child, path: formatPath(nextSegments) };
      }
    }
    return { node, path: formatPath(segments) };
  }

  return { node, path: formatPath(segments) };
}

function updateSelection(side: 'left' | 'right', offset: number) {
  const text = side === 'left' ? rawLeftJson.value : rawRightJson.value;

  if (!text.trim().length) {
    return;
  }

  let ast = side === 'left' ? leftAst.value : rightAst.value;

  if (!ast) {
    try {
      ast = parseJsonAst(text);
      if (side === 'left') {
        leftAst.value = ast;
      }
      else {
        rightAst.value = ast;
      }
    }
    catch {
      if (side === 'left') {
        leftSelection.value = null;
      }
      else {
        rightSelection.value = null;
      }
      return;
    }
  }

  const result = findPathAtOffset(ast, offset, []);
  if (!result) {
    return;
  }

  const selection = {
    path: result.path || t('tools.json-diff.rootPath'),
    value: extractValue(text, result.node),
  };

  if (side === 'left') {
    leftSelection.value = selection;
  }
  else {
    rightSelection.value = selection;
  }
}

interface CursorChangeEvent {
  side: 'original' | 'modified'
  offset: number
}

interface SplitRatioChangeEvent {
  ratio: number
}

interface ContextMenuActionEvent {
  actionId: string
}

function handleCursorChange({ side, offset }: CursorChangeEvent) {
  updateSelection(side === 'original' ? 'left' : 'right', offset);
}

function handleSplitRatioChange({ ratio }: SplitRatioChangeEvent) {
  splitRatio.value = ratio;
}

function handleContextMenuAction({ actionId }: ContextMenuActionEvent) {
  if (actionId === 'custom.format') {
    formatJson();
  }
}
</script>

<template>
  <c-card w-full class="json-diff-card" important:pa-2>
    <div class="json-diff-header">
      <div
        class="json-diff-header-labels"
        :style="{ '--left-ratio': `${Math.round(splitRatio * 100)}%` }"
      >
        <div class="json-diff-header-left">
          {{ $t('tools.json-diff.leftLabel') }}
        </div>
        <div class="json-diff-header-right">
          {{ $t('tools.json-diff.rightLabel') }}
        </div>
      </div>
      <c-button size="small" type="primary" class="json-diff-format" @click="formatJson">
        {{ $t('tools.json-diff.format') }}
      </c-button>
    </div>
    <div v-if="hasInvalidJson" mb-2 text-center op-70>
      {{ $t('tools.json-diff.invalidJson') }}
    </div>
    <c-diff-editor
      v-model:original="rawLeftJson"
      v-model:modified="rawRightJson"
      language="json"
      :enable-format-action="true"
      :options="diffOptions"
      @cursor-change="handleCursorChange"
      @split-ratio-change="handleSplitRatioChange"
      @context-menu-action="handleContextMenuAction"
    />
    <div class="json-path-grid">
      <div>
        <div class="json-path-label">
          {{ $t('tools.json-diff.leftLabel') }}
        </div>
        <div class="json-path-row">
          <span class="json-path-title">{{ $t('tools.json-diff.pathLabel') }}</span>
          <span class="json-path-value">{{ leftSelection?.path ?? '-' }}</span>
        </div>
        <div class="json-path-row">
          <span class="json-path-title">{{ $t('tools.json-diff.valueLabel') }}</span>
          <span class="json-path-value">{{ leftSelection?.value ?? '-' }}</span>
        </div>
      </div>
      <div>
        <div class="json-path-label">
          {{ $t('tools.json-diff.rightLabel') }}
        </div>
        <div class="json-path-row">
          <span class="json-path-title">{{ $t('tools.json-diff.pathLabel') }}</span>
          <span class="json-path-value">{{ rightSelection?.path ?? '-' }}</span>
        </div>
        <div class="json-path-row">
          <span class="json-path-title">{{ $t('tools.json-diff.valueLabel') }}</span>
          <span class="json-path-value">{{ rightSelection?.value ?? '-' }}</span>
        </div>
      </div>
    </div>
  </c-card>
</template>

<style scoped lang="less">
:global(.tool-content > .json-diff-card) {
  flex: 1 1 1500px;
}

.json-diff-card {
  width: 100%;
  max-width: 1500px;
  margin: 0 auto;
  overflow-x: auto;
}

.json-diff-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-bottom: 8px;
  min-height: 24px;
}

.json-diff-header-labels {
  position: absolute;
  left: 0;
  right: 0;
  display: grid;
  grid-template-columns: var(--left-ratio, 50%) 1fr;
  font-size: 12px;
  opacity: 0.7;
  padding-right: 64px;
}

.json-diff-header-left {
  padding-left: 8px;
}

.json-diff-header-right {
  padding-left: 8px;
}

.json-diff-format {
  position: relative;
  z-index: 1;
}

::v-deep(.json-diff-card .monaco-diff-editor) {
  min-width: calc(100% + 500px);
}

.json-path-grid {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  font-size: 12px;
}

.json-path-label {
  font-size: 12px;
  opacity: 0.7;
  margin-bottom: 6px;
}

.json-path-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
  margin-bottom: 4px;
}

.json-path-title {
  min-width: 40px;
  opacity: 0.7;
}

.json-path-value {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  word-break: break-all;
}

::v-deep(.monaco-editor .inline-folded) {
  color: rgba(148, 163, 184, 0.9);
  background-color: rgba(148, 163, 184, 0.2);
  border-radius: 3px;
  padding: 0 4px;
}
</style>
