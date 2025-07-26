import { router } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import React, { PropsWithChildren, useState, useEffect } from 'react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import { Department, Notification, Team } from '@/types';

import { Toaster } from '@/Components/ui/sonner';
import { motion, AnimatePresence } from 'framer-motion';
import MobileSidebar from '@/Components/MobileSidebar';
import { PageTransition } from '@/Components/ui/page-transition';
import NavigationHeader from '@/Components/Navigation/NavigationHeader';
import MobileNavigation from '@/Components/Navigation/MobileNavigation';

interface Props {
  title: string;

  renderHeader?(): JSX.Element;

  canLogin: boolean;
  canRegister: boolean;
  notifications: Notification[];
}

export default function AppLayout({
  title,
  renderHeader,
  children,
  canLogin,
  canRegister,
  notifications,
}: PropsWithChildren<Props>) {
  const page = useTypedPage();
  const route = useRoute();
  const [showingNavigationDropdown, setShowingNavigationDropdown] =
    useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Handle scroll event for sticky header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(open => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);
  function switchToTeam(e: React.FormEvent, team: Team) {
    e.preventDefault();
    router.put(
      route('current-team.update'),
      {
        team_id: team.id,
      },
      {
        preserveState: false,
      },
    );
  }
  const handleCategoryClick = () => {
    setOpen(true);
  };

  function logout(e: React.FormEvent) {
    e.preventDefault();
    router.post(route('logout'));
  }
  const role = page.props.auth.user?.roles.map(role => role.name).toString();
  const department = page.props.department;

  return (
    <div className="flex flex-col min-h-screen">
      <Head title={title} />

      <MobileSidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      <NavigationHeader
        scrolled={scrolled}
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
        showingNavigationDropdown={showingNavigationDropdown}
        setShowingNavigationDropdown={setShowingNavigationDropdown}
        role={role || ''}
        department={department}
        open={open}
        setOpen={setOpen}
        handleCategoryClick={handleCategoryClick}
        canLogin={canLogin}
        canRegister={canRegister}
        notifications={notifications}
        logout={logout}
      />

      <MobileNavigation
        showingNavigationDropdown={showingNavigationDropdown}
        role={role || ''}
        department={department}
        open={open}
        setOpen={setOpen}
        handleCategoryClick={handleCategoryClick}
        logout={logout}
        switchToTeam={switchToTeam}
      />

      {/* Page Content */}
      <main className="flex-grow">
        {/* Page Heading */}
        {renderHeader ? (
          <header className="bg-white shadow-sm dark:bg-gray-800">
            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
              {renderHeader()}
            </div>
          </header>
        ) : null}

        <AnimatePresence mode="wait">
          <PageTransition key={window.location.pathname}>
            {children}
          </PageTransition>
        </AnimatePresence>
      </main>

      {/* <Footer/> */}
    </div>
  );
}
