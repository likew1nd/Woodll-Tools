import type { OGSchemaType } from '../OGSchemaType.type';

export const profile: OGSchemaType = {
  name: 'tools.og-meta-generator.section.profile',
  elements: [
    {
      type: 'input',
      label: 'tools.og-meta-generator.profile.firstName.label',
      placeholder: 'tools.og-meta-generator.profile.firstName.placeholder',
      key: 'profile:first_name',
    },
    {
      type: 'input',
      label: 'tools.og-meta-generator.profile.lastName.label',
      placeholder: 'tools.og-meta-generator.profile.lastName.placeholder',
      key: 'profile:last_name',
    },
    { type: 'input', label: 'tools.og-meta-generator.profile.username.label', placeholder: 'tools.og-meta-generator.profile.username.placeholder', key: 'profile:username' },
    { type: 'input', label: 'tools.og-meta-generator.profile.gender.label', placeholder: 'tools.og-meta-generator.profile.gender.placeholder', key: 'profile:gender' },
  ],
};
