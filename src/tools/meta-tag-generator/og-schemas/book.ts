import type { OGSchemaType } from '../OGSchemaType.type';

export const book: OGSchemaType = {
  name: 'tools.og-meta-generator.section.book',
  elements: [
    { type: 'input', label: 'tools.og-meta-generator.book.author.label', key: 'book:author', placeholder: 'tools.og-meta-generator.book.author.placeholder' },
    { type: 'input', label: 'tools.og-meta-generator.book.isbn.label', key: 'book:isbn', placeholder: 'tools.og-meta-generator.book.isbn.placeholder' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.book.releaseDate.label',
      key: 'book:release_date',
      placeholder: 'tools.og-meta-generator.book.releaseDate.placeholder',
    },
    { type: 'input', label: 'tools.og-meta-generator.book.tag.label', key: 'book:tag', placeholder: 'tools.og-meta-generator.book.tag.placeholder' },
  ],
};
