import Link from 'next/link';
import ArticleCard from '../articles/ArticleCard';

interface Article {
  id: number;
  title: string;
  excerpt?: string;
  slug: string;
  featuredImage?: {
    url: string;
    alt: string;
  };
  category?: {
    name: string;
    slug: string;
  };
}

interface CategorySectionProps {
  categoryName: string;
  categorySlug: string;
  articles: Article[];
  showSidebar?: boolean;
  className?: string;
}

const CategorySection = ({ 
  categoryName, 
  categorySlug, 
  articles, 
  showSidebar = true,
  className = '' 
}: CategorySectionProps) => {
  return (
    <div className={`bg-white ${className}`}>
      <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
        <div className="flex flex-row flex-wrap">
          {/* Main Content Area */}
          <div className={`flex-shrink max-w-full w-full ${showSidebar ? 'lg:w-2/3' : ''} overflow-hidden`}>
            <div className="w-full py-3">
              <h2 className="text-gray-800 text-2xl font-bold">
                <span className="inline-block h-5 border-l-3 border-red-600 mr-2"></span>
                <Link href={`/category/${categorySlug}`} className="hover:text-red-600">
                  {categoryName}
                </Link>
              </h2>
            </div>
            
            {/* Article Grid */}
            <div className="flex flex-row flex-wrap -mx-3">
              {articles.map((article, index) => (
                <div 
                  key={article.id}
                  className="flex-shrink max-w-full w-full sm:w-1/2 lg:w-1/3 px-3 pb-3 pt-3 sm:pt-0 border-b-2 sm:border-b-0 border-dotted border-gray-100"
                >
                  <ArticleCard
                    title={article.title}
                    excerpt={article.excerpt}
                    slug={article.slug}
                    featuredImage={article.featuredImage}
                    category={article.category}
                    variant="horizontal"
                  />
                </div>
              ))}
            </div>

            {/* View More Link */}
            {articles.length > 0 && (
              <div className="text-center mt-6">
                <Link 
                  href={`/category/${categorySlug}`}
                  className="inline-block bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
                >
                  View More {categoryName} Articles
                </Link>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          {showSidebar && (
            <div className="flex-shrink max-w-full w-full lg:w-1/3 lg:pl-8 lg:pt-14 lg:pb-8 order-first lg:order-last">
              <div className="w-full bg-gray-50 h-full">
                <div className="text-sm py-6 sticky top-20">
                  {/* Advertisement Placeholder */}
                  <div className="w-full text-center mb-6">
                    <span className="uppercase text-gray-500 text-xs">Advertisement</span>
                    <div className="mt-2 bg-gray-200 h-64 flex items-center justify-center">
                      <span className="text-gray-400">Ad Space</span>
                    </div>
                  </div>
                  
                  {/* Popular Posts Widget */}
                  <div className="w-full bg-white">
                    <div className="mb-6">
                      <div className="p-4 bg-gray-100">
                        <h2 className="text-lg font-bold">Most Popular</h2>
                      </div>
                      <ul className="post-number">
                        {[...Array(5)].map((_, index) => (
                          <li key={index} className="border-b border-gray-100 hover:bg-gray-50">
                            <a className="text-sm font-medium px-4 py-3 flex flex-row items-center hover:text-red-600" href="#">
                              <span className="mr-3 text-red-600 font-bold">{index + 1}</span>
                              Sample popular article title here
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;