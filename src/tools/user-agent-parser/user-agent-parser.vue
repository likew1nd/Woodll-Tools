<script setup lang="ts">
import { UAParser } from 'ua-parser-js';
import { Adjustments, Browser, Cpu, Devices, Engine } from '@vicons/tabler';
import UserAgentResultCards from './user-agent-result-cards.vue';
import type { UserAgentResultSection } from './user-agent-parser.types';
import { withDefaultOnError } from '@/utils/defaults';

const { t } = useI18n();

const ua = ref(navigator.userAgent as string);

// If not input in the ua field is present return an empty object of type UAParser.IResult because otherwise
// UAParser returns the values for the current Browser. This is confusing because results are shown for an empty
// UA field value.
function getUserAgentInfo(userAgent: string) {
  return userAgent.trim().length > 0
    ? UAParser(userAgent.trim())
    : ({ ua: '', browser: {}, cpu: {}, device: {}, engine: {}, os: {} } as UAParser.IResult);
}
const userAgentInfo = computed(() => withDefaultOnError(() => getUserAgentInfo(ua.value), undefined));

const sections = computed<UserAgentResultSection[]>(() => [
  {
    heading: t('tools.user-agent-parser.browser'),
    icon: Browser,
    content: [
      {
        label: t('tools.user-agent-parser.name'),
        getValue: block => block?.browser.name,
        undefinedFallback: t('tools.user-agent-parser.noBrowserName'),
      },
      {
        label: t('tools.user-agent-parser.version'),
        getValue: block => block?.browser.version,
        undefinedFallback: t('tools.user-agent-parser.noBrowserVersion'),
      },
    ],
  },
  {
    heading: t('tools.user-agent-parser.engine'),
    icon: Engine,
    content: [
      {
        label: t('tools.user-agent-parser.name'),
        getValue: block => block?.engine.name,
        undefinedFallback: t('tools.user-agent-parser.noEngineName'),
      },
      {
        label: t('tools.user-agent-parser.version'),
        getValue: block => block?.engine.version,
        undefinedFallback: t('tools.user-agent-parser.noEngineVersion'),
      },
    ],
  },
  {
    heading: t('tools.user-agent-parser.os'),
    icon: Adjustments,
    content: [
      {
        label: t('tools.user-agent-parser.name'),
        getValue: block => block?.os.name,
        undefinedFallback: t('tools.user-agent-parser.noOsName'),
      },
      {
        label: t('tools.user-agent-parser.version'),
        getValue: block => block?.os.version,
        undefinedFallback: t('tools.user-agent-parser.noOsVersion'),
      },
    ],
  },
  {
    heading: t('tools.user-agent-parser.device'),
    icon: Devices,
    content: [
      {
        label: t('tools.user-agent-parser.model'),
        getValue: block => block?.device.model,
        undefinedFallback: t('tools.user-agent-parser.noDeviceModel'),
      },
      {
        label: t('tools.user-agent-parser.type'),
        getValue: block => block?.device.type,
        undefinedFallback: t('tools.user-agent-parser.noDeviceType'),
      },
      {
        label: t('tools.user-agent-parser.vendor'),
        getValue: block => block?.device.vendor,
        undefinedFallback: t('tools.user-agent-parser.noDeviceVendor'),
      },
    ],
  },
  {
    heading: t('tools.user-agent-parser.cpu'),
    icon: Cpu,
    content: [
      {
        label: t('tools.user-agent-parser.architecture'),
        getValue: block => block?.cpu.architecture,
        undefinedFallback: t('tools.user-agent-parser.noCpuArch'),
      },
    ],
  },
]);
</script>

<template>
  <div>
    <c-input-text
      v-model:value="ua"
      :label="$t('tools.user-agent-parser.inputLabel')"
      multiline
      :placeholder="$t('tools.user-agent-parser.inputPlaceholder')"
      clearable
      raw-text
      rows="2"
      autosize
      monospace
      mb-3
    />

    <UserAgentResultCards :user-agent-info="userAgentInfo" :sections="sections" />
  </div>
</template>
