<script setup lang="ts">
const { t } = useI18n();

const availableSizes = [16, 24, 32, 48, 64, 96, 128, 256];
const mode = ref<'multi' | 'single'>('multi');
const selectedSizes = ref<number[]>([16, 32, 48, 64, 128, 256]);
const singleSize = ref(256);

const sourceFile = ref<File | null>(null);
const imageUrl = ref('');
const imageInfo = ref<{ width: number; height: number } | null>(null);
const imageElement = ref<HTMLImageElement | null>(null);
const downloadUrl = ref('');
const isGenerating = ref(false);
const errorMessage = ref('');

const sizeOptions = computed(() =>
  availableSizes.map(size => ({
    label: `${size}x${size}`,
    value: size,
  })),
);

const activeSizes = computed(() => {
  const sizes = mode.value === 'multi' ? selectedSizes.value : [singleSize.value];
  return Array.from(new Set(sizes)).filter(size => size > 0 && size <= 256).sort((a, b) => a - b);
});

const downloadName = computed(() => {
  if (!sourceFile.value) { return 'icon.ico'; }
  const baseName = sourceFile.value.name.replace(/\.[^.]+$/, '') || 'icon';
  return `${baseName}.ico`;
});

function clearDownloadUrl() {
  if (downloadUrl.value) {
    URL.revokeObjectURL(downloadUrl.value);
    downloadUrl.value = '';
  }
}

function resetState() {
  imageUrl.value = '';
  imageInfo.value = null;
  imageElement.value = null;
  errorMessage.value = '';
  clearDownloadUrl();
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('load-failed'));
    img.src = src;
  });
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('read-failed'));
    reader.readAsDataURL(file);
  });
}

async function onUpload(file?: File) {
  if (!file) {
    resetState();
    return;
  }

  errorMessage.value = '';
  clearDownloadUrl();
  sourceFile.value = file;

  try {
    const dataUrl = await readFileAsDataUrl(file);
    const img = await loadImage(dataUrl);
    imageUrl.value = dataUrl;
    imageInfo.value = { width: img.naturalWidth, height: img.naturalHeight };
    imageElement.value = img;
  }
  catch {
    resetState();
    errorMessage.value = t('tools.png-to-ico.errors.noImage');
  }
}

function buildIconEntryHeader(
  view: DataView,
  index: number,
  size: number,
  byteLength: number,
  offset: number,
) {
  const entryOffset = 6 + index * 16;
  const dimension = size >= 256 ? 0 : size;

  view.setUint8(entryOffset, dimension);
  view.setUint8(entryOffset + 1, dimension);
  view.setUint8(entryOffset + 2, 0);
  view.setUint8(entryOffset + 3, 0);
  view.setUint16(entryOffset + 4, 1, true);
  view.setUint16(entryOffset + 6, 32, true);
  view.setUint32(entryOffset + 8, byteLength, true);
  view.setUint32(entryOffset + 12, offset, true);
}

async function renderPngForSize(img: HTMLImageElement, size: number) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('canvas-context');
  }

  context.clearRect(0, 0, size, size);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(img, 0, 0, size, size);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (!result) {
        reject(new Error('toBlob'));
        return;
      }
      resolve(result);
    }, 'image/png');
  });

  const buffer = await blob.arrayBuffer();
  return new Uint8Array(buffer);
}

async function buildIcoBlob(img: HTMLImageElement, sizes: number[]) {
  const pngBuffers = await Promise.all(sizes.map(size => renderPngForSize(img, size)));
  const headerSize = 6 + sizes.length * 16;
  const totalSize = headerSize + pngBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
  const buffer = new ArrayBuffer(totalSize);
  const view = new DataView(buffer);
  const output = new Uint8Array(buffer);

  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true);
  view.setUint16(4, sizes.length, true);

  let offset = headerSize;
  pngBuffers.forEach((pngBuffer, index) => {
    buildIconEntryHeader(view, index, sizes[index], pngBuffer.length, offset);
    output.set(pngBuffer, offset);
    offset += pngBuffer.length;
  });

  return new Blob([buffer], { type: 'image/x-icon' });
}

async function generateIco() {
  errorMessage.value = '';

  if (!imageElement.value) {
    errorMessage.value = t('tools.png-to-ico.errors.noImage');
    return;
  }

  if (!activeSizes.value.length) {
    errorMessage.value = t('tools.png-to-ico.errors.noSize');
    return;
  }

  isGenerating.value = true;
  try {
    const blob = await buildIcoBlob(imageElement.value, activeSizes.value);
    clearDownloadUrl();
    downloadUrl.value = URL.createObjectURL(blob);
  }
  catch {
    errorMessage.value = t('tools.png-to-ico.errors.generateFailed');
  }
  finally {
    isGenerating.value = false;
  }
}

function downloadIco() {
  if (!downloadUrl.value) { return; }
  const link = document.createElement('a');
  link.href = downloadUrl.value;
  link.download = downloadName.value;
  link.click();
}

watch([mode, selectedSizes, singleSize], () => {
  clearDownloadUrl();
});

onBeforeUnmount(() => {
  clearDownloadUrl();
});
</script>

<template>
  <c-card>
    <n-grid x-gap="16" y-gap="16" cols="1 720:2">
      <n-gi>
        <c-file-upload :title="t('tools.png-to-ico.uploadTitle')" accept=".png,image/png" @file-upload="onUpload" />

        <n-form label-width="120" label-placement="left" class="mt-4">
          <n-form-item :label="t('tools.png-to-ico.modeLabel')">
            <n-radio-group v-model:value="mode" size="small">
              <n-radio value="multi">
                {{ t('tools.png-to-ico.modeMulti') }}
              </n-radio>
              <n-radio value="single">
                {{ t('tools.png-to-ico.modeSingle') }}
              </n-radio>
            </n-radio-group>
          </n-form-item>

          <n-form-item v-if="mode === 'multi'" :label="t('tools.png-to-ico.sizesLabel')">
            <n-checkbox-group v-model:value="selectedSizes">
              <n-space wrap>
                <n-checkbox v-for="size in availableSizes" :key="size" :value="size">
                  {{ size }}x{{ size }}
                </n-checkbox>
              </n-space>
            </n-checkbox-group>
          </n-form-item>

          <n-form-item v-else :label="t('tools.png-to-ico.singleSizeLabel')">
            <c-select v-model:value="singleSize" :options="sizeOptions" />
          </n-form-item>
        </n-form>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <c-button :loading="isGenerating" @click="generateIco">
            {{ t('tools.png-to-ico.generate') }}
          </c-button>
          <c-button v-if="downloadUrl" secondary @click="downloadIco">
            {{ t('tools.png-to-ico.download') }}
          </c-button>
          <n-text v-if="imageInfo" depth="3">
            {{ t('tools.png-to-ico.originalSize') }}: {{ imageInfo.width }}x{{ imageInfo.height }}
          </n-text>
        </div>

        <n-alert v-if="errorMessage" type="error" class="mt-4" :show-icon="false">
          {{ errorMessage }}
        </n-alert>
      </n-gi>
      <n-gi>
        <div class="flex flex-col items-center gap-3">
          <n-image v-if="imageUrl" :src="imageUrl" width="220" />
          <n-text v-else depth="3">
            {{ t('tools.png-to-ico.previewPlaceholder') }}
          </n-text>
        </div>
      </n-gi>
    </n-grid>
  </c-card>
</template>
