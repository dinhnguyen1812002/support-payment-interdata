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
    ChevronsUpDown
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Button } from "@/Components/ui/button";
import { Separator } from "@/Components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/Components/ui/tooltip";
import { ThemeToggle } from "@/Components/Ticket/theme-toggle";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu"
import ThemeSwitch from "@/Components/dashboard/toggle-switch";


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
            { title: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, variant: 'default' },
        ],
    },
    {
        title: 'Management',
        items: [
            { title: 'Employee', href: '/nhan-su', icon: <Users className="h-5 w-5" /> },
            { title: 'Reports', href: '/reports', icon: <FileText className="h-5 w-5" /> },
            { title: 'Analytics', href: '/analytics', icon: <BarChart3 className="h-5 w-5" /> },
        ],
    },
    {
        title: 'Settings',
        items: [
            { title: 'Preferences', href: '/preferences', icon: <Settings className="h-5 w-5" /> },
            { title: 'Notifications', href: '/notifications', icon: <Bell className="h-5 w-5" /> },
            { title: 'Help', href: '/help', icon: <HelpCircle className="h-5 w-5" /> },
        ],
    },
];

const SidebarNav: React.FC<SidebarNavProps> = ({ title }) => {
    const [collapsed, setCollapsed] = useState(false);
    const activePath = '/dashboard';

    return (
        <div className="flex h-screen dark:bg-[#0F1014]">
            <div
                className={cn(
                    "group relative flex flex-col border-r transition-[width] duration-300 ease-in-out",
                    collapsed ? "w-16" : "w-64"
                )}
            >
                <div className="flex h-16 items-center justify-between border-b px-4">
                    {/* Logo + Title */}
                    <div
                        className={cn(
                            "flex items-center gap-4 transition-all duration-300",
                            collapsed ? "opacity-0 scale-95 pointer-events-none w-0" : "opacity-100 scale-100 w-auto"
                        )}
                    >

                        <DropdownMenu >
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="flex items-center gap-2 px-4 py-2  rounded-none"
                                >
                                    <div className="flex items-center gap-2">
                                        <img src="/icon/laravel.svg" alt="Logo" className="h-8 w-8 border-r py-2" />
                                        <span className="text-xl font-semibold whitespace-nowrap">{title}</span>
                                    </div>
                                    <ChevronsUpDown className="h-4 w-4 ml-2 opacity-50" />
                                </Button>
                            </DropdownMenuTrigger>

                            <DropdownMenuContent className="w-56 dark:bg-[#0F1014] ">
                                <DropdownMenuLabel  >
                                    <ThemeSwitch />
                                </DropdownMenuLabel>

                                <DropdownMenuSeparator />

                                {/*<DropdownMenuItem>Profile</DropdownMenuItem>*/}
                                {/*<DropdownMenuItem>Billing</DropdownMenuItem>*/}
                                {/*<DropdownMenuItem>Team</DropdownMenuItem>*/}
                                {/*<DropdownMenuItem>Subscription</DropdownMenuItem>*/}
                            </DropdownMenuContent>
                        </DropdownMenu>


                    </div>

                    {/* Toggle + Theme Button */}
                    <div className="flex items-center gap-2">
                        {!collapsed }
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md"
                            onClick={() => setCollapsed(!collapsed)}
                            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            {collapsed ? (
                                <PanelLeftOpen className="h-4 w-4" />
                            ) : (
                                <PanelLeftClose className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <ScrollArea className="flex-1">
                    <nav className="flex flex-col gap-2 p-2">
                        {navigationItems.map((section, sectionIndex) => (
                            <div key={sectionIndex} className="mb-2">
                                {section.title && !collapsed && (
                                    <div className="px-2 py-1.5">
                                        <p className="text-xs font-medium text-muted-foreground">{section.title}</p>
                                    </div>
                                )}
                                {section.title && collapsed && <Separator className="mx-2 my-2" />}
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

            {/* Main Content */}
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
    if (collapsed) {
        return (
            <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                    <a
                        href={item.href}
                        className={cn(
                            'flex h-10 w-10 mx-auto items-center justify-center rounded-md transition-colors',
                            'hover:bg-accent hover:text-accent-foreground',
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
                'flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                active ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
            )}
        >
            <span className="mr-2">{item.icon}</span>
            {item.title}
        </a>
    );
}
