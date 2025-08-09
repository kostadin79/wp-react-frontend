import { getHomepageData } from '@/lib/server-api';
import { Metadata } from 'next';
import HeroSection from '@/components/sections/HeroSection';
import CategorySection from '@/components/sections/CategorySection';
import ImageSlider from '@/components/ui/ImageSlider';

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Tailnews React - WordPress News App',
  description: 'Modern React news application with WordPress backend, featuring the latest articles and trending stories.',
  keywords: ['news', 'articles', 'WordPress', 'React', 'Next.js'],
  authors: [{ name: 'Tailnews Team' }],
  openGraph: {
    title: 'Tailnews React - WordPress News App',
    description: 'Modern React news application with WordPress backend',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tailnews React - WordPress News App',
    description: 'Modern React news application with WordPress backend',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function Home() {
  // Fetch data at build time for SSR
  const { featuredPosts, recentPosts, categories } = await getHomepageData();

  // Check if we have WordPress data
  const hasFeaturedPosts = featuredPosts.length > 0;
  const hasRecentPosts = recentPosts.length > 0;

  return (
    <div className="min-h-screen">
      {/* Hero Section with Featured Articles */}
      {hasFeaturedPosts ? (
        <HeroSection 
          featuredArticle={{
            id: featuredPosts[0].id,
            title: featuredPosts[0].title,
            excerpt: featuredPosts[0].excerpt || '',
            slug: featuredPosts[0].slug,
            featuredImage: featuredPosts[0].featuredImage,
            category: featuredPosts[0].category,
          }}
          sideArticles={featuredPosts.slice(1, 5).map(article => ({
            id: article.id,
            title: article.title,
            slug: article.slug,
            featuredImage: article.featuredImage,
            category: article.category,
          }))}
        />
      ) : (
        // Fallback hero section when no WordPress data
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

      {/* Category Section with Recent Posts */}
      {hasRecentPosts && (
        <CategorySection
          categoryName="Latest News"
          categorySlug="latest"
          articles={recentPosts.slice(0, 6).map(article => ({
            id: article.id,
            title: article.title,
            excerpt: article.excerpt,
            slug: article.slug,
            featuredImage: article.featuredImage,
            category: article.category,
          }))}
          className="py-6"
        />
      )}

      {/* Slider Section with More Recent Posts */}
      {recentPosts.length > 6 && (
        <div className="relative bg-gray-50 py-12">
          <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
            <div className="flex flex-row flex-wrap">
              <div className="flex-shrink max-w-full w-full overflow-hidden">
                <div className="w-full py-3">
                  <h2 className="text-gray-800 text-2xl font-bold">
                    <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
                    More Stories
                  </h2>
                </div>
                <ImageSlider
                  slides={recentPosts.slice(6).map(article => ({
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
          {!hasFeaturedPosts && (
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
  );
}