<script setup lang="ts">
import { useTimestamp } from '@vueuse/core';
import { useThemeVars } from 'naive-ui';
import { useQRCode } from '../qr-code-generator/useQRCode';
import { base32toHex, buildKeyUri, generateSecret, generateTOTP, getCounterFromTime } from './otp.service';
import TokenDisplay from './token-display.vue';
import { useStyleStore } from '@/stores/style.store';
import InputCopyable from '@/components/InputCopyable.vue';
import { computedRefreshable } from '@/composable/computedRefreshable';

const { t } = useI18n();

const now = useTimestamp();
const interval = computed(() => (now.value / 1000) % 30);
const theme = useThemeVars();
const styleStore = useStyleStore();

const secret = ref(generateSecret());

function refreshSecret() {
  secret.value = generateSecret();
}

const [tokens] = computedRefreshable(
  () => ({
    previous: generateTOTP({ key: secret.value, now: now.value - 30000 }),
    current: generateTOTP({ key: secret.value, now: now.value }),
    next: generateTOTP({ key: secret.value, now: now.value + 30000 }),
  }),
  { throttle: 500 },
);

const keyUri = computed(() => buildKeyUri({ secret: secret.value }));

const { qrcode } = useQRCode({
  text: keyUri,
  color: {
    background: computed(() => (styleStore.isDarkTheme ? '#ffffff' : '#00000000')),
    foreground: '#000000',
  },
  options: { width: 210 },
});

const secretValidationRules = [
  {
    message: t('tools.otp-code-generator-and-validator.secretBase32Error'),
    validator: (value: string) => value.toUpperCase().match(/^[A-Z234567]+$/),
  },
  {
    message: t('tools.otp-code-generator-and-validator.secretRequired'),
    validator: (value: string) => value !== '',
  },
];
</script>

<template>
  <div style="max-width: 350px">
    <c-input-text
      v-model:value="secret"
      :label="$t('tools.otp-code-generator-and-validator.secretLabel')"
      :placeholder="$t('tools.otp-code-generator-and-validator.secretPlaceholder')"
      mb-5
      :validation-rules="secretValidationRules"
    >
      <template #suffix>
        <c-tooltip :tooltip="$t('tools.otp-code-generator-and-validator.generateSecret')">
          <c-button circle variant="text" size="small" @click="refreshSecret">
            <icon-mdi-refresh />
          </c-button>
        </c-tooltip>
      </template>
    </c-input-text>

    <div>
      <TokenDisplay :tokens="tokens" />

      <n-progress :percentage="(100 * interval) / 30" :color="theme.primaryColor" :show-indicator="false" />
      <div style="text-align: center">
        {{ $t('tools.otp-code-generator-and-validator.nextIn', { seconds: String(Math.floor(30 - interval)).padStart(2, '0') }) }}
      </div>
    </div>
    <div mt-4 flex flex-col items-center justify-center gap-3>
      <n-image :src="qrcode" />
      <c-button :href="keyUri" target="_blank">
        {{ $t('tools.otp-code-generator-and-validator.openKeyUri') }}
      </c-button>
    </div>
  </div>
  <div style="max-width: 350px">
    <InputCopyable
      :label="$t('tools.otp-code-generator-and-validator.secretHexLabel')"
      :value="base32toHex(secret)"
      readonly
      :placeholder="$t('tools.otp-code-generator-and-validator.secretHexPlaceholder')"
      mb-5
    />

    <InputCopyable
      :label="$t('tools.otp-code-generator-and-validator.epochLabel')"
      :value="Math.floor(now / 1000).toString()"
      readonly
      mb-5
      :placeholder="$t('tools.otp-code-generator-and-validator.epochPlaceholder')"
    />

    <p>{{ $t('tools.otp-code-generator-and-validator.iterationTitle') }}</p>

    <InputCopyable
      :value="String(getCounterFromTime({ now, timeStep: 30 }))"
      readonly
      :label="$t('tools.otp-code-generator-and-validator.countLabel')"
      label-position="left"
      label-width="90px"
      label-align="right"
      :placeholder="$t('tools.otp-code-generator-and-validator.countPlaceholder')"
    />

    <InputCopyable
      :value="getCounterFromTime({ now, timeStep: 30 }).toString(16).padStart(16, '0')"
      readonly
      :placeholder="$t('tools.otp-code-generator-and-validator.countHexPlaceholder')"
      label-position="left"
      label-width="90px"
      label-align="right"
      :label="$t('tools.otp-code-generator-and-validator.countHexLabel')"
    />
  </div>
</template>

<style lang="less" scoped>
.n-progress {
  margin-top: 10px;
  ::v-deep(.n-progress-graph-line-fill) {
    transition-duration: 0.05s !important;
  }
}

.token {
  text-align: center;
  &.token-current {
    font-size: 20px;
  }
}
</style>
