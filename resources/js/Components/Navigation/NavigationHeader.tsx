import React from 'react';
import { Link } from '@inertiajs/react';
import classNames from 'classnames';
import MobileSidebarToggle from '@/Components/toggle-side-bar';
import DesktopNavigation from './DesktopNavigation';
import UserControls from './UserControls';
import MobileMenuToggle from './MobileMenuToggle';


interface NavigationHeaderProps {
  scrolled: boolean;
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  showingNavigationDropdown: boolean;
  setShowingNavigationDropdown: (show: boolean) => void;
  role: string;
  department: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleCategoryClick: () => void;
  canLogin: boolean;
  canRegister: boolean;
  notifications: any[];
  logout: (e: React.FormEvent) => void;
}

export default function NavigationHeader({
  scrolled,
  isMobileSidebarOpen,
  setIsMobileSidebarOpen,
  showingNavigationDropdown,
  setShowingNavigationDropdown,
  role,
  department,
  open,
  setOpen,
  handleCategoryClick,
  canLogin,
  canRegister,
  notifications,
  logout,
}: NavigationHeaderProps) {
  return (
    <nav
      className={classNames(
        'sticky top-0 z-30 transition-all duration-300 border-b bg-white/95 dark:bg-[#0D0E12]/95 backdrop-blur-sm',
        {
          'shadow-sm': scrolled,
        },
      )}
    >
      {/* Primary Navigation Menu */}
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 ">
        <div className="flex justify-between items-center h-20 ">
          {/* Left section: Logo and menu toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Mobile sidebar toggle button */}
            <div className="lg:hidden">
              <MobileSidebarToggle
                isMobileSidebarOpen={isMobileSidebarOpen}
                setIsMobileSidebarOpen={setIsMobileSidebarOpen}
              />
            </div>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold text-gray-900 dark:text-white">
                Support
              </p>
            </Link>
          </div>

          {/* Middle section: Navigation Links */}
          <DesktopNavigation role={role} department={department} />

          {/* Right section: User controls */}
          <div className="flex  space-x-2 sm:space-x-3">
            <UserControls
              open={open}
              setOpen={setOpen}
              handleCategoryClick={handleCategoryClick}
              notifications={notifications}
              canLogin={canLogin}
              canRegister={canRegister}
              logout={logout}
            />

            {/* Mobile menu toggle button */}
            <MobileMenuToggle
              showingNavigationDropdown={showingNavigationDropdown}
              setShowingNavigationDropdown={setShowingNavigationDropdown}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
