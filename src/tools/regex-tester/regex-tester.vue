<script setup lang="ts">
import { ref } from 'vue';
import { render } from '@regexper/render';
import type { ShadowRootExpose } from 'vue-shadow-dom';

import RegexMemo from '../regex-memo/regex-memo.vue';

import { matchRegex } from './regex-tester.service';
import { useValidation } from '@/composable/validation';
import { useQueryParamOrStorage } from '@/composable/queryParams';

const { t } = useI18n();

const regex = useQueryParamOrStorage({ name: 'regex', storageName: 'regex-tester:regex', defaultValue: '' });
const text = ref('');
const global = ref(true);
const ignoreCase = ref(false);
const multiline = ref(false);
const dotAll = ref(true);
const unicode = ref(true);
const unicodeSets = ref(false);
const visualizerSVG = ref<ShadowRootExpose>();

const regexValidation = useValidation({
  source: regex,
  rules: [
    {
      message: t('tools.regex-tester.invalidRegex', { error: '{0}' }),
      validator: value => new RegExp(value),
      getErrorMessage: (value) => {
        const _ = new RegExp(value);
        return '';
      },
    },
  ],
});
const results = computed(() => {
  let flags = 'd';
  if (global.value) {
    flags += 'g';
  }
  if (ignoreCase.value) {
    flags += 'i';
  }
  if (multiline.value) {
    flags += 'm';
  }
  if (dotAll.value) {
    flags += 's';
  }
  if (unicode.value) {
    flags += 'u';
  }
  else if (unicodeSets.value) {
    flags += 'v';
  }

  try {
    return matchRegex(regex.value, text.value, flags);
  }
  catch (_) {
    return [];
  }
});

watchEffect(
  async () => {
    const regexValue = regex.value;
    // shadow root is required:
    // @regexper/render append a <defs><style> that broke svg transparency of icons in the whole site
    const visualizer = visualizerSVG.value?.shadow_root;
    if (visualizer) {
      while (visualizer.lastChild) {
        visualizer.removeChild(visualizer.lastChild);
      }
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      try {
        await render(regexValue, svg);
      }
      catch (_) {
      }
      visualizer.appendChild(svg);
    }
  },
);

const quickPatterns = [
  { label: 'HTML 标签', pattern: '<[^>]+>' },
  { label: 'URL', pattern: 'https?://[^\\s]+' },
  { label: 'URL 中的域名', pattern: '(?<=https?://)[\\w.-]+' },
  { label: '邮箱用户名', pattern: '^[\\w.-]+' },
  { label: '邮箱地址', pattern: '[\\w.-]+@[\\w.-]+\\.[A-Za-z]{2,6}' },
  { label: 'IPv4 地址', pattern: '\\b(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d?\\d)){3}\\b' },
  { label: '手机号', pattern: '1[3-9]\\d{9}' },
  { label: '身份证号', pattern: '\\b(?:\\d{15}|\\d{17}[\\dXx])\\b' },
  { label: '十六进制颜色', pattern: '#[A-Fa-f0-9]{6}' },
  { label: 'QQ 号', pattern: '[1-9][0-9]{4,9}' },
  { label: '纯数字', pattern: '\\d+' },
  { label: '中文字符', pattern: '[\\u4e00-\\u9fa5]+' },
  { label: '中国邮政编码', pattern: '\\b\\d{6}\\b' },
  { label: '浮点数', pattern: '[-+]?(?:\\d*\\.\\d+|\\d+)' },
  { label: 'JavaScript 标识符', pattern: '[A-Za-z_$][A-Za-z0-9_$]*' },
  { label: 'MAC 地址', pattern: '\\b[0-9A-Fa-f]{2}(?::[0-9A-Fa-f]{2}){5}\\b' },
  { label: 'UUID', pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}' },
  { label: 'HTML 注释', pattern: '<!--[\\s\\S]*?-->' },
  { label: 'Base64 文字', pattern: '(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?' },
  { label: 'Markdown 标题', pattern: '^#{1,6}\\s.*' },
  { label: '端口号', pattern: ':\\d{1,5}\\b' },
  { label: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}' },
  { label: '时间 (HH:MM:SS)', pattern: '\\b(?:[01]\\d|2[0-3]):[0-5]\\d\\b' },
];

function applyQuickPattern(pattern: string) {
  regex.value = `${regex.value}${pattern}`;
}
</script>

