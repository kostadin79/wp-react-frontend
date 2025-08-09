import { MetadataRoute } from 'next';
import { serverPostsAPI, serverCategoriesAPI } from '@/lib/server-api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-site.com';
  
  const sitemap: MetadataRoute.Sitemap = [
    // Static pages
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
  ];

  try {
    // Get recent posts for sitemap
    const postsResult = await serverPostsAPI.getPosts({ per_page: 100 });
    const posts = postsResult.posts;

    // Add post URLs
    posts.forEach((post) => {
      sitemap.push({
        url: `${baseUrl}/posts/${post.slug}`,
        lastModified: new Date(post.date),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // Get categories for sitemap
    const categories = await serverCategoriesAPI.getCategories({ per_page: 100 });

    // Add category URLs
    categories.forEach((category) => {
      sitemap.push({
        url: `${baseUrl}/category/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return sitemap;
}