import React from 'react';

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/Components/ui/sidebar';

import useTypedPage from '@/Hooks/useTypedPage';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import ThemeSwitch from '@/Components/dashboard/toggle-switch';
import ModeToggle from '@/Components/mode-toggle';

function logout(e: React.FormEvent) {
  e.preventDefault();
  router.post(route('logout'));
}

export default function NavUser() {
  const { isMobile } = useSidebar();
  const page = useTypedPage();
  const user = page.props.auth.user;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={page.props.auth.user?.profile_photo_url}
                  alt={page.props.auth.user?.name}
                  className="rounded-lg"
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={page.props.auth.user?.profile_photo_url}
                    alt={page.props.auth.user?.name}
                    className="rounded-lg"
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <ThemeSwitch />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            {/*<DropdownMenuSeparator />*/}
            {/*<DropdownMenuGroup>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <BadgeCheck />*/}
            {/*    Account*/}
            {/*  </DropdownMenuItem>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <CreditCard />*/}
            {/*    Billing*/}
            {/*  </DropdownMenuItem>*/}
            {/*  <DropdownMenuItem>*/}
            {/*    <Bell />*/}
            {/*    Notifications*/}
            {/*  </DropdownMenuItem>*/}
            {/*</DropdownMenuGroup>*/}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Label
                onClick={logout}
                className="text-red-500 border-none flex items-center gap-2"
              >
                <LogOut />
                Logout
              </Label>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
