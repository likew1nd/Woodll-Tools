import { Server } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.vps-remaining-value.title'),
  path: '/vps-remaining-value',
  description: translate('tools.vps-remaining-value.description'),
  keywords: ['vps', 'value', 'remaining', 'prorate', 'calculator', 'server', 'cost'],
  component: () => import('./vps-remaining-value.vue'),
  icon: Server,
  createdAt: new Date('2026-02-05'),
});
