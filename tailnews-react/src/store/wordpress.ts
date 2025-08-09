import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { WordPressPost, WordPressCategory, WordPressAuthor } from '@/types/wordpress';

// WordPress store interfaces
interface WordPressState {
  // Posts state
  posts: WordPressPost[];
  featuredPosts: WordPressPost[];
  currentPost: WordPressPost | null;
  postsLoading: boolean;
  postsError: string | null;
  
  // Categories state
  categories: WordPressCategory[];
  currentCategory: WordPressCategory | null;
  categoriesLoading: boolean;
  categoriesError: string | null;
  
  // Authors state
  authors: WordPressAuthor[];
  currentAuthor: WordPressAuthor | null;
  
  // Search state
  searchQuery: string;
  searchResults: WordPressPost[];
  searchLoading: boolean;
  
  // Pagination state
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  
  // Settings
  postsPerPage: number;
  
  // Actions
  setPosts: (posts: WordPressPost[]) => void;
  addPosts: (posts: WordPressPost[]) => void;
  setFeaturedPosts: (posts: WordPressPost[]) => void;
  setCurrentPost: (post: WordPressPost | null) => void;
  setPostsLoading: (loading: boolean) => void;
  setPostsError: (error: string | null) => void;
  
  setCategories: (categories: WordPressCategory[]) => void;
  setCurrentCategory: (category: WordPressCategory | null) => void;
  setCategoriesLoading: (loading: boolean) => void;
  setCategoriesError: (error: string | null) => void;
  
  setAuthors: (authors: WordPressAuthor[]) => void;
  setCurrentAuthor: (author: WordPressAuthor | null) => void;
  
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: WordPressPost[]) => void;
  setSearchLoading: (loading: boolean) => void;
  clearSearch: () => void;
  
  setPagination: (currentPage: number, totalPages: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  
  setPostsPerPage: (perPage: number) => void;
  
  // Utility actions
  clearAll: () => void;
  getPostBySlug: (slug: string) => WordPressPost | undefined;
  getCategoryBySlug: (slug: string) => WordPressCategory | undefined;
  getPostsByCategory: (categoryId: number) => WordPressPost[];
  getPostsByAuthor: (authorId: number) => WordPressPost[];
}

// Create the WordPress store
export const useWordPressStore = create<WordPressState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        posts: [],
        featuredPosts: [],
        currentPost: null,
        postsLoading: false,
        postsError: null,
        
        categories: [],
        currentCategory: null,
        categoriesLoading: false,
        categoriesError: null,
        
        authors: [],
        currentAuthor: null,
        
        searchQuery: '',
        searchResults: [],
        searchLoading: false,
        
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
        
        postsPerPage: 10,
        
        // Posts actions
        setPosts: (posts) => set({ posts }),
        
        addPosts: (newPosts) => set((state) => ({
          posts: [...state.posts, ...newPosts]
        })),
        
        setFeaturedPosts: (featuredPosts) => set({ featuredPosts }),
        
        setCurrentPost: (currentPost) => set({ currentPost }),
        
        setPostsLoading: (postsLoading) => set({ postsLoading }),
        
        setPostsError: (postsError) => set({ postsError }),
        
        // Categories actions
        setCategories: (categories) => set({ categories }),
        
        setCurrentCategory: (currentCategory) => set({ currentCategory }),
        
        setCategoriesLoading: (categoriesLoading) => set({ categoriesLoading }),
        
        setCategoriesError: (categoriesError) => set({ categoriesError }),
        
        // Authors actions
        setAuthors: (authors) => set({ authors }),
        
        setCurrentAuthor: (currentAuthor) => set({ currentAuthor }),
        
        // Search actions
        setSearchQuery: (searchQuery) => set({ searchQuery }),
        
        setSearchResults: (searchResults) => set({ searchResults }),
        
        setSearchLoading: (searchLoading) => set({ searchLoading }),
        
        clearSearch: () => set({
          searchQuery: '',
          searchResults: [],
          searchLoading: false,
        }),
        
        // Pagination actions
        setPagination: (currentPage, totalPages) => set({
          currentPage,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        }),
        
        nextPage: () => set((state) => {
          const newPage = Math.min(state.currentPage + 1, state.totalPages);
          return {
            currentPage: newPage,
            hasNextPage: newPage < state.totalPages,
            hasPreviousPage: newPage > 1,
          };
        }),
        
        previousPage: () => set((state) => {
          const newPage = Math.max(state.currentPage - 1, 1);
          return {
            currentPage: newPage,
            hasNextPage: newPage < state.totalPages,
            hasPreviousPage: newPage > 1,
          };
        }),
        
        goToPage: (page) => set((state) => ({
          currentPage: Math.max(1, Math.min(page, state.totalPages)),
          hasNextPage: page < state.totalPages,
          hasPreviousPage: page > 1,
        })),
        
        setPostsPerPage: (postsPerPage) => set({ postsPerPage }),
        
        // Utility actions
        clearAll: () => set({
          posts: [],
          featuredPosts: [],
          currentPost: null,
          postsLoading: false,
          postsError: null,
          categories: [],
          currentCategory: null,
          categoriesLoading: false,
          categoriesError: null,
          authors: [],
          currentAuthor: null,
          searchQuery: '',
          searchResults: [],
          searchLoading: false,
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
        
        getPostBySlug: (slug) => {
          const { posts } = get();
          return posts.find(post => post.slug === slug);
        },
        
        getCategoryBySlug: (slug) => {
          const { categories } = get();
          return categories.find(category => category.slug === slug);
        },
        
        getPostsByCategory: (categoryId) => {
          const { posts } = get();
          return posts.filter(post => post.categories.includes(categoryId));
        },
        
        getPostsByAuthor: (authorId) => {
          const { posts } = get();
          return posts.filter(post => post.author === authorId);
        },
      }),
      {
        name: 'wordpress-store',
        partialize: (state) => ({
          // Only persist certain parts of the state
          categories: state.categories,
          authors: state.authors,
          postsPerPage: state.postsPerPage,
        }),
      }
    ),
    {
      name: 'WordPress Store',
    }
  )
);

