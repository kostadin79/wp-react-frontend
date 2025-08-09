interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'hero' | 'avatar';
  lines?: number;
  className?: string;
}

const SkeletonLoader = ({ variant = 'text', lines = 3, className = '' }: SkeletonLoaderProps) => {
  const baseClasses = 'animate-pulse bg-gray-200 rounded';

  if (variant === 'avatar') {
    return <div className={`${baseClasses} w-12 h-12 rounded-full ${className}`}></div>;
  }

  if (variant === 'hero') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="w-full h-64 md:h-96 bg-gray-200 rounded"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`${baseClasses} ${className}`}>
        <div className="w-full h-48 bg-gray-200 rounded"></div>
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // Text variant
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`${baseClasses} h-4 ${
            index === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        ></div>
      ))}
    </div>
  );
};

export default SkeletonLoader;