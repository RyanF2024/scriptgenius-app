import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi, beforeAll, afterAll } from 'vitest';
import { server } from '../mocks/server';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    forEach: vi.fn(),
    entries: vi.fn(),
    keys: vi.fn(),
    values: vi.fn(),
  }),
  usePathname: () => '/',
  useSelectedLayoutSegment: vi.fn().mockReturnValue(null),
  useSelectedLayoutSegments: vi.fn().mockReturnValue([]),
}));

// Mock next-auth/react
vi.mock('next-auth/react', () => ({
  useSession: () => ({
    data: null,
    status: 'unauthenticated',
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

// Mock next/head
vi.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: Array<React.ReactElement> }) => {
    return React.createElement(React.Fragment, null, children);
  },
}));

// Start the mock server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

// Reset any request handlers that we may add during the tests
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

// Clean up after all tests are done
afterAll(() => server.close());

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverStub;

// Mock IntersectionObserver
class IntersectionObserverStub {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.IntersectionObserver = IntersectionObserverStub as any;

// Mock scroll-related functions
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.scrollTo = vi.fn();

// Mock console.error to fail tests on React warnings
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  originalError(...args);
  // Only throw in CI to avoid breaking local development
  if (process.env.CI) {
    throw new Error('Console error was called. This is not allowed in tests.');
  }
};

console.warn = (...args) => {
  originalWarn(...args);
  // Optionally throw on warnings in CI
  // if (process.env.CI) {
  //   throw new Error('Console warning was called. This is not allowed in tests.');
  // }
};

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
