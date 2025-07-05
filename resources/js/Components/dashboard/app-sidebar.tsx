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
import { NavProjects } from './nav-projects';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  dashboard :{
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: LayoutDashboardIcon,
    isActive: true,
  },
  navMain: [
    {
      title: 'Dashboard',
      url: '/admin/dashboard',
      icon: LayoutDashboardIcon,

    },
    {
      title: 'Content Management',
      url: '#',
      icon: FileTextIcon,
      items: [
        {
          title: 'Posts',
          url: '/admin/posts',
        },
        {
          title: 'Categories',
          url: '/admin/categories',
        },
        {
          title: 'Tags',
          url: '/admin/tags',
        },
        {
          title: 'Trash',
          url: '/admin/posts/trash',
        },
      ],
    },
    {
      title: 'User Management',
      url: '#',
      icon: ContactRound,
      items: [
        {
          title: 'Users',
          url: '/users',
        },
        {
          title: 'Roles & Permissions',
          url: '/admin/roles-permissions',
        },
        {
          title: 'Departments',
          url: '/departments',
        },
      ],
    },
    {
      title: 'System',
      url: '#',
      icon: SettingsIcon,
      items: [
        {
          title: 'Notifications',
          url: '/admin/notifications',
        },
        {
          title: 'Automation Rules',
          url: '/admin/automation-rules',
        },
        {
          title: 'Documentation',
          url: '/admin/docs',
        },
      ],
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
              <a href="/admin/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Support payment</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects items={data.dashboard} />
        <NavMain items={data.navMain} />
        
        {/* <NavDocuments items={data.user} /> */}
         {/* <NavMain items={data.dashboard} /> */}
        {/* <NavSecondary items={data.navMain} className="mt-auto" /> */}

      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

