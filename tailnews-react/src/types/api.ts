// Transformed interfaces for components (simplified from WordPress API)
export interface Article {
  id: number;
  title: string;
  excerpt?: string;
  content?: string;
  slug: string;
  date: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  category?: {
    name: string;
    slug: string;
    id: number;
  };
  author?: {
    name: string;
    slug: string;
    id: number;
    avatar?: string;
  };
  tags?: Array<{
    name: string;
    slug: string;
    id: number;
  }>;
  isSticky?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count: number;
  parent?: number;
}

export interface Author {
  id: number;
  name: string;
  slug: string;
  description?: string;
  avatar?: string;
  url?: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count: number;
}

// API Response types
export interface APIResponse<T> {
  data: T | null;
  error: string | null;
  totalPages?: number;
  total?: number;
}

export interface PaginationParams {
  page?: number;
  per_page?: number;
}

export interface PostsParams extends PaginationParams {
  categories?: number[];
  tags?: number[];
  author?: number;
  search?: string;
  orderby?: 'date' | 'title' | 'menu_order';
  order?: 'asc' | 'desc';
  status?: 'publish' | 'draft' | 'private';
  sticky?: boolean;
}

export interface CategoriesParams extends PaginationParams {
  hide_empty?: boolean;
  parent?: number;
  orderby?: 'name' | 'count' | 'term_order';
  order?: 'asc' | 'desc';
}

export interface AuthorsParams extends PaginationParams {
  orderby?: 'name' | 'post_count';
  order?: 'asc' | 'desc';
  has_published_posts?: boolean;
}

export interface SearchParams extends PaginationParams {
  type?: 'post' | 'page';
  subtype?: string;
}

// Transform utilities type
export interface TransformUtils {
  wpPostToArticle: (post: any) => Article;
  wpCategoryToCategory: (category: any) => Category;
  wpAuthorToAuthor: (author: any) => Author;
  wpTagToTag: (tag: any) => Tag;
}

// Hook return types
export interface UsePostsReturn {
  posts: Article[] | null;
  totalPages?: number;
  total?: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UsePostReturn {
  post: Article | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UseCategoriesReturn {
  categories: Category[] | null;
  totalPages?: number;
  total?: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UseCategoryReturn {
  category: Category | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UseAuthorsReturn {
  authors: Author[] | null;
  totalPages?: number;
  total?: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UseAuthorReturn {
  author: Author | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

export interface UseSearchReturn {
  results: Article[] | null;
  totalPages?: number;
  total?: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
}

// Store types
export interface WordPressStoreState {
  posts: Article[];
  featuredPosts: Article[];
  currentPost: Article | null;
  categories: Category[];
  currentCategory: Category | null;
  authors: Author[];
  currentAuthor: Author | null;
  searchQuery: string;
  searchResults: Article[];
  
  // Loading states
  postsLoading: boolean;
  categoriesLoading: boolean;
  searchLoading: boolean;
  
  // Error states
  postsError: string | null;
  categoriesError: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  postsPerPage: number;
}

// Cache types
export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items to cache
  revalidateOnFocus: boolean;
  revalidateOnReconnect: boolean;
  dedupingInterval: number;
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export type CacheKey = string | (string | number | boolean | object)[];