import type { Preview } from '@storybook/react';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import React from 'react';

// Import global styles
import '../src/app/globals.css';

// Simple theme decorator
const withThemeDecorator = (Story, context) => {
  const theme = context.globals.theme || 'light';
  
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [theme]);
  
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={theme}
      enableSystem={false}
      disableTransitionOnChange
    >
      <div className={`min-h-screen p-8 ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-white'}`}>
        <Story {...context} />
      </div>
    </ThemeProvider>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
      expanded: true,
      sort: 'requiredFirst',
    },
    options: {
      storySort: {
        order: [
          'Introduction',
          'Documentation',
          'Foundations',
          'Components',
          'Pages',
          'Examples',
        ],
        method: 'alphabetical',
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
        { name: 'gray', value: '#f3f4f6' },
        { name: 'black', value: '#000000' },
      ],
    },
    layout: 'centered',
    docs: {
      source: {
        type: 'code',
      },
      autodocs: 'tag',
    },
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'circlehollow',
        items: [
          { value: 'light', icon: 'circlehollow', title: 'Light' },
          { value: 'dark', icon: 'circle', title: 'Dark' },
        ],
        showName: true,
      },
    },
  },
  decorators: [withThemeDecorator],
};

export default preview;
