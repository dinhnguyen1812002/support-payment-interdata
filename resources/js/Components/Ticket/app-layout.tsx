import React from 'react';
import { Button } from '@/Components/ui/button';
import { HelpCircle, LogOut, User } from 'lucide-react';
import SidebarNav from './sidebar-nav';
import NotificationsDropdown from '@/Components/NotificationsDropdown';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import useTypedPage from '@/Hooks/useTypedPage';
import { Department } from '@/types';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  department?: Department; // Add department prop
}

export function AppLayout({ children, title, department }: AppLayoutProps) {
  const page = useTypedPage();
  const currentUser = page.props.auth?.user;
  const username = currentUser?.name || undefined;

  return (
    <div className="flex flex-col dark:bg-[#0F1014]">
      <div className="flex flex-1 ">
        {/* Sidebar cố định chiều rộng */}
        <aside className="hidden md:block ">
          <SidebarNav title={title} department={department} />
        </aside>

        {/* Main content chiếm phần còn lại */}
        <main className="flex-1 w-full ">
          <header className="h-16 border-b dark:border-gray-800 bg-background flex items-center justify-between px-4 top-0 z-50 dark:bg-[#0F1014]">
            <div className="flex items-center gap-3">
              <h1 className="font-semibold text-lg">Dashboard</h1>
            </div>

            <div className="flex items-center gap-2 ">
              <NotificationsDropdown notifications={[]} />
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
              >
                <HelpCircle className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-10 w-10 rounded-lg">
                      <AvatarImage
                        src={
                          currentUser?.profile_photo_path
                            ? `/storage/${currentUser.profile_photo_path}`
                            : `https://ui-avatars.com/api/?name=${encodeURI(username as string)}&color=7F9CF5&background=EBF4FF`
                        }
                        alt={currentUser?.name}
                      />
                      <AvatarFallback>
                        {currentUser?.name?.[0] ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser?.name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {currentUser?.email || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link href={route('profile.show')} className="inline-flex">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}
