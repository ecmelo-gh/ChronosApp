export const baseColors = {
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    900: '#14532d',
  },
  warning: {
    50: '#fffbeb',
    500: '#f59e0b',
    900: '#78350f',
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    900: '#7f1d1d',
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    900: '#1e3a8a',
  },
} as const

export const lightTheme = {
  colors: {
    // Background colors
    background: {
      primary: baseColors.gray[50],
      secondary: 'white',
      tertiary: baseColors.gray[100],
    },
    // Text colors
    text: {
      primary: baseColors.gray[900],
      secondary: baseColors.gray[700],
      tertiary: baseColors.gray[500],
      inverse: 'white',
    },
    // Border colors
    border: {
      primary: baseColors.gray[200],
      secondary: baseColors.gray[300],
    },
    // Component colors
    component: {
      active: baseColors.primary[500],
      hover: baseColors.primary[600],
      disabled: baseColors.gray[300],
    },
    // Status colors
    status: {
      success: baseColors.success[500],
      warning: baseColors.warning[500],
      error: baseColors.error[500],
      info: baseColors.info[500],
    },
    // Brand colors
    brand: baseColors.primary,
  },
} as const

export const darkTheme = {
  colors: {
    // Background colors
    background: {
      primary: baseColors.gray[900],
      secondary: baseColors.gray[800],
      tertiary: baseColors.gray[700],
    },
    // Text colors
    text: {
      primary: baseColors.gray[50],
      secondary: baseColors.gray[300],
      tertiary: baseColors.gray[400],
      inverse: baseColors.gray[900],
    },
    // Border colors
    border: {
      primary: baseColors.gray[700],
      secondary: baseColors.gray[600],
    },
    // Component colors
    component: {
      active: baseColors.primary[400],
      hover: baseColors.primary[300],
      disabled: baseColors.gray[600],
    },
    // Status colors
    status: {
      success: baseColors.success[500],
      warning: baseColors.warning[500],
      error: baseColors.error[500],
      info: baseColors.info[500],
    },
    // Brand colors
    brand: baseColors.primary,
  },
} as const
