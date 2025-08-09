'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAHookReturn {
  isInstalled: boolean;
  canInstall: boolean;
  isOnline: boolean;
  installApp: () => Promise<void>;
  isSupported: boolean;
}

export function usePWA(): PWAHookReturn {
  const [isInstalled, setIsInstalled] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Check if PWA is supported
    const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
    
    if (!isSupported) return;

    // Check if app is already installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isIOSStandalone = (window.navigator as any).standalone === true;
      
      setIsInstalled(isStandalone || (isIOS && isIOSStandalone));
    };

    // Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    // Handle app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setCanInstall(false);
      setDeferredPrompt(null);
      
      // Track installation event
      if (typeof gtag !== 'undefined') {
        gtag('event', 'pwa_installed', {
          event_category: 'engagement',
          event_label: 'PWA Installation',
        });
      }
    };

    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check initial installation status
    checkInstalled();
    
    // Set initial online status
    setIsOnline(navigator.onLine);

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      mediaQuery.removeEventListener('change', checkInstalled);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) {
      throw new Error('Installation prompt not available');
    }

    try {
      // Show the installation prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        // Track successful prompt acceptance
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_accepted', {
            event_category: 'engagement',
            event_label: 'PWA Install Prompt',
          });
        }
      } else {
        // Track prompt dismissal
        if (typeof gtag !== 'undefined') {
          gtag('event', 'pwa_install_dismissed', {
            event_category: 'engagement',
            event_label: 'PWA Install Prompt',
          });
        }
      }
      
      // Clear the prompt
      setDeferredPrompt(null);
      setCanInstall(false);
      
    } catch (error) {
      console.error('Error during PWA installation:', error);
      throw error;
    }
  };

  return {
    isInstalled,
    canInstall,
    isOnline,
    installApp,
    isSupported: 'serviceWorker' in navigator && 'PushManager' in window,
  };
}

// Hook for service worker registration status
export function useServiceWorker() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration()
        .then((reg) => {
          if (reg) {
            setIsRegistered(true);
            setRegistration(reg);
          }
        })
        .catch((err) => {
          setError(err);
        });

      // Listen for service worker updates
      const handleControllerChange = () => {
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
      
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      };
    }
  }, []);

  return {
    isRegistered,
    registration,
    error,
  };
}

// Hook for managing offline content
export function useOfflineContent() {
  const [offlineArticles, setOfflineArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const saveForOffline = async (article: any) => {
    if (!('serviceWorker' in navigator) || !('caches' in window)) {
      throw new Error('Offline functionality not supported');
    }

    try {
      setIsLoading(true);
      
      // Save article to cache
      const cache = await caches.open('offline-articles');
      const articleUrl = `/posts/${article.slug}`;
      
      // Create a Response object from the article data
      const response = new Response(JSON.stringify(article), {
        headers: { 'Content-Type': 'application/json' },
      });
      
      await cache.put(articleUrl, response);
      
      // Update local state
      const updated = [...offlineArticles, article];
      setOfflineArticles(updated);
      localStorage.setItem('offline-articles', JSON.stringify(updated));
      
    } catch (error) {
      console.error('Error saving article for offline:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromOffline = async (articleSlug: string) => {
    try {
      setIsLoading(true);
      
      // Remove from cache
      const cache = await caches.open('offline-articles');
      await cache.delete(`/posts/${articleSlug}`);
      
      // Update local state
      const updated = offlineArticles.filter(article => article.slug !== articleSlug);
      setOfflineArticles(updated);
      localStorage.setItem('offline-articles', JSON.stringify(updated));
      
    } catch (error) {
      console.error('Error removing offline article:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isArticleOffline = (articleSlug: string): boolean => {
    return offlineArticles.some(article => article.slug === articleSlug);
  };

  useEffect(() => {
    // Load offline articles from localStorage
    const saved = localStorage.getItem('offline-articles');
    if (saved) {
      try {
        setOfflineArticles(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading offline articles:', error);
      }
    }
  }, []);

  return {
    offlineArticles,
    isLoading,
    saveForOffline,
    removeFromOffline,
    isArticleOffline,
  };
}

declare global {
  function gtag(...args: any[]): void;
}