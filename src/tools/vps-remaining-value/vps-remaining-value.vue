<script lang="ts">
// --- 静态常量定义（移出组件以提升性能）---
// 将常量和缓存移至普通 script 块中，使其在组件实例间共享，避免重复创建和请求
const CURRENCY_SYMBOL_MAP: Record<string, string> = {
  USD: '$',
  CNY: 'CNY ',
  EUR: 'EUR ',
  GBP: 'GBP ',
  JPY: 'JPY ',
  KRW: 'KRW ',
  HKD: 'HKD ',
  TWD: 'TWD ',
  SGD: 'SGD ',
  AUD: 'AUD ',
  CAD: 'CAD ',
  CHF: 'CHF ',
};

const BILLING_PERIOD_OPTIONS = [
  { label: '年', value: 'year' },
  { label: '月', value: 'month' },
  { label: '季度', value: 'quarter' },
  { label: '半年', value: 'half' },
  { label: '三年', value: 'threeYear' },
];

const CORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 16, 24, 32].map(value => ({ label: `${value}C`, value }));
const MEMORY_OPTIONS = [0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 16, 32, 64, 128].map(value => ({ label: `${value}G`, value }));
const DISK_OPTIONS = [20, 30, 40, 50, 100].map(value => ({ label: `${value}G`, value }));

const PERIOD_DAYS_MAP: Record<string, number> = {
  year: 365,
  threeYear: 365 * 3,
  half: 365 / 2,
  quarter: 365 / 4,
  month: 365 / 12,
};

const CURRENCY_OPTIONS = [
  { label: 'USD - 美元', value: 'USD' },
  { label: 'CNY - 人民币', value: 'CNY' },
  { label: 'EUR - 欧元', value: 'EUR' },
  { label: 'GBP - 英镑', value: 'GBP' },
  { label: 'JPY - 日元', value: 'JPY' },
  { label: 'KRW - 韩元', value: 'KRW' },
  { label: 'HKD - 港币', value: 'HKD' },
  { label: 'TWD - 台币', value: 'TWD' },
  { label: 'SGD - 新加坡币', value: 'SGD' },
  { label: 'AUD - 澳元', value: 'AUD' },
  { label: 'CAD - 加元', value: 'CAD' },
  { label: 'CHF - 瑞士法郎', value: 'CHF' },
];

const TRAFFIC_OPTIONS = ['2T', '1T', '500G', '300G', '250G', '200G', '100G'].map(value => ({ label: `${value}`, value }));
const PORT_OPTIONS = ['1G', '2.5G', '10G',  '800M', '700M', '500M', '300M', '200M', '30M', '15M', '10M', '5M'].map(value => ({ label: `${value}`, value }));

