'use client';

import { useHomepageData, useTransformedPosts } from '@/hooks/useWordPress';
import { transformPosts } from '@/lib/transforms';
import HeroSection from '@/components/sections/HeroSection';
import CategorySection from '@/components/sections/CategorySection';
import ImageSlider from '@/components/ui/ImageSlider';
import SkeletonLoader from '@/components/ui/SkeletonLoader';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

const HomePage = () => {
  const { featuredPosts, recentPosts, categories, isLoading, error } = useHomepageData();

  // Transform WordPress data to component-friendly format
  const transformedFeatured = featuredPosts ? transformPosts(featuredPosts) : null;
  const transformedRecent = recentPosts ? transformPosts(recentPosts) : null;

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Unable to load content
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            We're having trouble connecting to the WordPress API. Please check your configuration.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen">
        {/* Hero Section with Featured Articles */}
        {isLoading ? (
          <div className="bg-white py-6">
            <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
              <div className="flex flex-row flex-wrap">
                <div className="flex-shrink max-w-full w-full lg:w-1/2 pb-1 lg:pb-0 lg:pr-1">
                  <SkeletonLoader variant="hero" />
                </div>
                <div className="flex-shrink max-w-full w-full lg:w-1/2">
                  <div className="flex flex-row flex-wrap">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="flex-shrink max-w-full w-full sm:w-1/2 p-1">
                        <SkeletonLoader variant="card" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : transformedFeatured && transformedFeatured.length > 0 ? (
          <HeroSection 
            featuredArticle={{
              id: transformedFeatured[0].id,
              title: transformedFeatured[0].title,
              excerpt: transformedFeatured[0].excerpt || '',
              slug: transformedFeatured[0].slug,
              featuredImage: transformedFeatured[0].featuredImage,
              category: transformedFeatured[0].category,
            }}
            sideArticles={transformedFeatured.slice(1, 5).map(article => ({
              id: article.id,
              title: article.title,
              slug: article.slug,
              featuredImage: article.featuredImage,
              category: article.category,
            }))}
          />
        ) : (
          // Fallback with mock data when no WordPress data is available
          <HeroSection 
            featuredArticle={{
              id: 1,
              title: "Welcome to Tailnews React",
              excerpt: "Your modern WordPress headless frontend is ready. Configure your WordPress API to start displaying real content.",
              slug: "welcome",
              featuredImage: {
                url: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&q=80",
                alt: "Welcome to Tailnews"
              },
              category: { name: "Getting Started", slug: "getting-started" }
            }}
            sideArticles={[
              {
                id: 2,
                title: "Configure Your WordPress API",
                slug: "configure-api",
                featuredImage: { url: "https://images.unsplash.com/photo-1432821596592-e2c18b78144f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", alt: "API Configuration" },
                category: { name: "Setup", slug: "setup" }
              },
              {
                id: 3,
                title: "Customize Your Theme",
                slug: "customize-theme",
                featuredImage: { url: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80", alt: "Customization" },
                category: { name: "Design", slug: "design" }
              }
            ]}
          />
        )}

        {/* Category Section */}
        {isLoading ? (
          <div className="bg-white py-6">
            <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
              <div className="flex flex-row flex-wrap">
                <div className="flex-shrink max-w-full w-full lg:w-2/3">
                  <div className="w-full py-3">
                    <SkeletonLoader lines={1} className="w-1/3" />
                  </div>
                  <div className="flex flex-row flex-wrap -mx-3">
                    {[...Array(6)].map((_, index) => (
                      <div key={index} className="flex-shrink max-w-full w-full sm:w-1/3 px-3 pb-3">
                        <SkeletonLoader variant="card" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex-shrink max-w-full w-full lg:w-1/3 lg:pl-8 lg:pt-14">
                  <SkeletonLoader lines={5} />
                </div>
              </div>
            </div>
          </div>
        ) : transformedRecent && transformedRecent.length > 0 ? (
          <CategorySection
            categoryName="Latest News"
            categorySlug="latest"
            articles={transformedRecent.slice(0, 6).map(article => ({
              id: article.id,
              title: article.title,
              excerpt: article.excerpt,
              slug: article.slug,
              featuredImage: article.featuredImage,
              category: article.category,
            }))}
            className="py-6"
          />
        ) : null}

        {/* Slider Section with Recent Posts */}
        {transformedRecent && transformedRecent.length > 6 && (
          <div className="relative bg-gray-50 py-12">
            <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
              <div className="flex flex-row flex-wrap">
                <div className="flex-shrink max-w-full w-full overflow-hidden">
                  <div className="w-full py-3">
                    <h2 className="text-white text-2xl font-bold text-shadow-black">
                      <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
                      More Stories
                    </h2>
                  </div>
                  <ImageSlider
                    slides={transformedRecent.slice(6).map(article => ({
                      id: article.id,
                      title: article.title,
                      slug: article.slug,
                      excerpt: article.excerpt,
                      featuredImage: article.featuredImage,
                      category: article.category,
                    }))}
                    slidesPerView={3}
                    spaceBetween={30}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="bg-gray-50 py-12">
          <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Welcome to Tailnews React
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              A modern React application with Next.js, TypeScript, and Tailwind CSS, 
              designed to work seamlessly with WordPress as a headless CMS.
            </p>
            {!transformedFeatured && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-lg mx-auto">
                <p className="text-yellow-800 text-sm">
                  <strong>Getting Started:</strong> Configure your WordPress API URL in the environment variables 
                  to start displaying real content from your WordPress site.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;