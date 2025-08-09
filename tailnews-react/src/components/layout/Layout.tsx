import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import InstallPrompt from '../ui/InstallPrompt';
import OfflineIndicator from '../ui/OfflineIndicator';

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

const Layout = ({ children, className = '' }: LayoutProps) => {
  return (
    <div className={`min-h-screen flex flex-col text-gray-700 pt-9 sm:pt-10 ${className}`}>
      <Header />
      <OfflineIndicator />
      <main id="content" className="flex-grow">
        {children}
      </main>
      <Footer />
      <InstallPrompt />
    </div>
  );
};

export default Layout;