// Custom testing utilities
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { SWRConfig } from 'swr';

// Mock auth context for testing
const mockAuthContext = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshAuth: jest.fn(),
  updateUser: jest.fn(),
  checkAuth: jest.fn(),
};

// Test providers wrapper
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <SWRConfig
      value={{
        dedupingInterval: 0,
        provider: () => new Map(),
      }}
    >
      <AuthProvider>
        {children}
      </AuthProvider>
    </SWRConfig>
  );
};

// Custom render function
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock authenticated user
export const mockAuthenticatedUser = {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  displayName: 'Test User',
  roles: ['subscriber'],
  capabilities: {
    read: true,
    edit_posts: false,
  },
  avatar: 'https://example.com/avatar.jpg',
  description: 'Test user description',
  registeredDate: '2023-01-01T00:00:00Z',
};

// Mock authenticated context
export const mockAuthenticatedContext = {
  ...mockAuthContext,
  user: mockAuthenticatedUser,
  isAuthenticated: true,
  token: 'mock-jwt-token',
};

// Custom render with authenticated user
export const renderWithAuth = (
  ui: ReactElement,
  authContext = mockAuthenticatedContext,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
    <SWRConfig
      value={{
        dedupingInterval: 0,
        provider: () => new Map(),
      }}
    >
      <div data-testid="mock-auth-provider">
        {children}
      </div>
    </SWRConfig>
  );

  // Mock the useAuth hook
  jest.doMock('@/contexts/AuthContext', () => ({
    ...jest.requireActual('@/contexts/AuthContext'),
    useAuth: () => authContext,
  }));

  return render(ui, { wrapper: AuthWrapper, ...options });
};

// Async utilities
export const waitForLoadingToFinish = () =>
  new Promise(resolve => setTimeout(resolve, 0));

// Mock API responses
export const mockApiResponse = <T>(data: T, delay = 100) => {
  return new Promise<T>(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// Mock fetch with response
export const mockFetch = (response: any, ok = true, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok,
    status,
    json: jest.fn().mockResolvedValue(response),
    text: jest.fn().mockResolvedValue(JSON.stringify(response)),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  });
};

// Mock WordPress API responses
export const mockWordPressPost = {
  id: 1,
  title: { rendered: 'Test Post' },
  slug: 'test-post',
  content: { rendered: '<p>Test content</p>' },
  excerpt: { rendered: 'Test excerpt' },
  date: '2023-01-01T00:00:00Z',
  author: 1,
  categories: [1],
  tags: [1],
  featured_media: 1,
  _embedded: {
    author: [{
      id: 1,
      name: 'Test Author',
      slug: 'test-author',
      avatar_urls: { 96: 'https://example.com/avatar.jpg' },
    }],
    'wp:featuredmedia': [{
      id: 1,
      source_url: 'https://example.com/image.jpg',
      alt_text: 'Test image',
    }],
    'wp:term': [
      [{
        id: 1,
        name: 'Test Category',
        slug: 'test-category',
      }],
      [{
        id: 1,
        name: 'Test Tag',
        slug: 'test-tag',
      }],
    ],
  },
};

export const mockWordPressCategory = {
  id: 1,
  name: 'Test Category',
  slug: 'test-category',
  description: 'Test category description',
  count: 5,
  parent: 0,
};

// Mock SWR responses
export const mockSWRResponse = <T>(data: T, error?: Error) => {
  return {
    data,
    error,
    isLoading: false,
    mutate: jest.fn(),
  };
};

// Mock intersection observer entries
export const createMockIntersectionObserverEntry = (
  isIntersecting: boolean = true
) => ({
  isIntersecting,
  target: document.createElement('div'),
  intersectionRatio: isIntersecting ? 1 : 0,
  boundingClientRect: {} as DOMRectReadOnly,
  intersectionRect: {} as DOMRectReadOnly,
  rootBounds: {} as DOMRectReadOnly,
  time: Date.now(),
});

// Re-export everything from React Testing Library
export * from '@testing-library/react';
export { customRender as render };