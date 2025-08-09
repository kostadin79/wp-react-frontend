// Mock Service Worker handlers for API mocking
import { http, HttpResponse } from 'msw';
import { mockWordPressPost, mockWordPressCategory } from './test-utils';

const API_BASE = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'http://localhost:8000/wp-json/wp/v2';

export const handlers = [
  // Posts endpoints
  http.get(`${API_BASE}/posts`, ({ request }) => {
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const perPage = url.searchParams.get('per_page') || '10';
    const search = url.searchParams.get('search');
    const categories = url.searchParams.get('categories');

    let posts = Array.from({ length: parseInt(perPage) }, (_, index) => ({
      ...mockWordPressPost,
      id: index + 1,
      title: { rendered: `Test Post ${index + 1}` },
      slug: `test-post-${index + 1}`,
    }));

    // Filter by search
    if (search) {
      posts = posts.filter(post => 
        post.title.rendered.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by categories
    if (categories) {
      const categoryIds = categories.split(',').map(id => parseInt(id));
      posts = posts.filter(post => 
        post.categories.some(cat => categoryIds.includes(cat))
      );
    }

    return HttpResponse.json(posts, {
      headers: {
        'X-WP-Total': '100',
        'X-WP-TotalPages': '10',
        'Content-Type': 'application/json',
      },
    });
  }),

  // Single post endpoint
  http.get(`${API_BASE}/posts/:id`, ({ params }) => {
    const id = parseInt(params.id as string);
    return HttpResponse.json({
      ...mockWordPressPost,
      id,
      title: { rendered: `Test Post ${id}` },
      slug: `test-post-${id}`,
    });
  }),

  // Post by slug endpoint
  http.get(`${API_BASE}/posts`, ({ request }) => {
    const url = new URL(request.url);
    const slug = url.searchParams.get('slug');
    
    if (slug) {
      return HttpResponse.json([{
        ...mockWordPressPost,
        slug,
        title: { rendered: `Post: ${slug}` },
      }]);
    }

    // Fallback to all posts
    return HttpResponse.json([mockWordPressPost]);
  }),

  // Categories endpoints
  http.get(`${API_BASE}/categories`, () => {
    const categories = Array.from({ length: 5 }, (_, index) => ({
      ...mockWordPressCategory,
      id: index + 1,
      name: `Category ${index + 1}`,
      slug: `category-${index + 1}`,
    }));

    return HttpResponse.json(categories);
  }),

  // Single category endpoint
  http.get(`${API_BASE}/categories/:id`, ({ params }) => {
    const id = parseInt(params.id as string);
    return HttpResponse.json({
      ...mockWordPressCategory,
      id,
      name: `Category ${id}`,
      slug: `category-${id}`,
    });
  }),

  // Tags endpoint
  http.get(`${API_BASE}/tags`, () => {
    const tags = Array.from({ length: 10 }, (_, index) => ({
      id: index + 1,
      name: `Tag ${index + 1}`,
      slug: `tag-${index + 1}`,
      description: `Description for tag ${index + 1}`,
      count: Math.floor(Math.random() * 20) + 1,
    }));

    return HttpResponse.json(tags);
  }),

  // Users endpoint
  http.get(`${API_BASE}/users`, () => {
    const users = Array.from({ length: 5 }, (_, index) => ({
      id: index + 1,
      name: `User ${index + 1}`,
      username: `user${index + 1}`,
      email: `user${index + 1}@example.com`,
      avatar_urls: {
        96: `https://example.com/avatar${index + 1}.jpg`,
      },
      description: `Description for user ${index + 1}`,
    }));

    return HttpResponse.json(users);
  }),

  // Media endpoint
  http.get(`${API_BASE}/media/:id`, ({ params }) => {
    const id = parseInt(params.id as string);
    return HttpResponse.json({
      id,
      source_url: `https://example.com/image${id}.jpg`,
      alt_text: `Image ${id}`,
      caption: { rendered: `Caption for image ${id}` },
      media_details: {
        width: 800,
        height: 600,
        sizes: {
          thumbnail: {
            source_url: `https://example.com/image${id}-150x150.jpg`,
            width: 150,
            height: 150,
          },
          medium: {
            source_url: `https://example.com/image${id}-300x225.jpg`,
            width: 300,
            height: 225,
          },
          large: {
            source_url: `https://example.com/image${id}-800x600.jpg`,
            width: 800,
            height: 600,
          },
        },
      },
    });
  }),

  // Authentication endpoints
  http.post('*/jwt-auth/v1/token', async ({ request }) => {
    const body = await request.json() as any;
    
    if (body.username === 'testuser' && body.password === 'password') {
      return HttpResponse.json({
        token: 'mock-jwt-token',
        user_email: 'test@example.com',
        user_nicename: 'testuser',
        user_display_name: 'Test User',
      });
    }

    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }),

  // Token validation endpoint
  http.post('*/jwt-auth/v1/token/validate', ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (authHeader === 'Bearer mock-jwt-token') {
      return HttpResponse.json({
        code: 'jwt_auth_valid_token',
        data: {
          status: 200,
          user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com',
            name: 'Test User',
            roles: ['subscriber'],
          },
        },
      });
    }

    return new HttpResponse(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
  }),

  // Search endpoint
  http.get(`${API_BASE}/search`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search') || '';
    
    const results = [
      {
        id: 1,
        title: `Search result for: ${search}`,
        url: `/posts/search-result-${search}`,
        type: 'post',
        subtype: 'post',
      },
    ];

    return HttpResponse.json(results);
  }),

  // Error simulation endpoints for testing
  http.get('*/error/500', () => {
    return new HttpResponse(null, {
      status: 500,
      statusText: 'Internal Server Error',
    });
  }),

  http.get('*/error/404', () => {
    return new HttpResponse(null, {
      status: 404,
      statusText: 'Not Found',
    });
  }),
];