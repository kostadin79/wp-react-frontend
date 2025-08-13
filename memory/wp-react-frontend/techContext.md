# Technical Context: WordPress React Frontend

## Tech Stack Overview

### Frontend Framework
- **Next.js 15**: React framework with App Router, SSR/SSG, and Turbopack
- **React 18**: Latest React with concurrent features and server components
- **TypeScript 5**: Strict type checking and enhanced developer experience
- **Tailwind CSS 4**: Utility-first CSS framework with modern features

### Development Tools
- **ESLint**: Code linting with Next.js and TypeScript rules
- **Jest**: JavaScript testing framework with React Testing Library
- **Mock Service Worker (MSW)**: API mocking for testing environments
- **GitHub Actions**: CI/CD pipeline with automated testing and deployment

### WordPress Integration
- **WordPress REST API**: v2 API for content, authentication, and user management
- **JWT Authentication**: JSON Web Tokens for stateless authentication
- **Custom Post Types**: Support for WordPress custom post types and meta fields
- **Media Handling**: WordPress media library integration with Next.js Image optimization

### State Management
- **Zustand**: Lightweight state management for global application state
- **SWR**: Data fetching library with caching, revalidation, and error handling
- **React Context**: Authentication context and user session management
- **Server Components**: Next.js server components for initial data loading

### Performance & PWA
- **Service Worker**: Workbox-generated service worker for offline functionality
- **Web App Manifest**: PWA manifest for installable web app experience
- **Image Optimization**: Next.js Image component with automatic optimization
- **Bundle Optimization**: Automatic code splitting and tree-shaking

## Development Environment Setup

### Prerequisites
- Node.js 18+ (recommended: Node.js 20 LTS)
- npm or yarn package manager
- WordPress backend with REST API enabled
- JWT authentication plugin installed on WordPress

### Environment Variables
```bash
# WordPress API Configuration
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
NEXT_PUBLIC_JWT_AUTH_URL=https://your-wordpress-site.com/wp-json/jwt-auth/v1

# Optional: Analytics and monitoring
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Development Commands
```bash
npm install              # Install dependencies
npm run dev             # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server
npm run test            # Run test suite
npm run test:coverage   # Generate coverage reports
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript check
```

## Deployment Architecture

### Vercel Deployment (Recommended)
- **Automatic Deployments**: GitHub integration with preview deployments
- **Edge Network**: Global CDN with automatic optimization
- **Serverless Functions**: API routes deployed as serverless functions
- **Environment Management**: Secure environment variable management

### Docker Deployment
- **Multi-stage Build**: Optimized Docker image with build and runtime stages
- **Production Optimizations**: Next.js production build with static file serving
- **Container Orchestration**: Ready for Kubernetes or Docker Swarm deployment

### Traditional Hosting
- **Static Export**: Next.js static export for traditional hosting environments
- **CDN Integration**: CloudFront, CloudFlare, or other CDN integration
- **Load Balancing**: Support for multiple server instances with shared state

## Security Configuration

### Content Security Policy
- **Strict CSP**: Comprehensive content security policy headers
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **HTTPS Enforcement**: Automatic HTTPS redirect and security headers

### Authentication Security
- **JWT Token Management**: Secure token storage with httpOnly cookies option
- **Automatic Token Refresh**: Transparent token refresh for better UX
- **Role-based Access**: WordPress user roles and capabilities integration

## Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Lighthouse CI integration with performance budgets
- **Bundle Analysis**: Webpack bundle analyzer for optimization insights
- **Real User Monitoring**: Optional integration with monitoring services

### Error Tracking
- **Error Boundaries**: React error boundaries with error reporting integration
- **API Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging Strategy**: Structured logging for debugging and monitoring