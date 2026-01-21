import { World } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.my-ip.title'),
  path: '/my-ip',
  description: translate('tools.my-ip.description'),
  keywords: ['ip', 'public ip', 'network', 'address', 'geo', 'location'],
  component: () => import('./my-ip.vue'),
  icon: World,
  createdAt: new Date('2024-01-20'),
});
