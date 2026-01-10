import { defineThemes } from '../theme/theme.models';

export const { useTheme } = defineThemes({
  dark: {
    backgroundColor: '#121826',
    borderColor: '#1f2937',
  },
  light: {
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
  },
});
