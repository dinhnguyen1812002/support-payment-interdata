import {
  ChevronDown,
  Home,
  Settings,
  Users,
  FileText,
  Mail,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/Components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/Components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import React from 'react';

// Navigation items with nested sections
const navItems = [
  {
    title: 'Dashboard',
    icon: Home,
    href: '/',
  },
  {
    title: 'Users',
    icon: Users,
    href: '/users',
  },
  {
    title: 'Content',
    icon: FileText,
    children: [
      { title: 'Pages', href: '/content/pages' },
      { title: 'Blog Posts', href: '/content/blog' },
      { title: 'Media Library', href: '/content/media' },
    ],
  },
  {
    title: 'Communications',
    icon: Mail,
    children: [
      { title: 'Email', href: '/communications/email' },
      { title: 'Notifications', href: '/communications/notifications' },
      { title: 'Calendar', href: '/communications/calendar' },
    ],
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export default function AdvancedSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="h-16 flex items-center px-4 border-b">
        <div className="flex items-center gap-3">
          <div className="bg-primary h-8 w-8 rounded-md flex items-center justify-center text-primary-foreground font-bold">
            A
          </div>
          <div className="font-semibold text-lg">Admin Panel</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map(item => (
            <SidebarMenuItem key={item.title}>
              {item.children ? (
                <Collapsible className="w-full">
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <item.icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                      <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.children.map(subItem => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <a href={subItem.href}>{subItem.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <SidebarMenuButton asChild>
                  <a href={item.href} className="flex items-center">
                    <item.icon className="mr-2 h-4 w-4" />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src="/placeholder.svg?height=40&width=40" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">User Name</div>
            <div className="text-xs text-muted-foreground">
              user@example.com
            </div>
          </div>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
