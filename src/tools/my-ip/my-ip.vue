<script setup lang="ts">
import SpanCopyable from '@/components/SpanCopyable.vue';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface Result {
  status: Status
  ip?: string
  location?: string
  isp?: string
  error?: string
}

interface Source {
  id: string
  label: string
  description: string
  url: string
  parser?: (data: unknown) => { ip?: string; location?: string; isp?: string }
}

const { t } = useI18n();

const sources = computed<Source[]>(() => [
  {
    id: 'domestic',
    label: t('tools.my-ip.cards.domestic'),
    description: t('tools.my-ip.cards.domesticDesc'),
    url: 'https://myip.ipip.net/json',
    parser: parseIpip,
  },
  {
    id: 'overseas',
    label: t('tools.my-ip.cards.overseas'),
    description: t('tools.my-ip.cards.overseasDesc'),
    url: 'https://ipinfo.io/json',
  },
  {
    id: 'google',
    label: t('tools.my-ip.cards.google'),
    description: t('tools.my-ip.cards.googleDesc'),
    url: 'https://api.ip.sb/geoip',
    parser: parseIpSb,
  },
]);

const results = reactive<Record<string, Result>>({});

function getResult(id: string) {
  if (!results[id]) {
    results[id] = { status: 'idle' };
  }
  return results[id];
}

function parseIpSb(data: unknown) {
  if (!data || typeof data !== 'object') {
    return {};
  }
  const payload = data as Record<string, unknown>;
  const ip = String(payload.ip ?? '');
  const country = String(payload.country ?? '');
  const region = String(payload.region ?? '');
  const city = String(payload.city ?? '');
  const isp = String(payload.isp ?? payload.organization ?? payload.asn_organization ?? '');
  const location = [country, region, city].filter(Boolean).join(' ');
  return { ip, location: location || undefined, isp: isp || undefined };
}

function parseIpip(data: unknown) {
  if (!data || typeof data !== 'object') {
    return {};
  }
  const payload = data as { data?: { ip?: string; location?: string[] } };
  const info = payload.data ?? {};
  const ip = String(info.ip ?? '');
  const parts = Array.isArray(info.location) ? info.location : [];
  const location = parts.slice(0, 4).filter(Boolean).join(' ');
  const isp = String(parts[4] ?? '');
  return { ip, location: location || undefined, isp: isp || undefined };
}

function parseAny(data: unknown, fallbackText?: string) {
  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>;
    const ip = String(payload.ip ?? payload.query ?? payload.address ?? '');
    const city = String(payload.city ?? '');
    const region = String(payload.region ?? payload.regionName ?? '');
    const country = String(payload.country_name ?? payload.country ?? '');
    const isp = String(payload.org ?? payload.isp ?? payload.as ?? '');
    const location = [city, region, country].filter(Boolean).join(' ');
    return { ip, location: location || undefined, isp: isp || undefined };
  }

  if (fallbackText) {
    const ipMatch = fallbackText.match(/\b\d{1,3}(?:\.\d{1,3}){3}\b/);
    return { ip: ipMatch?.[0] };
  }

  return {};
}

async function fetchSource(source: Source) {
  const result = getResult(source.id);
  result.status = 'loading';
  result.error = undefined;

  try {
    const response = await fetch(source.url, { cache: 'no-store' });
    const text = await response.text();
    const data = text ? safeJsonParse(text) : null;
    const parsed = source.parser ? source.parser(data ?? text) : parseAny(data ?? text, text);
    if (!parsed.ip) {
      throw new Error(t('tools.my-ip.errors.noIpFound'));
    }
    result.status = 'success';
    result.ip = parsed.ip;
    result.location = parsed.location;
    result.isp = parsed.isp;
  }
  catch (error) {
    result.status = 'error';
    result.error = error instanceof Error ? error.message : t('tools.my-ip.errors.unknown');
  }
}

function safeJsonParse(text: string) {
  try {
    return JSON.parse(text);
  }
  catch {
    return null;
  }
}

async function refreshAll() {
  await Promise.all(sources.value.map(fetchSource));
}

onMounted(() => {
  refreshAll();
});
</script>

<template>
  <c-card :title="$t('tools.my-ip.title')" :description="$t('tools.my-ip.description')" class="my-ip">
    <div class="actions">
      <c-button size="small" @click="refreshAll">
        {{ $t('tools.my-ip.refresh') }}
      </c-button>
    </div>

    <n-grid cols="1 800:3" x-gap="16" y-gap="16">
      <n-gi v-for="source in sources" :key="source.id">
        <div class="ip-card">
          <div class="card-header">
            <div class="card-title">
              {{ source.label }}
            </div>
            <div class="card-subtitle">
              {{ source.description }}
            </div>
          </div>

          <div class="card-body">
            <template v-if="getResult(source.id).status === 'loading'">
              <div class="status">
                {{ $t('tools.my-ip.loading') }}
              </div>
            </template>

            <template v-else-if="getResult(source.id).status === 'error'">
              <div class="status error">
                {{ getResult(source.id).error }}
              </div>
            </template>

            <template v-else>
              <div class="ip-value">
                <SpanCopyable v-if="getResult(source.id).ip" :value="getResult(source.id).ip" />
                <span v-else class="status">{{ $t('tools.my-ip.unavailable') }}</span>
              </div>
              <div v-if="getResult(source.id).location" class="meta">
                {{ getResult(source.id).location }}
              </div>
              <div v-if="getResult(source.id).isp" class="meta">
                {{ getResult(source.id).isp }}
              </div>
            </template>
          </div>
        </div>
      </n-gi>
    </n-grid>
  </c-card>
</template>

<style scoped lang="less">
.my-ip {
  max-width: 1200px;
}

.actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.ip-card {
  border: 1px solid var(--app-border);
  background: var(--app-bg-elev);
  border-radius: 14px;
  padding: 16px;
  min-height: 160px;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
}

.card-header {
  margin-bottom: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.card-subtitle {
  font-size: 12px;
  opacity: 0.7;
  margin-top: 4px;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ip-value {
  font-size: 20px;
  font-weight: 600;
}

.meta {
  font-size: 12px;
  opacity: 0.75;
}

.status {
  font-size: 13px;
  opacity: 0.7;
}

.status.error {
  color: #ef4444;
}
</style>
