import type { OGSchemaType } from '../OGSchemaType.type';
import { videoMovie } from './videoMovie';

export const videoEpisode: OGSchemaType = {
  name: 'tools.og-meta-generator.section.videoEpisode',
  elements: [
    ...videoMovie.elements,
    { type: 'input', label: 'tools.og-meta-generator.video.series.label', key: 'video:series', placeholder: 'tools.og-meta-generator.video.series.placeholder' },
  ],
};
