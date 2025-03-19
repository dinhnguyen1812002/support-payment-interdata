import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { ScrollArea } from "@/Components/ui/scroll-area";
import { Separator } from "@/Components/ui/separator";
import {
    UserCircle,
    Lock,
    Activity,
    Bell as BellIcon,
    UserX,
    ChevronRight,
    FileText,
    Menu,
    X
} from 'lucide-react';

import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import LogoutOtherBrowserSessions from '@/Pages/Profile/Partials/LogoutOtherBrowserSessionsForm';
import TwoFactorAuthenticationForm from '@/Pages/Profile/Partials/TwoFactorAuthenticationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import useTypedPage from '@/Hooks/useTypedPage';
import AppLayout from '@/Layouts/AppLayout';
import {Notification, Post, Session} from '@/types';
import PostsTable from "@/Pages/Profile/Partials/PostTable";
import { router } from '@inertiajs/core';
import {route} from "ziggy-js";

interface Props {
    sessions: Session[];
    confirmsTwoFactorAuthentication: boolean;
    posts: Post[];
    categories: any[];
    postCount: number;
    pagination: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
        next_page_url: string | null;
        prev_page_url: string | null;
    };
    keyword?: string;
    notifications: Notification[];
}

interface SidebarItemProps {
    icon: React.ReactNode;
    title: string;
    isActive: boolean;
    onClick: () => void;
}

const SidebarItem = ({ icon, title, isActive, onClick }: SidebarItemProps) => (
    <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
            "w-full justify-start gap-2 h-12",
            isActive && "bg-muted font-medium"
        )}
        onClick={onClick}
    >
        {icon}
        <span className="text-left">{title}</span>
        {isActive && <ChevronRight className="ml-auto w-4 h-4" />}
    </Button>
);

const ProfilePage = ({
                         sessions,
                         confirmsTwoFactorAuthentication,
                         posts,
                         categories,
                         postCount,
                         pagination,
                         keyword = '',
                         notifications
                     }: Props) => {
    const page = useTypedPage();
    const [activeSection, setActiveSection] = useState('profile');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const user = page.props.auth.user!;

    // Check if we're on mobile
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkIfMobile();
        window.addEventListener('resize', checkIfMobile);

        return () => {
            window.removeEventListener('resize', checkIfMobile);
        };
    }, []);

    // Close sidebar when clicking outside on mobile
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isMobile && sidebarOpen) {
                const sidebar = document.getElementById('sidebar');
                const menuButton = document.getElementById('menu-button');

                if (sidebar &&
                    !sidebar.contains(event.target as Node) &&
                    menuButton &&
                    !menuButton.contains(event.target as Node)) {
                    setSidebarOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isMobile, sidebarOpen]);

    const handleSearch = (searchKeyword: string) => {
        router.get(
            route('profile.show'),
            { search: searchKeyword },
            { preserveState: true }
        );
    };

    const handlePageChange = (pageNumber: number) => {
        router.get(
            route('profile.show'),
            { page: pageNumber, search: keyword },
            { preserveState: true }
        );
    };

    const handleSectionChange = (sectionId: string) => {
        setActiveSection(sectionId);
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    const sidebarItems = [
        {
            id: 'profile',
            title: 'Profile Information',
            icon: <UserCircle className="w-5 h-5" />,
            component: <UpdateProfileInformationForm user={user} />
        },
        {
            id: 'security',
            title: 'Security Settings',
            icon: <Lock className="w-5 h-5" />,
            component: (
                <div className="space-y-6">
                    <UpdatePasswordForm />
                    {page.props.jetstream.canManageTwoFactorAuthentication && (
                        <TwoFactorAuthenticationForm
                            requiresConfirmation={confirmsTwoFactorAuthentication}
                        />
                    )}
                </div>
            )
        },
        {
            id: 'sessions',
            title: 'Active Sessions',
            icon: <Activity className="w-5 h-5" />,
            component: <LogoutOtherBrowserSessions sessions={sessions} />
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: <BellIcon className="w-5 h-5" />,
            component: (
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Preferences</CardTitle>
                        <CardDescription>
                            Manage how you receive notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Add notification settings here */}
                    </CardContent>
                </Card>
            )
        },
        {
            id: 'posts',
            title: 'Câu hỏi của bạn ',
            icon: <FileText className="h-5 w-5" />,
            component: (
                <PostsTable
                    posts={{data:posts}}
                    pagination={pagination}
                    keyword={keyword}
                />
            )
        }
    ];

    // Add overlay when sidebar is open on mobile
    const renderOverlay = () => {
        if (isMobile && sidebarOpen) {
            return (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10"
                    onClick={() => setSidebarOpen(false)}
                />
            );
        }
        return null;
    };

    return (
        <AppLayout title={"Username"} canLogin={true} canRegister={true} notifications={notifications}>
            <div className="max-w-[1354px] mx-auto lg:px-4 dark:bg-[#0F1014]">

                <div className="flex">
                    {/* Main Content Area with Search Functionality */}

                        <div className="flex  gap-x-4 ">
                            {/* Left Sidebar */}
                            <div className="hidden lg:block w-52 pr-2 ml-[-10px]  ">
                                <div
                                    id="sidebar"
                                    className={cn(
                                        "border-r bg-background md:w-64 transition-all duration-300 ease-in-out",
                                        isMobile ? "fixed h-full z-20" : "relative",
                                        isMobile && (sidebarOpen
                                            ? "left-0 w-64"
                                            : "-left-full w-0")
                                    )}
                                >
                                    <div className="hidden md:flex items-center px-4 h-14 border-b">
                                        <h2 className="text-lg font-semibold">Settings</h2>
                                    </div>
                                    <ScrollArea className="h-auto md:h-[calc(100vh-8rem)]">
                                        <div className="p-3 space-y-1">
                                            {sidebarItems.map((item) => (
                                                <SidebarItem
                                                    key={item.id}
                                                    icon={item.icon}
                                                    title={item.title}
                                                    isActive={activeSection === item.id}
                                                    onClick={() => handleSectionChange(item.id)}
                                                />
                                            ))}
                                            {page.props.jetstream.hasAccountDeletionFeatures && (
                                                <>
                                                    <Separator className="my-2" />
                                                    <SidebarItem
                                                        icon={<UserX className="w-5 h-5 text-destructive" />}
                                                        title="Delete Account"
                                                        isActive={activeSection === 'delete'}
                                                        onClick={() => handleSectionChange('delete')}
                                                    />
                                                </>
                                            )}
                                        </div>
                                    </ScrollArea>
                                </div>
                            </div>

                            <div className="overflow-y-auto flex-1">
                                <div className="flex items-center px-6 h-14">
                                    <h1 className="text-lg font-semibold">
                                        {sidebarItems.find(item => item.id === activeSection)?.title || 'Delete Account'}
                                    </h1>
                                </div>
                                <div className="p-6">
                                    {activeSection === 'delete'
                                        ? <DeleteUserForm />
                                        : sidebarItems.find(item => item.id === activeSection)?.component
                                    }
                                </div>
                            </div>

                        </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default ProfilePage;
