// Server-side WordPress API functions for SSR/SSG
import { WordPressPost, WordPressCategory, WordPressAuthor, WordPressMedia } from '@/types/wordpress';
import { Article, Category, Author } from '@/types/api';
import { transformPost, transformCategory, transformAuthor } from './transforms';

// WordPress API Configuration for server-side
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://your-wordpress-site.com/wp-json/wp/v2';

// Server-side fetch with better error handling and timeout
async function serverFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const url = `${WORDPRESS_API_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Tailnews-React/1.0',
        ...options.headers,
      },
      signal: controller.signal,
      // Add cache control for better performance
      next: {
        revalidate: process.env.NODE_ENV === 'development' ? 0 : 60, // Revalidate every minute in production
      },
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('WordPress API request timeout');
      }
      throw error;
    }
    throw new Error('Unknown WordPress API error');
  }
}

// Server-side Posts API
export const serverPostsAPI = {
  // Get all posts with server-side rendering support
  async getPosts(params: {
    page?: number;
    per_page?: number;
    categories?: number[];
    tags?: number[];
    author?: number;
    search?: string;
    orderby?: 'date' | 'title' | 'menu_order';
    order?: 'asc' | 'desc';
    status?: 'publish' | 'draft' | 'private';
  } = {}): Promise<{ posts: Article[]; totalPages: number; total: number }> {
    const searchParams = new URLSearchParams();
    
    // Set default values
    searchParams.set('_embed', 'true');
    searchParams.set('per_page', (params.per_page || 10).toString());
    searchParams.set('page', (params.page || 1).toString());
    searchParams.set('orderby', params.orderby || 'date');
    searchParams.set('order', params.order || 'desc');
    searchParams.set('status', params.status || 'publish');

    // Add optional filters
    if (params.categories?.length) {
      searchParams.set('categories', params.categories.join(','));
    }
    if (params.tags?.length) {
      searchParams.set('tags', params.tags.join(','));
    }
    if (params.author) {
      searchParams.set('author', params.author.toString());
    }
    if (params.search) {
      searchParams.set('search', params.search);
    }

    try {
      const response = await fetch(`${WORDPRESS_API_URL}/posts?${searchParams.toString()}`, {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.statusText}`);
      }

      const posts: WordPressPost[] = await response.json();
      const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
      const total = parseInt(response.headers.get('X-WP-Total') || '0');

      return {
        posts: posts.map(transformPost),
        totalPages,
        total,
      };
    } catch (error) {
      console.error('Server posts API error:', error);
      return { posts: [], totalPages: 1, total: 0 };
    }
  },

  // Get single post by slug for SSR
  async getPostBySlug(slug: string): Promise<Article | null> {
    try {
      const posts = await serverFetch<WordPressPost[]>(`/posts?slug=${slug}&_embed=true`);
      
      if (posts && posts.length > 0) {
        return transformPost(posts[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Server post by slug error:', error);
      return null;
    }
  },

  // Get featured posts for homepage SSR
  async getFeaturedPosts(limit: number = 5): Promise<Article[]> {
    try {
      const posts = await serverFetch<WordPressPost[]>(`/posts?sticky=true&per_page=${limit}&_embed=true`);
      return posts.map(transformPost);
    } catch (error) {
      console.error('Server featured posts error:', error);
      return [];
    }
  },

  // Get posts by category for SSR
  async getPostsByCategory(categorySlug: string, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<{ posts: Article[]; category: Category | null; totalPages: number; total: number }> {
    try {
      // First get the category
      const categories = await serverFetch<WordPressCategory[]>(`/categories?slug=${categorySlug}`);
      const category = categories.length > 0 ? transformCategory(categories[0]) : null;

      if (!category) {
        return { posts: [], category: null, totalPages: 1, total: 0 };
      }

      // Then get posts for that category
      const result = await serverPostsAPI.getPosts({
        categories: [category.id],
        page: params.page,
        per_page: params.per_page,
      });

      return {
        ...result,
        category,
      };
    } catch (error) {
      console.error('Server posts by category error:', error);
      return { posts: [], category: null, totalPages: 1, total: 0 };
    }
  },
};

// Server-side Categories API
export const serverCategoriesAPI = {
  // Get all categories for SSR
  async getCategories(params: {
    page?: number;
    per_page?: number;
    hide_empty?: boolean;
    parent?: number;
  } = {}): Promise<Category[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('per_page', (params.per_page || 100).toString());
    searchParams.set('page', (params.page || 1).toString());
    searchParams.set('hide_empty', (params.hide_empty !== false).toString());
    
    if (params.parent !== undefined) {
      searchParams.set('parent', params.parent.toString());
    }

    try {
      const categories = await serverFetch<WordPressCategory[]>(`/categories?${searchParams.toString()}`);
      return categories.map(transformCategory);
    } catch (error) {
      console.error('Server categories error:', error);
      return [];
    }
  },

  // Get category by slug for SSR
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const categories = await serverFetch<WordPressCategory[]>(`/categories?slug=${slug}`);
      
      if (categories && categories.length > 0) {
        return transformCategory(categories[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Server category by slug error:', error);
      return null;
    }
  },
};

// Server-side Authors API  
export const serverAuthorsAPI = {
  // Get all authors for SSR
  async getAuthors(params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<Author[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('per_page', (params.per_page || 100).toString());
    searchParams.set('page', (params.page || 1).toString());

    try {
      const authors = await serverFetch<WordPressAuthor[]>(`/users?${searchParams.toString()}`);
      return authors.map(transformAuthor);
    } catch (error) {
      console.error('Server authors error:', error);
      return [];
    }
  },

  // Get author by slug for SSR
  async getAuthorBySlug(slug: string): Promise<Author | null> {
    try {
      const authors = await serverFetch<WordPressAuthor[]>(`/users?slug=${slug}`);
      
      if (authors && authors.length > 0) {
        return transformAuthor(authors[0]);
      }
      
      return null;
    } catch (error) {
      console.error('Server author by slug error:', error);
      return null;
    }
  },

  // Get posts by author for SSR
  async getPostsByAuthor(authorId: number, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<{ posts: Article[]; author: Author | null; totalPages: number; total: number }> {
    try {
      // First get the author
      const author = await serverFetch<WordPressAuthor>(`/users/${authorId}`);
      const transformedAuthor = author ? transformAuthor(author) : null;

      // Then get posts by that author
      const result = await serverPostsAPI.getPosts({
        author: authorId,
        page: params.page,
        per_page: params.per_page,
      });

      return {
        ...result,
        author: transformedAuthor,
      };
    } catch (error) {
      console.error('Server posts by author error:', error);
      return { posts: [], author: null, totalPages: 1, total: 0 };
    }
  },
};

// Homepage data fetcher for SSR
export async function getHomepageData(): Promise<{
  featuredPosts: Article[];
  recentPosts: Article[];
  categories: Category[];
}> {
  try {
    const [featuredPosts, recentPostsResult, categories] = await Promise.all([
      serverPostsAPI.getFeaturedPosts(5),
      serverPostsAPI.getPosts({ per_page: 12 }), // Get more for different sections
      serverCategoriesAPI.getCategories({ per_page: 10 }),
    ]);

    return {
      featuredPosts,
      recentPosts: recentPostsResult.posts,
      categories,
    };
  } catch (error) {
    console.error('Homepage data fetch error:', error);
    return {
      featuredPosts: [],
      recentPosts: [],
      categories: [],
    };
  }
}

// Generate static paths helpers
export async function getAllPostSlugs(): Promise<string[]> {
  try {
    const posts = await serverFetch<WordPressPost[]>('/posts?per_page=100&_fields=slug');
    return posts.map(post => post.slug);
  } catch (error) {
    console.error('Error fetching post slugs:', error);
    return [];
  }
}

export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    const categories = await serverFetch<WordPressCategory[]>('/categories?per_page=100&_fields=slug');
    return categories.map(category => category.slug);
  } catch (error) {
    console.error('Error fetching category slugs:', error);
    return [];
  }
}

export async function getAllAuthorSlugs(): Promise<string[]> {
  try {
    const authors = await serverFetch<WordPressAuthor[]>('/users?per_page=100&_fields=slug');
    return authors.map(author => author.slug);
  } catch (error) {
    console.error('Error fetching author slugs:', error);
    return [];
  }
}