import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
  Home,
  Users,
  FileText,
  Mail,
  Settings,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/Components/ui/sidebar';
// import {
//   Collapsible,
//   CollapsibleContent,
//   CollapsibleTrigger,
// } from '@/Components/ui/collapsible';
// import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import React from 'react';
import { NavMain } from '../dashboard/nav-main';

import NavUser from './nav-user';
import NavProjects from '@/Components/Ticket/nav-projects';
import { TeamSwitcher } from '@/Components/Ticket/team-switcher';
import { Department } from '@/types';

// Navigation items with nested sections
// const navItems = [
//   {
//     title: 'Dashboard',
//     icon: Home,
//     href: '/',
//   },
//   {
//     title: 'Users',
//     icon: Users,
//     href: '/users',
//   },
//   {
//     title: 'Content',
//     icon: FileText,
//     children: [
//       { title: 'Pages', href: '/content/pages' },
//       { title: 'Blog Posts', href: '/content/blog' },
//       { title: 'Media Library', href: '/content/media' },
//     ],
//   },
//   {
//     title: 'Communications',
//     icon: Mail,
//     children: [
//       { title: 'Email', href: '/communications/email' },
//       { title: 'Notifications', href: '/communications/notifications' },
//       { title: 'Calendar', href: '/communications/calendar' },
//     ],
//   },
//   {
//     title: 'Settings',
//     icon: Settings,
//     href: '/settings',
//   },
// ];

export default function AppSidebar(department: Department) {
  const data = {
    navMain: [
      {
        title: 'Dashboard ',
        url: `/departments/${department.slug}`,
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: 'History',
            url: '#',
          },
          {
            title: 'Starred',
            url: '#',
          },
          {
            title: 'Settings',
            url: '#',
          },
        ],
      },
      {
        title: 'Employee',
        url: `/departments/${department.slug}/employee`,
        icon: Bot,
        items: [
          {
            title: 'Genesis',
            url: '#',
          },
          {
            title: 'Explorer',
            url: '#',
          },
          {
            title: 'Quantum',
            url: '#',
          },
        ],
      },
      {
        title: 'Documentation',
        url: '#',
        icon: BookOpen,
        items: [
          {
            title: 'Introduction',
            url: '#',
          },
          {
            title: 'Get Started',
            url: '#',
          },
          {
            title: 'Tutorials',
            url: '#',
          },
          {
            title: 'Changelog',
            url: '#',
          },
        ],
      },
      {
        title: 'Settings',
        url: '#',
        icon: Settings2,
        items: [
          {
            title: 'General',
            url: '#',
          },
          {
            title: 'Team',
            url: '#',
          },
          {
            title: 'Billing',
            url: '#',
          },
          {
            title: 'Limits',
            url: '#',
          },
        ],
      },
    ],
    projects: [
      {
        name: 'Design Engineering',
        url: '#',
        icon: Frame,
      },
      {
        name: 'Sales & Marketing',
        url: '#',
        icon: PieChart,
      },
      {
        name: 'Travel',
        url: '#',
        icon: Map,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <TeamSwitcher
          name={department.name}
          id={department.id}
          slug={department.slug}
          description={null}
          created_at={''}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
