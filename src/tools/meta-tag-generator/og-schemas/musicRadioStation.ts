import type { OGSchemaType } from '../OGSchemaType.type';

export const musicRadioStation: OGSchemaType = {
  name: 'tools.og-meta-generator.section.musicRadioStation',
  elements: [
    { type: 'input', label: 'tools.og-meta-generator.music.creator.label', key: 'music:creator', placeholder: 'tools.og-meta-generator.music.creator.placeholder' },
  ],
};
