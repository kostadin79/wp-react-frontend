# System Patterns: WordPress React Frontend

## Architecture Patterns

### Headless CMS Pattern
- **WordPress Backend**: Content management and REST API endpoints
- **React Frontend**: Presentation layer consuming WordPress API
- **JWT Authentication**: Token-based authentication for stateless security
- **Progressive Enhancement**: Core functionality works without JavaScript

### Component Architecture
```
src/
├── components/           # Reusable UI components
│   ├── articles/        # Article-specific components
│   ├── auth/           # Authentication components  
│   ├── layout/         # Layout and navigation
│   ├── pages/          # Page-specific components
│   ├── sections/       # Content sections
│   └── ui/             # Generic UI components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── lib/                # API clients and utilities
├── store/              # Global state management
└── types/              # TypeScript type definitions
```

### API Integration Patterns
- **WordPress API Client**: Centralized API communication with error handling
- **Authentication API**: Separate auth API with token refresh logic  
- **Server API**: Next.js API routes for server-side operations
- **Data Transforms**: Consistent data normalization between WordPress and React

### State Management Pattern
- **Zustand**: Global state for WordPress data and user authentication
- **React Context**: Authentication state and user session management
- **SWR**: Client-side data fetching with automatic revalidation
- **Server State**: Next.js server components for initial data loading

## Design Patterns

### Error Handling
- **Error Boundaries**: React error boundaries for graceful failure handling
- **Loading States**: Skeleton loaders and loading spinners for better UX
- **Offline Support**: Service worker with offline-first caching strategy
- **Fallback UI**: Default content when API requests fail

### Performance Patterns
- **Code Splitting**: Route-based splitting with Next.js automatic optimization
- **Image Optimization**: Next.js Image component with responsive loading
- **Caching Strategy**: Multi-layer caching (browser, CDN, server-side)
- **Bundle Optimization**: Tree-shaking, compression, and chunk optimization

### Testing Patterns
- **Unit Tests**: Component behavior testing with React Testing Library
- **Integration Tests**: API integration and authentication flow testing
- **Mock Service Worker**: API mocking for consistent test environments
- **Coverage Reporting**: Automated coverage reports with GitHub Actions

### Security Patterns
- **JWT Token Management**: Secure token storage with automatic refresh
- **CORS Configuration**: Proper cross-origin resource sharing setup
- **Content Security Policy**: Security headers and CSP implementation
- **Input Sanitization**: WordPress content sanitization and XSS prevention

## Development Patterns

### File Organization
- **Feature-based Structure**: Components organized by domain/feature
- **Index Exports**: Clean imports with barrel exports
- **Type Co-location**: TypeScript types near their usage
- **Test Co-location**: Tests alongside components in __tests__ folders

### Code Style Patterns
- **TypeScript First**: Strict typing for all components and functions
- **Functional Components**: React hooks pattern throughout
- **Custom Hooks**: Reusable logic extraction into custom hooks
- **Composition over Inheritance**: Component composition patterns