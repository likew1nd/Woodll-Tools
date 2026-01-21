import { Photo } from '@vicons/tabler';
import { defineTool } from '../tool';
import { translate } from '@/plugins/i18n.plugin';

export const tool = defineTool({
  name: translate('tools.png-to-ico.title'),
  path: '/png-to-ico',
  description: translate('tools.png-to-ico.description'),
  keywords: ['png', 'ico', 'icon', 'convert', 'favicon', 'multi-size'],
  component: () => import('./png-to-ico.vue'),
  icon: Photo,
  createdAt: new Date('2024-01-20'),
});
