'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSearch } from '@/hooks/useWordPress';
import { transformPosts } from '@/lib/transforms';
import Link from 'next/link';
import Image from 'next/image';
import LoadingSpinner from './LoadingSpinner';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  showResults?: boolean;
}

const SearchBar = ({ 
  placeholder = "Search articles...", 
  className = '',
  showResults = true 
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Use search hook with debounced query
  const { results, isLoading, error } = useSearch(query.length > 2 ? query : null, {
    per_page: 5
  });

  // Transform WordPress posts to articles
  const transformedResults = results ? transformPosts(results) : null;

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setIsFocused(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(showResults && value.length > 0);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.length > 0 && showResults) {
      setIsOpen(true);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setIsFocused(false);
    setQuery('');
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-10 text-gray-700 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent ${
            isFocused ? 'ring-2 ring-red-500' : ''
          }`}
        />
        <button
          type="submit"
          className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Search Results Dropdown */}
      {isOpen && showResults && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {isLoading && (
            <div className="p-4 text-center">
              <LoadingSpinner size="sm" className="mx-auto" />
              <p className="text-sm text-gray-500 mt-2">Searching...</p>
            </div>
          )}

          {error && (
            <div className="p-4 text-center text-red-600">
              <p className="text-sm">Search error occurred</p>
            </div>
          )}

          {!isLoading && !error && transformedResults && transformedResults.length > 0 && (
            <div>
              <div className="p-2 text-xs text-gray-500 border-b">
                Found {transformedResults.length} results
              </div>
              {transformedResults.map((article) => (
                <Link
                  key={article.id}
                  href={`/posts/${article.slug}`}
                  onClick={handleResultClick}
                  className="block p-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start space-x-3">
                    {article.featuredImage && (
                      <div className="flex-shrink-0">
                        <Image
                          src={article.featuredImage.url}
                          alt={article.featuredImage.alt}
                          width={60}
                          height={40}
                          className="w-15 h-10 object-cover rounded"
                        />
                      </div>
                    )}
                    <div className="flex-grow min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {article.title}
                      </h4>
                      {article.excerpt && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                          {article.excerpt}
                        </p>
                      )}
                      {article.category && (
                        <div className="mt-1">
                          <span className="inline-block h-2 border-l-2 border-red-600 mr-1"></span>
                          <span className="text-xs text-gray-400">{article.category.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
              {transformedResults.length === 5 && (
                <div className="p-3 text-center border-t">
                  <Link
                    href={`/search?q=${encodeURIComponent(query)}`}
                    onClick={handleResultClick}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    View all results →
                  </Link>
                </div>
              )}
            </div>
          )}

          {!isLoading && !error && query.length > 2 && (!transformedResults || transformedResults.length === 0) && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try different keywords</p>
            </div>
          )}

          {!isLoading && !error && query.length <= 2 && query.length > 0 && (
            <div className="p-4 text-center text-gray-500">
              <p className="text-sm">Type at least 3 characters to search</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;