import * as React from 'react';
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  CameraIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FileTextIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  ListIcon,
  SearchIcon,
  SettingsIcon,
  ContactRound,
  ChartColumnStacked,
  Boxes,
  FolderKey,
  Bell,
  Trash,
} from 'lucide-react';

import { NavDocuments } from '@/Components/dashboard/nav-documents';
import { NavMain } from '@/Components/dashboard/nav-main';
import { NavSecondary } from '@/Components/dashboard/nav-secondary';
import { NavUser } from '@/Components/dashboard/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/Components/ui/sidebar';
import { route } from 'ziggy-js';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin/',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Notifications',
      url: '/admin/notifications',
      icon: Bell,
    },
    {
      title: 'Post',
      url: '/admin/posts',
      icon: ListIcon,
    },
    {
      title: 'User',
      url: '/users',
      icon: ContactRound,
    },
    {
      title: 'Categories',
      url: '/admin/categories',
      icon: ChartColumnStacked,
    },
    {
      title: 'tag',
      url: '/admin/tags',
      icon: FileTextIcon,
    },
    {
      title: 'roles and permission',
      url: '/admin/roles-permissions',
      icon: FolderKey,
    },

    {
      title: 'Department',
      url: '/departments',
      icon: Boxes,
    },
    {
      title: 'Trash',
      url: '/admin/posts/trash',
      icon: Trash,
    },
  ],

  // documents: [
  //   {
  //     name: "Data Library",
  //     url: "#",
  //     icon: DatabaseIcon,
  //   },
  //   {
  //     name: "Reports",
  //     url: "#",
  //     icon: ClipboardListIcon,
  //   },
  //   {
  //     name: "Word Assistant",
  //     url: "#",
  //     icon: FileIcon,
  //   },
  // ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Support payment</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/*<NavDocuments items={data.documents} />*/}
        {/*<NavSecondary items={data.navSecondary} className="mt-auto" />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
