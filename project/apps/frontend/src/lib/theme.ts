import { createTheme, MantineColorsTuple } from '@mantine/core';

const red: MantineColorsTuple = [
  '#fef2f2', // Lightest - based on #C52720
  '#fee2e2', // Very light
  '#fecaca', // Light
  '#fca5a5', // Lighter
  '#f87171', // Light-medium
  '#C52720', // Primary color
  '#b91c1c', // Medium
  '#991b1b', // Medium-dark
  '#7f1d1d', // Dark
  '#450a0a', // Darkest
];

export const theme = createTheme({
  primaryColor: 'red',
  colors: {
    red,
  },
  fontFamily:
    'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
  fontFamilyMonospace: 'Monaco, Courier, monospace',
  headings: {
    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif',
    fontWeight: '600',
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  radius: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
  },
  spacing: {
    xs: '0.5rem',
    sm: '0.75rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  breakpoints: {
    xs: '36em',
    sm: '48em',
    md: '62em',
    lg: '75em',
    xl: '88em',
  },
  components: {
    Button: {
      defaultProps: {
        size: 'md',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'md',
      },
    },
    Select: {
      defaultProps: {
        size: 'md',
      },
    },
    Textarea: {
      defaultProps: {
        size: 'md',
      },
    },
  },
});
