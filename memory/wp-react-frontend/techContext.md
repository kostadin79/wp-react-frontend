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

### 1. Vercel Deployment (Recommended)
- **Automatic Deployments**: GitHub integration with preview deployments
- **Edge Network**: Global CDN with automatic optimization
- **Serverless Functions**: API routes deployed as serverless functions
- **Environment Management**: Secure environment variable management
- **Performance**: Built-in Core Web Vitals monitoring and optimization

**Deployment Command:**
```bash
vercel --prod
```

### 2. Docker Deployment Options ✅ NEW

#### Option A: Full Stack Docker Compose
**Use Case**: Complete local development or self-hosted deployment
- **Services**: WordPress + MySQL + Redis + React Frontend
- **Benefits**: Complete control, local WordPress development, no external dependencies
- **Environment**: All services in isolated Docker network with persistent volumes

**Configuration:**
```bash
# Start full stack
docker-compose up -d

# Services included:
# - WordPress (port 8080)
# - MySQL Database (port 3306)
# - React Frontend (port 3000)
# - Redis Cache (port 6379)
```

**Files:**
- `docker-compose.yml` - Main configuration
- `docker-compose.override.yml` - Development overrides
- `.env.docker` - Environment template

#### Option B: Frontend-Only Docker Compose
**Use Case**: Production frontend connecting to existing WordPress site
- **Services**: React Frontend + Redis + Nginx
- **Benefits**: Optimized for production, connects to any WordPress site, better performance
- **Environment**: Lightweight setup for external WordPress integration

**Configuration:**
```bash
# Start frontend-only
docker-compose -f docker-compose.frontend.yml up -d

# Services included:
# - React Frontend (port 3000)
# - Redis Cache (port 6379)
# - Nginx Reverse Proxy (port 80/443)
```

**Files:**
- `docker-compose.frontend.yml` - Main configuration
- `docker-compose.frontend.override.yml` - Development overrides
- `.env.frontend` - Environment template
- `nginx.conf` - Nginx configuration

#### Docker Infrastructure Features
- **Multi-stage Builds**: Optimized Docker images with build and runtime stages
- **Health Checks**: Comprehensive health monitoring for all services
- **Data Persistence**: Volumes for database, WordPress files, and cache
- **Service Orchestration**: Proper networking and service discovery
- **Development Mode**: Hot reloading and development-specific configurations
- **Production Mode**: Nginx reverse proxy with compression and caching

### 3. Traditional Hosting
- **Static Export**: Next.js static export for traditional hosting environments
- **CDN Integration**: CloudFront, CloudFlare, or other CDN integration
- **Load Balancing**: Support for multiple server instances with shared state

**Deployment Command:**
```bash
npm run build && npm start
```

### 4. Container Orchestration
- **Kubernetes**: Ready for Kubernetes deployment with provided Docker configurations
- **Docker Swarm**: Support for Docker Swarm with service definitions
- **Cloud Platforms**: Compatible with AWS ECS, Google Cloud Run, Azure Container Instances

## Environment Configuration

### Full Stack Docker Environment
```bash
# WordPress Configuration
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8080
WORDPRESS_API_URL=http://wordpress:80/wp-json/wp/v2
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-change-this-in-production

# Database Configuration
MYSQL_DATABASE=wordpress
MYSQL_USER=wordpress
MYSQL_PASSWORD=wordpress_password
MYSQL_ROOT_PASSWORD=root_password

# Redis Configuration
REDIS_URL=redis://redis:6379
```

### Frontend-Only Docker Environment
```bash
# External WordPress Configuration
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com

# JWT Authentication (must match WordPress)
JWT_SECRET_KEY=your-wordpress-jwt-secret-key

# Redis Configuration
REDIS_URL=redis://redis:6379
```

## Security Configuration

### Content Security Policy
- **Strict CSP**: Comprehensive content security policy headers
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **HTTPS Enforcement**: Automatic HTTPS redirect and security headers

### Authentication Security
- **JWT Token Management**: Secure token storage with httpOnly cookies option
- **Automatic Token Refresh**: Transparent token refresh for better UX
- **Role-based Access**: WordPress user roles and capabilities integration

