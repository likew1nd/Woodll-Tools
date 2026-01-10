import { defineThemes } from './theme.models';

export const { themes: appThemes, useTheme: useAppTheme } = defineThemes({
  light: {
    background: '#f1f5ff',
    text: {
      baseColor: '#0f172a',
      mutedColor: '#64748b',
    },
    default: {
      color: 'rgba(15, 23, 42, 0.05)',
      colorHover: 'rgba(15, 23, 42, 0.1)',
      colorPressed: 'rgba(15, 23, 42, 0.2)',
    },
    primary: {
      color: '#7c5cff',
      colorHover: '#8f78ff',
      colorPressed: '#6b4cff',
      colorFaded: '#7c5cff30',
    },
    warning: {
      color: '#f59e0b',
      colorHover: '#f59e0b',
      colorPressed: '#f59e0b',
      colorFaded: '#f59e0b2f',
    },
    success: {
      color: '#18a058',
      colorHover: '#36ad6a',
      colorPressed: '#0c7a43',
      colorFaded: '#18a0582f',
    },
    error: {
      color: '#d03050',
      colorHover: '#de576d',
      colorPressed: '#ab1f3f',
      colorFaded: '#d030502a',
    },
  },
  dark: {
    background: '#0a0f1a',
    text: {
      baseColor: '#e2e8f0',
      mutedColor: '#9aa4b2',
    },
    default: {
      color: 'rgba(148, 163, 184, 0.1)',
      colorHover: 'rgba(148, 163, 184, 0.16)',
      colorPressed: 'rgba(148, 163, 184, 0.24)',
    },
    primary: {
      color: '#7f2bff',
      colorHover: '#9a5bff',
      colorPressed: '#6b16ff',
      colorFaded: '#7f2bff55',
    },
    warning: {
      color: '#f59e0b',
      colorHover: '#f59e0b',
      colorPressed: '#f59e0b',
      colorFaded: '#f59e0b2f',
    },
    success: {
      color: '#18a058',
      colorHover: '#36ad6a',
      colorPressed: '#0c7a43',
      colorFaded: '#18a0582f',
    },
    error: {
      color: '#e88080',
      colorHover: '#e98b8b',
      colorPressed: '#e57272',
      colorFaded: '#e8808029',
    },
  },
});
