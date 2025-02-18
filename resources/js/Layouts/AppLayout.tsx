import { router } from '@inertiajs/core';
import { Link, Head } from '@inertiajs/react';
import classNames from 'classnames';
import React, { PropsWithChildren, useState } from 'react';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';
import ApplicationMark from '@/Components/ApplicationMark';
import Banner from '@/Components/Banner';

import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Notification, Team } from '@/types';

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

  return (
    <div>
      <Head title={title} />
      <Banner />
      <div className="min-h-svh">
        <nav className="sticky top-0 z-10 text-black bg-white border-b border-gray-100">
          {/* <!-- Primary Navigation Menu --> */}
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex justify-between h-20">
              <div className="flex">
                {/* <!-- Logo --> */}
                <div className="flex flex-shrink-0 items-center">
                  <Link href={route('/')}>
                    {/*<ApplicationMark className="block w-auto h-9" />\*/}
                      <img alt="logo" src="	https://preview.keenthemes.com/metronic8/demo5/assets/media/logos/demo5.svg"
                      className={"block w-auto h-7"}
                      />
                  </Link>
                </div>

                {/* <!-- Navigation Links --> */}
                <div className="hidden space-x-8 sm:-my-px sm:ml-10 sm:flex">
                  {/*<NavLink*/}
                  {/*    href={route('dashboard')}*/}
                  {/*    active={route().current('dashboard')}*/}

                  {/*>*/}
                  {/*    Dashboard*/}
                  {/*</NavLink>*/}
                  <NavLink href={route('/')} active={route().current('/')}>
                    Home
                  </NavLink>
                  <NavLink
                    href={route('posts.create')}
                    active={route().current('posts.create')}
                  >
                    Create Post
                  </NavLink>
                </div>
              </div>

              <div className="flex sticky top-0 items-center space-x-4">
                <ModeToggle />
                {page.props.auth.user && (
                  <NotificationsDropdown notifications={notifications} />
                )}
                {page.props.auth.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="flex relative gap-3 items-center px-3 h-16 rounded-lg"
                      >
                        <div className="mr-2 text-sm">
                          <span className="text-gray-500">
                            Hello, <br />{' '}
                          </span>
                          <span className="font-medium">
                            {page.props.auth.user?.name}
                          </span>
                        </div>

                        <Avatar className="w-10 h-10 rounded-md">
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
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {page.props.auth.user?.name}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {page.props.auth.user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
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
                  <div className="flex items-center space-x-4">
                    {canLogin && (
                      <Button variant="ghost" asChild>
                        <Link href={route('login')}>Log in</Link>
                      </Button>
                    )}
                    {canRegister && (
                      <Button asChild>
                        <Link href={route('register')}>Register</Link>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* <!-- Hamburger --> */}
              <div className="flex items-center -mr-2 sm:hidden">
                <button
                  onClick={() =>
                    setShowingNavigationDropdown(!showingNavigationDropdown)
                  }
                  className="inline-flex justify-center items-center p-2 text-gray-400 rounded-md transition duration-150 ease-in-out dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-900 focus:text-gray-500 dark:focus:text-gray-400"
                >
                  <svg
                    className="w-6 h-6"
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

          {/* <!-- Responsive Navigation Menu --> */}
          <div
            className={classNames('sm:hidden', {
              block: showingNavigationDropdown,
              hidden: !showingNavigationDropdown,
            })}
          >
            <div className="pt-2 pb-3 space-y-1">
              <ResponsiveNavLink
                href={route('dashboard')}
                active={route().current('dashboard')}
              >
                Dashboard
              </ResponsiveNavLink>
            </div>

            {/* <!-- Responsive Settings Options --> */}
            <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center px-4">
                {page.props.jetstream.managesProfilePhotos ? (
                  <div className="flex-shrink-0 mr-3">
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

                {page.props.jetstream.hasApiFeatures ? (
                  <ResponsiveNavLink
                    href={route('api-tokens.index')}
                    active={route().current('api-tokens.index')}
                  >
                    API Tokens
                  </ResponsiveNavLink>
                ) : null}

                {/* <!-- Authentication --> */}
                <form method="POST" onSubmit={logout}>
                  <ResponsiveNavLink as="button">Log Out</ResponsiveNavLink>
                </form>

                {/* <!-- Team Management --> */}
                {page.props.jetstream.hasTeamFeatures ? (
                  <>
                    <div className="border-t border-gray-200 dark:border-gray-600"></div>

                    <div className="block px-4 py-2 text-xs text-gray-400">
                      Manage Team
                    </div>

                    {/* <!-- Team Settings --> */}
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

                    <div className="border-t border-gray-200 dark:border-gray-600"></div>

                    {/* <!-- Team Switcher --> */}
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
          </div>
        </nav>

        {/* <!-- Page Heading --> */}
        {renderHeader ? (
          <header className="bg-white shadow dark:bg-gray-800">
            <div className="px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
              {renderHeader()}
            </div>
          </header>
        ) : null}

        {/* <!-- Page Content --> */}

        <main>
          <Toaster position="top-right" />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
