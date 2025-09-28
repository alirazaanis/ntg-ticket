import { createTheme, MantineColorsTuple } from '@mantine/core';

const blue: MantineColorsTuple = [
  '#f0f2ff', // Lightest - based on #667eea
  '#e1e7ff', // Very light
  '#c7d2fe', // Light
  '#a5b4fc', // Lighter
  '#8b9cf8', // Light-medium
  '#667eea', // Primary color from landing page
  '#5a67d8', // Medium
  '#4c51bf', // Medium-dark
  '#434190', // Dark
  '#3c366b', // Darkest
];

export const theme = createTheme({
  primaryColor: 'blue',
  colors: {
    blue,
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