// 简单的内存缓存，避免重复请求（现在是全局共享的）
const rateCache = new Map<string, { rate: number; time: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 缓存 1 小时
</script>

<script setup lang="ts">
import { differenceInCalendarDays, startOfDay, isValid, format } from 'date-fns';
import { useStyleStore } from '../../stores/style.store';

const { t } = useI18n();
const message = useMessage();

const totalPrice = ref<number | null>(null);
const currencySymbol = ref('CNY ');
const payCurrency = ref('USD');
const settleCurrency = ref('CNY');
const realtimeRate = ref<number | null>(null);
const appliedRate = ref<number | null>(null);
const rateStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle');
const rateError = ref('');
const isManualRate = ref(false);
const billingPeriod = ref('year');
const premiumPercent = ref(0);
const premiumAmount = ref<number | null>(null);
const isDiscount = ref(false);
const productName = ref('');
const cpuCores = ref<number | null>(null);
const memoryGb = ref<number | null>(null);
const diskGb = ref<number | string | null>(null);
const trafficGb = ref<number | string | null>(null);
const portMbps = ref<number | string | null>(null);
const isTrafficBidirectional = ref(false);
const endDate = ref<number | null>(null);
const asOfDate = ref<number | null>(Date.now());
const decimalPlaces = ref(1);
// 优化：不再使用 computed 监听 window.location.host，因为它不会变
const siteHost = window.location.host;
const previewUrl = ref('');
const isPreviewOpen = ref(false);
const lastPayloadKey = ref('');
const lastShareMarkdown = ref('');

const styleStore = useStyleStore();

const normalizedEnd = computed(() => {
  if (!endDate.value) return null;
  const date = startOfDay(new Date(endDate.value));
  return isValid(date) ? date : null;
});

const periodDays = computed(() => PERIOD_DAYS_MAP[billingPeriod.value] ?? 365);

const normalizedAsOf = computed(() => {

  if (!asOfDate.value) return null;
  const date = startOfDay(new Date(asOfDate.value));
  return isValid(date) ? date : null;
});

const totalDays = computed(() => {
  return Math.max(0, periodDays.value);
});

const remainingDays = computed(() => {
  if (!totalDays.value || !normalizedEnd.value || !normalizedAsOf.value) return null;
  if (normalizedAsOf.value >= normalizedEnd.value) return 0;
  return Math.max(0, differenceInCalendarDays(normalizedEnd.value, normalizedAsOf.value));
});

const usedDays = computed(() => {
  if (!totalDays.value || remainingDays.value === null) return null;
  return Math.max(0, totalDays.value - remainingDays.value);
});

const remainingRatio = computed(() => {
  if (!totalDays.value || remainingDays.value === null) return null;
  return totalDays.value === 0 ? 0 : remainingDays.value / totalDays.value;
});

function formatNumber(value: number | null) {
  if (value === null || Number.isNaN(value) || !Number.isFinite(value)) return '';
  const digits = Math.max(0, Math.min(8, Number(decimalPlaces.value ?? 2)));
  return value.toFixed(digits);
}

const totalPriceInSettlement = computed(() => {
  if (totalPrice.value === null || appliedRate.value === null) return null;
  return totalPrice.value * appliedRate.value;
});


const dailyRate = computed(() => {

  if (totalPriceInSettlement.value === null) return null;
  return totalPriceInSettlement.value / (periodDays.value || 1);
});

const remainingBaseValue = computed(() => {
  if (dailyRate.value === null || remainingDays.value === null) return '';
  const value = dailyRate.value * remainingDays.value;
  return formatNumber(value);
});

const premiumPercentValue = computed(() => {
  if (dailyRate.value === null || remainingDays.value === null) return 0;
  const pct = Number(premiumPercent.value ?? 0);
  if (!Number.isFinite(pct) || pct <= 0) return 0;
  return dailyRate.value * remainingDays.value * (pct / 100);
});

const premiumAmountValue = computed(() => {
  const amount = Number(premiumAmount.value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  return amount;
});

const adjustmentAmount = computed(() => premiumPercentValue.value + premiumAmountValue.value);

const adjustmentSigned = computed(() => (isDiscount.value ? -1 : 1) * adjustmentAmount.value);

const premiumValue = computed(() => {
  if (!Number.isFinite(adjustmentAmount.value) || adjustmentAmount.value <= 0) return '';
  return formatNumber(adjustmentAmount.value);
});

const premiumBadgeText = computed(() => {
  if (!premiumValue.value) return '';
  const label = isDiscount.value ? '折扣' : '溢价';
  const sign = isDiscount.value ? ' -' : ' +';
  return `${label}${sign}${premiumValue.value}`;
});

const premiumPercentLabel = computed(() => (isDiscount.value ? '折扣（%）' : t('tools.vps-remaining-value.premiumPercent')));
const premiumAmountLabel = computed(() => (isDiscount.value ? '折扣金额' : '溢价金额'));

const billingPeriodLabel = computed(() => {
  const match = BILLING_PERIOD_OPTIONS.find(option => option.value === billingPeriod.value);
  return match?.label ?? billingPeriod.value;
});

const configText = computed(() => {
  const coreText = cpuCores.value ? `${cpuCores.value}C` : '--';
  const memText = memoryGb.value ? `${memoryGb.value}G` : '--';
  const diskText = diskGb.value !== null && diskGb.value !== '' ? `${diskGb.value}G` : '--';
  return `${coreText} / ${memText} / ${diskText}`;
});

const trafficText = computed(() => {
  const traffic = trafficGb.value !== null && trafficGb.value !== '' ? `${trafficGb.value}` : '--';
  const port = portMbps.value !== null && portMbps.value !== '' ? `${portMbps.value}` : '--';
  const modeText = isTrafficBidirectional.value ? ' 双 ' : ' 单';
  //const trafficPart = `${traffic}（${modeText}） `;
  const trafficPart = `${traffic}${modeText}`;  
  if (isTrafficBidirectional.value) {
    return `${trafficPart} / ${port}`;
  }
  return `${trafficPart} / ${port}`;
});

const renewalText = computed(() => {
  if (totalPrice.value === null || !Number.isFinite(totalPrice.value)) return '--';
  return `${formatNumber(totalPrice.value)} ${payCurrency.value}`;
});

const remainingValue = computed(() => {
  if (dailyRate.value === null || remainingDays.value === null) return '';
  const base = dailyRate.value * remainingDays.value;
  const value = base + adjustmentSigned.value;
  return `${currencySymbol.value}${formatNumber(value)}`;
});

const ratioPercent = computed(() => {
  if (remainingRatio.value === null) return '';
  return `${formatNumber(remainingRatio.value * 100)}%`;
});


const remainingValuePay = computed(() => {
  if (totalPrice.value === null || remainingDays.value === null) return '';
  const value = (totalPrice.value / (periodDays.value || 1)) * remainingDays.value;
  return `${payCurrency.value} ${formatNumber(value)}`;
});

const hasResult = computed(() => {
  return Boolean(
    totalPrice.value !== null
    && remainingDays.value !== null
    && remainingValue.value
    && !invalidRange.value,
  );
});

const progressPercent = computed(() => {
  if (remainingRatio.value === null) return 0;
  return Math.max(0, Math.min(100, remainingRatio.value * 100));
});

const formattedAsOf = computed(() => {
  if (!normalizedAsOf.value) return '--';
  return format(normalizedAsOf.value, 'yyyy-MM-dd');
});

const formattedEnd = computed(() => {
  if (!normalizedEnd.value) return '--';
  return format(normalizedEnd.value, 'yyyy-MM-dd');
});

const serviceActive = computed(() => {
  if (invalidRange.value) return false;
  return (remainingDays.value ?? 0) > 0;
});


function buildPayload() {
  return {
    currencySymbol: currencySymbol.value,
    remainingValue: remainingValue.value || '--',
    remainingBaseValue: remainingBaseValue.value || '--',
    premiumValue: premiumValue.value || '--',
    discountMode: isDiscount.value,
    productName: productName.value || '--',
    configText: configText.value || '--',
    trafficText: trafficText.value || '--',
    billingPeriodLabel: billingPeriodLabel.value || '--',
    renewalText: renewalText.value || '--',
    remainingDays: remainingDays.value ?? '--',
    formattedAsOf: formattedAsOf.value ?? '--',
    formattedEnd: formattedEnd.value ?? '--',
    providerHost: siteHost,
    theme: styleStore.isDarkTheme ? 'dark' : 'light',
    progress: progressPercent.value / 100,
  };
}

async function fetchSvgUrl(payload: Record<string, unknown>) {
  const res = await fetch('/api/vps-remaining-value/svg/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  const data = await res.json();
  const url = data?.url || (data?.path ? `${window.location.origin}${data.path}` : '');
  if (!url) {
    throw new Error('No URL');
  }
  return url;
}

async function openPreview() {
  if (!hasResult.value) {
    message.warning(t('tools.vps-remaining-value.noResult'));
    return;
  }

  const payload = buildPayload();
  const payloadKey = JSON.stringify(payload);

  if (payloadKey !== lastPayloadKey.value || !previewUrl.value) {
    try {
      previewUrl.value = await fetchSvgUrl(payload);
      lastPayloadKey.value = payloadKey;
    }
    catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg.startsWith('HTTP')) {
        message.error(`${t('tools.vps-remaining-value.copySvgFailed')} (${msg})`);
      }
      else {
        message.error(t('tools.vps-remaining-value.copySvgBackend'));
      }
      return;
    }
  }

  if (previewUrl.value) {
    isPreviewOpen.value = true;
  }
  else {
    message.warning(t('tools.vps-remaining-value.previewMissing'));
  }
}

async function copySvgToClipboard() {
  if (!hasResult.value) {
    message.warning(t('tools.vps-remaining-value.noResult'));
    return;
  }
  const payload = buildPayload();
  const payloadKey = JSON.stringify(payload);

  if (payloadKey === lastPayloadKey.value && lastShareMarkdown.value) {
    // reuse previous result
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(lastShareMarkdown.value);
      }
      else {
        const textarea = document.createElement('textarea');
        textarea.value = lastShareMarkdown.value;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      message.success(t('tools.vps-remaining-value.copySvgSuccess'));
    }
    catch {
      message.error(t('tools.vps-remaining-value.copySvgFailed'));
    }
    return;
  }

  try {
    const url = await fetchSvgUrl(payload);
    previewUrl.value = url;
    const markdown = `![image](${url})`;

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(markdown);
    }
    else {
      const textarea = document.createElement('textarea');
      textarea.value = markdown;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }

    lastPayloadKey.value = payloadKey;
    lastShareMarkdown.value = markdown;

    message.success(t('tools.vps-remaining-value.copySvgSuccess'));
  }
  catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.startsWith('HTTP')) {
      message.error(`${t('tools.vps-remaining-value.copySvgFailed')} (${msg})`);
    }
    else {
      message.error(t('tools.vps-remaining-value.copySvgBackend'));
    }
  }
}

