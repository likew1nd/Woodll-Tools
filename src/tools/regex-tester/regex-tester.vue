<script setup lang="ts">
import RandExp from 'randexp';
import { render } from '@regexper/render';
import type { ShadowRootExpose } from 'vue-shadow-dom';
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

const sample = computed(() => {
  try {
    const randexp = new RandExp(new RegExp(regex.value.replace(/\(\?\<[^\>]*\>/g, '(?:')));
    return randexp.gen();
  }
  catch (_) {
    return '';
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
</script>

<template>
  <div max-w-600px>
    <c-card :title="$t('tools.regex-tester.regexTitle')" mb-1>
      <c-input-text
        v-model:value="regex"
        :label="$t('tools.regex-tester.regexLabel')"
        :placeholder="$t('tools.regex-tester.regexPlaceholder')"
        multiline
        rows="3"
        :validation="regexValidation"
      />
      <router-link target="_blank" to="/regex-memo" mb-1 mt-1>
        {{ $t('tools.regex-tester.cheatsheet') }}
      </router-link>
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
        rows="5"
      />
    </c-card>

    <c-card :title="$t('tools.regex-tester.matchesTitle')" mb-1 mt-3>
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

    <c-card :title="$t('tools.regex-tester.sampleTitle')" mt-3>
      <pre style="white-space: pre-wrap; word-break: break-all;">{{ sample }}</pre>
    </c-card>

    <c-card :title="$t('tools.regex-tester.diagramTitle')" style="overflow-x: scroll;" mt-3>
      <shadow-root ref="visualizerSVG">
&#xa0;
      </shadow-root>
    </c-card>
  </div>
</template>
