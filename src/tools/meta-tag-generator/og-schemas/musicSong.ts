import type { OGSchemaType } from '../OGSchemaType.type';

export const musicSong: OGSchemaType = {
  name: 'tools.og-meta-generator.section.musicSong',
  elements: [
    { type: 'input', label: 'tools.og-meta-generator.music.duration.label', placeholder: 'tools.og-meta-generator.music.duration.placeholder', key: 'music:duration' },
    { type: 'input', label: 'tools.og-meta-generator.music.album.label', placeholder: 'tools.og-meta-generator.music.album.placeholder', key: 'music:album' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.music.disc.label',
      placeholder: 'tools.og-meta-generator.music.disc.placeholder',
      key: 'music:album:disk',
    },
    { type: 'input', label: 'tools.og-meta-generator.music.track.label', placeholder: 'tools.og-meta-generator.music.track.placeholder', key: 'music:album:track' },
    {
      type: 'input-multiple',
      label: 'tools.og-meta-generator.music.musician.label',
      placeholder: 'tools.og-meta-generator.music.musician.placeholder',
      key: 'music:musician',
    },
  ],
};
