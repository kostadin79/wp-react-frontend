# Architecture Documentation

## Overview

Tailnews React is built using modern web development best practices with a focus on performance, maintainability, and developer experience. This document provides a detailed overview of the system architecture, design patterns, and technical decisions.

## System Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client/PWA    │◄───┤  Next.js App     │◄───┤  WordPress CMS  │
│                 │    │                  │    │                 │
│ • Service Worker│    │ • SSR/SSG        │    │ • REST API      │
│ • Cache Storage │    │ • API Routes     │    │ • Content Mgmt  │
│ • IndexedDB     │    │ • Static Assets  │    │ • Media Files   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CDN/Edge      │    │  Build System    │    │   Database      │
│                 │    │                  │    │                 │
│ • Static Assets │    │ • TypeScript     │    │ • WordPress DB  │
│ • Image Optim.  │    │ • Bundle Optim.  │    │ • Posts/Meta    │
│ • Global Cache  │    │ • PWA Generation │    │ • User Data     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with modern features
- **TypeScript** - Type safety and developer experience

#### Styling & UI
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Swiper.js** - Touch-enabled slider/carousel

#### State Management
- **Zustand** - Lightweight state management
- **SWR** - Data fetching with caching
- **React Hooks** - Local component state

#### Build & Development
- **Turbopack** - Fast bundler for development
- **SWC** - Fast TypeScript/JavaScript compiler
- **ESLint** - Code quality and consistency
- **Webpack Bundle Analyzer** - Bundle optimization

#### PWA & Performance
- **Next-PWA** - Progressive Web App features
- **Workbox** - Service worker strategies
- **Image Optimization** - AVIF/WebP support

## Application Architecture

### Directory Structure

```
tailnews-react/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (routes)/          # Route groups
│   │   ├── api/               # API routes
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Homepage
│   ├── components/            # React components
│   │   ├── articles/          # Article components
│   │   ├── layout/            # Layout components
│   │   ├── pages/             # Page-specific components
│   │   ├── sections/          # Section components
│   │   └── ui/                # Reusable UI components
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility libraries
│   ├── store/                 # State management
│   ├── styles/                # Additional styles
│   ├── types/                 # TypeScript definitions
│   └── utils/                 # Utility functions
├── public/                    # Static assets
├── docs/                      # Documentation
├── .github/                   # GitHub workflows
└── config files              # Various config files
```

### Component Architecture

#### Design Patterns

1. **Component Composition**
   - Small, focused components
   - Composition over inheritance
   - Prop drilling avoided with context

2. **Container/Presentational Pattern**
   - Logic components (containers)
   - UI components (presentational)
   - Clear separation of concerns

3. **Custom Hooks Pattern**
   - Reusable stateful logic
   - API integration encapsulation
   - Cross-component state sharing

#### Component Categories

```
Components/
├── Layout Components          # Page structure
│   ├── Header                # Navigation and branding
│   ├── Footer                # Site footer
│   └── Layout                # Main layout wrapper
├── Article Components         # Content display
│   ├── ArticleCard           # Article preview card
│   ├── ArticleList           # List of articles
│   └── ArticleDetail         # Full article view
├── Section Components         # Page sections
│   ├── HeroSection           # Main hero area
│   ├── CategorySection       # Category browsing
│   └── FeaturedSection       # Featured content
├── UI Components             # Reusable UI elements
│   ├── Button                # Button variants
│   ├── Modal                 # Modal dialogs
│   ├── Loading               # Loading states
│   └── ErrorBoundary         # Error handling
└── PWA Components            # Progressive Web App
    ├── InstallPrompt         # App installation
    ├── OfflineIndicator      # Connection status
    └── ServiceWorkerStatus   # SW status
```

## Data Flow Architecture

### Client-Side Data Flow

```
Component Request
        ↓
Custom Hook (usePosts, useCategories)
        ↓
SWR Cache Check
        ↓
API Client (wordpress-api.ts)
        ↓
WordPress REST API
        ↓
Response Processing
        ↓
SWR Cache Update
        ↓
Component Re-render
```

### Server-Side Data Flow (SSR/SSG)

```
Page Request
        ↓
Server-Side Function (getServerSideProps/generateStaticParams)
        ↓
Server API Client (server-api.ts)
        ↓
WordPress REST API
        ↓
Data Processing & Transformation
        ↓
HTML Generation
        ↓
Client Hydration
```

