import type { OGSchemaType } from '../OGSchemaType.type';

export const image: OGSchemaType = {
  name: 'tools.og-meta-generator.section.image',
  elements: [
    {
      type: 'input',
      label: 'tools.og-meta-generator.image.url.label',
      placeholder: 'tools.og-meta-generator.image.url.placeholder',
      key: 'image',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.image.alt.label',
      placeholder: 'tools.og-meta-generator.image.alt.placeholder',
      key: 'image:alt',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.image.width.label',
      placeholder: 'tools.og-meta-generator.image.width.placeholder',
      key: 'image:width',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.image.height.label',
      placeholder: 'tools.og-meta-generator.image.height.placeholder',
      key: 'image:height',
    },
  ],
};
