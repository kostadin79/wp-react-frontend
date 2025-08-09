# API Documentation

## Overview

This document provides comprehensive documentation for the WordPress REST API integration and custom API endpoints used in the Tailnews React application.

## WordPress REST API Integration

### Base Configuration

```typescript
// Base API configuration
const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost:8000/wp-json/wp/v2',
  timeout: 10000,
  retries: 3,
  cacheTime: 300000, // 5 minutes
};

// Request headers
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
```

### Authentication

Currently configured for public read-only access. For authenticated requests:

```typescript
// JWT Authentication (future implementation)
interface AuthConfig {
  username: string;
  password: string;
  token?: string;
}

// Basic Authentication
const authHeaders = {
  'Authorization': `Basic ${btoa(`${username}:${password}`)}`
};

// JWT Token
const jwtHeaders = {
  'Authorization': `Bearer ${token}`
};
```

## Core API Endpoints

### Posts API

#### Get All Posts

```typescript
GET /wp/v2/posts

// Parameters
interface PostsParams {
  page?: number;           // Page number (default: 1)
  per_page?: number;       // Posts per page (default: 10, max: 100)
  search?: string;         // Search term
  author?: number[];       // Author IDs
  categories?: number[];   // Category IDs  
  tags?: number[];         // Tag IDs
  orderby?: 'date' | 'relevance' | 'id' | 'title';
  order?: 'asc' | 'desc';
  status?: 'publish' | 'draft' | 'private';
  sticky?: boolean;        // Include sticky posts
  after?: string;          // ISO 8601 date
  before?: string;         // ISO 8601 date
  exclude?: number[];      // Post IDs to exclude
  include?: number[];      // Post IDs to include
  offset?: number;         // Number of posts to skip
  slug?: string;           // Post slug
}

// Usage
const posts = await postsAPI.getPosts({
  page: 1,
  per_page: 12,
  categories: [1, 5],
  orderby: 'date',
  order: 'desc'
});

// Response
interface PostsResponse {
  posts: Post[];
  totalPages: number;
  totalPosts: number;
  currentPage: number;
}
```

#### Get Single Post

```typescript
GET /wp/v2/posts/{id}
GET /wp/v2/posts?slug={slug}

// Usage
const post = await postsAPI.getPost(123);
const post = await postsAPI.getPostBySlug('my-post-slug');

// Response
interface Post {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: 'publish' | 'draft' | 'private';
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
    protected: boolean;
  };
  excerpt: {
    rendered: string;
    protected: boolean;
  };
  author: number;
  featured_media: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  sticky: boolean;
  template: string;
  format: string;
  meta: Record<string, any>;
  categories: number[];
  tags: number[];
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    author: Array<{ embeddable: boolean; href: string }>;
    replies: Array<{ embeddable: boolean; href: string }>;
    'version-history': Array<{ count: number; href: string }>;
    'wp:attachment': Array<{ href: string }>;
    'wp:term': Array<{ taxonomy: string; embeddable: boolean; href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}
```

#### Search Posts

```typescript
GET /wp/v2/posts?search={query}

// Usage
const results = await postsAPI.searchPosts('react tutorial', {
  per_page: 20,
  orderby: 'relevance'
});

// Advanced search
const results = await postsAPI.searchPosts('javascript', {
  categories: [1, 2],
  tags: [5],
  after: '2023-01-01T00:00:00',
  per_page: 15
});
```

### Categories API

#### Get All Categories

```typescript
GET /wp/v2/categories

// Parameters
interface CategoriesParams {
  page?: number;
  per_page?: number;
  search?: string;
  exclude?: number[];
  include?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
  hide_empty?: boolean;
  parent?: number;
  post?: number;
  slug?: string;
}

// Usage  
const categories = await categoriesAPI.getCategories({
  hide_empty: true,
  orderby: 'count',
  order: 'desc'
});

// Response
interface Category {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  parent: number;
  meta: Record<string, any>;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    'wp:post_type': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}
```

#### Get Category with Posts

```typescript
// Custom function combining category and posts data
const categoryData = await postsAPI.getPostsByCategory('technology', {
  page: 1,
  per_page: 12
});

// Response
interface CategoryWithPosts {
  category: Category;
  posts: Post[];
  totalPages: number;
  currentPage: number;
}
```

### Tags API

