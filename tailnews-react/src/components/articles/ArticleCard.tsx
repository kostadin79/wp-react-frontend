import Link from 'next/link';
import Image from 'next/image';

interface ArticleCardProps {
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
  date?: string;
  variant?: 'default' | 'horizontal' | 'card' | 'hero';
  className?: string;
}

const ArticleCard = ({
  title,
  excerpt,
  slug,
  featuredImage,
  category,
  date,
  variant = 'default',
  className = '',
}: ArticleCardProps) => {
  const baseUrl = '/posts';

  const CategoryIndicator = () => (
    category && (
      <Link href={`/category/${category.slug}`} className="text-gray-500 hover:text-red-600">
        <span className="inline-block h-3 border-l-2 border-red-600 mr-2"></span>
        {category.name}
      </Link>
    )
  );

  // Hero variant - large featured article
  if (variant === 'hero') {
    return (
      <div className={`relative hover-img max-h-98 overflow-hidden ${className}`}>
        <Link href={`${baseUrl}/${slug}`}>
          {featuredImage && (
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          )}
        </Link>
        <div className="absolute px-5 pt-8 pb-5 bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent">
          <Link href={`${baseUrl}/${slug}`}>
            <h2 className="text-3xl font-bold capitalize text-white mb-3 hover:text-gray-200">
              {title}
            </h2>
          </Link>
          {excerpt && (
            <p className="text-gray-100 hidden sm:inline-block line-clamp-2">
              {excerpt}
            </p>
          )}
          <div className="pt-2">
            <div className="text-gray-100">
              <CategoryIndicator />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Card variant - small featured cards
  if (variant === 'card') {
    return (
      <article className={`flex-shrink max-w-full w-full ${className}`}>
        <div className="relative hover-img max-h-48 overflow-hidden">
          <Link href={`${baseUrl}/${slug}`}>
            {featuredImage && (
              <Image
                src={featuredImage.url}
                alt={featuredImage.alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            )}
          </Link>
          <div className="absolute px-4 pt-7 pb-4 bottom-0 w-full bg-gradient-to-t from-black/80 to-transparent">
            <Link href={`${baseUrl}/${slug}`}>
              <h2 className="text-lg font-bold capitalize leading-tight text-white mb-1 hover:text-gray-200 line-clamp-2">
                {title}
              </h2>
            </Link>
            <div className="pt-1">
              <div className="text-gray-100">
                <CategoryIndicator />
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Horizontal variant - mobile-friendly row layout
  if (variant === 'horizontal') {
    return (
      <div className={`flex flex-row sm:block hover-img ${className}`}>
        <Link href={`${baseUrl}/${slug}`} className="flex-shrink-0">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.alt}
              width={120}
              height={80}
              className="w-24 h-20 sm:w-full sm:h-auto object-cover"
            />
          ) : (
            <div className="w-24 h-20 sm:w-full sm:h-32 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
        </Link>
        <div className="py-0 sm:py-3 pl-3 sm:pl-0 flex-grow">
          <h3 className="text-lg font-bold leading-tight mb-2">
            <Link href={`${baseUrl}/${slug}`} className="hover:text-red-600">
              {title}
            </Link>
          </h3>
          {excerpt && (
            <p className="hidden md:block text-gray-600 leading-tight mb-1 line-clamp-2">
              {excerpt}
            </p>
          )}
          <CategoryIndicator />
        </div>
      </div>
    );
  }

  // Default variant - standard article card
  return (
    <article className={`hover-img bg-white ${className}`}>
      <Link href={`${baseUrl}/${slug}`}>
        {featuredImage ? (
          <Image
            src={featuredImage.url}
            alt={featuredImage.alt}
            width={400}
            height={240}
            className="max-w-full w-full mx-auto h-auto object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No Image Available</span>
          </div>
        )}
      </Link>
      <div className="py-3 px-6">
        <h3 className="text-lg font-bold leading-tight mb-2">
          <Link href={`${baseUrl}/${slug}`} className="hover:text-red-600">
            {title}
          </Link>
        </h3>
        {excerpt && (
          <p className="text-gray-600 leading-tight mb-2 line-clamp-2">
            {excerpt}
          </p>
        )}
        <CategoryIndicator />
      </div>
    </article>
  );
};

export default ArticleCard;