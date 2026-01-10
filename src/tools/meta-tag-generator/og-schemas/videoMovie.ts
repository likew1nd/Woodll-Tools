import type { OGSchemaType } from '../OGSchemaType.type';

export const videoMovie: OGSchemaType = {
  name: 'tools.og-meta-generator.section.videoMovie',
  elements: [
    {
      type: 'input-multiple',
      label: 'tools.og-meta-generator.video.actor.label',
      key: 'video:actor',
      placeholder: 'tools.og-meta-generator.video.actor.placeholder',
    },
    // { type: 'input', label: 'Actor role', key: 'video:actor:role', placeholder: 'The role they played...' },
    {
      type: 'input-multiple',
      label: 'tools.og-meta-generator.video.director.label',
      key: 'video:director',
      placeholder: 'tools.og-meta-generator.video.director.placeholder',
    },
    { type: 'input-multiple', label: 'tools.og-meta-generator.video.writer.label', key: 'video:writer', placeholder: 'tools.og-meta-generator.video.writer.placeholder' },
    { type: 'input', label: 'tools.og-meta-generator.video.duration.label', key: 'video:duration', placeholder: 'tools.og-meta-generator.video.duration.placeholder' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.video.releaseDate.label',
      key: 'video:release_date',
      placeholder: 'tools.og-meta-generator.video.releaseDate.placeholder',
    },
    { type: 'input', label: 'tools.og-meta-generator.video.tag.label', key: 'video:tag', placeholder: 'tools.og-meta-generator.video.tag.placeholder' },
  ],
};
