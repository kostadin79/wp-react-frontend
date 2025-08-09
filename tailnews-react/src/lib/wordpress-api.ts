import { WordPressPost, WordPressCategory, WordPressTag, WordPressAuthor, WordPressMedia } from '@/types/wordpress';

// WordPress API Configuration
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://your-wordpress-site.com/wp-json/wp/v2';

// API Response wrapper for better error handling
interface APIResponse<T> {
  data: T | null;
  error: string | null;
  totalPages?: number;
  total?: number;
}

// Generic API fetch function with error handling
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<APIResponse<T>> {
  try {
    const url = `${WORDPRESS_API_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`WordPress API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract pagination info from headers
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const total = parseInt(response.headers.get('X-WP-Total') || '0');

    return {
      data,
      error: null,
      totalPages,
      total,
    };
  } catch (error) {
    console.error('WordPress API request failed:', error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown API error',
    };
  }
}

// Posts API
export const postsAPI = {
  // Get all posts with pagination and filtering
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
  } = {}): Promise<APIResponse<WordPressPost[]>> {
    const searchParams = new URLSearchParams();
    
    // Set default values
    searchParams.set('_embed', 'true'); // Include featured media and author
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

    return apiRequest<WordPressPost[]>(`/posts?${searchParams.toString()}`);
  },

  // Get single post by slug
  async getPostBySlug(slug: string): Promise<APIResponse<WordPressPost>> {
    const response = await apiRequest<WordPressPost[]>(`/posts?slug=${slug}&_embed=true`);
    
    if (response.data && response.data.length > 0) {
      return {
        data: response.data[0],
        error: null,
      };
    }
    
    return {
      data: null,
      error: 'Post not found',
    };
  },

  // Get post by ID
  async getPostById(id: number): Promise<APIResponse<WordPressPost>> {
    return apiRequest<WordPressPost>(`/posts/${id}?_embed=true`);
  },

  // Get featured posts (sticky posts)
  async getFeaturedPosts(limit: number = 5): Promise<APIResponse<WordPressPost[]>> {
    return apiRequest<WordPressPost[]>(`/posts?sticky=true&per_page=${limit}&_embed=true`);
  },

  // Get related posts by category
  async getRelatedPosts(postId: number, categoryIds: number[], limit: number = 5): Promise<APIResponse<WordPressPost[]>> {
    const categoryQuery = categoryIds.join(',');
    return apiRequest<WordPressPost[]>(
      `/posts?categories=${categoryQuery}&exclude=${postId}&per_page=${limit}&_embed=true`
    );
  },
};

