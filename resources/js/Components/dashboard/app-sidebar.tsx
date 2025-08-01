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
import { itemsEqual } from '@dnd-kit/sortable/dist/utilities';
import { Link } from '@inertiajs/react';

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },

  dashboard: [
    {
      name: 'Quản Trị',
      url: '/admin',
      icon: LayoutDashboardIcon,
    }
  ],

  // Single navigation items (không dropdown)
  singleNavItems: [
    {
      title: 'Reports',
      url: '/admin/reports',
      icon: BarChartIcon,
    },
    {
      title: 'Settings',
      url: '/admin/settings',
      icon: SettingsIcon,
    },
  ],
  navMain: [
    // {
    //   title: 'Dashboard',
    //   url: '/admin/',
    //   icon: LayoutDashboardIcon,
    //   items: [
    //     {
    //       title: 'Home',
    //       url: '/admin',
    //     },
    //   ]
    // },
    {
      title: 'Ticket',
      url: '#',
      icon: FileTextIcon,
      items: [
        {
          title: 'Ticket',
          url: '/admin/posts',
        },
        {
          title: 'Danh Mục',
          url: '/admin/categories',
        },
        {
          title: 'Nhãn',
          url: '/admin/tags',
        },
        {
          title: 'Ticket Đã xóa',
          url: '/admin/posts/trash',
        },
      ],
    },
    {
      title: 'Quản lý',
      url: '#',
      icon: ContactRound,
      items: [
        {
          title: 'Người dùng',
          url: '/admin/users',
        },
        {
          title: 'Quyền và Vai trò',
          url: '/admin/roles-permissions',
        },
        {
          title: 'Phòng ban', 
          url: '/departments',
        },
      ],
    },
    {
      title: 'Cài đặt',
      url: '#',
      icon: SettingsIcon,
      items: [
        // {
        //   title: 'Notifications',
        //   url: '/admin/notifications',
        // },
        {
          title: 'Quy tắc',
          url: '/admin/automation-rules',
        },
        // {
        //   title: 'Documentation',
        //   url: '/admin/docs',
        // },
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
              <Link href="/admin">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Support payment</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavProjects items={data.dashboard} />
        <NavMain items={data.navMain} />
        <NavSecondary items={data.singleNavItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}

