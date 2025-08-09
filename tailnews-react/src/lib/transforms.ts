import { WordPressPost, WordPressCategory, WordPressAuthor, WordPressTag } from '@/types/wordpress';
import { Article, Category, Author, Tag } from '@/types/api';
import { wpUtils } from './wordpress-api';

// Transform WordPress post to Article interface
export function transformPost(post: WordPressPost): Article {
  const featuredImage = wpUtils.getFeaturedImage(post);
  const author = wpUtils.getAuthor(post);
  const categories = wpUtils.getCategories(post);
  const tags = wpUtils.getTags(post);

  return {
    id: post.id,
    title: post.title.rendered,
    excerpt: wpUtils.createExcerpt(post.excerpt.rendered),
    content: post.content.rendered,
    slug: post.slug,
    date: post.date,
    featuredImage: featuredImage ? {
      url: featuredImage.url,
      alt: featuredImage.alt,
    } : undefined,
    category: categories.length > 0 ? {
      name: categories[0].name,
      slug: categories[0].slug,
      id: categories[0].id,
    } : undefined,
    author: author ? {
      name: author.name,
      slug: author.slug,
      id: author.id,
      avatar: author.avatar_urls?.['96'] || author.avatar_urls?.['48'],
    } : undefined,
    tags: tags.map(tag => ({
      name: tag.name,
      slug: tag.slug,
      id: tag.id,
    })),
    isSticky: post.sticky,
  };
}

// Transform WordPress category to Category interface
export function transformCategory(category: WordPressCategory): Category {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description,
    count: category.count,
    parent: category.parent || undefined,
  };
}

// Transform WordPress author to Author interface
export function transformAuthor(author: WordPressAuthor): Author {
  return {
    id: author.id,
    name: author.name,
    slug: author.slug,
    description: author.description,
    avatar: author.avatar_urls?.['96'] || author.avatar_urls?.['48'],
    url: author.url,
  };
}

// Transform WordPress tag to Tag interface
export function transformTag(tag: WordPressTag): Tag {
  return {
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    description: tag.description,
    count: tag.count,
  };
}

// Bulk transform functions
export function transformPosts(posts: WordPressPost[]): Article[] {
  return posts.map(transformPost);
}

export function transformCategories(categories: WordPressCategory[]): Category[] {
  return categories.map(transformCategory);
}

export function transformAuthors(authors: WordPressAuthor[]): Author[] {
  return authors.map(transformAuthor);
}

export function transformTags(tags: WordPressTag[]): Tag[] {
  return tags.map(transformTag);
}

// Transform utilities object
export const transformUtils = {
  post: transformPost,
  category: transformCategory,
  author: transformAuthor,
  tag: transformTag,
  posts: transformPosts,
  categories: transformCategories,
  authors: transformAuthors,
  tags: transformTags,
};