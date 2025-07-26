import React from 'react';
import classNames from 'classnames';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { SearchCommandDialog } from '@/Components/command-dialog';
import { Button } from '@/Components/ui/button';
import { Search } from 'lucide-react';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import useRoute from '@/Hooks/useRoute';
import useTypedPage from '@/Hooks/useTypedPage';

interface MobileNavigationProps {
  showingNavigationDropdown: boolean;
  role: string;
  department: any;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleCategoryClick: () => void;
  logout: (e: React.FormEvent) => void;
  switchToTeam: (e: React.FormEvent, team: any) => void;
}

export default function MobileNavigation({
  showingNavigationDropdown,
  role,
  department,
  open,
  setOpen,
  handleCategoryClick,
  logout,
  switchToTeam,
}: MobileNavigationProps) {
  const route = useRoute();
  const page = useTypedPage();

  return (
    <div
      className={classNames(
        'md:hidden transition-all duration-300 ease-in-out bg-white dark:bg-[#0D0E12]',
        {
          'max-h-[500px] opacity-100': showingNavigationDropdown,
          'max-h-0 opacity-0 overflow-hidden': !showingNavigationDropdown,
        },
      )}
    >
      <div className="pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
        <ResponsiveNavLink href={route('/')} active={route().current('/')}>
          Home
        </ResponsiveNavLink>
        <ResponsiveNavLink href={route('all')} active={route().current('all')}>
          Tickets
        </ResponsiveNavLink>
        {role === 'admin' && (
          <ResponsiveNavLink
            href={route('admin.dashboard')}
            active={route().current('admin.dashboard')}
          >
            Dashboard
          </ResponsiveNavLink>
        )}
        {department && (
          <ResponsiveNavLink
            href={route('departments.show', {
              department: department.slug,
            })}
            active={route().current('departments.show', {
              department: department.slug,
            })}
          >
            {department.name}
          </ResponsiveNavLink>
        )}
        
        {/* Mobile Search */}
        <div className="px-4 py-2">
          <SearchCommandDialog open={open} setOpen={setOpen} />
          <Button
            variant={'ghost'}
            className="w-full justify-start"
            onClick={() => handleCategoryClick()}
          >
            <Search className="h-4 w-4 mr-2" />
            Search (Ctrl+K)
          </Button>
        </div>

        {/* Responsive Navigation Menu */}
        {page.props.jetstream.hasTeamFeatures ? (
          <div className="pt-4 pb-1 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <img
                  className="w-10 h-10 rounded-full"
                  src={page.props.auth.user?.profile_photo_url}
                  alt={page.props.auth.user?.name}
                />
              </div>

              <div className="ml-3">
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

              <ResponsiveNavLink
                href={route('api-tokens.index')}
                active={route().current('api-tokens.index')}
              >
                API Tokens
              </ResponsiveNavLink>

              {/* Authentication */}
              <form method="POST" onSubmit={logout}>
                <ResponsiveNavLink as="button">Log Out</ResponsiveNavLink>
              </form>

              {/* Team Management */}
              {page.props.jetstream.hasTeamFeatures ? (
                <>
                  <div className="border-t border-gray-200 dark:border-gray-600"></div>

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

                  <div className="border-t border-gray-200 dark:border-gray-600"></div>

                  {/* Team Switcher */}
                  <div className="block px-4 py-2 text-xs text-gray-400">
                    Switch Teams
                  </div>

                  {page.props.auth.user?.all_teams?.map(team => (
                    <form
                      onSubmit={e => switchToTeam(e, team)}
                      key={team.id}
                    >
                      <ResponsiveNavLink as="button">
                        <div className="flex items-center">
                          {team.id ==
                            page.props.auth.user?.current_team_id && (
                            <svg
                              className="w-5 h-5 mr-2 text-green-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
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
        ) : null}
      </div>
    </div>
  );
}
