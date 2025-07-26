import React from 'react';
import classNames from 'classnames';

interface MobileMenuToggleProps {
  showingNavigationDropdown: boolean;
  setShowingNavigationDropdown: (show: boolean) => void;
}

export default function MobileMenuToggle({
  showingNavigationDropdown,
  setShowingNavigationDropdown,
}: MobileMenuToggleProps) {
  return (
    <div className="flex items-center md:hidden">
      <button
        onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
        className="p-2 text-gray-400 rounded-md transition-colors
        dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400
        hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
        aria-label="Toggle navigation menu"
      >
        <svg
          className="w-5 h-5"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 24 24"
        >
          <path
            className={classNames({
              hidden: showingNavigationDropdown,
              'inline-flex': !showingNavigationDropdown,
            })}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
          <path
            className={classNames({
              hidden: !showingNavigationDropdown,
              'inline-flex': showingNavigationDropdown,
            })}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}