const invalidRange = computed(() => {
  if (!normalizedAsOf.value || !normalizedEnd.value) return false;
  return differenceInCalendarDays(normalizedEnd.value, normalizedAsOf.value) <= 0;
});

watch(
  settleCurrency,
  (next) => {
    currencySymbol.value = CURRENCY_SYMBOL_MAP[next] ?? currencySymbol.value;
  },
  { immediate: true },
);

let abortController: AbortController | null = null;

async function fetchRealtimeRate() {
  rateError.value = '';
  rateStatus.value = 'loading';
  
  // 取消上一次未完成的请求
  if (abortController) {
    abortController.abort();
  }
  abortController = new AbortController();

  if (payCurrency.value === settleCurrency.value) {
    realtimeRate.value = 1;
    if (!isManualRate.value) {
      appliedRate.value = 1;
    }
    rateStatus.value = 'success';
    return;
  }

  // 检查缓存
  const cacheKey = `${payCurrency.value}-${settleCurrency.value}`;
  const cached = rateCache.get(cacheKey);
  if (cached && Date.now() - cached.time < CACHE_DURATION) {
    realtimeRate.value = cached.rate;
    if (!isManualRate.value) {
      appliedRate.value = cached.rate;
    }
    rateStatus.value = 'success';
    return;
  }

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${payCurrency.value}`, {
      signal: abortController.signal,
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const rate = data?.rates?.[settleCurrency.value];
    
    if (!rate || typeof rate !== 'number') {
      throw new Error('Rate not found');
    }
    realtimeRate.value = rate;
    if (!isManualRate.value) {
      appliedRate.value = rate;
    }
    rateCache.set(cacheKey, { rate, time: Date.now() });
    rateStatus.value = 'success';
  }
  catch (err) {
    if (err instanceof Error && err.name === 'AbortError') return;
    rateStatus.value = 'error';
    rateError.value = err instanceof Error ? err.message : 'Unknown error';
  }
}

watch([payCurrency, settleCurrency], () => {
  isManualRate.value = false;
  fetchRealtimeRate();
}, { immediate: true });

// 组件销毁时取消未完成的请求，防止内存泄漏和报错
onUnmounted(() => {
  if (abortController) {
    abortController.abort();
  }
});

</script>

<template>
  <div class="vps-layout">
    <div class="vps-form">
      <c-card class="vps-panel">
        <!-- <div class="vps-panel-title">
          {{ t('tools.vps-remaining-value.formTitle') }}
        </div> -->
        <div class="vps-fields">
          <div class="vps-field vps-field-row">
            <div class="vps-row vps-row-head">
            <div class="vps-label">{{ t('tools.vps-remaining-value.realtimeRate') }}</div>
            <div class="vps-label">当前汇率（可修改）</div>
            </div>
            <div class="vps-row">
              <n-input-number
                :value="realtimeRate ?? undefined"
                :placeholder="t('tools.vps-remaining-value.realtimeRate')"
                :disabled="rateStatus === 'loading'"
                :input-props="{ autocomplete: 'off', 'data-lpignore': 'true' }"
                readonly
              />
              <n-input-number
                v-model:value="appliedRate"
                :placeholder="t('tools.vps-remaining-value.appliedRate')"
                min="0"
                :input-props="{ autocomplete: 'off', 'data-lpignore': 'true' }"
                @update:value="() => { isManualRate = true; }"
              />
            </div>
          </div>
           <div class="vps-field vps-field-row">
            <div class="vps-row vps-row-head">
              <div class="vps-label">{{ t('tools.vps-remaining-value.payCurrency') }}</div>
              <div class="vps-label">{{ t('tools.vps-remaining-value.settleCurrency') }}</div>
            </div>
            <div class="vps-row">
              <n-select
                v-model:value="payCurrency"
                :options="CURRENCY_OPTIONS"
                :placeholder="t('tools.vps-remaining-value.payCurrency')"
                class="vps-select vps-select-config"
              />
              
              <n-select
                v-model:value="settleCurrency"
                :options="CURRENCY_OPTIONS"
                :placeholder="t('tools.vps-remaining-value.settleCurrency')"
                class="vps-select vps-select-config"
              />
            </div>
          </div>
          <div class="vps-field vps-field-row">
            <div class="vps-label">品名</div>
            <div class="vps-row vps-row-full">
              <n-input
                v-model:value="productName"
                placeholder="输入品名"
              />
            </div>
          </div>
          <div class="vps-field vps-field-row">
            <div class="vps-row vps-row-head vps-row-3 vps-row-config">
              <div class="vps-label">CPU（可自定义）</div>
              <div class="vps-label">内存（可自定义）</div>
              <div class="vps-label">硬盘（可自定义）</div>
            </div>
            <div class="vps-row vps-row-3 vps-row-config">
              <n-select
                v-model:value="cpuCores"
                :options="CORE_OPTIONS"
                placeholder="选择核心"
                filterable
                tag
                class="vps-select vps-select-config"
              />
              <n-select
                v-model:value="memoryGb"
                :options="MEMORY_OPTIONS"
                placeholder="选择内存"
                filterable
                tag
                class="vps-select"
              />
              <n-select
                v-model:value="diskGb"
                :options="DISK_OPTIONS"
                placeholder="选择硬盘"
                filterable
                tag
                class="vps-select"
              />
            </div>
          </div>
          <div class="vps-field vps-field-row">
            <div class="vps-row vps-row-head">
              <div class="vps-label">流量（可自定义）</div>
              <div class="vps-label">网口速率（可自定义）</div>
            </div>
            <div class="vps-row vps-row-traffic">
              <n-select
                v-model:value="trafficGb"
                :options="TRAFFIC_OPTIONS"
                placeholder="流量"
                filterable
                tag
                class="vps-select"
              />
              <n-checkbox v-model:checked="isTrafficBidirectional">双向</n-checkbox>
              <n-select
                v-model:value="portMbps"
                :options="PORT_OPTIONS"
                placeholder="速率"
                filterable
                tag
                class="vps-select"
              />
            </div>
          </div>

          <div class="vps-field vps-field-row">
            <div class="vps-row vps-row-head">
            <div class="vps-label">{{ t('tools.vps-remaining-value.totalPrice') }}</div>
            <div class="vps-label">付费周期</div>
            </div>
            <div class="vps-row">
              <n-input-number
                v-model:value="totalPrice"
                :placeholder="t('tools.vps-remaining-value.totalPrice')"
                min="0"
                :input-props="{ autocomplete: 'off', 'data-lpignore': 'true' }"
              />
              <n-select
                v-model:value="billingPeriod"
                :options="BILLING_PERIOD_OPTIONS"
                class="vps-select"
              />
            </div>
          </div>

          <div class="vps-field vps-field-row">
          <div class="vps-row vps-row-head">
            <div class="vps-label">{{ t('tools.vps-remaining-value.endDate') }}</div>
            <div class="vps-label">{{ t('tools.vps-remaining-value.asOfDate') }}</div>
            </div>
            <div class="vps-row">
              <n-date-picker
                v-model:value="endDate"
                type="date"
                :placeholder="t('tools.vps-remaining-value.endDate')"
              />
              <n-date-picker
                v-model:value="asOfDate"
                type="date"
                :placeholder="t('tools.vps-remaining-value.asOfDate')"
              />
            </div>
          </div>
          <div class="vps-field vps-field-row">
            <div class="vps-row vps-row-head">
              <div class="vps-label">{{ premiumPercentLabel }}</div>
              <div class="vps-label">{{ premiumAmountLabel }}</div>
            </div>
            <div class="vps-row vps-row-3">
              <n-input-number
                v-model:value="premiumPercent"
                :placeholder="premiumPercentLabel"
                min="0"
                max="1000"
                :input-props="{ autocomplete: 'off', 'data-lpignore': 'true' }"
              />
              <n-input-number
                v-model:value="premiumAmount"
                :placeholder="premiumAmountLabel"
                min="0"
                class="vps-premium-amount"
                :input-props="{ autocomplete: 'off', 'data-lpignore': 'true' }"
              />
              <n-checkbox v-model:checked="isDiscount">折扣</n-checkbox>
            </div>
          </div>
          <n-alert v-if="invalidRange" type="warning" :show-icon="false">
            {{ t('tools.vps-remaining-value.invalidRange') }}
          </n-alert>
        </div>
      </c-card>
    </div>

    <div class="vps-result">
      <div class="vps-result-actions">
        <n-button class="vps-action-btn" type="primary" secondary @click="copySvgToClipboard">
          {{ t('tools.vps-remaining-value.copySvg') }}
        </n-button>
        <n-button class="vps-action-btn" type="info" secondary @click="openPreview">
          {{ t('tools.vps-remaining-value.previewSvg') }}
        </n-button>
      </div>
      <div class="vps-result-card">
        <!-- <div class="vps-result-header">
          {{ t('tools.vps-remaining-value.resultTitle') }}
        </div> -->
        <div class="vps-result-main">
          <div class="vps-result-icon">$</div>
          <div class="vps-result-title">
            <span class="vps-title-text">{{ t('tools.vps-remaining-value.remainingValue') }}</span>
            <span v-if="premiumBadgeText" :class="['vps-premium-badge', isDiscount ? 'is-discount' : 'is-premium']">{{ premiumBadgeText }}</span>
          </div>
          <div class="vps-result-amount">
            {{ remainingValue || '--' }}
          </div>
          <div class="vps-result-divider" />
          <div class="vps-result-info">
            <div class="vps-info-row">
              <span class="vps-info-label">品名</span>
              <span class="vps-info-value">{{ productName || '--' }}</span>
            </div>
            <div class="vps-info-row">
              <span class="vps-info-label">配置</span>
              <span class="vps-info-value">{{ configText }}</span>
            </div>
            <div class="vps-info-row">
              <span class="vps-info-label">流量/网络速率</span>
              <span class="vps-info-value">{{ trafficText }}</span>
            </div>
            <div class="vps-info-row">
              <span class="vps-info-label">付费周期</span>
              <span class="vps-info-value">{{ billingPeriodLabel }}</span>
            </div>
            <div class="vps-info-row">
              <span class="vps-info-label">续费金额</span>
              <span class="vps-info-value">{{ renewalText }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="vps-time-card">
        <div class="vps-time-left">
          <div class="vps-time-icon">🕙︎</div>
          <div>
            <div class="vps-time-title">
              {{ t('tools.vps-remaining-value.remainingTime') }}
            </div>
            <div class="vps-time-sub">
              {{ t('tools.vps-remaining-value.untilDate') }} {{ formattedEnd }}
            </div>
          </div>
        </div>
        <div class="vps-time-right">
          <div class="vps-time-days">{{ remainingDays ?? '--' }}</div>
          <div class="vps-time-unit">{{ t('tools.vps-remaining-value.days') }}</div>
        </div>
        <div class="vps-time-range">
          <span>{{ formattedAsOf }}</span>
          <span>{{ formattedEnd }}</span>
        </div>
        <div class="vps-site-footer">由 {{ siteHost }} 提供</div>
      </div>

    </div>
  </div>
  <n-modal v-model:show="isPreviewOpen" preset="card" :title="t('tools.vps-remaining-value.previewTitle')" style="width: 520px">
    <div class="vps-preview-modal">
      <img v-if="previewUrl" :src="previewUrl" alt="svg preview" />
      <div v-else class="vps-preview-empty">{{ t('tools.vps-remaining-value.previewMissing') }}</div>
    </div>
  </n-modal>
</template>


<style scoped lang="less">
.vps-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 24px;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
}

.vps-panel {
  border-radius: 18px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

.vps-panel-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: var(--app-text);
}

.vps-fields {
  display: grid;
  gap: 16px;
}

.vps-field {
  display: grid;
  gap: 8px;
}

.vps-label {
  font-size: 13px;
  color: var(--app-text-muted);
  font-weight: 600;
}

.vps-row {
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.vps-row-full {
  grid-template-columns: 1fr;
}

.vps-row-3 {
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.7fr) auto;
  align-items: center;
}

.vps-row-config {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.vps-select-config {
  min-width: 120px;
}

.vps-row-traffic {
  grid-template-columns: minmax(0, 0.7fr) auto minmax(0, 1fr);
  align-items: center;
}

.vps-select-traffic {
  max-width: 160px;
}

.vps-premium-amount {
  max-width: 200px;
}

.vps-row-head {
  margin-bottom: -2px;
}

.vps-row-head .vps-label {
  justify-self: start;
  text-align: left;
}

.vps-select {
  width: 100%;
}

.vps-field-row {
  gap: 10px;
}


.vps-result {
  display: grid;
  gap: 20px;
  padding: 8px;
  border-radius: 20px;
  background: linear-gradient(160deg, rgba(59, 130, 246, 0.08), rgba(16, 185, 129, 0.05));
}

.vps-result-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-bottom: 8px;
}

.vps-action-btn {
  border-radius: 12px;
  font-weight: 600;
  letter-spacing: 0.2px;
  padding: 0 14px;
  height: 36px;
  box-shadow: 0 10px 18px rgba(15, 23, 42, 0.22);
}

:global(.dark) .vps-action-btn {
  box-shadow: 0 12px 22px rgba(2, 6, 23, 0.5);
}

.vps-result-card {
  background: var(--app-bg-elev);
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
}

.vps-result-header {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
}

.vps-result-main {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
}

.vps-result-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: #22c55e;
  color: #fff;
  display: grid;
  place-items: center;
  font-size: 22px;
  font-weight: 700;
}

.vps-result-title {
  font-size: 16px;
  font-weight: 600;
  display: inline-block;
  position: relative;
}

.vps-premium-badge {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  background: rgba(239, 68, 68, 0.16);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.45);
  line-height: 1.4;
  position: absolute;
  left: 115%;
  margin-left: 8px;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
}

.vps-premium-badge.is-discount {
  background: rgba(56, 189, 248, 0.16);
  color: #38bdf8;
  border-color: rgba(56, 189, 248, 0.45);
}
.vps-title-text {
  display: inline-block;
}

.vps-result-amount {
  font-size: 36px;
  font-weight: 800;
  color: #16a34a;
}

.vps-result-sub {
  color: var(--app-text-muted);
}

.vps-result-info {
  width: 100%;
  display: grid;
  gap: 8px;
  margin-top: 6px;
}

.vps-result-divider {
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: linear-gradient(90deg, #f43f5e, #f97316);
  margin: 6px 0 2px;
  opacity: 0.9;
}

.vps-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: var(--app-text-muted);
}

.vps-info-label {
  color: var(--app-text-muted);
}

.vps-info-value {
  color: var(--app-text);
  font-weight: 600;
}

.vps-result-breakdown {
  display: grid;
  gap: 6px;
}

.vps-result-breakdown-title {
  font-size: 14px;
  color: var(--app-text-muted);
}

.vps-result-breakdown-line {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
}

.vps-break-base {
  color: #22c55e;
}

.vps-break-plus {
  color: var(--app-text-muted);
}

.vps-break-premium {
  color: #f59e0b;
}

.vps-result-breakdown-total {
  font-size: 20px;
  font-weight: 700;
  color: #22c55e;
}

.vps-result-meta {
  width: 100%;
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--app-text-muted);
}

.vps-time-card {
  background: var(--app-bg-elev);
  border-radius: 16px;
  padding: 18px;
  display: grid;
  gap: 12px;
  box-shadow: 0 16px 32px rgba(15, 23, 42, 0.1);
}

.vps-time-left {
  display: flex;
  gap: 12px;
  align-items: center;
}

.vps-time-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.15);
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 18px;
}

.vps-time-title {
  font-weight: 600;
}

.vps-time-sub {
  font-size: 12px;
  color: var(--app-text-muted);
}

.vps-time-right {
  justify-self: end;
  text-align: right;
}

.vps-time-days {
  font-size: 28px;
  font-weight: 800;
  color: #2563eb;
}

.vps-time-unit {
  font-size: 12px;
  color: var(--app-text-muted);
}

.vps-time-range {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--app-text-muted);
}

.vps-site-footer {
  margin-top: 8px;
  text-align: center;
  font-size: 12px;
  color: var(--app-text-muted);
}

.vps-preview-modal {
  display: grid;
  place-items: center;
}

.vps-preview-modal img {
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.35);
}

.vps-preview-empty {
  color: var(--app-text-muted);
}




@media (max-width: 1024px) {
  .vps-layout {
    grid-template-columns: 1fr;
  }

  .vps-row {
    grid-template-columns: 1fr;
  }

  .vps-symbol {
    width: 100%;
  }
}
</style>
