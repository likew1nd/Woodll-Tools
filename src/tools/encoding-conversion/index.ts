import { Code } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.encoding-conversion.title'),
  path: '/encoding-conversion',
  description: translate('tools.encoding-conversion.description'),
  keywords: [
    'encoding',
    'conversion',
    'url',
    'base64',
    'md5',
    'gbk',
    'gb2312',
    'utf8',
  ],
  component: () => import('./encoding-conversion.vue'),
  icon: Code,
});
