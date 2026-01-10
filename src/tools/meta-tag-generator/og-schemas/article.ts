import type { OGSchemaType } from '../OGSchemaType.type';

export const article: OGSchemaType = {
  name: 'tools.og-meta-generator.section.article',
  elements: [
    {
      type: 'input',
      label: 'tools.og-meta-generator.article.published.label',
      key: 'article:published_time',
      placeholder: 'tools.og-meta-generator.article.published.placeholder',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.article.modified.label',
      key: 'article:modified_time',
      placeholder: 'tools.og-meta-generator.article.modified.placeholder',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.article.expiration.label',
      key: 'article:expiration_time',
      placeholder: 'tools.og-meta-generator.article.expiration.placeholder',
    },
    { type: 'input', label: 'tools.og-meta-generator.article.author.label', key: 'article:author', placeholder: 'tools.og-meta-generator.article.author.placeholder' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.article.section.label',
      key: 'article:section',
      placeholder: 'tools.og-meta-generator.article.section.placeholder',
    },
    { type: 'input', label: 'tools.og-meta-generator.article.tag.label', key: 'article:tag', placeholder: 'tools.og-meta-generator.article.tag.placeholder' },
  ],
};
