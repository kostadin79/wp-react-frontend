'use client';

import Link from 'next/link';
import { useState } from 'react';
import SearchBar from '../ui/SearchBar';
import UserMenu from '../auth/UserMenu';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navigation: NavItem[] = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Pages',
    href: '#',
    children: [
      {
        label: 'Homepage',
        href: '#',
        children: [
          { label: 'Homepage 1', href: '/' },
          { label: 'Homepage 2', href: '/home-2' },
        ],
      },
      {
        label: 'Pages',
        href: '#',
        children: [
          { label: 'Author', href: '/author' },
          { label: 'Category', href: '/category' },
          { label: 'Search', href: '/search' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      {
        label: 'Post',
        href: '#',
        children: [
          { label: 'Post default', href: '/posts' },
          { label: 'Post fullwidth', href: '/posts/fullwidth' },
        ],
      },
    ],
  },
  {
    label: 'Categories',
    href: '/categories',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
];

interface DropdownProps {
  items: NavItem[];
  isOpen: boolean;
  level?: number;
}

const Dropdown = ({ items, isOpen, level = 0 }: DropdownProps) => {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <ul 
      className={`dropdown-menu font-normal absolute ${level === 0 ? 'left-0 right-auto top-full' : 'left-full right-auto top-0'} z-50 border-b-0 text-left bg-white text-gray-700 border border-gray-100 shadow-lg`}
      style={{ minWidth: '12rem' }}
    >
      {items.map((item, index) => (
        <li 
          key={index}
          className="subdropdown relative hover:bg-gray-50"
          onMouseEnter={() => item.children && setOpenSubmenu(item.label)}
          onMouseLeave={() => setOpenSubmenu(null)}
        >
          <Link
            href={item.href}
            className="block py-2 px-6 border-b border-gray-100 hover:text-black"
          >
            {item.label}
          </Link>
          {item.children && (
            <Dropdown
              items={item.children}
              isOpen={openSubmenu === item.label}
              level={level + 1}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <nav className="bg-black">
        <div className="xl:container mx-auto px-3 sm:px-4 xl:px-2">
          <div className="flex justify-between">
            {/* Logo */}
            <div className="max-w-10 text-2xl font-bold capitalize text-white flex items-center">
              <Link href="/">Tailnews</Link>
            </div>
            
            <div className="flex flex-row">
              {/* Desktop Navigation */}
              <ul className="navbar hidden lg:flex lg:flex-row text-gray-400 text-sm items-center font-bold">
                {navigation.map((item, index) => (
                  <li
                    key={index}
                    className="relative border-l border-gray-800 hover:bg-gray-900"
                    onMouseEnter={() => item.children && setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <Link
                      href={item.href}
                      className="block py-3 px-6 border-b-2 border-transparent hover:text-white"
                    >
                      {item.label}
                    </Link>
                    {item.children && (
                      <Dropdown
                        items={item.children}
                        isOpen={activeDropdown === item.label}
                      />
                    )}
                  </li>
                ))}
              </ul>

              {/* Desktop Search */}
              <div className="lg:block hidden border-l border-gray-800">
                <div className="p-3">
                  <SearchBar className="w-64" />
                </div>
              </div>

              {/* User Menu */}
              <div className="hidden lg:block">
                <UserMenu />
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden text-gray-400 hover:text-white p-3 border-l border-gray-800 hover:bg-gray-900"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden bg-gray-900 border-t border-gray-800">
              {/* Mobile Search */}
              <div className="p-4 border-b border-gray-800">
                <SearchBar placeholder="Search..." />
              </div>
              
              <ul className="py-2">
                {navigation.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="block py-2 px-4 text-gray-400 hover:text-white hover:bg-gray-800"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              
              {/* Mobile User Menu */}
              <div className="lg:hidden p-4 border-t border-gray-800">
                <UserMenu />
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;