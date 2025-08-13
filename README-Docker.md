# Docker Setup for TailNews React Frontend

This guide explains how to run the complete WordPress React frontend stack using Docker Compose.

## Quick Start

```bash
# Clone and navigate to project
cd wp-react-frontend

# Copy environment configuration
cp .env.docker .env.local

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f frontend
```

## Services Overview

The Docker Compose setup includes:

- **Frontend** (`localhost:3000`) - Next.js React application
- **WordPress** (`localhost:8080`) - WordPress backend with REST API
- **Database** (`localhost:3306`) - MySQL 8.0 database
- **Redis** (`localhost:6379`) - Optional caching layer

## First Time Setup

### 1. Start Services
```bash
docker-compose up -d
```

### 2. Configure WordPress
1. Visit `http://localhost:8080`
2. Complete WordPress installation
3. Install required plugins:
   - JWT Authentication for WP REST API
   - REST API enabler (if needed)

### 3. Configure JWT Authentication
Add to WordPress `wp-config.php`:
```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

### 4. Enable CORS
Add to WordPress `.htaccess` or theme functions:
```php
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($value) {
        header('Access-Control-Allow-Origin: http://localhost:3000');
        header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE, PUT');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Allow-Headers: Authorization, X-WP-Nonce, Content-Disposition, Content-MD5, Content-Type');
        return $value;
    });
}, 15);
```

## Development Workflow

### Development Mode
```bash
# Start in development mode (uses docker-compose.override.yml)
docker-compose up

# Watch frontend logs
docker-compose logs -f frontend

# Watch WordPress logs  
docker-compose logs -f wordpress
```

### Production Mode
```bash
# Start in production mode
docker-compose -f docker-compose.yml up -d
```

### Useful Commands

```bash
# Rebuild frontend container
docker-compose build frontend

# Access frontend container shell
docker-compose exec frontend sh

# Access WordPress container shell
docker-compose exec wordpress bash

# Access database
docker-compose exec db mysql -u wordpress -p wordpress

# View all logs
docker-compose logs

# Stop all services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Environment Configuration

### Required Environment Variables

Copy `.env.docker` to `.env.local` and update:

```bash
# WordPress URLs
NEXT_PUBLIC_WORDPRESS_URL=http://localhost:8080
WORDPRESS_API_URL=http://wordpress:80/wp-json/wp/v2

# JWT Secret (change in production!)
JWT_SECRET_KEY=your-secret-key-change-this-in-production

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Production Environment Variables

For production deployment, update:

```bash
# Use your actual domain
NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-domain.com
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com

# Strong JWT secret
JWT_SECRET_KEY=your-very-secure-secret-key

# Database credentials
MYSQL_ROOT_PASSWORD=very-secure-root-password
MYSQL_PASSWORD=secure-wordpress-password
```

## Data Persistence

Volumes are configured for data persistence:

- `db_data` - MySQL database data
- `wordpress_data` - WordPress files and uploads
- `redis_data` - Redis cache data

## Networking

All services communicate via the `tailnews-network` bridge network:

- Frontend can access WordPress at `http://wordpress:80`
- WordPress can access database at `db:3306`
- Redis available at `redis:6379`

## Troubleshooting

### Frontend Build Issues
```bash
# Rebuild with no cache
docker-compose build --no-cache frontend

# Check frontend logs
docker-compose logs frontend
```

### WordPress Connection Issues
```bash
# Check WordPress logs
docker-compose logs wordpress

# Verify database connection
docker-compose exec wordpress wp db check
```

### Database Issues
```bash
# Access MySQL directly
docker-compose exec db mysql -u root -p

# Check database logs
docker-compose logs db
```

### CORS Issues
1. Verify WordPress CORS configuration
2. Check browser developer tools for CORS errors
3. Ensure WordPress URL is accessible from frontend container

## Security Considerations

### Development
- Default passwords are for development only
- JWT secret should be changed
- Database is exposed on port 3306 for debugging

### Production
- Use strong passwords for all services
- Generate secure JWT secret key
- Configure proper firewall rules
- Use HTTPS for all external communication
- Consider using Docker secrets for sensitive data

## Backup and Restore

### Backup
```bash
# Backup database
docker-compose exec db mysqldump -u wordpress -p wordpress > backup.sql

# Backup WordPress files
docker cp tailnews-wordpress:/var/www/html ./wordpress-backup
```

### Restore
```bash
# Restore database
docker-compose exec -T db mysql -u wordpress -p wordpress < backup.sql

# Restore WordPress files
docker cp ./wordpress-backup/. tailnews-wordpress:/var/www/html
```