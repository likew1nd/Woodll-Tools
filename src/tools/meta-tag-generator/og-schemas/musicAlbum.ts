import type { OGSchemaType } from '../OGSchemaType.type';

export const musicAlbum: OGSchemaType = {
  name: 'tools.og-meta-generator.section.musicAlbum',
  elements: [
    { type: 'input', label: 'tools.og-meta-generator.music.song.label', key: 'music:song', placeholder: 'tools.og-meta-generator.music.song.placeholder' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.music.disc.label',
      key: 'music:song:disc',
      placeholder: 'tools.og-meta-generator.music.discReverse.placeholder',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.music.track.label',
      key: 'music:song:track',
      placeholder: 'tools.og-meta-generator.music.trackReverse.placeholder',
    },
    { type: 'input', label: 'tools.og-meta-generator.music.musician.label', key: 'music:musician', placeholder: 'tools.og-meta-generator.music.musician.placeholder' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.music.releaseDate.label',
      key: 'music:release_date',
      placeholder: 'tools.og-meta-generator.music.releaseDate.placeholder',
    },
  ],
};
