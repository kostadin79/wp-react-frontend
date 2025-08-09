// Jest DOM setup
import '@testing-library/jest-dom';

// Polyfill for MSW
import { TextEncoder, TextDecoder } from 'util';
import 'web-streams-polyfill/polyfill';

Object.assign(global, {
  TextDecoder,
  TextEncoder,
});

// Mock Response for MSW
if (!globalThis.Response) {
  globalThis.Response = class MockResponse {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this.body = body;
      this.status = init?.status || 200;
      this.ok = this.status >= 200 && this.status < 300;
      this.headers = new Headers(init?.headers);
    }
    async json() {
      return JSON.parse(this.body as string);
    }
    async text() {
      return this.body as string;
    }
  } as any;
}

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
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

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock fetch
global.fetch = jest.fn();

// Mock Image
Object.defineProperty(window, 'Image', {
  value: class {
    constructor() {
      setTimeout(() => {
        this.onload();
      }, 100);
    }
  },
});

// Mock scrollTo
global.scrollTo = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to ignore a specific log level
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '';
  },
}));

// Mock Next.js Image component
jest.mock('next/image', () => {
  const React = require('react');
  return function MockImage({ src, alt, ...props }: any) {
    return React.createElement('img', { src, alt, ...props });
  };
});

// Mock Next.js Link component
jest.mock('next/link', () => {
  const React = require('react');
  return function MockLink({ children, href, ...props }: any) {
    return React.createElement('a', { href, ...props }, children);
  };
});

// Add global test utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toBeDisabled(): R;
    }
  }
}