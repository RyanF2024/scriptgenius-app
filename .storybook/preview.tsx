import type { Preview, ReactRenderer } from '@storybook/react';
import { ThemeProvider } from 'next-themes';
import { useEffect } from 'react';
import React, { FC, ReactNode } from 'react';
import { themes } from '@storybook/theming';

// Import global styles
import '../src/app/globals.css';

// Add type for theme decorator props
interface ThemeDecoratorProps {
  children: ReactNode;
  theme: string;
}

// Theme decorator component
const ThemeDecorator: FC<ThemeDecoratorProps> = ({ children, theme }) => {
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
        {children}
      </div>
    </ThemeProvider>
  );
};

// Storybook decorator with proper types
const withThemeDecorator = (Story, context: any) => {
  const theme = context.globals.theme || 'light';
  
  return (
    <ThemeDecorator theme={theme}>
      <Story {...context} />
    </ThemeDecorator>
  );
};

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      expanded: true,
      sort: 'requiredFirst',
    },
    backgrounds: {
      disable: true, // Disable default background addon as we handle it with our theme
    },
    darkMode: {
      darkClass: 'dark',
      lightClass: 'light',
      stylePreview: true,
      classTarget: 'html',
    },
    layout: 'centered',
    docs: {
      theme: themes.light,
      toc: {
        headingSelector: 'h2, h3',
        title: 'Table of Contents',
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Introduction', 'Components', 'Pages', 'Templates'],
        locales: 'en-US',
      },
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
  decorators: [withThemeDecorator],
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'contrast',
        items: [
          { value: 'light', icon: 'sun', title: 'Light' },
          { value: 'dark', icon: 'moon', title: 'Dark' },
        ],
        showName: true,
        dynamicTitle: true,
      },
    },
  },
};

export default preview;
