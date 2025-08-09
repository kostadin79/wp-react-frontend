'use client';

import { useState } from 'react';
import { useOfflineContent } from '@/hooks/usePWA';
import { Article } from '@/types/api';

interface SaveOfflineButtonProps {
  article: Article;
  className?: string;
}

const SaveOfflineButton = ({ article, className = '' }: SaveOfflineButtonProps) => {
  const { isArticleOffline, saveForOffline, removeFromOffline, isLoading } = useOfflineContent();
  const [actionLoading, setActionLoading] = useState(false);
  
  const isOffline = isArticleOffline(article.slug);

  const handleToggleOffline = async () => {
    if (actionLoading) return;
    
    try {
      setActionLoading(true);
      
      if (isOffline) {
        await removeFromOffline(article.slug);
      } else {
        await saveForOffline(article);
      }
    } catch (error) {
      console.error('Error toggling offline status:', error);
      // Could show a toast notification here
    } finally {
      setActionLoading(false);
    }
  };

  // Don't show if offline functionality is not supported
  if (!('serviceWorker' in navigator) || !('caches' in window)) {
    return null;
  }

  const loading = isLoading || actionLoading;

  return (
    <button
      onClick={handleToggleOffline}
      disabled={loading}
      className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed ${
        isOffline ? 'text-red-600 border-red-300 bg-red-50' : ''
      } ${className}`}
      title={isOffline ? 'Remove from offline reading' : 'Save for offline reading'}
    >
      {loading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
      ) : (
        <svg 
          className={`w-4 h-4 mr-2 ${isOffline ? 'fill-current' : ''}`} 
          fill={isOffline ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
      {loading ? 'Processing...' : isOffline ? 'Saved offline' : 'Save offline'}
    </button>
  );
};

export default SaveOfflineButton;