// Selector hooks for optimized state access
export const useWordPressPosts = () => useWordPressStore((state) => ({
  posts: state.posts,
  featuredPosts: state.featuredPosts,
  currentPost: state.currentPost,
  postsLoading: state.postsLoading,
  postsError: state.postsError,
}));

export const useWordPressCategories = () => useWordPressStore((state) => ({
  categories: state.categories,
  currentCategory: state.currentCategory,
  categoriesLoading: state.categoriesLoading,
  categoriesError: state.categoriesError,
}));

export const useWordPressSearch = () => useWordPressStore((state) => ({
  searchQuery: state.searchQuery,
  searchResults: state.searchResults,
  searchLoading: state.searchLoading,
  setSearchQuery: state.setSearchQuery,
  setSearchResults: state.setSearchResults,
  setSearchLoading: state.setSearchLoading,
  clearSearch: state.clearSearch,
}));

export const useWordPressPagination = () => useWordPressStore((state) => ({
  currentPage: state.currentPage,
  totalPages: state.totalPages,
  hasNextPage: state.hasNextPage,
  hasPreviousPage: state.hasPreviousPage,
  nextPage: state.nextPage,
  previousPage: state.previousPage,
  goToPage: state.goToPage,
  setPagination: state.setPagination,
}));

// Action hooks for common operations
export const useWordPressActions = () => useWordPressStore((state) => ({
  setPosts: state.setPosts,
  addPosts: state.addPosts,
  setFeaturedPosts: state.setFeaturedPosts,
  setCurrentPost: state.setCurrentPost,
  setPostsLoading: state.setPostsLoading,
  setPostsError: state.setPostsError,
  setCategories: state.setCategories,
  setCurrentCategory: state.setCurrentCategory,
  setCategoriesLoading: state.setCategoriesLoading,
  setCategoriesError: state.setCategoriesError,
  setAuthors: state.setAuthors,
  setCurrentAuthor: state.setCurrentAuthor,
  setPagination: state.setPagination,
  setPostsPerPage: state.setPostsPerPage,
  clearAll: state.clearAll,
}));

// Utility selectors
export const useWordPressUtils = () => useWordPressStore((state) => ({
  getPostBySlug: state.getPostBySlug,
  getCategoryBySlug: state.getCategoryBySlug,
  getPostsByCategory: state.getPostsByCategory,
  getPostsByAuthor: state.getPostsByAuthor,
}));