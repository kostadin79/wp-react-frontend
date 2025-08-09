import ArticleCard from '../articles/ArticleCard';

interface Article {
  id: number;
  title: string;
  excerpt: string;
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

interface HeroSectionProps {
  featuredArticle: Article;
  sideArticles: Article[];
  className?: string;
}

const HeroSection = ({ featuredArticle, sideArticles, className = '' }: HeroSectionProps) => {
  return (
    <div className={`bg-white py-6 ${className}`}>
      <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
        <div className="flex flex-row flex-wrap">
          {/* Left Large Featured Article */}
          <div className="flex-shrink max-w-full w-full lg:w-1/2 pb-1 lg:pb-0 lg:pr-1">
            <ArticleCard
              title={featuredArticle.title}
              excerpt={featuredArticle.excerpt}
              slug={featuredArticle.slug}
              featuredImage={featuredArticle.featuredImage}
              category={featuredArticle.category}
              variant="hero"
            />
          </div>

          {/* Right Side 2x2 Grid of Articles */}
          <div className="flex-shrink max-w-full w-full lg:w-1/2">
            <div className="box-one flex flex-row flex-wrap">
              {sideArticles.slice(0, 4).map((article, index) => (
                <ArticleCard
                  key={article.id}
                  title={article.title}
                  slug={article.slug}
                  featuredImage={article.featuredImage}
                  category={article.category}
                  variant="card"
                  className={`sm:w-1/2 ${
                    index < 2 ? 'pb-1' : ''
                  } ${
                    index % 2 === 0 ? 'pr-1' : 'pl-1'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;