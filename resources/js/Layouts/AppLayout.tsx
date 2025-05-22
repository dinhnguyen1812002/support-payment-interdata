import { router } from '@inertiajs/core';
import { Link, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React, { PropsWithChildren, useState, useEffect } from 'react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Department, Notification, Team } from '@/types';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import Footer from '@/Components/Footer';
import { Button } from '@/Components/ui/button';
import NotificationsDropdown from '@/Components/NotificationsDropdown';

import ModeToggle from '@/Components/mode-toggle';

import { Toaster } from '@/Components/ui/sonner';
import { motion } from 'framer-motion';
import MobileSidebarToggle from '@/Components/toggle-side-bar';
import MobileSidebar from '@/Components/MobileSidebar';
import { Label } from '@/Components/ui/label';

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

  // Handle scroll event for sticky header effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
  function logout(e: React.FormEvent) {
    e.preventDefault();
    router.post(route('logout'));
  }
  const role = page.props.auth.user?.roles.map(role => role.name).toString();

  return (
    <div className="flex flex-col min-h-screen">
      <Head title={title} />

      <MobileSidebar
        isMobileSidebarOpen={isMobileSidebarOpen}
        setIsMobileSidebarOpen={setIsMobileSidebarOpen}
      />

      <nav
        className={classNames(
          'sticky top-0 z-30 w-full transition-all duration-300 border-b',
          {
            'shadow-md bg-white/95 backdrop-blur-sm dark:bg-[#0D0E12]/95':
              scrolled,
            'bg-white dark:bg-[#0D0E12]': !scrolled,
          },
        )}
      >
        {/* Primary Navigation Menu */}
        <div className="max-w-[1450px] mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between h-14 sm:h-16 md:h-18 lg:h-20">
            {/* Left section: Logo and menu toggle */}
            <div className="flex items-center space-x-1">
              {/* Mobile sidebar toggle button */}
              <div className="lg:hidden">
                <MobileSidebarToggle
                  isMobileSidebarOpen={isMobileSidebarOpen}
                  setIsMobileSidebarOpen={setIsMobileSidebarOpen}
                />
              </div>

              {/* Logo */}
              <Link href={route('/')} className="flex items-center ml-12">
                <p
                  className="text-xl sm:text-2xl md:text-3xl font-extrabold bg-gradient-to-r
                    from-blue-600 to-indigo-500 text-transparent bg-clip-text
                    hover:from-indigo-600 hover:to-blue-500 transition-all
                    duration-300 transform hover:scale-105"
                >
                  Support
                </p>
              </Link>
            </div>

            {/* Middle section: Navigation Links */}
            <div className="hidden max-w-3xl flex-1 items-center justify-start ml-10 sm:flex  ">
              <div className="flex space-x-3 md:space-x-6">
                <NavLink href={route('/')} active={route().current('/')}>
                  Dashboard
                </NavLink>
                {/*<NavLink*/}
                {/*  href={route('posts.create')}*/}
                {/*  active={route().current('posts.create')}*/}
                {/*>*/}
                {/*  Create Post*/}
                {/*</NavLink>*/}
                {role === 'admin' && (
                  <NavLink
                    href={route('admin.dashboard')}
                    active={route().current('admin.dashboard')}
                  >
                    Management
                  </NavLink>
                )}
              </div>
            </div>

            {/* Right section: User controls */}
            <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 ">
              {/* Theme toggle */}
              <ModeToggle />
              {/* Notifications - Only show for authenticated users */}
              {page.props.auth.user && (
                <NotificationsDropdown notifications={notifications} />
              )}

              {/*<div className="flex items-center gap-4 rounded-md">*/}
              {/*  <Link*/}
              {/*    href={route('admin.dashboard')}*/}
              {/*    className="hidden md:block"*/}
              {/*  >*/}
              {/*    <Label className="flex cursor-pointer">Admin</Label>*/}
              {/*  </Link>*/}
              {/*</div>*/}
              {/* User Menu or Login/Register buttons */}
              {page.props.auth.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="flex items-center gap-1 p-1 sm:p-2 md:px-3 h-8 sm:h-10 rounded-lg"
                    >
                      <div className="hidden md:block text-sm text-left">
                        <span className="text-gray-500 dark:text-gray-400">
                          Hello, <br />
                        </span>
                        <span className="font-medium line-clamp-1">
                          {page.props.auth.user?.name}
                        </span>
                      </div>

                      <Avatar className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-md">
                        <AvatarImage
                          src={page.props.auth.user?.profile_photo_url}
                          alt={page.props.auth.user?.name}
                          className="rounded-lg"
                        />
                        <AvatarFallback>
                          {page.props.auth.user?.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1 ">
                        <p className="text-sm font-medium leading-none line-clamp-1">
                          {page.props.auth.user?.name}
                        </p>
                        <p className="text-xs leading-none text-muted-foreground ">
                          {page.props.auth.user?.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {page.props.department && (
                      <DropdownMenuItem asChild>
                        <Link
                          href={route('departments.show', {
                            department: page.props.department.slug,
                          })}
                        >
                          {/*{page.props.department.name}*/}
                          Department
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem asChild>
                      <Link href={route('profile.show')}>Profile</Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={e => {
                        e.preventDefault();
                        logout(e as unknown as React.FormEvent);
                      }}
                    >
                      Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  {canLogin && (
                    <Button
                      variant="ghost"
                      asChild
                      size="sm"
                      className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Link href={route('login')}>Log in</Link>
                    </Button>
                  )}
                  {canRegister && (
                    <Button
                      asChild
                      size="sm"
                      className="text-xs sm:text-sm px-2 sm:px-3"
                    >
                      <Link href={route('register')}>Register</Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Mobile menu toggle button */}
              <div className="flex items-center sm:hidden">
                <button
                  onClick={() =>
                    setShowingNavigationDropdown(!showingNavigationDropdown)
                  }
                  className="p-2 text-gray-400 rounded-md transition-colors
                  dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400
                  hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
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
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={classNames(
            'sm:hidden transition-all duration-300 ease-in-out',
            {
              'max-h-[500px] opacity-100': showingNavigationDropdown,
              'max-h-0 opacity-0 overflow-hidden': !showingNavigationDropdown,
            },
          )}
        >
          <div className="pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
            <ResponsiveNavLink href={route('/')} active={route().current('/')}>
              Dashboard
            </ResponsiveNavLink>
            {/*<ResponsiveNavLink*/}
            {/*  href={route('posts.create')}*/}
            {/*  active={route().current('posts.create')}*/}
            {/*>*/}
            {/*  Create Post*/}
            {/*</ResponsiveNavLink>*/}
            {role === 'admin' && (
              <ResponsiveNavLink
                href={route('admin.dashboard')}
                active={route().current('admin.dashboard')}
              >
                Management
              </ResponsiveNavLink>
            )}

            {/*{role === 'admin' && (*/}
            {/*    <NavLink*/}
            {/*        href={route('admin.dashboard')}*/}
            {/*        active={route().current('admin.dashboard')}*/}
            {/*    >*/}
            {/*        Management*/}
            {/*    </NavLink>*/}
            {/*)}*/}
          </div>

          {/* Mobile User Menu */}
          {page.props.auth.user && (
            <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                {page.props.jetstream.managesProfilePhotos ? (
                  <div className="shrink-0 mr-3">
                    <img
                      className="object-cover w-10 h-10 rounded-full"
                      src={page.props.auth.user?.profile_photo_url}
                      alt={page.props.auth.user?.name}
                    />
                  </div>
                ) : null}

                <div>
                  <div className="text-base font-medium text-gray-800 dark:text-gray-200">
                    {page.props.auth.user?.name}
                  </div>
                  <div className="text-sm font-medium text-gray-500">
                    {page.props.auth.user?.email}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <ResponsiveNavLink
                  href={route('profile.show')}
                  active={route().current('profile.show')}
                >
                  Profile
                </ResponsiveNavLink>

                {/* Authentication */}
                <form method="POST" onSubmit={logout}>
                  <ResponsiveNavLink as="button">Log Out</ResponsiveNavLink>
                </form>

                {/* Team Management (if enabled) */}
                {page.props.jetstream.hasTeamFeatures ? (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    <div className="block px-4 py-2 text-xs text-gray-400">
                      Manage Team
                    </div>

                    {/* Team Settings */}
                    <ResponsiveNavLink
                      href={route('teams.show', [
                        page.props.auth.user?.current_team!,
                      ])}
                      active={route().current('teams.show')}
                    >
                      Team Settings
                    </ResponsiveNavLink>

                    {page.props.jetstream.canCreateTeams ? (
                      <ResponsiveNavLink
                        href={route('teams.create')}
                        active={route().current('teams.create')}
                      >
                        Create New Team
                      </ResponsiveNavLink>
                    ) : null}

                    <div className="border-t border-gray-200 dark:border-gray-700"></div>

                    {/* Team Switcher */}
                    <div className="block px-4 py-2 text-xs text-gray-400">
                      Switch Teams
                    </div>
                    {page.props.auth.user?.all_teams?.map(team => (
                      <form onSubmit={e => switchToTeam(e, team)} key={team.id}>
                        <ResponsiveNavLink as="button">
                          <div className="flex items-center">
                            {team.id ==
                              page.props.auth.user?.current_team_id && (
                              <svg
                                className="mr-2 w-5 h-5 text-green-400"
                                fill="none"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            )}
                            <div>{team.name}</div>
                          </div>
                        </ResponsiveNavLink>
                      </form>
                    ))}
                  </>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-grow">
        <Toaster position="top-right" />

        {/* Page Heading */}
        {renderHeader ? (
          <header className="bg-white shadow-sm dark:bg-gray-800">
            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
              {renderHeader()}
            </div>
          </header>
        ) : null}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
