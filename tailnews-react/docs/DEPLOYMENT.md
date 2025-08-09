# Deployment Guide

## Overview

This guide covers comprehensive deployment strategies for the Tailnews React application across multiple platforms including Vercel, Docker, traditional hosting, and CI/CD pipelines.

## Quick Deployment (Vercel)

### 1. Vercel Platform (Recommended)

Vercel provides the most optimized deployment experience for Next.js applications.

#### Prerequisites
- GitHub/GitLab/Bitbucket account
- Vercel account (free tier available)
- Environment variables configured

#### Step-by-Step Deployment

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy from project directory
cd tailnews-react
vercel

# 4. Production deployment
vercel --prod
```

#### Environment Variables Setup

In Vercel Dashboard:
1. Go to Project Settings
2. Navigate to Environment Variables
3. Add the following variables:

```env
# Required
NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
NEXT_PUBLIC_SITE_URL=https://your-vercel-domain.vercel.app
NEXT_PUBLIC_SITE_NAME=Your Site Name

# Optional
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Custom Domain Setup

```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS (add these records to your DNS provider):
# Type: A, Name: @, Value: 76.76.19.61
# Type: CNAME, Name: www, Value: cname.vercel-dns.com
```

### 2. Vercel Configuration

Create `vercel.json` for advanced configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev",
  "env": {
    "NEXT_PUBLIC_WORDPRESS_API_URL": "@wordpress_api_url",
    "NEXT_PUBLIC_SITE_URL": "@site_url"
  },
  "build": {
    "env": {
      "NODE_ENV": "production"
    }
  },
  "functions": {
    "src/app/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        },
        {
          "key": "Service-Worker-Allowed",
          "value": "/"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

## Docker Deployment

### 1. Docker Setup

#### Dockerfile (Multi-stage build)

```dockerfile
# Dependencies stage
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# Builder stage
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN npm run build

# Runner stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  tailnews-react:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json/wp/v2
      - NEXT_PUBLIC_SITE_URL=https://yourdomain.com
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - tailnews-react
    restart: unless-stopped
```

#### Nginx Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream nextjs {
        server tailnews-react:3000;
    }
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name yourdomain.com www.yourdomain.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        # Security headers
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
        add_header X-Frame-Options "DENY" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        
        # Compression
        gzip on;
        gzip_vary on;
        gzip_types
            text/plain
            text/css
            text/xml
            text/javascript
            application/javascript
            application/xml+rss
            application/json;
        
        location / {
            proxy_pass http://nextjs;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
        
        # Static assets caching
        location /_next/static {
            proxy_pass http://nextjs;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
        
        # API rate limiting
        location /api/ {
            limit_req zone=api burst=20 nodelay;
            proxy_pass http://nextjs;
        }
    }
}
```

### 2. Docker Deployment Commands

```bash
# Build and run with Docker Compose
docker-compose up -d

# Build only
docker-compose build

# View logs
docker-compose logs -f tailnews-react

# Scale the application
docker-compose up -d --scale tailnews-react=3

# Stop and remove containers
docker-compose down

# Update and redeploy
docker-compose pull
docker-compose up -d
```

## AWS Deployment

### 1. AWS Amplify

```bash
# Install Amplify CLI
npm install -g @aws-amplify/cli

# Initialize Amplify project
amplify init

# Add hosting
amplify add hosting

# Deploy
amplify publish
```

#### Amplify Configuration

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### 2. AWS ECS with Fargate

```json
{
  "family": "tailnews-react",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "tailnews-react",
      "image": "your-ecr-repo/tailnews-react:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "NEXT_PUBLIC_WORDPRESS_API_URL",
          "value": "https://your-wordpress-site.com/wp-json/wp/v2"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/tailnews-react",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## Traditional Hosting

### 1. VPS/Dedicated Server Setup

#### Prerequisites
- Ubuntu 20.04+ or CentOS 8+
- Node.js 20+
- PM2 process manager
- Nginx web server
- SSL certificate

#### Server Setup Script

```bash
#!/bin/bash
# server-setup.sh

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
sudo mkdir -p /var/www/tailnews-react
sudo chown $USER:$USER /var/www/tailnews-react

# Clone and setup application
cd /var/www/tailnews-react
git clone <your-repo-url> .
npm install
npm run build

# PM2 configuration
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Setup SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

#### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'tailnews-react',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/tailnews-react',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXT_PUBLIC_WORDPRESS_API_URL: 'https://your-wordpress-site.com/wp-json/wp/v2',
      },
      error_file: '/var/log/tailnews-react/err.log',
      out_file: '/var/log/tailnews-react/out.log',
      log_file: '/var/log/tailnews-react/combined.log',
      time: true,
      max_memory_restart: '1G',
      node_args: '--max_old_space_size=1024',
    },
  ],
};
```

### 2. Deployment Script

```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Starting deployment..."

# Pull latest changes
git pull origin main

# Install dependencies
npm ci --only=production

# Build application
npm run build

# Restart PM2
pm2 reload ecosystem.config.js

# Check health
sleep 10
curl -f http://localhost:3000 || exit 1

echo "✅ Deployment successful!"

# Optional: Clear CDN cache
# curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \
#   -H "Authorization: Bearer YOUR_API_TOKEN" \
#   -H "Content-Type: application/json" \
#   --data '{"purge_everything":true}'
```

## CI/CD Pipeline

### 1. GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  NODE_VERSION: '20'

jobs:
  test:
    name: Test and Lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npm run type-check

      - name: Run tests
        run: npm test
        env:
          CI: true

  security:
    name: Security Audit
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run security audit
        run: npm audit --audit-level high

      - name: Run Snyk test
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    name: Build Application
    runs-on: ubuntu-latest
    needs: [test, security]
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
          NEXT_PUBLIC_WORDPRESS_API_URL: ${{ secrets.NEXT_PUBLIC_WORDPRESS_API_URL }}

      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build-files
          path: |
            .next/
            public/
          retention-days: 1

  deploy-vercel:
    name: Deploy to Vercel
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  deploy-docker:
    name: Deploy via Docker
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}

      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: .
          platforms: linux/amd64,linux/arm64
          push: true
          tags: |
            your-dockerhub-username/tailnews-react:latest
            your-dockerhub-username/tailnews-react:${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

      - name: Deploy to production server
        uses: appleboy/ssh-action@v1.0.0
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/tailnews-react
            docker-compose pull
            docker-compose up -d
            docker system prune -f

  lighthouse:
    name: Lighthouse Audit
    runs-on: ubuntu-latest
    needs: deploy-vercel
    steps:
      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            https://your-vercel-domain.vercel.app
            https://your-vercel-domain.vercel.app/posts/sample-post
          uploadArtifacts: true
          temporaryPublicStorage: true
```

### 2. GitLab CI/CD

```yaml
# .gitlab-ci.yml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "20"
  DOCKER_IMAGE: $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA

cache:
  paths:
    - node_modules/
    - .next/cache/

test:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run lint
    - npm run type-check
    - npm test
  artifacts:
    reports:
      junit: junit.xml
    expire_in: 1 week

security_scan:
  stage: test
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm audit --audit-level high
  allow_failure: true

build:
  stage: build
  image: node:$NODE_VERSION
  script:
    - npm ci
    - npm run build
  artifacts:
    paths:
      - .next/
    expire_in: 1 hour
  only:
    - main

deploy_docker:
  stage: deploy
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - docker build -t $DOCKER_IMAGE .
    - docker push $DOCKER_IMAGE
    - docker tag $DOCKER_IMAGE $CI_REGISTRY_IMAGE:latest
    - docker push $CI_REGISTRY_IMAGE:latest
  only:
    - main

deploy_production:
  stage: deploy
  image: alpine:latest
  before_script:
    - apk add --no-cache openssh-client
    - eval $(ssh-agent -s)
    - echo "$SSH_PRIVATE_KEY" | ssh-add -
    - mkdir -p ~/.ssh
    - ssh-keyscan -H $DEPLOY_HOST >> ~/.ssh/known_hosts
  script:
    - |
      ssh $DEPLOY_USER@$DEPLOY_HOST << 'EOF'
        cd /var/www/tailnews-react
        docker-compose pull
        docker-compose up -d
        docker system prune -f
      EOF
  only:
    - main
  when: manual
```

## Performance Optimization

### 1. CDN Configuration

#### Cloudflare Setup

```javascript
// Cloudflare Worker for edge caching
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const cache = caches.default
  const cacheKey = new Request(request.url, request)
  
  // Check cache first
  let response = await cache.match(cacheKey)
  
  if (!response) {
    // Fetch from origin
    response = await fetch(request)
    
    // Cache static assets for 1 year
    if (request.url.includes('/_next/static/')) {
      const newHeaders = new Headers(response.headers)
      newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable')
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      })
    }
    
    // Cache HTML for 1 hour with stale-while-revalidate
    if (response.headers.get('Content-Type')?.includes('text/html')) {
      const newHeaders = new Headers(response.headers)
      newHeaders.set('Cache-Control', 'public, max-age=3600, stale-while-revalidate=86400')
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      })
    }
    
    event.waitUntil(cache.put(cacheKey, response.clone()))
  }
  
  return response
}
```

### 2. Database Optimization

#### WordPress Optimization

```php
// WordPress performance optimizations
// Add to functions.php