### Caching Strategy

#### Multi-Level Caching

1. **Browser Cache**
   - Static assets: 1 year
   - HTML pages: No cache
   - API responses: Managed by SWR

2. **Service Worker Cache**
   - Network First: API calls
   - Cache First: Static assets, images
   - Stale While Revalidate: Dynamic content

3. **SWR Cache**
   - Memory-based caching
   - Background revalidation
   - Optimistic updates

4. **CDN/Edge Cache**
   - Global static asset distribution
   - Edge-side includes for dynamic content
   - Geographic optimization

## API Architecture

### WordPress REST API Integration

#### Endpoints Used

```typescript
// Posts
GET /wp/v2/posts
GET /wp/v2/posts/{id}
GET /wp/v2/posts?slug={slug}

// Categories  
GET /wp/v2/categories
GET /wp/v2/categories/{id}

// Tags
GET /wp/v2/tags

// Media
GET /wp/v2/media/{id}

// Users/Authors
GET /wp/v2/users/{id}

// Search
GET /wp/v2/search?search={query}
```

#### API Client Architecture

```typescript
// Base API client
class WordPressAPI {
  private baseURL: string;
  private defaultOptions: RequestInit;
  
  async request<T>(endpoint: string, options?: RequestInit): Promise<T>
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T>
  // Error handling, retry logic, etc.
}

// Specialized API clients
export const postsAPI = {
  getPosts: (params) => api.get('/posts', params),
  getPost: (id) => api.get(`/posts/${id}`),
  getPostBySlug: (slug) => api.get('/posts', { slug }),
};

export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
};
```

#### Error Handling Strategy

```typescript
// Global error handling
class APIError extends Error {
  constructor(
    message: string, 
    public status: number,
    public endpoint: string
  ) {
    super(message);
  }
}

// Retry logic
const retryConfig = {
  attempts: 3,
  delay: 1000,
  exponentialBackoff: true
};

// Circuit breaker pattern
class CircuitBreaker {
  private failures = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Implementation
  }
}
```

## State Management

### Global State (Zustand)

```typescript
interface AppStore {
  // UI State
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  
  // App State
  user: User | null;
  notifications: Notification[];
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  addNotification: (notification: Notification) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  theme: 'light',
  sidebarOpen: false,
  user: null,
  notifications: [],
  
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ 
    sidebarOpen: !state.sidebarOpen 
  })),
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, notification]
  })),
}));
```

### Server State (SWR)

```typescript
// Custom hooks for data fetching
export function usePosts(params?: PostsParams) {
  const { data, error, mutate, isLoading } = useSWR(
    ['posts', params],
    ([, params]) => postsAPI.getPosts(params),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 60000, // 1 minute
      errorRetryCount: 3,
    }
  );
  
  return {
    posts: data?.posts || [],
    totalPages: data?.totalPages || 0,
    isLoading,
    error,
    refetch: mutate,
  };
}
```

### Local State (React Hooks)

```typescript
// Component-level state
function SearchComponent() {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({});
  const [isSearching, setIsSearching] = useState(false);
  
  // Debounced search
  const debouncedQuery = useDebounce(query, 300);
  
  // Search results
  const { data: results } = usePosts({
    search: debouncedQuery,
    ...filters
  });
  
  return (
    // Component JSX
  );
}
```

## Performance Architecture

### Bundle Optimization

#### Code Splitting Strategies

```typescript
// Route-based splitting (automatic with App Router)
const CategoryPage = lazy(() => import('../category/[slug]/page'));
const PostPage = lazy(() => import('../posts/[slug]/page'));

// Component-based splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// Feature-based splitting
const AdminPanel = lazy(() => import('../features/admin/AdminPanel'));
```

#### Bundle Analysis

```bash
# Bundle analyzer configuration
npm run build:analyze

# Webpack Bundle Analyzer output
┌─────────────────────────────────┬──────────┬─────────────┐
│ Asset                           │ Size     │ Chunks      │
├─────────────────────────────────┼──────────┼─────────────┤
│ _next/static/chunks/main-xxx.js │ 45.2 kB  │ main        │
│ _next/static/chunks/framework-xxx.js │ 42.1 kB │ framework  │
│ _next/static/chunks/pages/_app-xxx.js │ 1.2 kB  │ pages/_app │
└─────────────────────────────────┴──────────┴─────────────┘
```

