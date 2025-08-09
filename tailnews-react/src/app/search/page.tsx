import { Metadata } from 'next';
import { serverPostsAPI } from '@/lib/server-api';
import ArticleCard from '@/components/articles/ArticleCard';
import SearchBar from '@/components/ui/SearchBar';
import Link from 'next/link';

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    page?: string;
  }>;
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  
  if (!query) {
    return {
      title: 'Search | Tailnews React',
      description: 'Search through all articles and news stories.',
      robots: {
        index: false, // Don't index empty search page
      },
    };
  }

  return {
    title: `Search results for "${query}" | Tailnews React`,
    description: `Search results for "${query}" - Find relevant articles and news stories.`,
    robots: {
      index: false, // Don't index search result pages
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || '';
  const currentPage = parseInt(resolvedSearchParams.page || '1', 10);
  const postsPerPage = 12;

  // Fetch search results if query exists
  let posts: any[] = [];
  let totalPages = 1;
  let total = 0;

  if (query && query.length >= 3) {
    try {
      const result = await serverPostsAPI.getPosts({
        search: query,
        page: currentPage,
        per_page: postsPerPage,
      });
      posts = result.posts;
      totalPages = result.totalPages;
      total = result.total;
    } catch (error) {
      console.error('Search error:', error);
    }
  }

  // Generate pagination URLs
  const basePath = `/search`;
  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  const buildUrl = (page: number) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (page > 1) params.set('page', page.toString());
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Search Header */}
      <div className="bg-gray-50 border-b">
        <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Search Articles
            </h1>
            <SearchBar 
              placeholder="Enter keywords to search..." 
              className="w-full"
              showResults={false}
            />
            {query && (
              <div className="mt-4 text-sm text-gray-600">
                {total > 0 ? (
                  <span>
                    Found <strong>{total}</strong> result{total !== 1 ? 's' : ''} for "<strong>{query}</strong>"
                  </span>
                ) : (
                  <span>No results found for "<strong>{query}</strong>"</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2 py-8">
        {/* Search Results */}
        {query && query.length >= 3 ? (
          <>
            {posts.length > 0 ? (
              <>
                {/* Results Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
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
                  <div className="flex justify-center items-center space-x-2">
                    {/* Previous Page */}
                    {prevPage ? (
                      <Link
                        href={buildUrl(prevPage)}
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
                            href={buildUrl(pageNumber)}
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
                        href={buildUrl(nextPage)}
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

                {/* Results Info */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">
                    Showing page {currentPage} of {totalPages} ({posts.length} of {total} results)
                  </p>
                </div>
              </>
            ) : (
              /* No Results */
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No results found</h3>
                  <p className="mt-2 text-gray-500">
                    Sorry, we couldn't find any articles matching "<strong>{query}</strong>".
                  </p>
                  <div className="mt-6 space-y-2">
                    <p className="text-sm text-gray-500">Try:</p>
                    <ul className="text-sm text-gray-500 space-y-1">
                      <li>• Using different keywords</li>
                      <li>• Checking your spelling</li>
                      <li>• Using more general terms</li>
                      <li>• Searching for fewer words</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : query && query.length < 3 ? (
          /* Query Too Short */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Search query too short</h3>
              <p className="mt-2 text-gray-500">
                Please enter at least 3 characters to search.
              </p>
            </div>
          </div>
        ) : (
          /* Welcome Search */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Start searching</h3>
              <p className="mt-2 text-gray-500">
                Enter keywords in the search box above to find articles and news stories.
              </p>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                >
                  Browse Latest Articles
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}