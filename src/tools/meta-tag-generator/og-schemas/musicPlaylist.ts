import type { OGSchemaType } from '../OGSchemaType.type';

export const musicPlaylist: OGSchemaType = {
  name: 'tools.og-meta-generator.section.musicPlaylist',
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
    { type: 'input', label: 'tools.og-meta-generator.music.creator.label', key: 'music:creator', placeholder: 'tools.og-meta-generator.music.creator.placeholder' },
  ],
};