// Categories API
export const categoriesAPI = {
  // Get all categories
  async getCategories(params: {
    page?: number;
    per_page?: number;
    hide_empty?: boolean;
    parent?: number;
  } = {}): Promise<APIResponse<WordPressCategory[]>> {
    const searchParams = new URLSearchParams();
    searchParams.set('per_page', (params.per_page || 100).toString());
    searchParams.set('page', (params.page || 1).toString());
    searchParams.set('hide_empty', (params.hide_empty !== false).toString());
    
    if (params.parent !== undefined) {
      searchParams.set('parent', params.parent.toString());
    }

    return apiRequest<WordPressCategory[]>(`/categories?${searchParams.toString()}`);
  },

  // Get category by slug
  async getCategoryBySlug(slug: string): Promise<APIResponse<WordPressCategory>> {
    const response = await apiRequest<WordPressCategory[]>(`/categories?slug=${slug}`);
    
    if (response.data && response.data.length > 0) {
      return {
        data: response.data[0],
        error: null,
      };
    }
    
    return {
      data: null,
      error: 'Category not found',
    };
  },

  // Get posts by category slug
  async getPostsByCategory(categorySlug: string, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<APIResponse<WordPressPost[]>> {
    // First get the category ID
    const categoryResponse = await this.getCategoryBySlug(categorySlug);
    if (!categoryResponse.data) {
      return {
        data: null,
        error: 'Category not found',
      };
    }

    // Then get posts for that category
    return postsAPI.getPosts({
      categories: [categoryResponse.data.id],
      page: params.page,
      per_page: params.per_page,
    });
  },
};

// Tags API
export const tagsAPI = {
  // Get all tags
  async getTags(params: {
    page?: number;
    per_page?: number;
    hide_empty?: boolean;
  } = {}): Promise<APIResponse<WordPressTag[]>> {
    const searchParams = new URLSearchParams();
    searchParams.set('per_page', (params.per_page || 100).toString());
    searchParams.set('page', (params.page || 1).toString());
    searchParams.set('hide_empty', (params.hide_empty !== false).toString());

    return apiRequest<WordPressTag[]>(`/tags?${searchParams.toString()}`);
  },

  // Get tag by slug
  async getTagBySlug(slug: string): Promise<APIResponse<WordPressTag>> {
    const response = await apiRequest<WordPressTag[]>(`/tags?slug=${slug}`);
    
    if (response.data && response.data.length > 0) {
      return {
        data: response.data[0],
        error: null,
      };
    }
    
    return {
      data: null,
      error: 'Tag not found',
    };
  },
};

// Authors API
export const authorsAPI = {
  // Get all authors
  async getAuthors(params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<APIResponse<WordPressAuthor[]>> {
    const searchParams = new URLSearchParams();
    searchParams.set('per_page', (params.per_page || 100).toString());
    searchParams.set('page', (params.page || 1).toString());

    return apiRequest<WordPressAuthor[]>(`/users?${searchParams.toString()}`);
  },

  // Get author by ID
  async getAuthorById(id: number): Promise<APIResponse<WordPressAuthor>> {
    return apiRequest<WordPressAuthor>(`/users/${id}`);
  },

  // Get author by slug
  async getAuthorBySlug(slug: string): Promise<APIResponse<WordPressAuthor>> {
    const response = await apiRequest<WordPressAuthor[]>(`/users?slug=${slug}`);
    
    if (response.data && response.data.length > 0) {
      return {
        data: response.data[0],
        error: null,
      };
    }
    
    return {
      data: null,
      error: 'Author not found',
    };
  },

  // Get posts by author
  async getPostsByAuthor(authorId: number, params: {
    page?: number;
    per_page?: number;
  } = {}): Promise<APIResponse<WordPressPost[]>> {
    return postsAPI.getPosts({
      author: authorId,
      page: params.page,
      per_page: params.per_page,
    });
  },
};

// Media API
export const mediaAPI = {
  // Get media by ID
  async getMediaById(id: number): Promise<APIResponse<WordPressMedia>> {
    return apiRequest<WordPressMedia>(`/media/${id}`);
  },

  // Get all media
  async getMedia(params: {
    page?: number;
    per_page?: number;
    media_type?: 'image' | 'video' | 'audio' | 'file';
  } = {}): Promise<APIResponse<WordPressMedia[]>> {
    const searchParams = new URLSearchParams();
    searchParams.set('per_page', (params.per_page || 20).toString());
    searchParams.set('page', (params.page || 1).toString());
    
    if (params.media_type) {
      searchParams.set('media_type', params.media_type);
    }

    return apiRequest<WordPressMedia[]>(`/media?${searchParams.toString()}`);
  },
};

// Search API
export const searchAPI = {
  // Global search across posts, pages, and other content
  async search(query: string, params: {
    page?: number;
    per_page?: number;
    type?: 'post' | 'page';
  } = {}): Promise<APIResponse<WordPressPost[]>> {
    return postsAPI.getPosts({
      search: query,
      page: params.page,
      per_page: params.per_page,
    });
  },
};

// Utility functions
export const wpUtils = {
  // Extract featured image from WordPress post
  getFeaturedImage(post: WordPressPost): { url: string; alt: string } | null {
    if (post._links?.['wp:featuredmedia']?.[0]) {
      const embedded = post._embedded;
      if (embedded?.['wp:featuredmedia']?.[0]) {
        const media = embedded['wp:featuredmedia'][0];
        return {
          url: media.source_url,
          alt: media.alt_text || post.title.rendered,
        };
      }
    }
    return null;
  },

  // Extract author from WordPress post
  getAuthor(post: WordPressPost): WordPressAuthor | null {
    const embedded = post._embedded;
    if (embedded?.author?.[0]) {
      return embedded.author[0];
    }
    return null;
  },

  // Extract categories from WordPress post
  getCategories(post: WordPressPost): WordPressCategory[] {
    const embedded = post._embedded;
    if (embedded?.['wp:term']?.[0]) {
      return embedded['wp:term'][0].filter((term: any) => term.taxonomy === 'category');
    }
    return [];
  },

  // Extract tags from WordPress post
  getTags(post: WordPressPost): WordPressTag[] {
    const embedded = post._embedded;
    if (embedded?.['wp:term']?.[1]) {
      return embedded['wp:term'][1].filter((term: any) => term.taxonomy === 'post_tag');
    }
    return [];
  },

  // Clean HTML content and create excerpt
  createExcerpt(content: string, length: number = 160): string {
    const cleanText = content.replace(/<[^>]*>/g, '');
    return cleanText.length > length 
      ? `${cleanText.substring(0, length).trim()}...`
      : cleanText;
  },

  // Format WordPress date
  formatDate(dateString: string, options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }): string {
    return new Date(dateString).toLocaleDateString(undefined, options);
  },
};