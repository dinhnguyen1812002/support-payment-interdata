import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
    ChevronLeft,
    ChevronRight,
    LayoutDashboard,
    Settings,
    Users,
    BarChart3,
    FileText,
    HelpCircle,
    Bell,
} from 'lucide-react';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Button } from '@/Components/ui/button';
import { Separator } from '@/Components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/Components/ui/tooltip';

// Define navigation items
interface NavItem {
    title: string;
    href: string;
    icon: React.ReactNode;
    variant?: 'default' | 'ghost';
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
                href: '/dashboard',
                icon: <LayoutDashboard className="h-5 w-5" />,
                variant: 'default',
            },
        ],
    },
    {
        title: 'Management',
        items: [
            {
                title: 'Users',
                href: '/users',
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

interface SidebarNavProps extends React.HTMLAttributes<HTMLDivElement> {
    defaultCollapsed?: boolean;
    title?: string;
}

export function SidebarNav({
                               className,
                               defaultCollapsed = false,
                           }: SidebarNavProps) {
    const [collapsed, setCollapsed] = useState(defaultCollapsed);

    // Simulate active path (would typically come from a router)
    const activePath = '/dashboard';

    return (
        <div
            className={cn(
                'group relative flex flex-col border-r bg-background transition-all duration-300 ease-in-out',
                collapsed ? 'w-16' : 'w-64',
                className
            )}

        >
            <div className="flex h-16 items-center justify-between border-b px-4">
                <div className={cn("transition-opacity duration-300", collapsed ? "opacity-0 invisible hidden" : "opacity-100 visible")}>
                    <h2 className="text-lg font-semibold">Support</h2>
                </div>

                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md"
                    onClick={() => setCollapsed(!collapsed)}
                    aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {collapsed ? (
                        <ChevronRight className="h-4 w-4" />
                    ) : (
                        <ChevronLeft className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <ScrollArea className="flex-1">
                <nav className="flex flex-col gap-2 p-2">
                    {navigationItems.map((section, sectionIndex) => (
                        <div key={sectionIndex} className="mb-2">
                            {section.title && !collapsed && (
                                <div className="px-2 py-1.5">
                                    <p className="text-xs font-medium text-muted-foreground">{section.title}</p>
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
                                        active={activePath === item.href}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </nav>
            </ScrollArea>
        </div>
    );
}

interface NavItemProps {
    item: NavItem;
    collapsed: boolean;
    active: boolean;
}

function NavItem({ item, collapsed, active }: NavItemProps) {
    if (collapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <a
                        href={item.href}
                        className={cn(
                            'flex h-10 w-10 mx-auto items-center justify-center rounded-md',
                            'hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                            active ? 'bg-accent text-accent-foreground font-medium' : 'text-muted-foreground'
                        )}
                    >
                        {item.icon}
                    </a>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                    {item.title}
                </TooltipContent>
            </Tooltip>
        );
    }

    return (
        <a
            href={item.href}
            className={cn(
                'flex h-10 items-center rounded-md px-3 text-sm font-medium',
                'hover:bg-accent hover:text-accent-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            )}
        >
            <span className="mr-2">{item.icon}</span>
            {item.title}
        </a>
    );
}
