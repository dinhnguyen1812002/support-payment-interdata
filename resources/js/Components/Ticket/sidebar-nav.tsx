import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
  Settings,
  Bell,
  HelpCircle,
  PanelLeftOpen,
  PanelLeftClose,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/Components/ui/tooltip';
// import { ThemeToggle } from "@/Components/Ticket/theme-toggle";
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuLabel,
//     DropdownMenuSeparator,
//     DropdownMenuTrigger,
// } from "@/Components/ui/dropdown-menu"
import ThemeSwitch from '@/Components/dashboard/toggle-switch';
import { Link, usePage } from '@inertiajs/react';
import { Department } from '@/types';

interface NavItem {
  title: string;
  href: string;

  icon: React.ReactNode;
  variant?: 'default' | 'ghost';
}

interface SidebarNavProps {
  title: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const navigationItems: NavSection[] = [
  {
    items: [
      {
        title: 'Dashboard',
        href: `/department/`,
        icon: <LayoutDashboard className="h-5 w-5" />,
        variant: 'default',
      },
    ],
  },
  {
    title: 'Management',
    items: [
      {
        title: 'Employee',
        href: '/department/employee',
        icon: <Users className="h-5 w-5" />,
      },
      {
        title: 'Reports',
        href: '/reports',
        icon: <FileText className="h-5 w-5" />,
      },
      {
        title: 'Analytics',
        href: '/analytics',
        icon: <BarChart3 className="h-5 w-5" />,
      },
    ],
  },
  {
    title: 'Settings',
    items: [
      {
        title: 'Preferences',
        href: '/preferences',
        icon: <Settings className="h-5 w-5" />,
      },
      {
        title: 'Notifications',
        href: '/notifications',
        icon: <Bell className="h-5 w-5" />,
      },
      {
        title: 'Help',
        href: '/help',
        icon: <HelpCircle className="h-5 w-5" />,
      },
    ],
  },
];

const SidebarNav: React.FC<SidebarNavProps> = ({ title }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { url } = usePage();
  const activePath = url;

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div
        className={cn(
          'flex flex-col border-r bg-sidebar dark:bg-[#0F1014] transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link
            className={cn(
              'flex items-center gap-2 px-2 py-2 rounded-none transition-all',
              collapsed && 'opacity-0 scale-90 w-0 overflow-hidden',
            )}
            href={'/'}
          >
            <img src="/icon/laravel.svg" alt="Logo" className="h-8 w-8" />
            <span className="text-xl font-semibold whitespace-nowrap">
              {title}
            </span>
            <ChevronsUpDown className="h-4 w-4 ml-2 opacity-50" />
          </Link>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="flex flex-col gap-2">
            {navigationItems.map((section, sectionIndex) => (
              <div key={sectionIndex}>
                {section.title && !collapsed && (
                  <div className="px-2 py-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      {section.title}
                    </p>
                  </div>
                )}
                {section.title && collapsed && (
                  <Separator className="mx-2 my-2" />
                )}
                <div className="grid gap-1">
                  {section.items.map((item, itemIndex) => (
                    <NavItem
                      key={itemIndex}
                      item={item}
                      collapsed={collapsed}
                      active={activePath.startsWith(item.href)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer (optional) */}
        <div className="border-t p-4">{!collapsed && <ThemeSwitch />}</div>
      </div>
    </div>
  );
};

export default SidebarNav;

interface NavItemProps {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}

function NavItem({ item, collapsed, active }: NavItemProps) {
  const baseClasses = 'flex items-center rounded-md transition-colors';
  const activeClasses = 'bg-accent text-accent-foreground';
  const normalClasses =
    'text-muted-foreground hover:bg-accent hover:text-accent-foreground';

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <a
            href={item.href}
            className={cn(
              baseClasses,
              'h-10 w-10 mx-auto justify-center',
              active ? activeClasses : normalClasses,
            )}
          >
            {item.icon}
          </a>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <a
      href={item.href}
      className={cn(
        baseClasses,
        'h-10 px-3 text-sm font-medium gap-2',
        active ? activeClasses : normalClasses,
      )}
    >
      {item.icon}
      <span>{item.title}</span>
    </a>
  );
}
