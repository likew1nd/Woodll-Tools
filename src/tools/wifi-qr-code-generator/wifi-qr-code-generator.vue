<script setup lang="ts">
import {
  EAPMethods,
  EAPPhase2Methods,
  useWifiQRCode,
} from './useQRCode';
import { useDownloadFileFromBase64 } from '@/composable/downloadBase64';

const { t } = useI18n();

const foreground = ref('#000000ff');
const background = ref('#ffffffff');

const ssid = ref();
const password = ref();
const eapMethod = ref();
const isHiddenSSID = ref(false);
const eapAnonymous = ref(false);
const eapIdentity = ref();
const eapPhase2Method = ref();

const { qrcode, encryption } = useWifiQRCode({
  ssid,
  password,
  eapMethod,
  isHiddenSSID,
  eapAnonymous,
  eapIdentity,
  eapPhase2Method,
  color: {
    background,
    foreground,
  },
  options: { width: 1024 },
});

const { download } = useDownloadFileFromBase64({ source: qrcode, filename: 'qr-code.png' });
</script>

<template>
  <c-card>
    <div grid grid-cols-1 gap-12>
      <div>
        <c-select
          v-model:value="encryption"
          mb-4
          :label="$t('tools.wifi-qr-code-generator.encryptionLabel')"
          default-value="WPA"
          label-position="left"
          label-width="130px"
          label-align="right"
          :options="[
            {
              label: $t('tools.wifi-qr-code-generator.encryptionNone'),
              value: 'nopass',
            },
            {
              label: $t('tools.wifi-qr-code-generator.encryptionWpa'),
              value: 'WPA',
            },
            {
              label: $t('tools.wifi-qr-code-generator.encryptionWep'),
              value: 'WEP',
            },
            {
              label: $t('tools.wifi-qr-code-generator.encryptionWpa2Eap'),
              value: 'WPA2-EAP',
            },
          ]"
        />
        <div class="mb-6 flex flex-row items-center gap-2">
          <c-input-text
            v-model:value="ssid"
            label-position="left"
            label-width="130px"
            label-align="right"
            :label="$t('tools.wifi-qr-code-generator.ssidLabel')"
            rows="1"
            autosize
            :placeholder="$t('tools.wifi-qr-code-generator.ssidPlaceholder')"
            mb-6
          />
          <n-checkbox v-model:checked="isHiddenSSID">
            {{ $t('tools.wifi-qr-code-generator.hiddenSsid') }}
          </n-checkbox>
        </div>
        <c-input-text
          v-if="encryption !== 'nopass'"
          v-model:value="password"
          label-position="left"
          label-width="130px"
          label-align="right"
          :label="$t('tools.wifi-qr-code-generator.passwordLabel')"
          rows="1"
          autosize
          type="password"
          :placeholder="$t('tools.wifi-qr-code-generator.passwordPlaceholder')"
          mb-6
        />
        <c-select
          v-if="encryption === 'WPA2-EAP'"
          v-model:value="eapMethod"
          :label="$t('tools.wifi-qr-code-generator.eapMethodLabel')"
          label-position="left"
          label-width="130px"
          label-align="right"
          :options="EAPMethods.map((method) => ({ label: method, value: method }))"
          searchable mb-4
        />
        <div v-if="encryption === 'WPA2-EAP'" class="mb-6 flex flex-row items-center gap-2">
          <c-input-text
            v-model:value="eapIdentity"
            label-position="left"
            label-width="130px"
            label-align="right"
            :label="$t('tools.wifi-qr-code-generator.identityLabel')"
            rows="1"
            autosize
            :placeholder="$t('tools.wifi-qr-code-generator.identityPlaceholder')"
            mb-6
          />
          <n-checkbox v-model:checked="eapAnonymous">
            {{ $t('tools.wifi-qr-code-generator.anonymous') }}
          </n-checkbox>
        </div>
        <c-select
          v-if="encryption === 'WPA2-EAP'"
          v-model:value="eapPhase2Method"
          :label="$t('tools.wifi-qr-code-generator.eapPhase2Label')"
          label-position="left"
          label-width="130px"
          label-align="right"
          :options="EAPPhase2Methods.map((method) => ({ label: method, value: method }))"
          searchable mb-4
        />
        <n-form label-width="130" label-placement="left">
          <n-form-item :label="$t('tools.wifi-qr-code-generator.foregroundLabel')">
            <n-color-picker v-model:value="foreground" :modes="['hex']" />
          </n-form-item>
          <n-form-item :label="$t('tools.wifi-qr-code-generator.backgroundLabel')">
            <n-color-picker v-model:value="background" :modes="['hex']" />
          </n-form-item>
        </n-form>
      </div>
      <div v-if="qrcode">
        <div flex flex-col items-center gap-3>
          <img alt="wifi-qrcode" :src="qrcode" width="200">
          <c-button @click="download">
            {{ $t('tools.wifi-qr-code-generator.download') }}
          </c-button>
        </div>
      </div>
    </div>
  </c-card>
</template>
