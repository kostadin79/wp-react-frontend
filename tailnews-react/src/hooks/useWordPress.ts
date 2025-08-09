import useSWR from 'swr';
import { postsAPI, categoriesAPI, tagsAPI, authorsAPI, wpUtils } from '@/lib/wordpress-api';
import { WordPressPost, WordPressCategory, WordPressTag, WordPressAuthor } from '@/types/wordpress';

// Custom hook for fetching posts
export function usePosts(params: {
  page?: number;
  per_page?: number;
  categories?: number[];
  tags?: number[];
  author?: number;
  search?: string;
  orderby?: 'date' | 'title' | 'menu_order';
  order?: 'asc' | 'desc';
} = {}) {
  const key = ['posts', params];
  
  const { data, error, isLoading, mutate } = useSWR(
    key,
    () => postsAPI.getPosts(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    posts: data?.data || null,
    totalPages: data?.totalPages,
    total: data?.total,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching a single post by slug
export function usePost(slug: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? ['post', slug] : null,
    () => slug ? postsAPI.getPostBySlug(slug) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  const post = data?.data;
  
  return {
    post,
    featuredImage: post ? wpUtils.getFeaturedImage(post) : null,
    author: post ? wpUtils.getAuthor(post) : null,
    categories: post ? wpUtils.getCategories(post) : [],
    tags: post ? wpUtils.getTags(post) : [],
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching featured/sticky posts
export function useFeaturedPosts(limit: number = 5) {
  const { data, error, isLoading, mutate } = useSWR(
    ['featured-posts', limit],
    () => postsAPI.getFeaturedPosts(limit),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  return {
    posts: data?.data || null,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching related posts
export function useRelatedPosts(postId: number | null, categoryIds: number[], limit: number = 5) {
  const { data, error, isLoading, mutate } = useSWR(
    postId && categoryIds.length > 0 ? ['related-posts', postId, categoryIds, limit] : null,
    () => postId ? postsAPI.getRelatedPosts(postId, categoryIds, limit) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );

  return {
    posts: data?.data || null,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching categories
export function useCategories(params: {
  page?: number;
  per_page?: number;
  hide_empty?: boolean;
  parent?: number;
} = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['categories', params],
    () => categoriesAPI.getCategories(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // Cache for 10 minutes
    }
  );

  return {
    categories: data?.data || null,
    totalPages: data?.totalPages,
    total: data?.total,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching a single category by slug
export function useCategory(slug: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    slug ? ['category', slug] : null,
    () => slug ? categoriesAPI.getCategoryBySlug(slug) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // Cache for 10 minutes
    }
  );

  return {
    category: data?.data || null,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching posts by category
export function usePostsByCategory(categorySlug: string | null, params: {
  page?: number;
  per_page?: number;
} = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    categorySlug ? ['posts-by-category', categorySlug, params] : null,
    () => categorySlug ? categoriesAPI.getPostsByCategory(categorySlug, params) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    posts: data?.data || null,
    totalPages: data?.totalPages,
    total: data?.total,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching authors
export function useAuthors(params: {
  page?: number;
  per_page?: number;
} = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    ['authors', params],
    () => authorsAPI.getAuthors(params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // Cache for 10 minutes
    }
  );

  return {
    authors: data?.data || null,
    totalPages: data?.totalPages,
    total: data?.total,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching a single author
export function useAuthor(authorId: number | null) {
  const { data, error, isLoading, mutate } = useSWR(
    authorId ? ['author', authorId] : null,
    () => authorId ? authorsAPI.getAuthorById(authorId) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // Cache for 10 minutes
    }
  );

  return {
    author: data?.data || null,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for fetching posts by author
export function usePostsByAuthor(authorId: number | null, params: {
  page?: number;
  per_page?: number;
} = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    authorId ? ['posts-by-author', authorId, params] : null,
    () => authorId ? authorsAPI.getPostsByAuthor(authorId, params) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    posts: data?.data || null,
    totalPages: data?.totalPages,
    total: data?.total,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Custom hook for search functionality
export function useSearch(query: string | null, params: {
  page?: number;
  per_page?: number;
  type?: 'post' | 'page';
} = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    query && query.length > 2 ? ['search', query, params] : null,
    () => query ? postsAPI.getPosts({ search: query, ...params }) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    results: data?.data || null,
    totalPages: data?.totalPages,
    total: data?.total,
    isLoading,
    error: error || data?.error,
    refresh: mutate,
  };
}

// Utility hook for homepage data
export function useHomepageData() {
  const { posts: featuredPosts, isLoading: featuredLoading, error: featuredError } = useFeaturedPosts(5);
  const { posts: recentPosts, isLoading: recentLoading, error: recentError } = usePosts({ per_page: 10 });
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useCategories({ per_page: 10 });

  return {
    featuredPosts,
    recentPosts,
    categories,
    isLoading: featuredLoading || recentLoading || categoriesLoading,
    error: featuredError || recentError || categoriesError,
  };
}

// Utility hook for transforming WordPress data to component props
export function useTransformedPosts(posts: WordPressPost[] | null) {
  if (!posts) return null;

  return posts.map(post => ({
    id: post.id,
    title: post.title.rendered,
    excerpt: wpUtils.createExcerpt(post.excerpt.rendered),
    slug: post.slug,
    date: post.date,
    featuredImage: wpUtils.getFeaturedImage(post),
    author: wpUtils.getAuthor(post),
    categories: wpUtils.getCategories(post),
    tags: wpUtils.getTags(post),
  }));
}