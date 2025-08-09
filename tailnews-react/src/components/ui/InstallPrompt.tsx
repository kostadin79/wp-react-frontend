'use client';

import { useState, useEffect } from 'react';
import { usePWA } from '@/hooks/usePWA';
import { motion, AnimatePresence } from 'framer-motion';

interface InstallPromptProps {
  className?: string;
}

const InstallPrompt = ({ className = '' }: InstallPromptProps) => {
  const { canInstall, isInstalled, installApp, isSupported } = usePWA();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if user has previously dismissed the prompt
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after a delay if app can be installed
    if (canInstall && !isInstalled && isSupported) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 3000); // Show after 3 seconds

      return () => clearTimeout(timer);
    }
  }, [canInstall, isInstalled, isSupported]);

  const handleInstall = async () => {
    try {
      setIsInstalling(true);
      await installApp();
      setIsVisible(false);
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  };

  const handleRemindLater = () => {
    setIsVisible(false);
    // Set a temporary dismiss for 24 hours
    const remindTime = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('pwa-install-remind-later', remindTime.toString());
  };

  // Don't show if dismissed, not supported, already installed, or can't install
  if (isDismissed || !isSupported || isInstalled || !canInstall || !isVisible) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className={`fixed bottom-4 left-4 right-4 z-50 ${className}`}
        >
          <div className="max-w-sm mx-auto bg-white shadow-lg rounded-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-red-600 text-white p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">Install Tailnews App</h3>
                </div>
                <button
                  onClick={handleDismiss}
                  className="ml-auto flex-shrink-0 text-white hover:text-gray-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Get the full experience with our mobile app. Read articles offline, get notifications for breaking news, and enjoy faster loading times.
              </p>

              {/* Features */}
              <ul className="text-xs text-gray-500 space-y-1 mb-4">
                <li className="flex items-center">
                  <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Read articles offline
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Faster loading times
                </li>
                <li className="flex items-center">
                  <svg className="w-3 h-3 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Native app experience
                </li>
              </ul>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 bg-red-600 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isInstalling ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Installing...
                    </div>
                  ) : (
                    'Install App'
                  )}
                </button>
                <button
                  onClick={handleRemindLater}
                  className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallPrompt;