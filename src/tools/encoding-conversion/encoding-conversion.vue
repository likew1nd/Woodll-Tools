<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import type { lib } from 'crypto-js';
import CryptoJS, { MD5, RIPEMD160, SHA1, SHA224, SHA256, SHA3, SHA384, SHA512, enc } from 'crypto-js';

import InputCopyable from '@/components/InputCopyable.vue';
import { useCopy } from '@/composable/copy';
import {
  getExtensionFromMimeType,
  getMimeTypeFromBase64,
  previewImageFromBase64,
  useDownloadFileFromBase64Refs,
} from '@/composable/downloadBase64';
import { useValidation } from '@/composable/validation';
import { useQueryParam } from '@/composable/queryParams';
import { withDefaultOnError } from '@/utils/defaults';
import { isValidBase64 } from '@/utils/base64';
import { convertHexToBin } from '../hash-text/hash-text.service';
import {
  ansiToUcs2,
  ansiToUnicode,
  base64Decode,
  base64DecodeGbk,
  base64Encode,
  base64EncodeGbk,
  gb2312ToUtf8,
  md5,
  textToWordArray,
  unicodeToAnsi,
  urlDecodeGbk,
  urlDecodeUtf8,
  urlEncodeGbk,
  urlEncodeUtf8,
  usc2ToAnsi,
  utf8ToGb2312,
} from './encoding-conversion.service';

const { t } = useI18n();

const defaultRows = 5;
const smallRows = 3;

const sourceText = ref('123 ABC 你好');

function transformValue(handler: (value: string) => string) {
  return withDefaultOnError(() => handler(sourceText.value), '');
}

const algos = {
  MD5,
  SHA1,
  SHA256,
  SHA224,
  SHA512,
  SHA384,
  SHA3,
  RIPEMD160,
} as const;

type AlgoNames = keyof typeof algos;
type Encoding = keyof typeof enc | 'Bin' | 'Raw' | 'RawGbk';
const algoNames = Object.keys(algos) as AlgoNames[];
const hashEncoding = useQueryParam<Encoding>({ defaultValue: 'Hex', name: 'encoding' });

const hashEncodingOptions = [
  {
    label: '原始输出 (UTF-8)',
    value: 'Raw',
  },
  {
    label: '原始输出 (GBK)',
    value: 'RawGbk',
  },
  {
    label: '二进制 (Base 2)',
    value: 'Bin',
  },
  {
    label: '十六进制 (Base 16)',
    value: 'Hex',
  },
  {
    label: 'Base64 (Base 64)',
    value: 'Base64',
  },
  {
    label: 'Base64 (Url)',
    value: 'Base64url',
  },
];

function formatHashWithEncoding(words: lib.WordArray, encoding: Encoding) {
  if (encoding === 'Bin') {
    return convertHexToBin(words.toString(enc.Hex));
  }

  if (encoding === 'Raw' || encoding === 'RawGbk') {
    return words.toString(enc.Hex).toUpperCase();
  }

  return words.toString(enc[encoding]);
}

const mapPairs = (items: Array<{ label: string; value: string }>) => {
  const pairs: Array<Array<{ label: string; value: string }>> = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
};

const hashResults = computed(() =>
  algoNames.map(algo => ({
    algo,
    label: algo,
    value: withDefaultOnError(() => {
      const input = hashEncoding.value === 'RawGbk'
        ? textToWordArray(sourceText.value, 'gbk')
        : sourceText.value;
      const words = algos[algo](input as string | lib.WordArray);
      return formatHashWithEncoding(words, hashEncoding.value);
    }, ''),
  })),
);

const hashResultPairs = computed(() => mapPairs(hashResults.value));

const tabGroups = computed(() => [
  {
    key: 'Url 编解码',
    label: t('tools.encoding-conversion.tabs.url'),
    pairs: [
      [
        {
          label: t('tools.encoding-conversion.urlEncodeGbk'),
          value: transformValue(urlEncodeGbk),
        },
        {
          label: t('tools.encoding-conversion.urlDecodeGbk'),
          value: transformValue(urlDecodeGbk),
        },
      ],
      [
        {
          label: t('tools.encoding-conversion.urlEncodeUtf8'),
          value: transformValue(urlEncodeUtf8),
        },
        {
          label: t('tools.encoding-conversion.urlDecodeUtf8'),
          value: transformValue(urlDecodeUtf8),
        },
      ],
    ],
  },
  {
    key: 'Base64 编解码',
    label: t('tools.encoding-conversion.tabs.base64'),
    pairs: [
      [
        {
          label: t('tools.encoding-conversion.base64Encode'),
          value: transformValue(base64Encode),
        },
        {
          label: t('tools.encoding-conversion.base64Decode'),
          value: transformValue(base64Decode),
        },
      ],
      [
        {
          label: t('tools.encoding-conversion.base64EncodeGbk'),
          value: transformValue(base64EncodeGbk),
        },
        {
          label: t('tools.encoding-conversion.base64DecodeGbk'),
          value: transformValue(base64DecodeGbk),
        },
      ],
    ],
  },
  {
    key: 'Text 编解码',
    label: t('tools.encoding-conversion.tabs.text'),
    pairs: [
      [
        {
          label: t('tools.encoding-conversion.ansiToUsc2'),
          value: transformValue(ansiToUcs2),
        },
        {
          label: t('tools.encoding-conversion.usc2ToAnsi'),
          value: transformValue(usc2ToAnsi),
        },
      ],
      [
        {
          label: t('tools.encoding-conversion.ansiToUnicode'),
          value: transformValue(ansiToUnicode),
        },
        {
          label: t('tools.encoding-conversion.unicodeToAnsi'),
          value: transformValue(unicodeToAnsi),
        },
      ],
      [
        {
          label: t('tools.encoding-conversion.gb2312ToUtf8'),
          value: transformValue(gb2312ToUtf8),
        },
        {
          label: t('tools.encoding-conversion.utf8ToGb2312'),
          value: transformValue(utf8ToGb2312),
        },
      ],
      [
        {
          label: t('tools.encoding-conversion.md5'),
          value: transformValue(md5),
        },
      ],
    ],
  },
  {
    key: 'Hash',
    label: t('tools.encoding-conversion.tabs.hash'),
    pairs: [],
  },
  {
    key: '文件 转 Md5',
    label: t('tools.encoding-conversion.tabs.md5File'),
    pairs: [],
  },
]);

const fileName = ref('file');
const fileExtension = ref('');
const base64FileInput = ref('');
const { download } = useDownloadFileFromBase64Refs({
  source: base64FileInput,
  filename: fileName,
  extension: fileExtension,
});
const base64FileInputValidation = useValidation({
  source: base64FileInput,
  rules: [
    {
      message: t('tools.base64-file-converter.invalidBase64'),
      validator: value => isValidBase64(value.trim()),
    },
  ],
});

watch(
  base64FileInput,
  (newValue) => {
    const { mimeType } = getMimeTypeFromBase64({ base64String: newValue });
    if (mimeType) {
      fileExtension.value = getExtensionFromMimeType(mimeType) || fileExtension.value;
    }
  },
);

function previewImage() {
  if (!base64FileInputValidation.isValid) {
    return;
  }
  try {
    const image = previewImageFromBase64(base64FileInput.value);
    image.style.maxWidth = '100%';
    image.style.maxHeight = '400px';
    const previewContainer = document.getElementById('previewContainer');
    if (previewContainer) {
      previewContainer.innerHTML = '';
      previewContainer.appendChild(image);
    }
  }
  catch (_) {
    //
  }
}

function downloadFile() {
  if (!base64FileInputValidation.isValid) {
    return;
  }

  try {
    download();
  }
  catch (_) {
    //
  }
}

const fileBase64 = ref('');
const { copy: copyFileBase64 } = useCopy({
  source: fileBase64,
  text: t('tools.base64-file-converter.copied'),
});

function readFileAsBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result);
      }
      else {
        resolve('');
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function onUpload(file?: File) {
  if (!file) {
    fileBase64.value = '';
    return;
  }

  try {
    fileBase64.value = await readFileAsBase64(file);
  }
  catch {
    fileBase64.value = '';
  }
}

const md5FileValue = ref('');
const md5FileName = ref('');
const md5FileLabel = computed(() =>
  md5FileName.value
    ? `${t('tools.encoding-conversion.md5FileLabel')} (${md5FileName.value})`
    : t('tools.encoding-conversion.md5FileLabel'),
);

async function onMd5FileUpload(file?: File) {
  if (!file) {
    md5FileValue.value = '';
    md5FileName.value = '';
    return;
  }

  try {
    const buffer = await file.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(buffer) as any);
    md5FileValue.value = CryptoJS.MD5(wordArray).toString(CryptoJS.enc.Hex).toUpperCase();
    md5FileName.value = file.name;
  }
  catch {
    md5FileValue.value = '';
    md5FileName.value = '';
  }
}

const activeTab = ref(tabGroups.value[0]?.key ?? 'url');
</script>

<template>
  <c-card :description="$t('tools.encoding-conversion.description')" class="max-w-[1650px] w-full">
    <c-input-text
      v-model:value="sourceText"
      :placeholder="$t('tools.encoding-conversion.inputPlaceholder')"
      :rows="defaultRows"
      autofocus
      multiline
      raw-text
    />

    <div my-16px divider />

    <n-tabs v-model:value="activeTab" type="line">
      <n-tab-pane
        v-for="tab in tabGroups"
        :key="tab.key"
        :name="tab.key"
        :title="tab.label"
      >
        <template v-if="tab.key === 'Hash'">
          <div flex flex-col gap-4>
            <c-select
              v-model:value="hashEncoding"
              mb-2
              :label="$t('tools.hash-text.encodingLabel')"
              :options="hashEncodingOptions"
            />
            <div grid gap-3>
              <div
                v-for="(pair, index) in hashResultPairs"
                :key="`hash-pair-${index}`"
                grid
                gap-3
                sm:grid-cols-2
              >
                <InputCopyable
                  v-for="result in pair"
                  :key="result.label"
                  :value="result.value"
                  :label="result.label"
                  class="w-full"
                  :rows="smallRows"
                  readonly
                  mb-1
                />
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="tab.key === '文件 转 Md5'">
          <div flex flex-col gap-4>
            <c-file-upload :title="t('tools.encoding-conversion.md5FileUploadTitle')" @file-upload="onMd5FileUpload" />
            <InputCopyable
              :value="md5FileValue"
              :label="md5FileLabel"
              class="w-full"
              :rows="smallRows"
              mb-1
            />
          </div>
        </template>

        <template v-else>
          <div grid gap-3>
            <div
              v-for="(pair, index) in tab.pairs"
              :key="`${tab.key}-pair-${index}`"
              grid
              gap-3
              sm:grid-cols-2
            >
              <InputCopyable
                v-if="pair[0]"
                :value="pair[0].value"
                :label="pair[0].label"
                class="w-full"
                :rows="smallRows"
                mb-1
              />
              <InputCopyable
                v-if="pair[1]"
                :value="pair[1].value"
                :label="pair[1].label"
                class="w-full"
                :rows="smallRows"
                mb-1
              />
            </div>
          </div>
        </template>
      </n-tab-pane>

      <n-tab-pane
        key="base64-to-file"
        name="Base64 转 文件"
        :title="t('tools.base64-file-converter.base64ToFileTitle')"
      >
        <n-grid cols="3" x-gap="12">
          <n-gi span="2">
            <c-input-text
              v-model:value="fileName"
              :label="t('tools.base64-file-converter.fileNameLabel')"
              :placeholder="t('tools.base64-file-converter.fileNamePlaceholder')"
              mb-2
            />
          </n-gi>
          <n-gi>
            <c-input-text
              v-model:value="fileExtension"
              :label="t('tools.base64-file-converter.extensionLabel')"
              :placeholder="t('tools.base64-file-converter.extensionPlaceholder')"
              mb-2
            />
          </n-gi>
        </n-grid>
        <c-input-text
          v-model:value="base64FileInput"
          multiline
          :rows="defaultRows"
          :placeholder="t('tools.base64-file-converter.base64InputPlaceholder')"
          :validation="base64FileInputValidation"
          mb-2
        />

        <div flex justify-center py-2>
          <div id="previewContainer" />
        </div>

        <div flex justify-center gap-3>
          <c-button :disabled="base64FileInput === '' || !base64FileInputValidation.isValid" @click="previewImage">
            {{ $t('tools.base64-file-converter.previewImage') }}
          </c-button>
          <c-button :disabled="base64FileInput === '' || !base64FileInputValidation.isValid" @click="downloadFile">
            {{ $t('tools.base64-file-converter.downloadFile') }}
          </c-button>
        </div>
      </n-tab-pane>

      <n-tab-pane
        key="file-to-base64"
        name="文件 转 Base64"
        :title="t('tools.base64-file-converter.fileToBase64Title')"
      >
        <c-file-upload :title="t('tools.base64-file-converter.uploadTitle')" @file-upload="onUpload" />
        <c-input-text
          :value="fileBase64 ?? ''"
          multiline
          readonly
          :placeholder="t('tools.base64-file-converter.fileBase64Placeholder')"
          :rows="defaultRows"
          my-2
        />

        <div flex justify-center>
          <c-button :disabled="!fileBase64" @click="copyFileBase64">
            {{ $t('tools.base64-file-converter.copy') }}
          </c-button>
        </div>
      </n-tab-pane>
    </n-tabs>
  </c-card>
</template>