<template>
  <div class="regex-tester-root">
    <section class="regex-memo-panel">
      <c-card :title="$t('tools.regex-tester.cheatsheet')">
        <RegexMemo />
      </c-card>
    </section>

    <section class="regex-tester-panel">
      <c-card>
        <div class="quick-patterns">
          <div class="quick-patterns-title">
            {{ $t('tools.regex-tester.quickPatternsTitle') }}
          </div>
          <n-space wrap size="small">
            <n-button
              v-for="(item, index) in quickPatterns"
              :key="item.label"
              type="default"
              size="small"
              text
              class="quick-pattern-btn"
              :class="{ 'quick-pattern-btn--alt': index % 2 === 1 }"
              @click="applyQuickPattern(item.pattern)"
            >
              {{ item.label }}
            </n-button>
          </n-space>
        </div>
        <c-input-text
          v-model:value="regex"
          :label="$t('tools.regex-tester.regexLabel')"
          :placeholder="$t('tools.regex-tester.regexPlaceholder')"
          multiline
          rows="3"
          :validation="regexValidation"
          class="regex-input"
        />
        <n-space>
          <n-checkbox v-model:checked="global">
            <span :title="$t('tools.regex-tester.flagGlobalTitle')">{{ $t('tools.regex-tester.flagGlobal') }} (<code>g</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="ignoreCase">
            <span :title="$t('tools.regex-tester.flagIgnoreCaseTitle')">{{ $t('tools.regex-tester.flagIgnoreCase') }} (<code>i</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="multiline">
            <span :title="$t('tools.regex-tester.flagMultilineTitle')">{{ $t('tools.regex-tester.flagMultiline') }}(<code>m</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="dotAll">
            <span :title="$t('tools.regex-tester.flagDotAllTitle')">{{ $t('tools.regex-tester.flagDotAll') }}(<code>s</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="unicode">
            <span :title="$t('tools.regex-tester.flagUnicodeTitle')">{{ $t('tools.regex-tester.flagUnicode') }}(<code>u</code>)</span>
          </n-checkbox>
          <n-checkbox v-model:checked="unicodeSets">
            <span :title="$t('tools.regex-tester.flagUnicodeSetsTitle')">{{ $t('tools.regex-tester.flagUnicodeSets') }} (<code>v</code>)</span>
          </n-checkbox>
        </n-space>

        <n-divider />

        <c-input-text
          v-model:value="text"
          :label="$t('tools.regex-tester.textLabel')"
          :placeholder="$t('tools.regex-tester.textPlaceholder')"
          multiline
          rows="10"
        />
      </c-card>

      <c-card :title="$t('tools.regex-tester.matchesTitle')">
        <n-table v-if="results?.length > 0">
          <thead>
            <tr>
              <th scope="col">
                {{ $t('tools.regex-tester.indexHeader') }}
              </th>
              <th scope="col">
                {{ $t('tools.regex-tester.valueHeader') }}
              </th>
              <th scope="col">
                {{ $t('tools.regex-tester.capturesHeader') }}
              </th>
              <th scope="col">
                {{ $t('tools.regex-tester.groupsHeader') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="match of results" :key="match.index">
              <td>{{ match.index }}</td>
              <td>{{ match.value }}</td>
              <td>
                <ul>
                  <li v-for="capture in match.captures" :key="capture.name">
                    "{{ capture.name }}" = {{ capture.value }} [{{ capture.start }} - {{ capture.end }}]
                  </li>
                </ul>
              </td>
              <td>
                <ul>
                  <li v-for="group in match.groups" :key="group.name">
                    "{{ group.name }}" = {{ group.value }} [{{ group.start }} - {{ group.end }}]
                  </li>
                </ul>
              </td>
            </tr>
          </tbody>
        </n-table>
        <c-alert v-else>
          {{ $t('tools.regex-tester.noMatch') }}
        </c-alert>
      </c-card>

      <c-card :title="$t('tools.regex-tester.diagramTitle')" style="overflow-x: scroll;">
        <shadow-root ref="visualizerSVG">
&#xa0;
        </shadow-root>
      </c-card>
    </section>
  </div>
</template>

<style scoped>
.regex-tester-root {
  position: relative;
  width: min(1180px, 100%);
  margin: 0 auto;
    padding-left: 360px;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

.regex-tester-panel {
  max-width: 880px;
  min-width: 880px;
}

.regex-memo-panel {
  position: absolute;
  top: 0;
  left: 0;
  width: 320px;
  transform: translateX(-10px);
}

.regex-memo-panel > c-card,
.regex-memo-panel > c-card > div {
  width: 100%;
}

.regex-tester-panel {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 760px;
  flex: 0 0 760px;
}

.quick-patterns {
  margin: 0.75rem 0;
}

.quick-patterns-title {
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

::v-deep(.quick-pattern-btn) {
  background-color: rgba(56, 132, 255, 0.06);
  border-radius: 18px;
  color: inherit;
  border: 1px solid rgba(56, 132, 255, 0.2);
}

::v-deep(.quick-pattern-btn--alt) {
  background-color: rgba(39, 176, 102, 0.08);
  border-color: rgba(39, 176, 102, 0.25);
}

@media (max-width: 960px) {
  .regex-tester-root {
    padding-left: 0;
  }

  .regex-memo-panel {
    position: static;
    transform: none;
    width: 100%;
  }

.regex-tester-panel {
    width: 100%;
  }
}

.regex-input {
  width: 100%;
  box-sizing: border-box;
}

::v-deep(.regex-input .n-input) {
  width: 100% !important;
  box-sizing: border-box;
}

@media (max-width: 960px) {
  .regex-tester-panel {
    min-width: unset;
  }
}
</style>
