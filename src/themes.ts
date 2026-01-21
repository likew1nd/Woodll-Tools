import type { GlobalThemeOverrides } from 'naive-ui';

export const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#ec4899',
    primaryColorHover: '#f472b6',
    primaryColorPressed: '#db2777',
    primaryColorSuppl: '#f472b6',
  },
  Menu: {
    itemHeight: '32px',
  },

  Layout: {
    color: '#f1f5ff',
    siderColor: '#ffffff',
    siderBorderColor: '#cbd5f5',
  },

  Card: {
    color: '#ffffff',
    borderColor: '#cbd5f5',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px' },
    },
  },
};

export const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#22d3ee',
    primaryColorHover: '#4ee3f5',
    primaryColorPressed: '#06b6d4',
    primaryColorSuppl: '#4ee3f5',
  },

  AutoComplete: {
    peers: {
      InternalSelectMenu: { height: '500px', color: '#0f172a' },
    },
  },

  Menu: {
    itemHeight: '32px',
  },

  Layout: {
    color: '#0b0f15',
    siderColor: '#0f172a',
    siderBorderColor: 'transparent',
  },

  Card: {
    color: '#121826',
    borderColor: '#1f2937',
  },

  Table: {
    tdColor: '#121826',
    thColor: '#1f2937',
  },
};