// Remove unnecessary scripts
function remove_wordpress_scripts() {
    wp_deregister_script('wp-embed');
    remove_action('wp_head', 'wp_generator');
    remove_action('wp_head', 'wlwmanifest_link');
    remove_action('wp_head', 'rsd_link');
}
add_action('wp_enqueue_scripts', 'remove_wordpress_scripts');

// Optimize REST API queries
function optimize_rest_api_query($args, $request) {
    // Limit fields to reduce payload
    if (isset($request['_fields'])) {
        return $args;
    }
    
    $args['meta_query'] = array(
        'relation' => 'OR',
        array(
            'key' => '_thumbnail_id',
            'compare' => 'EXISTS'
        ),
        array(
            'key' => '_thumbnail_id',
            'compare' => 'NOT EXISTS'
        )
    );
    
    return $args;
}
add_filter('rest_post_query', 'optimize_rest_api_query', 10, 2);

// Enable object caching
function enable_rest_api_caching() {
    if (is_admin() || !function_exists('wp_cache_get')) {
        return;
    }
    
    $cache_key = 'rest_api_' . md5($_SERVER['REQUEST_URI']);
    $cached_response = wp_cache_get($cache_key);
    
    if ($cached_response !== false) {
        header('X-Cache: HIT');
        echo $cached_response;
        exit;
    }
    
    ob_start();
}
add_action('rest_api_init', 'enable_rest_api_caching');
```

## Monitoring & Health Checks

### 1. Health Check Endpoint

```typescript
// src/app/api/health/route.ts
export async function GET() {
  try {
    // Check database connectivity
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL}/posts?per_page=1`);
    
    if (!response.ok) {
      throw new Error('WordPress API not accessible');
    }
    
    return Response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        wordpress: 'healthy',
        database: 'healthy'
      }
    });
  } catch (error) {
    return Response.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    }, { status: 503 });
  }
}
```

### 2. Monitoring Setup

```bash
# Install monitoring tools
npm install @sentry/nextjs @vercel/analytics

# Setup Sentry
npx @sentry/wizard -i nextjs
```

## Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   ```bash
   # Clear caches
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Check environment variables
   printenv | grep NEXT_PUBLIC
   
   # Verify .env.local exists and is properly formatted
   cat .env.local
   ```

3. **Memory Issues During Build**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS="--max_old_space_size=4096" npm run build
   ```

4. **Service Worker Not Updating**
   ```bash
   # Clear service worker cache
   # In browser: Application > Storage > Clear storage
   
   # Force service worker update
   # In service worker: self.skipWaiting()
   ```

This deployment guide provides comprehensive instructions for deploying the Tailnews React application across various platforms and environments.