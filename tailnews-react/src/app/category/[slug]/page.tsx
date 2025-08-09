import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { serverPostsAPI, serverCategoriesAPI, getAllCategorySlugs } from '@/lib/server-api';
import ArticleCard from '@/components/articles/ArticleCard';
import Link from 'next/link';

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    page?: string;
  }>;
}

// Generate static params for known categories
export async function generateStaticParams() {
  try {
    const slugs = await getAllCategorySlugs();
    return slugs.map((slug) => ({ slug }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return [];
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await serverCategoriesAPI.getCategoryBySlug(resolvedParams.slug);

  if (!category) {
    return {
      title: 'Category Not Found',
      description: 'The requested category could not be found.',
    };
  }

  return {
    title: `${category.name} Articles | Tailnews React`,
    description: category.description || `Browse all articles in the ${category.name} category.`,
    openGraph: {
      title: `${category.name} Articles`,
      description: category.description || `Browse all articles in the ${category.name} category.`,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: `${category.name} Articles`,
      description: category.description || `Browse all articles in the ${category.name} category.`,
    },
    alternates: {
      canonical: `/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const postsPerPage = 12;

  // Fetch category and posts data
  const { posts, category, totalPages } = await serverPostsAPI.getPostsByCategory(
    resolvedParams.slug,
    {
      page: currentPage,
      per_page: postsPerPage,
    }
  );

  if (!category) {
    notFound();
  }

  // Generate pagination URLs
  const basePath = `/category/${resolvedParams.slug}`;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

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
            <span className="text-gray-800">Categories</span>
            <span className="mx-2">/</span>
            <span className="text-gray-800">{category.name}</span>
          </nav>
        </div>
      </div>

      {/* Category Header */}
      <div className="bg-white border-b">
        <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2 py-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              <span className="inline-block h-5 border-l-3 border-red-600 mr-3"></span>
              {category.name}
            </h1>
            {category.description && (
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {category.description}
              </p>
            )}
            <div className="mt-4 text-sm text-gray-500">
              {category.count} {category.count === 1 ? 'article' : 'articles'} in this category
            </div>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2 py-8">
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.map((post) => (
                <ArticleCard
                  key={post.id}
                  title={post.title}
                  excerpt={post.excerpt}
                  slug={post.slug}
                  featuredImage={post.featuredImage}
                  category={post.category}
                  variant="horizontal"
                  className="bg-white shadow-sm border border-gray-100 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-12">
                {/* Previous Page */}
                {prevPage ? (
                  <Link
                    href={`${basePath}?page=${prevPage}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </Link>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </span>
                )}

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 7) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 4) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNumber = totalPages - 6 + i;
                    } else {
                      pageNumber = currentPage - 3 + i;
                    }

                    const isCurrentPage = pageNumber === currentPage;

                    return (
                      <Link
                        key={pageNumber}
                        href={`${basePath}?page=${pageNumber}`}
                        className={`inline-flex items-center px-3 py-2 text-sm font-medium border rounded-lg ${
                          isCurrentPage
                            ? 'text-white bg-red-600 border-red-600'
                            : 'text-gray-500 bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </Link>
                    );
                  })}
                </div>

                {/* Next Page */}
                {nextPage ? (
                  <Link
                    href={`${basePath}?page=${nextPage}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-gray-700"
                  >
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ) : (
                  <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-300 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed">
                    Next
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                )}
              </div>
            )}

            {/* Page Info */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Showing page {currentPage} of {totalPages} ({posts.length} of {category.count} articles)
              </p>
            </div>
          </>
        ) : (
          /* No Posts Message */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No articles found</h3>
              <p className="mt-2 text-gray-500">
                There are no articles in the {category.name} category yet.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}