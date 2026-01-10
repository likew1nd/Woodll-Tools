import { defineThemes } from '../theme/theme.models';
import { appThemes } from '../theme/themes';

const sizes = {
  small: {
    height: '28px',
    fontSize: '12px',
  },
  medium: {
    height: '34px',
    fontSize: '14px',
  },
  large: {
    height: '40px',
    fontSize: '16px',
  },
};

export const { useTheme } = defineThemes({
  dark: {
    sizes,

    backgroundColor: '#0f172a',
    borderColor: '#1f2937',
    dropdownShadow: 'rgba(0, 0, 0, 0.35) 0px 18px 40px',

    option: {
      hover: {
        backgroundColor: '#444444',
      },
      active: {
        textColor: appThemes.dark.primary.color,
      },
    },

    focus: {
      backgroundColor: '#111827',
    },
  },
  light: {
    sizes,

    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    dropdownShadow: 'rgba(15, 23, 42, 0.14) 0px 18px 40px',

    option: {
      hover: {
        backgroundColor: '#eee',
      },
      active: {
        textColor: appThemes.light.primary.color,
      },
    },

    focus: {
      backgroundColor: '#ffffff',
    },
  },
});
