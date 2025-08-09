import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverPostsAPI, getAllPostSlugs } from '@/lib/server-api';
import { wpUtils } from '@/lib/wordpress-api';
import Image from 'next/image';
import Link from 'next/link';
import SaveOfflineButton from '@/components/ui/SaveOfflineButton';

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Generate static params for known posts
export async function generateStaticParams() {
  try {
    const slugs = await getAllPostSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await serverPostsAPI.getPostBySlug(resolvedParams.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested post could not be found.',
    };
  }

  return {
    title: `${post.title} | Tailnews React`,
    description: post.excerpt || wpUtils.createExcerpt(post.content || '', 160),
    keywords: post.tags?.map(tag => tag.name) || [],
    authors: post.author ? [{ name: post.author.name }] : [],
    openGraph: {
      title: post.title,
      description: post.excerpt || wpUtils.createExcerpt(post.content || '', 160),
      type: 'article',
      publishedTime: post.date,
      authors: post.author ? [post.author.name] : [],
      images: post.featuredImage ? [
        {
          url: post.featuredImage.url,
          width: 1200,
          height: 630,
          alt: post.featuredImage.alt,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || wpUtils.createExcerpt(post.content || '', 160),
      images: post.featuredImage ? [post.featuredImage.url] : [],
    },
    alternates: {
      canonical: `/posts/${post.slug}`,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const post = await serverPostsAPI.getPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  // Format the date
  const formattedDate = wpUtils.formatDate(post.date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="bg-gray-50 border-b">
        <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2 py-3">
          <nav className="flex text-sm text-gray-600">
            <Link href="/" className="hover:text-red-600">
              Home
            </Link>
            <span className="mx-2">/</span>
            {post.category && (
              <>
                <Link href={`/category/${post.category.slug}`} className="hover:text-red-600">
                  {post.category.name}
                </Link>
                <span className="mx-2">/</span>
              </>
            )}
            <span className="text-gray-800 truncate">{post.title}</span>
          </nav>
        </div>
      </div>

      <article className="xl:container mx-auto px-3 sm:px-4 xl:px-2 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <header className="mb-8">
            {/* Category */}
            {post.category && (
              <div className="mb-4">
                <Link
                  href={`/category/${post.category.slug}`}
                  className="inline-flex items-center text-red-600 hover:text-red-700 font-medium"
                >
                  <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
                  {post.category.name}
                </Link>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              {post.title}
            </h1>

            {/* Excerpt */}
            {post.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed mb-6">
                {post.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center justify-between text-sm text-gray-500 mb-8">
              <div className="flex flex-wrap items-center space-x-4">
                {/* Author */}
                {post.author && (
                  <div className="flex items-center">
                    {post.author.avatar && (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full mr-2"
                      />
                    )}
                    <Link 
                      href={`/author/${post.author.slug}`}
                      className="hover:text-red-600"
                    >
                      By {post.author.name}
                    </Link>
                  </div>
                )}
                
                {/* Date */}
                <time dateTime={post.date} className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {formattedDate}
                </time>
              </div>
              
              {/* Save Offline Button */}
              <SaveOfflineButton article={post} />
            </div>

            {/* Featured Image */}
            {post.featuredImage && (
              <div className="mb-8">
                <Image
                  src={post.featuredImage.url}
                  alt={post.featuredImage.alt}
                  width={1200}
                  height={630}
                  className="w-full h-auto rounded-lg"
                  priority
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content || '' }}
              className="prose prose-lg prose-red max-w-none
                prose-headings:text-gray-900 prose-headings:font-bold
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:text-lg
                prose-a:text-red-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:text-gray-700 prose-ol:text-gray-700
                prose-li:text-gray-700 prose-li:leading-relaxed
                prose-blockquote:border-l-red-600 prose-blockquote:text-gray-600
                prose-code:text-red-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded
                prose-pre:bg-gray-900 prose-pre:text-gray-100"
            />
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap items-center">
                <span className="text-sm font-medium text-gray-500 mr-3">Tags:</span>
                {post.tags.map((tag, index) => (
                  <Link
                    key={tag.id}
                    href={`/tag/${tag.slug}`}
                    className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full mr-2 mb-2 transition-colors"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Author Bio */}
          {post.author && post.author.description && (
            <div className="mt-12 p-6 bg-gray-50 rounded-lg">
              <div className="flex items-start space-x-4">
                {post.author.avatar && (
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    <Link href={`/author/${post.author.slug}`} className="hover:text-red-600">
                      {post.author.name}
                    </Link>
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {post.author.description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}