### Image Optimization

#### Next.js Image Component

```typescript
import Image from 'next/image';

// Optimized image loading
<Image
  src={post.featuredImage.url}
  alt={post.featuredImage.alt}
  width={800}
  height={400}
  priority={isAboveTheFold}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

#### Image Configuration

```typescript
// next.config.ts
export default {
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.wordpress.com',
      }
    ],
  }
}
```

### Service Worker Architecture

#### Caching Strategies

```javascript
// Service Worker configuration
const cacheStrategies = {
  // Static assets - Cache First
  staticAssets: {
    urlPattern: /\.(?:js|css|woff|woff2|ttf|eot)$/,
    handler: 'CacheFirst',
    cacheName: 'static-resources',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },
  },
  
  // Images - Cache First  
  images: {
    urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
    handler: 'CacheFirst',
    cacheName: 'images',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },
  },
  
  // API calls - Network First
  api: {
    urlPattern: /^.*\/wp-json\/wp\/v2\/.*$/,
    handler: 'NetworkFirst',
    cacheName: 'wordpress-api',
    networkTimeoutSeconds: 10,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 5 * 60, // 5 minutes
    },
  },
  
  // HTML pages - Network First
  pages: {
    urlPattern: /^https?.*/,
    handler: 'NetworkFirst',
    cacheName: 'offlineCache',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 24 * 60 * 60, // 24 hours
    },
  },
};
```

## Security Architecture

### Content Security Policy

```typescript
// Security headers
const securityHeaders = [
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://your-wordpress-site.com",
    ].join('; ')
  }
];
```

### Input Sanitization

```typescript
// WordPress content sanitization
import DOMPurify from 'dompurify';

function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  });
}

// Component usage
function PostContent({ content }: { content: string }) {
  return (
    <div 
      dangerouslySetInnerHTML={{ 
        __html: sanitizeContent(content) 
      }} 
    />
  );
}
```

### Environment Security

```typescript
// Environment variable validation
const requiredEnvVars = [
  'NEXT_PUBLIC_WORDPRESS_API_URL',
  'NEXT_PUBLIC_SITE_URL',
] as const;

function validateEnvironment() {
  const missing = requiredEnvVars.filter(
    varName => !process.env[varName]
  );
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }
}

// Runtime validation
validateEnvironment();
```

## Deployment Architecture

### Build Pipeline

```yaml
# GitHub Actions workflow
name: CI/CD Pipeline
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      
  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4  
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: .next/
          
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: vercel/action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Docker Architecture

```dockerfile
# Multi-stage build
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder  
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

### CDN Strategy

```typescript
// Asset optimization
const assetConfig = {
  // Static assets
  staticAssets: {
    maxAge: 31536000, // 1 year
    immutable: true,
    gzip: true,
    brotli: true,
  },
  
  // Images
  images: {
    formats: ['avif', 'webp', 'jpeg'],
    qualities: [75, 85, 95],
    sizes: [320, 640, 960, 1280, 1920],
  },
  
  // HTML
  html: {
    maxAge: 0,
    staleWhileRevalidate: 60,
  },
};
```

## Monitoring & Observability

### Performance Monitoring

```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric: any) {
  // Send to your analytics service
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);  
getTTFB(sendToAnalytics);
```

### Error Monitoring

```typescript
// Global error boundary
class GlobalErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to error monitoring service
    console.error('Global error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    
    return this.props.children;
  }
}
```

### Analytics Integration

```typescript
// Google Analytics 4
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

## Scalability Considerations

### Horizontal Scaling
- **Serverless deployment** with Vercel/Netlify
- **CDN distribution** for global performance
- **Database optimization** for WordPress backend

### Vertical Scaling  
- **Bundle splitting** for optimal loading
- **Progressive loading** of content
- **Lazy loading** of images and components

### Caching Strategy
- **Multi-tier caching** (browser, service worker, CDN)
- **Cache invalidation** strategies
- **Background updates** for fresh content

This architecture provides a solid foundation for a scalable, maintainable, and performant WordPress headless frontend application.