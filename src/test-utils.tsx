import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { renderHook as rtlRenderHook } from '@testing-library/react';
import type { RenderHookOptions, RenderHookResult } from '@testing-library/react';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { NextRouter } from 'next/router';
import { vi, Mock } from 'vitest';

const mockRouter: NextRouter = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
  push: vi.fn(),
  replace: vi.fn(),
  reload: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(() => Promise.resolve()),
  beforePopState: vi.fn(),
  events: {
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
};

const AllProviders = ({ children }: { children: ReactNode }) => {
  return (
    <AppRouterContext.Provider
      value={{
        push: () => Promise.resolve(true),
        replace: () => Promise.resolve(true),
        refresh: () => Promise.resolve(),
        prefetch: () => Promise.resolve(),
        back: () => {},
        forward: () => {},
        ...mockRouter,
      }}
    >
      {children}
    </AppRouterContext.Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllProviders, ...options });

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Custom renderHook with proper typing
export function renderHook<TProps, TResult>(
  callback: (props: TProps) => TResult,
  options?: Omit<RenderHookOptions<TProps>, 'wrapper'>
): RenderHookResult<TResult, TProps> {
  return rtlRenderHook(callback, {
    ...options,
    wrapper: AllProviders,
  });
}

export const mockNextRouter = (router: Partial<NextRouter> = {}) => ({
  ...mockRouter,
  ...router,
});