```typescript
GET /wp/v2/tags

// Parameters (similar to categories)
interface TagsParams {
  page?: number;
  per_page?: number;
  search?: string;
  exclude?: number[];
  include?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'id' | 'include' | 'name' | 'slug' | 'term_group' | 'description' | 'count';
  hide_empty?: boolean;
  post?: number;
  slug?: string;
}

// Usage
const tags = await tagsAPI.getTags({
  hide_empty: true,
  per_page: 50
});

// Response
interface Tag {
  id: number;
  count: number;
  description: string;
  link: string;
  name: string;
  slug: string;
  taxonomy: string;
  meta: Record<string, any>;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    'wp:post_type': Array<{ href: string }>;
    curies: Array<{ name: string; href: string; templated: boolean }>;
  };
}
```

### Authors/Users API

```typescript
GET /wp/v2/users

// Parameters
interface UsersParams {
  page?: number;
  per_page?: number;
  search?: string;
  exclude?: number[];
  include?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'id' | 'include' | 'name' | 'registered_date' | 'slug' | 'email' | 'url';
  slug?: string[];
  roles?: string[];
  who?: 'authors';
}

// Usage
const authors = await usersAPI.getUsers({
  who: 'authors',
  orderby: 'name',
  per_page: 50
});

// Response
interface User {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  url: string;
  description: string;
  link: string;
  locale: string;
  nickname: string;
  slug: string;
  roles: string[];
  registered_date: string;
  capabilities: Record<string, boolean>;
  extra_capabilities: Record<string, boolean>;
  avatar_urls: {
    24: string;
    48: string;
    96: string;
  };
  meta: Record<string, any>;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
  };
}
```

### Media API

```typescript
GET /wp/v2/media

// Parameters
interface MediaParams {
  page?: number;
  per_page?: number;
  search?: string;
  after?: string;
  author?: number[];
  author_exclude?: number[];
  before?: string;
  exclude?: number[];
  include?: number[];
  order?: 'asc' | 'desc';
  orderby?: 'author' | 'date' | 'id' | 'include' | 'modified' | 'parent' | 'relevance' | 'slug' | 'include_slugs' | 'title';
  parent?: number[];
  parent_exclude?: number[];
  slug?: string[];
  status?: 'inherit' | 'private' | 'trash';
  media_type?: 'image' | 'video' | 'text' | 'application' | 'audio';
  mime_type?: string;
}

// Usage
const media = await mediaAPI.getMedia({
  media_type: 'image',
  per_page: 20,
  orderby: 'date'
});

// Response
interface Media {
  id: number;
  date: string;
  date_gmt: string;
  guid: {
    rendered: string;
  };
  modified: string;
  modified_gmt: string;
  slug: string;
  status: string;
  type: string;
  link: string;
  title: {
    rendered: string;
  };
  author: number;
  comment_status: 'open' | 'closed';
  ping_status: 'open' | 'closed';
  template: string;
  meta: Record<string, any>;
  description: {
    rendered: string;
  };
  caption: {
    rendered: string;
  };
  alt_text: string;
  media_type: string;
  mime_type: string;
  media_details: {
    width: number;
    height: number;
    file: string;
    sizes: {
      [key: string]: {
        file: string;
        width: number;
        height: number;
        mime_type: string;
        source_url: string;
      };
    };
    image_meta: {
      aperture: string;
      credit: string;
      camera: string;
      caption: string;
      created_timestamp: string;
      copyright: string;
      focal_length: string;
      iso: string;
      shutter_speed: string;
      title: string;
      orientation: string;
      keywords: string[];
    };
  };
  source_url: string;
  _links: {
    self: Array<{ href: string }>;
    collection: Array<{ href: string }>;
    about: Array<{ href: string }>;
    author: Array<{ embeddable: boolean; href: string }>;
    replies: Array<{ embeddable: boolean; href: string }>;
  };
}
```

## Custom API Functions

### Server-Side API

