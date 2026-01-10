import type { OGSchemaType } from '../OGSchemaType.type';

export const twitter: OGSchemaType = {
  name: 'tools.og-meta-generator.section.twitter',
  elements: [
    {
      type: 'select',
      options: [
        { label: 'tools.og-meta-generator.twitter.card.summary', value: 'summary' },
        { label: 'tools.og-meta-generator.twitter.card.summaryLargeImage', value: 'summary_large_image' },
        { label: 'tools.og-meta-generator.twitter.card.application', value: 'app' },
        { label: 'tools.og-meta-generator.twitter.card.player', value: 'player' },
      ],
      label: 'tools.og-meta-generator.twitter.card.label',
      placeholder: 'tools.og-meta-generator.twitter.card.placeholder',
      key: 'twitter:card',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.twitter.site.label',
      placeholder: 'tools.og-meta-generator.twitter.site.placeholder',
      key: 'twitter:site',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.twitter.creator.label',
      placeholder: 'tools.og-meta-generator.twitter.creator.placeholder',
      key: 'twitter:creator',
    },
  ],
};
