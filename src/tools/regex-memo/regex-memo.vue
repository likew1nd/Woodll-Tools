<script setup lang="ts">
import { ref } from 'vue';
import { useThemeVars } from 'naive-ui';

interface Section {
  key: string
  title: string
  rows: { expression: string; description: string }[]
  notes?: string[]
}

const themeVars = useThemeVars();

const sections: Section[] = [
  {
    key: 'basic-characters',
    title: '普通字符',
    rows: [
      { expression: '.', description: '任意字符（不含换行或回车）' },
      { expression: '[A-Za-z]', description: '字母' },
      { expression: '[a-z]', description: '小写字母' },
      { expression: '[A-Z]', description: '大写字母' },
      { expression: '\\d 或 [0-9]', description: '数字' },
      { expression: '\\D 或 [^0-9]', description: '非数字' },
      { expression: '_', description: '下划线' },
      { expression: '\\w 或 [A-Za-z0-9_]', description: '字母、数字或下划线' },
      { expression: '\\W 或 [^A-Za-z0-9_]', description: '\\w 的反集合' },
      { expression: '\\S', description: '\\s 的反集合' },
    ],
  },
  {
    key: 'whitespace',
    title: '空白字符',
    rows: [
      { expression: ' ', description: '空格' },
      { expression: '\\t', description: '制表符' },
      { expression: '\\n', description: '换行' },
      { expression: '\\r', description: '回车' },
      { expression: '\\s', description: '空格、制表符、换行或回车' },
    ],
  },
  {
    key: 'char-classes',
    title: '字符集合',
    rows: [
      { expression: '[xyz]', description: '匹配 x、y 或 z' },
      { expression: '[^xyz]', description: '非 x、y 或 z' },
      { expression: '[1-3]', description: '匹配 1、2 或 3' },
      { expression: '[^1-3]', description: '非 1、2 或 3' },
    ],
    notes: [
      '字符集相当于“或”操作；用 ^ 放在开头表示取反，- 放在两个字符之间表示范围。',
    ],
  },
  {
    key: 'escape-characters',
    title: '需要转义的字符',
    rows: [
      { expression: '\\.', description: '句点' },
      { expression: '\\^', description: '脱字符' },
      { expression: '\\$', description: '美元符号' },
      { expression: '\\|', description: '竖线' },
      { expression: '\\\\', description: '反斜杠' },
      { expression: '\\/', description: '斜杠' },
      { expression: '\\(', description: '左括号' },
      { expression: '\\)', description: '右括号' },
      { expression: '\\[', description: '左方括号' },
      { expression: '\\]', description: '右方括号' },
      { expression: '\\{', description: '左花括号' },
      { expression: '\\}', description: '右花括号' },
    ],
    notes: [
      '括号、点、美元符等在任何位置都需要转义。',
      '只有 ^ 置于字符集开头或 - 处于两个字符之间时才需要额外转义。',
    ],
  },
  {
    key: 'quantifiers',
    title: '量词',
    rows: [
      { expression: '{2}', description: '恰好 2 次' },
      { expression: '{2,}', description: '至少 2 次' },
      { expression: '{2,7}', description: '至少 2 次，最多 7 次' },
      { expression: '*', description: '0 次或多次' },
      { expression: '+', description: '1 次或多次' },
      { expression: '?', description: '0 次或 1 次' },
    ],
    notes: ['量词始终放在要量化的表达式之后。'],
  },
  {
    key: 'boundaries',
    title: '边界',
    rows: [
      { expression: '^', description: '字符串开头' },
      { expression: '$', description: '字符串结尾' },
      { expression: '\\b', description: '单词边界' },
    ],
    notes: [
      '单词边界要求左边是 \\w，右边是 \\W；或左边是 \\W 右边是 \\w；或位于字符串开始或结束。',
    ],
  },
  {
    key: 'matching',
    title: '匹配（处理上下文）',
    rows: [
      { expression: 'foo\\|bar', description: '匹配 foo 或 bar' },
      { expression: 'foo(?=bar)', description: 'foo 后紧跟 bar 时匹配 foo' },
      { expression: 'foo(?!bar)', description: 'foo 后不是 bar 时匹配 foo' },
      { expression: '(?<=bar)foo', description: 'foo 前面是 bar 时匹配 foo' },
      { expression: '(?<!bar)foo', description: 'foo 前面不是 bar 时匹配 foo' },
    ],
  },
  {
    key: 'groups',
    title: '分组与捕获',
    rows: [
      { expression: '(foo)', description: '捕获组；匹配并捕获 foo' },
      { expression: '(?:foo)', description: '非捕获组；匹配 foo 但不捕获' },
      { expression: '(foo)bar\\1', description: '\\1 代表第 1 个捕获组；匹配 foobarfoo' },
    ],
    notes: [
      '捕获组在 match/matchAll/replace 等 API 中才可用；\\N 表示第 N 个捕获组。',
    ],
  },
];

const expandedSections = ref(sections.map(section => section.key));
</script>

<template>
  <n-collapse v-model:value="expandedSections" accordion>
    <n-collapse-item
      v-for="section in sections"
      :key="section.key"
      :name="section.key"
      :title="section.title"
    >
      <div v-if="section.notes?.length" class="section-notes">
        <p
          v-for="note in section.notes"
          :key="note"
        >
          {{ note }}
        </p>
      </div>
      <div class="table-wrapper">
        <table class="memo-table">
          <thead>
            <tr>
              <th>表达式</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in section.rows" :key="row.expression">
              <td><code>{{ row.expression }}</code></td>
              <td>{{ row.description }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </n-collapse-item>
  </n-collapse>
</template>

<style scoped>
.table-wrapper {
  margin-top: 0.5rem;
  overflow: auto;
}

.memo-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

.memo-table,
.memo-table th,
.memo-table td {
  border: 1px solid v-bind('themeVars.textColor1');
}

.memo-table th,
.memo-table td {
  padding: 6px 8px;
  text-align: left;
}

.section-notes {
  font-size: 0.85rem;
  color: v-bind('themeVars.textColor2');
}

.section-notes p + p {
  margin-top: 0.25rem;
}

::v-deep(.n-collapse-item__content) {
  padding-top: 0;
}
</style>
