import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { Toaster } from '@/components/ui/toaster';
import { OnboardingProvider } from '@/contexts/OnboardingContext';

const createMockRouter = (router: Partial<NextRouter>): NextRouter => ({
  basePath: '',
  pathname: '/',
  route: '/',
  query: {},
  asPath: '/',
  push: jest.fn(),
  replace: jest.fn(),
  reload: jest.fn(),
  back: jest.fn(),
  prefetch: jest.fn().mockResolvedValue(undefined),
  beforePopState: jest.fn(),
  events: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
  },
  isFallback: false,
  isLocaleDomain: false,
  isReady: true,
  isPreview: false,
  ...router,
});

type AllTheProvidersProps = {
  children: React.ReactNode;
  router?: Partial<NextRouter>;
};

const AllTheProviders = ({ children, router }: AllTheProvidersProps) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <RouterContext.Provider value={createMockRouter(router || {})}>
      <QueryClientProvider client={queryClient}>
        <OnboardingProvider>
          {children}
          <Toaster />
        </OnboardingProvider>
      </QueryClientProvider>
    </RouterContext.Provider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { router?: Partial<NextRouter> }
) => {
  const { router, ...restOptions } = options || {};
  return render(ui, {
    wrapper: (props) => <AllTheProviders {...props} router={router} />,
    ...restOptions,
  });
};

export * from '@testing-library/react';
export { customRender as render };

export const mockOnboardingData = {
  fullName: 'John Doe',
  displayName: 'johndoe',
  timezone: 'America/New_York',
  avatarUrl: 'https://example.com/avatar.jpg',
  preferences: {
    theme: 'light',
    notifications: true,
    language: 'en',
  },
  goals: ['improve-scripting', 'increase-engagement'],
  completed: false,
};

export const mockSession = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
  },
  expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
};

export const mockSupabaseResponse = (data: any, error = null) => ({
  data,
  error,
  count: Array.isArray(data) ? data.length : null,
});

export const mockSupabaseError = (message: string) => ({
  message,
  details: 'Error details',
  hint: 'Error hint',
  code: 'ERROR_CODE',
});
