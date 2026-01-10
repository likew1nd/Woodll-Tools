import type { OGSchemaType } from '../OGSchemaType.type';

const typeOptions = [
  { label: 'tools.og-meta-generator.website.type.website', value: 'website' },
  { label: 'tools.og-meta-generator.website.type.article', value: 'article' },
  { label: 'tools.og-meta-generator.website.type.book', value: 'book' },
  { label: 'tools.og-meta-generator.website.type.profile', value: 'profile' },
  {
    type: 'group',
    label: 'tools.og-meta-generator.website.typeGroup.music',
    key: 'Music',
    children: [
      { label: 'tools.og-meta-generator.website.type.musicSong', value: 'music.song' },
      { label: 'tools.og-meta-generator.website.type.musicAlbum', value: 'music.album' },
      { label: 'tools.og-meta-generator.website.type.musicPlaylist', value: 'music.playlist' },
      { label: 'tools.og-meta-generator.website.type.musicRadio', value: 'music.radio_station' },
    ],
  },
  {
    type: 'group',
    label: 'tools.og-meta-generator.website.typeGroup.video',
    key: 'Video',
    children: [
      { label: 'tools.og-meta-generator.website.type.videoMovie', value: 'video.movie' },
      { label: 'tools.og-meta-generator.website.type.videoEpisode', value: 'video.episode' },
      { label: 'tools.og-meta-generator.website.type.videoTvShow', value: 'video.tv_show' },
      { label: 'tools.og-meta-generator.website.type.videoOther', value: 'video.other' },
    ],
  },
];

export const website: OGSchemaType = {
  name: 'tools.og-meta-generator.section.general',
  elements: [
    {
      type: 'select',
      label: 'tools.og-meta-generator.website.pageType.label',
      placeholder: 'tools.og-meta-generator.website.pageType.placeholder',
      key: 'type',
      options: typeOptions,
    },
    { type: 'input', label: 'tools.og-meta-generator.website.title.label', placeholder: 'tools.og-meta-generator.website.title.placeholder', key: 'title' },
    {
      type: 'input',
      label: 'tools.og-meta-generator.website.description.label',
      placeholder: 'tools.og-meta-generator.website.description.placeholder',
      key: 'description',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.website.url.label',
      placeholder: 'tools.og-meta-generator.website.url.placeholder',
      key: 'url',
    },
  ],
};
