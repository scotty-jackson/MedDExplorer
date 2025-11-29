/**
 * Main layout component with header, navigation, and footer.
 * Includes ad placeholder containers for future monetization.
 */

import React from 'react';
import Link from 'next/link';
import AdPlaceholder from './AdPlaceholder';

interface LayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export default function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header Ad Placeholder */}
      <AdPlaceholder slot="header" size="leaderboard" />

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <div className="text-2xl font-bold text-primary-600">
                  Medicare Part D Explorer
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Home
              </Link>
              <Link
                href="/categories"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Categories
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                About
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {showSidebar ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main content area */}
              <div className="lg:col-span-9">{children}</div>

              {/* Sidebar with ad placeholders */}
              <aside className="lg:col-span-3">
                <div className="sticky top-4 space-y-6">
                  <AdPlaceholder slot="sidebar-1" size="medium-rectangle" />
                  <AdPlaceholder slot="sidebar-2" size="medium-rectangle" />
                </div>
              </aside>
            </div>
          ) : (
            <>{children}</>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                About This Site
              </h3>
              <p className="text-sm text-gray-600">
                Medicare Part D Drug Spending Explorer provides insights into prescription
                drug costs covered by Medicare Part D, using publicly available data from CMS.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.cms.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-600 hover:text-primary-600"
                  >
                    CMS Official Site
                  </a>
                </li>
                <li>
                  <a
                    href="/about"
                    className="text-sm text-gray-600 hover:text-primary-600"
                  >
                    Data Sources
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/privacy" className="text-sm text-gray-600 hover:text-primary-600">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-gray-600 hover:text-primary-600">
                    Terms of Use
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              &copy; {new Date().getFullYear()} Medicare Part D Explorer. Data sourced from CMS public datasets.
            </p>
          </div>
        </div>

        {/* Footer Ad Placeholder */}
        <AdPlaceholder slot="footer" size="leaderboard" />
      </footer>
    </div>
  );
}
