import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';
import '@testing-library/jest-dom/vitest';
import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers';

// Extend expect with jest-dom matchers
declare global {
  namespace Vi {
    interface JestAssertion<T = any>
      extends jest.Matchers<void, T>,
        TestingLibraryMatchers<T, void> {}
  }
}

expect.extend(matchers);

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
  usePathname: vi.fn().mockReturnValue('/'),
  useSelectedLayoutSegment: vi.fn().mockReturnValue(null),
  useSelectedLayoutSegments: vi.fn().mockReturnValue([]),
}));

// Mock next/head
vi.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: Array<React.ReactElement> }) => 
    React.createElement(React.Fragment, null, children),
}));

// Mock next/image
vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    const { src, alt, width, height, ...rest } = props;
    return React.createElement('img', {
      src: src,
      alt: alt || '',
      width: width || '100%',
      height: height || 'auto',
      loading: 'lazy',
      ...rest,
    });
  },
}));

// Mock next/font
vi.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter',
    style: { fontFamily: 'Inter' },
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver = window.ResizeObserver || ResizeObserverStub;

// Mock IntersectionObserver
class IntersectionObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.IntersectionObserver = window.IntersectionObserver || IntersectionObserverStub;

// Mock sessionStorage
const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Cleanup after each test
afterEach(() => {
  cleanup();
  window.sessionStorage.clear();
  vi.clearAllMocks();
});

// Mock console methods
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  originalConsoleError(...args);
  throw new Error('Console error was called. This is not allowed in tests.');
};

console.warn = (...args) => {
  originalConsoleWarn(...args);
  // Optionally throw on warnings as well
  // throw new Error('Console warning was called. This is not allowed in tests.');
};

// Mock window.scrollTo
window.scrollTo = vi.fn();
