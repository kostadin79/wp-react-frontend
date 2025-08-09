import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { server } from '@/test/utils/msw-server';
import { usePosts, usePost, useCategories } from '../useWordPress';

// Setup MSW server
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// SWR wrapper for testing
const React = require('react');
const SWRWrapper = ({ children }: { children: React.ReactNode }) => 
  React.createElement(SWRConfig, 
    { value: { dedupingInterval: 0, provider: () => new Map() } }, 
    children
  );

describe('useWordPress hooks', () => {
  describe('usePosts', () => {
    it('fetches posts successfully', async () => {
      const { result } = renderHook(() => usePosts(), {
        wrapper: SWRWrapper,
      });

      // Initial state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.posts).toEqual([]);

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.posts).toHaveLength(10);
      expect(result.current.posts[0]).toMatchObject({
        id: expect.any(Number),
        title: expect.any(String),
        slug: expect.any(String),
      });
      expect(result.current.error).toBeUndefined();
    });

    it('handles posts with search parameters', async () => {
      const { result } = renderHook(() => usePosts({ search: 'test' }), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.posts).toBeDefined();
      expect(result.current.posts.length).toBeGreaterThanOrEqual(0);
    });

    it('handles posts with category filter', async () => {
      const { result } = renderHook(() => usePosts({ categories: [1, 2] }), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.posts).toBeDefined();
    });

    it('handles pagination parameters', async () => {
      const { result } = renderHook(() => usePosts({ page: 2, per_page: 5 }), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.posts).toHaveLength(5);
      expect(result.current.totalPages).toBe(10);
    });

    it('provides refetch functionality', async () => {
      const { result } = renderHook(() => usePosts(), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');

      // Test refetch doesn't throw
      await result.current.refetch();
    });

    it('handles API errors gracefully', async () => {
      // Mock fetch to return error
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValueOnce(new Error('API Error'));

      const { result } = renderHook(() => usePosts(), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.posts).toEqual([]);

      // Restore fetch
      global.fetch = originalFetch;
    });
  });

  describe('usePost', () => {
    it('fetches single post by slug', async () => {
      const slug = 'test-post';
      const { result } = renderHook(() => usePost(slug), {
        wrapper: SWRWrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.post).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.post).toMatchObject({
        slug: 'test-post',
        title: expect.any(String),
        content: expect.any(String),
      });
      expect(result.current.error).toBeUndefined();
    });

    it('handles empty slug', () => {
      const { result } = renderHook(() => usePost(''), {
        wrapper: SWRWrapper,
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.post).toBeUndefined();
      expect(result.current.error).toBeUndefined();
    });

    it('handles post not found', async () => {
      // Mock fetch to return empty array (post not found)
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      const { result } = renderHook(() => usePost('nonexistent-post'), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.post).toBeNull();

      // Restore fetch
      global.fetch = originalFetch;
    });
  });

  describe('useCategories', () => {
    it('fetches categories successfully', async () => {
      const { result } = renderHook(() => useCategories(), {
        wrapper: SWRWrapper,
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.categories).toEqual([]);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.categories).toHaveLength(5);
      expect(result.current.categories[0]).toMatchObject({
        id: expect.any(Number),
        name: expect.any(String),
        slug: expect.any(String),
      });
      expect(result.current.error).toBeUndefined();
    });

    it('caches categories data', async () => {
      const { result: result1 } = renderHook(() => useCategories(), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
      });

      const { result: result2 } = renderHook(() => useCategories(), {
        wrapper: SWRWrapper,
      });

      // Second hook should have immediate data due to caching
      expect(result2.current.isLoading).toBe(false);
      expect(result2.current.categories).toEqual(result1.current.categories);
    });

    it('provides refetch functionality', async () => {
      const { result } = renderHook(() => useCategories(), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refetch).toBe('function');
    });
  });

  describe('SWR configuration', () => {
    it('uses correct cache keys', async () => {
      // Test that different parameters create different cache keys
      const { result: result1 } = renderHook(() => usePosts({ page: 1 }), {
        wrapper: SWRWrapper,
      });

      const { result: result2 } = renderHook(() => usePosts({ page: 2 }), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });

      // Different pages should have different data
      expect(result1.current.posts).not.toEqual(result2.current.posts);
    });

    it('handles concurrent requests efficiently', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch');

      // Multiple hooks with same parameters
      const { result: result1 } = renderHook(() => usePosts(), {
        wrapper: SWRWrapper,
      });

      const { result: result2 } = renderHook(() => usePosts(), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result1.current.isLoading).toBe(false);
        expect(result2.current.isLoading).toBe(false);
      });

      // Should deduplicate requests
      expect(fetchSpy).toHaveBeenCalledTimes(1);

      fetchSpy.mockRestore();
    });
  });

  describe('Error handling', () => {
    it('retries failed requests', async () => {
      let attemptCount = 0;
      const originalFetch = global.fetch;
      
      global.fetch = jest.fn().mockImplementation(() => {
        attemptCount++;
        if (attemptCount < 3) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([]),
        });
      });

      const { result } = renderHook(() => usePosts(), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      }, { timeout: 5000 });

      expect(attemptCount).toBeGreaterThan(1);

      global.fetch = originalFetch;
    });

    it('provides error information', async () => {
      const originalFetch = global.fetch;
      const errorMessage = 'Server Error';
      
      global.fetch = jest.fn().mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => usePosts(), {
        wrapper: SWRWrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error.message).toBe(errorMessage);

      global.fetch = originalFetch;
    });
  });
});