```typescript
// src/lib/server-api.ts

// Posts API for SSR/SSG
export const serverPostsAPI = {
  // Get posts with full transformation
  async getPosts(params?: PostsParams): Promise<PostsResponse> {
    const response = await fetch(`${API_BASE}/posts?${new URLSearchParams(params)}`);
    const posts = await response.json();
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    
    return {
      posts: posts.map(transformPost),
      totalPages,
      totalPosts: parseInt(response.headers.get('X-WP-Total') || '0'),
      currentPage: params?.page || 1,
    };
  },

  // Get single post by slug
  async getPostBySlug(slug: string): Promise<TransformedPost | null> {
    const response = await fetch(`${API_BASE}/posts?slug=${slug}`);
    const posts = await response.json();
    
    if (posts.length === 0) return null;
    
    return transformPost(posts[0]);
  },

  // Get posts by category
  async getPostsByCategory(
    categorySlug: string, 
    params?: PostsParams
  ): Promise<CategoryWithPosts> {
    // First get category
    const categoryResponse = await fetch(`${API_BASE}/categories?slug=${categorySlug}`);
    const categories = await categoryResponse.json();
    
    if (categories.length === 0) {
      throw new Error(`Category not found: ${categorySlug}`);
    }
    
    const category = categories[0];
    
    // Then get posts
    const postsResponse = await this.getPosts({
      ...params,
      categories: [category.id],
    });
    
    return {
      category: transformCategory(category),
      posts: postsResponse.posts,
      totalPages: postsResponse.totalPages,
      currentPage: postsResponse.currentPage,
    };
  },

  // Search posts
  async searchPosts(
    query: string, 
    params?: PostsParams
  ): Promise<PostsResponse> {
    return this.getPosts({
      ...params,
      search: query,
      orderby: 'relevance',
    });
  },
};

// Categories API for SSR/SSG
export const serverCategoriesAPI = {
  async getCategories(params?: CategoriesParams): Promise<TransformedCategory[]> {
    const response = await fetch(
      `${API_BASE}/categories?${new URLSearchParams(params)}`
    );
    const categories = await response.json();
    
    return categories.map(transformCategory);
  },

  async getCategoryBySlug(slug: string): Promise<TransformedCategory | null> {
    const response = await fetch(`${API_BASE}/categories?slug=${slug}`);
    const categories = await response.json();
    
    if (categories.length === 0) return null;
    
    return transformCategory(categories[0]);
  },
};

// Generate static params for posts
export async function getAllPostSlugs(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/posts?per_page=100&_fields=slug`);
  const posts = await response.json();
  
  return posts.map((post: { slug: string }) => post.slug);
}

