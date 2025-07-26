import React from 'react';
import { Link } from '@inertiajs/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { AvatarWithFallback } from '@/Components/ui/avatar-with-fallback';
import { Button } from '@/Components/ui/button';
import { LogOut } from 'lucide-react';
import useTypedPage from '@/Hooks/useTypedPage';
import useRoute from '@/Hooks/useRoute';
import ModeToggle from '../mode-toggle';
import ThemeSwitch from '../dashboard/toggle-switch';

interface UserMenuProps {
  logout: (e: React.FormEvent) => void;
}

export default function UserMenu({ logout }: UserMenuProps) {
  const page = useTypedPage();
  const route = useRoute();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-1 sm:gap-2 p-1 sm:p-2 h-8 sm:h-10 rounded-lg"
        >
          <div className="hidden lg:block text-xs xl:text-sm text-left">
            <span className="text-gray-500 dark:text-gray-400 text-xs">
              Hello,
            </span>
            <div className="font-medium line-clamp-1 max-w-[100px] truncate">
              {page.props.auth.user?.name}
            </div>
          </div>

          <AvatarWithFallback
            src={page.props.auth.user?.profile_photo_url}
            name={page.props.auth.user?.name || 'User'}
            alt={page.props.auth.user?.name}
            className="w-7 h-7 sm:w-8 sm:h-8"
            variant="initials"
            square={true}
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none line-clamp-1">
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
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <ThemeSwitch />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
