# Frontend-Only Docker Setup

This setup runs only the React frontend without a local WordPress instance. The frontend connects to an existing external WordPress site via REST API.

## Quick Start

```bash
# Copy environment configuration
cp .env.frontend .env.local

# Edit .env.local with your WordPress URL
# NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com

# Start frontend services
docker-compose -f docker-compose.frontend.yml up -d

# View logs
docker-compose -f docker-compose.frontend.yml logs -f frontend
```

## Services Overview

- **Frontend** (`localhost:3000`) - Next.js React application
- **Redis** (`localhost:6379`) - Caching layer for better performance
- **Nginx** (`localhost:80`) - Reverse proxy with compression and caching

## Prerequisites

### WordPress Requirements

Your external WordPress site must have:

1. **REST API v2 enabled** (default in WordPress 4.7+)
2. **JWT Authentication plugin** installed and configured
3. **CORS headers** configured for your frontend domain

### Required WordPress Plugins

```bash
# Install via WordPress admin or WP-CLI
wp plugin install jwt-authentication-for-wp-rest-api --activate
```

### WordPress Configuration

Add to your WordPress `wp-config.php`:

```php
// JWT Authentication
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);

// CORS for REST API
define('ALLOW_UNFILTERED_UPLOADS', true);
```

Add to your theme's `functions.php` or a plugin:

```php
// Enable CORS for your frontend domain
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: https://your-frontend-domain.com');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type');
        return $value;
    });
}, 15);
```

## Environment Configuration

### Required Environment Variables

Edit `.env.local`:

```bash
# Your WordPress site URL
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2

# JWT secret (must match WordPress configuration)
JWT_SECRET_KEY=your-wordpress-jwt-secret-key

# Your frontend domain
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

### Production Configuration

For production, also set:

```bash
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1

# Optional services
REDIS_URL=redis://redis:6379
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
SENTRY_DSN=https://your-sentry-dsn
```

## Usage Commands

### Development Mode

```bash
# Start in development mode (hot reloading enabled)
docker-compose -f docker-compose.frontend.yml up

# Watch logs
docker-compose -f docker-compose.frontend.yml logs -f frontend
```

### Production Mode

```bash
# Start in production mode (with nginx proxy)
docker-compose -f docker-compose.frontend.yml --profile production up -d

# Access via nginx proxy at http://localhost
```

### Useful Commands

```bash
# Rebuild frontend container
docker-compose -f docker-compose.frontend.yml build frontend

# Access frontend container shell
docker-compose -f docker-compose.frontend.yml exec frontend sh

# Check Redis cache
docker-compose -f docker-compose.frontend.yml exec redis redis-cli monitor

# Stop all services
docker-compose -f docker-compose.frontend.yml down

# Remove volumes (cache data)
docker-compose -f docker-compose.frontend.yml down -v
```

## Service Details

### Frontend Service

- **Base Image**: node:20-alpine
- **Port**: 3000
- **Health Check**: Monitors application health
- **Volumes**: 
  - Source code for development
  - Persistent node_modules and .next cache

### Redis Service

- **Purpose**: Cache WordPress API responses and session data
- **Memory Limit**: 256MB with LRU eviction
- **Persistence**: Data saved to volume for restarts

### Nginx Service

- **Purpose**: Reverse proxy with compression and caching
- **Features**:
  - Gzip compression for static assets
  - Long-term caching for `/_next/static/`
  - Health check endpoint at `/health`
  - WebSocket support for hot reloading

## Performance Optimization

### Caching Strategy

1. **Browser Cache**: Static assets cached for 1 year
2. **Redis Cache**: API responses cached with SWR
3. **CDN Ready**: Static files served with proper headers

### Resource Limits

```yaml
# Add to docker-compose.frontend.yml if needed
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## Security Considerations

### Development

- Redis accessible locally for debugging
- CORS configured for localhost
- Source code mounted for hot reloading

### Production

- Use HTTPS for all external communication
- Configure proper CORS origins
- Use strong JWT secrets
- Enable rate limiting in nginx
- Regular security updates for base images

### Recommended nginx Security Headers

Add to nginx.conf:

```nginx
# Security headers
add_header X-Frame-Options DENY;
add_header X-Content-Type-Options nosniff;
add_header X-XSS-Protection "1; mode=block";
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';";
```

## Troubleshooting

### WordPress Connection Issues

```bash
# Test WordPress API directly
curl https://your-wordpress-site.com/wp-json/wp/v2/posts

# Check CORS headers
curl -H "Origin: http://localhost:3000" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-wordpress-site.com/wp-json/wp/v2/posts
```

### Frontend Build Issues

```bash
# Check frontend logs
docker-compose -f docker-compose.frontend.yml logs frontend

# Rebuild without cache
docker-compose -f docker-compose.frontend.yml build --no-cache frontend
```

### Redis Connection Issues

```bash
# Test Redis connection
docker-compose -f docker-compose.frontend.yml exec redis redis-cli ping

# Check Redis logs
docker-compose -f docker-compose.frontend.yml logs redis
```

## Monitoring

### Health Checks

All services include health checks:

```bash
# Check service health
docker-compose -f docker-compose.frontend.yml ps
```

### Logs

```bash
# All services
docker-compose -f docker-compose.frontend.yml logs

# Specific service
docker-compose -f docker-compose.frontend.yml logs frontend

# Follow logs
docker-compose -f docker-compose.frontend.yml logs -f --tail=100
```

## Deployment

### Docker Swarm

```bash
# Deploy to swarm
docker stack deploy -c docker-compose.frontend.yml tailnews
```

### Kubernetes

Convert using Kompose:

```bash
kompose convert -f docker-compose.frontend.yml
kubectl apply -f .
```

### Cloud Platforms

- **AWS ECS**: Use task definitions
- **Google Cloud Run**: Single container deployment
- **Azure Container Instances**: Multi-container groups

## Backup Strategy

### Configuration Backup

```bash
# Backup configuration files
tar -czf config-backup.tar.gz .env.local nginx.conf docker-compose.frontend.yml
```

### Redis Data Backup

```bash
# Backup Redis data
docker-compose -f docker-compose.frontend.yml exec redis redis-cli save
docker cp tailnews-redis:/data/dump.rdb ./redis-backup.rdb
```