// Generate static params for categories
export async function getAllCategorySlugs(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/categories?per_page=100&_fields=slug`);
  const categories = await response.json();
  
  return categories.map((category: { slug: string }) => category.slug);
}
```

### Data Transformation

```typescript
// Transform raw WordPress data to application format
export function transformPost(post: any): TransformedPost {
  return {
    id: post.id,
    title: post.title.rendered,
    slug: post.slug,
    content: post.content.rendered,
    excerpt: post.excerpt.rendered,
    date: post.date,
    modified: post.modified,
    author: post._embedded?.author?.[0] ? {
      id: post._embedded.author[0].id,
      name: post._embedded.author[0].name,
      slug: post._embedded.author[0].slug,
      description: post._embedded.author[0].description,
      avatar: post._embedded.author[0].avatar_urls?.[96],
    } : null,
    featuredImage: post._embedded?.['wp:featuredmedia']?.[0] ? {
      id: post._embedded['wp:featuredmedia'][0].id,
      url: post._embedded['wp:featuredmedia'][0].source_url,
      alt: post._embedded['wp:featuredmedia'][0].alt_text,
      caption: post._embedded['wp:featuredmedia'][0].caption.rendered,
    } : null,
    categories: post._embedded?.['wp:term']?.[0]?.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    })) || [],
    tags: post._embedded?.['wp:term']?.[1]?.map((tag: any) => ({
      id: tag.id,
      name: tag.name,
      slug: tag.slug,
    })) || [],
    category: post._embedded?.['wp:term']?.[0]?.[0] ? {
      id: post._embedded['wp:term'][0][0].id,
      name: post._embedded['wp:term'][0][0].name,
      slug: post._embedded['wp:term'][0][0].slug,
    } : null,
    commentStatus: post.comment_status,
    link: post.link,
    status: post.status,
    sticky: post.sticky,
  };
}

export function transformCategory(category: any): TransformedCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    count: category.count,
    parent: category.parent,
    link: category.link,
  };
}
```

## Custom Hooks

### usePosts Hook

```typescript
// Client-side posts fetching
export function usePosts(params?: PostsParams) {
  const { data, error, mutate, isLoading } = useSWR(
    ['posts', params],
    ([, params]) => postsAPI.getPosts(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
      errorRetryInterval: 1000,
      onError: (error) => {
        console.error('Posts fetch error:', error);
      },
    }
  );
  
  return {
    posts: data?.posts || [],
    totalPages: data?.totalPages || 0,
    totalPosts: data?.totalPosts || 0,
    currentPage: data?.currentPage || 1,
    isLoading,
    error,
    refetch: mutate,
  };
}

// Usage in component
function PostsList() {
  const { posts, isLoading, error, refetch } = usePosts({
    page: 1,
    per_page: 12,
    categories: [1, 2],
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} onRetry={refetch} />;

  return (
    <div>
      {posts.map(post => (
        <ArticleCard key={post.id} article={post} />
      ))}
    </div>
  );
}
```

### usePost Hook

```typescript
export function usePost(slug: string) {
  const { data, error, mutate, isLoading } = useSWR(
    slug ? ['post', slug] : null,
    ([, slug]) => postsAPI.getPostBySlug(slug),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000, // 5 minutes
    }
  );
  
  return {
    post: data,
    isLoading,
    error,
    refetch: mutate,
  };
}
```

### useCategories Hook

```typescript
export function useCategories() {
  const { data, error, mutate, isLoading } = useSWR(
    'categories',
    () => categoriesAPI.getCategories({ hide_empty: true }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes
    }
  );
  
  return {
    categories: data || [],
    isLoading,
    error,
    refetch: mutate,
  };
}
```

### useSearch Hook

```typescript
export function useSearch(query: string, params?: PostsParams) {
  const debouncedQuery = useDebounce(query, 300);
  
  const { data, error, mutate, isLoading } = useSWR(
    debouncedQuery ? ['search', debouncedQuery, params] : null,
    ([, query, params]) => postsAPI.searchPosts(query, params),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );
  
  return {
    results: data?.posts || [],
    totalResults: data?.totalPosts || 0,
    totalPages: data?.totalPages || 0,
    isLoading: isLoading && !!debouncedQuery,
    error,
    refetch: mutate,
  };
}
```

## Error Handling

### API Error Types

```typescript
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public endpoint: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string, public endpoint: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```

### Error Handling Strategy

```typescript
async function handleAPIRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });
    
    if (!response.ok) {
      throw new APIError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        url
      );
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    if (error instanceof TypeError) {
      throw new NetworkError('Network connection failed', url);
    }
    
    throw new APIError('Unknown error occurred', 500, url, error);
  }
}

// Retry logic
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && (error instanceof NetworkError || 
        (error instanceof APIError && error.status >= 500))) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}
```

### Error Boundary Integration

```typescript
// Error fallback component
function APIErrorFallback({ error, onRetry }: { 
  error: Error; 
  onRetry: () => void; 
}) {
  if (error instanceof NetworkError) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold mb-2">Connection Problem</h3>
        <p className="text-gray-600 mb-4">
          Unable to connect to the server. Please check your internet connection.
        </p>
        <button onClick={onRetry} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }
  
  if (error instanceof APIError && error.status === 404) {
    return (
      <div className="text-center p-6">
        <h3 className="text-lg font-semibold mb-2">Content Not Found</h3>
        <p className="text-gray-600 mb-4">
          The requested content could not be found.
        </p>
        <Link href="/" className="btn-primary">
          Go Home
        </Link>
      </div>
    );
  }
  
  return (
    <div className="text-center p-6">
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-gray-600 mb-4">
        An unexpected error occurred. Please try again.
      </p>
      <button onClick={onRetry} className="btn-primary">
        Try Again  
      </button>
    </div>
  );
}
```

## Rate Limiting & Optimization

### Request Optimization

```typescript
// Request deduplication
const requestCache = new Map();

async function deduplicatedRequest<T>(key: string, fn: () => Promise<T>): Promise<T> {
  if (requestCache.has(key)) {
    return requestCache.get(key);
  }
  
  const promise = fn();
  requestCache.set(key, promise);
  
  // Clean up after request completes
  promise.finally(() => {
    setTimeout(() => requestCache.delete(key), 1000);
  });
  
  return promise;
}

// Usage in API calls
export const postsAPI = {
  async getPosts(params?: PostsParams): Promise<PostsResponse> {
    const cacheKey = `posts:${JSON.stringify(params)}`;
    return deduplicatedRequest(cacheKey, () => 
      fetchPosts(params)
    );
  },
};
```

### Batch Requests

```typescript
// Batch multiple requests
async function batchRequests<T>(
  requests: Array<() => Promise<T>>
): Promise<T[]> {
  const results = await Promise.allSettled(requests.map(req => req()));
  
  return results.map((result, index) => {
    if (result.status === 'rejected') {
      console.error(`Request ${index} failed:`, result.reason);
      return null;
    }
    return result.value;
  }).filter(Boolean) as T[];
}

// Usage
const [posts, categories, tags] = await batchRequests([
  () => postsAPI.getPosts({ per_page: 5 }),
  () => categoriesAPI.getCategories(),
  () => tagsAPI.getTags(),
]);
```

This API documentation provides a comprehensive guide for integrating with the WordPress REST API and using the custom API functions in the Tailnews React application.