### Docker Security
- **Non-root Execution**: All containers run with non-root users
- **Network Isolation**: Services communicate through dedicated Docker networks
- **Secret Management**: Environment variables for sensitive configuration
- **Image Security**: Base images regularly updated for security patches

## Performance Optimization

### Caching Strategy
- **Browser Cache**: Static assets cached with proper headers
- **Redis Cache**: API responses and session data cached with Redis
- **CDN Cache**: Static files served via CDN with long-term caching
- **Service Worker**: Offline caching for content and API responses

### Docker Performance
- **Nginx Optimization**: Gzip compression and static file caching
- **Resource Limits**: Configured resource limits for production environments
- **Multi-stage Builds**: Minimal production images with optimized layers
- **Volume Optimization**: Persistent volumes for data and efficient builds

## Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals**: Lighthouse CI integration with performance budgets
- **Bundle Analysis**: Webpack bundle analyzer for optimization insights
- **Real User Monitoring**: Optional integration with monitoring services
- **Docker Health Checks**: Service health monitoring and automatic restarts

### Error Tracking
- **Error Boundaries**: React error boundaries with error reporting integration
- **API Error Handling**: Comprehensive error handling with user-friendly messages
- **Logging Strategy**: Structured logging for debugging and monitoring
- **Container Logging**: Centralized logging from all Docker services

## Development Workflow

### Local Development Options

#### Option 1: Standard Development
```bash
npm install
npm run dev
# Requires external WordPress instance
```

#### Option 2: Full Stack Docker Development
```bash
docker-compose up
# Complete WordPress + React environment
# WordPress: http://localhost:8080
# Frontend: http://localhost:3000
```

#### Option 3: Frontend-Only Docker Development
```bash
docker-compose -f docker-compose.frontend.yml up
# Frontend with external WordPress
# Frontend: http://localhost:3000
```

### Testing Strategy
- **Unit Tests**: Jest with React Testing Library for component testing
- **Integration Tests**: MSW for API mocking and full workflow testing
- **End-to-End Tests**: Optional Playwright or Cypress integration
- **Docker Testing**: Health checks and service integration testing

### CI/CD Pipeline
- **GitHub Actions**: Automated testing, building, and deployment
- **Multi-environment**: Separate workflows for development, staging, and production
- **Docker Integration**: Automated Docker image building and pushing
- **Security Scanning**: Automated vulnerability scanning for dependencies and images

## Architecture Decisions

### WordPress Integration Strategy
- **Headless CMS**: Complete separation of frontend and backend
- **REST API**: WordPress REST API v2 for all data operations
- **JWT Authentication**: Stateless authentication with automatic token refresh
- **Type Safety**: Full TypeScript interfaces for WordPress data structures

### Docker Strategy
- **Multi-deployment Options**: Full stack and frontend-only configurations
- **Environment Flexibility**: Templates for different deployment scenarios
- **Service Orchestration**: Proper networking, volumes, and health checks
- **Development Experience**: Hot reloading and development-specific overrides

### Performance Strategy
- **Multi-level Caching**: Browser, Redis, CDN, and service worker caching
- **Image Optimization**: Next.js Image component with automatic optimization
- **Bundle Optimization**: Automatic code splitting and tree-shaking
- **Server-side Rendering**: Next.js SSR with caching for optimal performance

## Maintenance & Updates

### Regular Maintenance Tasks
- **Dependency Updates**: Regular updates for security and performance
- **Docker Image Updates**: Base image updates for security patches
- **WordPress Compatibility**: Testing with new WordPress versions
- **Performance Monitoring**: Ongoing optimization and monitoring

### Backup Strategy
- **Configuration Backup**: Version-controlled configuration files
- **Docker Volume Backup**: Automated backup of persistent data
- **Database Backup**: Regular MySQL database backups for full stack setup
- **Redis Backup**: Cache data backup for session persistence

This technical context provides comprehensive coverage of the WordPress React frontend architecture, deployment options, and operational considerations with the newly added Docker Compose infrastructure.