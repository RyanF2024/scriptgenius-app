import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions, fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@testing-library/react';
import { ThemeProvider } from 'next-themes';
import { SessionProvider } from 'next-auth/react';
import { NextIntlClientProvider } from 'next-intl';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { Session } from 'next-auth';
import { NextRouter } from 'next/router';
import { RouterContext } from 'next/dist/shared/lib/router-context.shared-runtime';

// Mock Next.js router
const mockRouter: Partial<NextRouter> = {
  basePath: '',
  pathname: '/',
  route: '/',
  asPath: '/',
  query: {},
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
};

// Mock session
const mockSession: Session = {
  user: {
    name: 'Test User',
    email: 'test@example.com',
    image: 'https://example.com/avatar.jpg',
  },
  expires: '2025-01-01T00:00:00.000Z',
};

// Mock Apollo Client
const createMockApolloClient = () => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    uri: 'http://localhost:3000/api/graphql',
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    },
  });
};

// Create a custom render function that includes all necessary providers
const AllTheProviders = ({ 
  children,
  session = mockSession,
  router = mockRouter,
  mocks = [],
  addTypename = false,
}: { 
  children: ReactNode;
  session?: Session | null;
  router?: Partial<NextRouter>;
  mocks?: MockedResponse[];
  addTypename?: boolean;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0,
      },
    },
  });

  return (
    <RouterContext.Provider value={router as NextRouter}>
      <ApolloProvider client={createMockApolloClient()}>
        <MockedProvider mocks={mocks} addTypename={addTypename}>
          <QueryClientProvider client={queryClient}>
            <NextIntlClientProvider locale="en" messages={{}}>
              <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
                <SessionProvider session={session}>
                  {children}
                </SessionProvider>
              </ThemeProvider>
            </NextIntlClientProvider>
          </QueryClientProvider>
        </MockedProvider>
      </ApolloProvider>
    </RouterContext.Provider>
  );
};

// Custom render with all providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & {
    session?: Session | null;
    router?: Partial<NextRouter>;
    mocks?: MockedResponse[];
    addTypename?: boolean;
  }
) => {
  const { session, router, mocks, addTypename, ...restOptions } = options || {};
  
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders 
        session={session}
        router={router}
        mocks={mocks}
        addTypename={addTypename}
      >
        {children}
      </AllTheProviders>
    ),
    ...restOptions,
  });
};

// Helper to wait for loading to finish
const waitForLoadingToFinish = (container?: HTMLElement) =>
  waitFor(
    () => {
      const elements = (container || document).querySelectorAll(
        '[role="progressbar"], [data-loading="true"]'
      );
      expect(elements.length).toBe(0);
    },
    { timeout: 4000 }
  );

// Mock GraphQL errors
const createGraphQLError = (message: string, extensions?: Record<string, any>) => ({
  message,
  locations: [{ line: 1, column: 1 }],
  path: ['test'],
  extensions: {
    code: 'INTERNAL_SERVER_ERROR',
    ...extensions,
  },
});

// Mock GraphQL response
const mockGraphQLResponse = (
  query: any,
  data: any,
  variables: any = {},
  error?: GraphQLError
) => ({
  request: {
    query,
    variables,
  },
  result: error ? undefined : { data },
  error: error ? new Error(error.message) : undefined,
  ...(error && { errors: [error] }),
});

// Re-export everything from @testing-library/react
export * from '@testing-library/react';

// Export our custom render and utilities
export {
  customRender as render,
  waitForLoadingToFinish,
  createGraphQLError,
  mockGraphQLResponse,
  userEvent,
  fireEvent,
  screen,
  waitFor,
};

// Custom matchers
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string | RegExp): R;
      toBeInViewport(): R;
      toBeVisible(): R;
      toHaveFocus(): R;
      toHaveFormValues(expectedValues: Record<string, any>): R;
      toHaveAccessibleDescription(description?: string | RegExp): R;
      toHaveAccessibleName(name?: string | RegExp): R;
      toBeValid(): R;
      toBeInvalid(): R;
      toBeRequired(): R;
      toHaveValue(value: string | string[] | number | null): R;
      toHaveDisplayValue(value: string | string[] | RegExp): R;
      toBeChecked(): R;
      toBePartiallyChecked(): R;
      toHaveClass(...classNames: string[]): R;
      toHaveAttribute(attr: string, value?: any): R;
      toHaveStyle(css: string | Record<string, any>): R;
    }
  }
}

expect.extend({
  toBeInTheDocument(element: HTMLElement | null) {
    if (!element) {
      return {
        message: () => `expected element to be in document`,
        pass: false,
      };
    }
    return {
      message: () => `expected element not to be in document`,
      pass: document.body.contains(element),
    };
  },
  
  toHaveTextContent(element: HTMLElement | null, text: string | RegExp) {
    if (!element) {
      return {
        message: () => `element is null`,
        pass: false,
      };
    }
    
    const hasText = (node: Element) => {
      if (typeof text === 'string') {
        return node.textContent?.includes(text) ?? false;
      }
      return text.test(node.textContent || '');
    };
    
    const nodeHasText = hasText(element);
    const childrenDoNotHaveText = Array.from(element.children).every(
      (child) => !hasText(child as Element)
    );
    const pass = nodeHasText && childrenDoNotHaveText;

    if (pass) {
      return {
        message: () => `expected element not to have text content: ${text}`,
        pass: true,
      };
    }
    
    return {
      message: () => `expected element to have text content: ${text}`,
      pass: false,
    };
  },
  
  // Additional custom matchers can be added here
  toBeInViewport(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const isInViewport = (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
    
    return {
      pass: isInViewport,
      message: () => `expected element ${isInViewport ? 'not ' : ''}to be in viewport`,
    };
  },
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Mock IntersectionObserver
class IntersectionObserver {
  readonly root: Element | null = null;
  readonly rootMargin: string = '';
  readonly thresholds: ReadonlyArray<number> = [];
  
  constructor() {}
  
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve() {}
}

// Mock scrollIntoView
element.scrollIntoView = jest.fn();

// Add mocks to global scope
global.ResizeObserver = ResizeObserver;
global.IntersectionObserver = IntersectionObserver;

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Mock console.error to fail tests on React warnings and errors
  console.error = (...args) => {
    originalConsoleError(...args);
    throw new Error('Console error was called');
  };
  
  // Mock console.warn to fail tests on warnings
  console.warn = (...args) => {
    originalConsoleWarn(...args);
    throw new Error('Console warning was called');
  };
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({
      children,
    }: {
      children: Array<React.ReactElement>;
    }) => {
      return <>{children}</>;
    },
  };
});

// Mock next/image
jest.mock('next/image', () => {
  return function Image({
    src,
    alt,
    width,
    height,
  }: {
    src: string;
    alt: string;
    width: number;
    height: number;
  }) {
    return <img src={src} alt={alt} width={width} height={height} />;
  };
});
