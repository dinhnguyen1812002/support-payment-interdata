import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { ScrollArea } from '@/Components/ui/scroll-area';

import {
  UserCircle,
  Lock,
  Activity,
  Bell as BellIcon,
  UserX,
  FileText,
  Menu,
  X,
  Settings,
  ChevronRight,
  LogOut,
} from 'lucide-react';

import DeleteUserForm from '@/Pages/Profile/Partials/DeleteUserForm';
import LogoutOtherBrowserSessions from '@/Pages/Profile/Partials/LogoutOtherBrowserSessionsForm';
import TwoFactorAuthenticationForm from '@/Pages/Profile/Partials/TwoFactorAuthenticationForm';
import UpdatePasswordForm from '@/Pages/Profile/Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from '@/Pages/Profile/Partials/UpdateProfileInformationForm';
import useTypedPage from '@/Hooks/useTypedPage';
import AppLayout from '@/Layouts/AppLayout';
import { Notification, Post, Session } from '@/types';
import PostsTable from '@/Pages/Profile/Partials/PostTable';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
import { Switch } from '@/Components/ui/switch';
import { uppercaseText } from '@/Utils/slugUtils';

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
  variant?: 'default' | 'destructive';
}

const SidebarItem = ({
  icon,
  title,
  isActive,
  onClick,
  variant = 'default',
}: SidebarItemProps) => (
  <Button
    variant={
      variant === 'destructive' ? 'ghost' : isActive ? 'secondary' : 'ghost'
    }
    className={cn(
      'w-full justify-start gap-2 h-12 relative',
      isActive && 'bg-muted font-medium',
      isActive && 'border-l-4 border-blue-500',
      variant === 'destructive' &&
        'text-destructive hover:text-destructive hover:bg-destructive/10',
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
  notifications,
}: Props) => {
  const page = useTypedPage();
  const [activeSection, setActiveSection] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
  });
  const user = page.props.auth.user!;

  // Create refs for each section
  const sectionRefs = useRef<{
    [key: string]: React.RefObject<HTMLDivElement>;
  }>({});

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setScreenSize({
        isMobile: window.innerWidth < 640,
        isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
      });
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
    };
  }, []);

  // Close sidebar when clicking outside on mobile or tablet
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((screenSize.isMobile || screenSize.isTablet) && sidebarOpen) {
        const sidebar = document.getElementById('sidebar');
        const menuButton = document.getElementById('menu-button');

        if (
          sidebar &&
          !sidebar.contains(event.target as Node) &&
          menuButton &&
          !menuButton.contains(event.target as Node)
        ) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [screenSize, sidebarOpen]);

  const handleSearch = (searchKeyword: string) => {
    router.get(
      route('profile.show'),
      { search: searchKeyword },
      { preserveState: true },
    );
  };

  const handlePageChange = (pageNumber: number) => {
    router.get(
      route('profile.show'),
      { page: pageNumber, search: keyword },
      { preserveState: true },
    );
  };

  const handleSectionChange = (sectionId: string) => {
    setActiveSection(sectionId);
    if (screenSize.isMobile || screenSize.isTablet) {
      setSidebarOpen(false);
    }

    // Scroll to the section
    const sectionElement = document.getElementById(sectionId);
    if (sectionElement) {
      sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sidebarItems = [
    {
      id: 'profile',
      title: 'Profile',
      icon: <UserCircle className="w-5 h-5" />,
      component: <UpdateProfileInformationForm user={user} />,
    },
    {
      id: 'security',
      title: 'Security',
      icon: <Lock className="w-5 h-5" />,
      component: (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">Password</h2>
            <UpdatePasswordForm />
          </div>
          {page.props.jetstream.canManageTwoFactorAuthentication && (
            <div>
              <h2 className="text-lg font-semibold">
                Two factor authentication
              </h2>
              <TwoFactorAuthenticationForm
                requiresConfirmation={confirmsTwoFactorAuthentication}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'sessions',
      title: 'Sessions',
      icon: <Activity className="w-5 h-5" />,
      component: <LogoutOtherBrowserSessions sessions={sessions} />,
    },
    // {
    //   id: 'notifications',
    //   title: 'Notifications',
    //   icon: <BellIcon className="w-5 h-5" />,
    //   component: (
    //     <Card>
    //       <CardHeader>
    //         <CardTitle>Tùy chọn thông báo</CardTitle>
    //         <CardDescription>Quản lý cách bạn nhận thông báo.</CardDescription>
    //       </CardHeader>
    //       <CardContent>
    //         <div className="space-y-4">
    //           <div className="flex items-center justify-between">
    //             <div>
    //               <h4 className="font-medium">Thông báo qua email</h4>
    //               <p className="text-sm text-muted-foreground">
    //                 Nhận thông báo qua email khi có hoạt động mới
    //               </p>
    //             </div>
    //             <div>
    //               <Switch />
    //             </div>
    //           </div>
    //
    //           <div className="flex items-center justify-between">
    //             <div>
    //               <h4 className="font-medium">Thông báo trên trình duyệt</h4>
    //               <p className="text-sm text-muted-foreground">
    //                 Hiển thị thông báo trên trình duyệt
    //               </p>
    //             </div>
    //             <div>
    //               <Switch />
    //             </div>
    //           </div>
    //         </div>
    //       </CardContent>
    //     </Card>
    //   ),
    // },
    {
      id: 'posts',
      title: 'Your question',
      icon: <FileText className="h-5 w-5" />,
      component: (
        <PostsTable
          posts={{ data: posts }}
          pagination={pagination}
          keyword={keyword}
        />
      ),
    },
  ];

  // Initialize refs for each section
  useEffect(() => {
    const items = [...sidebarItems];
    if (page.props.jetstream.hasAccountDeletionFeatures) {
      items.push({
        id: 'delete-account',
        title: 'Delete Account',
        icon: <UserX className="w-5 h-5" />,
        component: <DeleteUserForm />,
      });
    }

    items.forEach(item => {
      sectionRefs.current[item.id] = React.createRef();
    });
  }, []);

  // Add scroll position detection to highlight correct sidebar item
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200; // Add offset for better detection

      // Find which section is currently in view
      const sectionIds = Object.keys(sectionRefs.current);
      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const id = sectionIds[i];
        const element = document.getElementById(id);
        if (element && element.offsetTop <= scrollPosition) {
          if (activeSection !== id) {
            setActiveSection(id);
          }
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activeSection]);

  // Add overlay when sidebar is open on mobile or tablet
  const renderOverlay = () => {
    if ((screenSize.isMobile || screenSize.isTablet) && sidebarOpen) {
      return (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setSidebarOpen(false)}
        />
      );
    }
    return null;
  };

  return (
    <AppLayout
      notifications={notifications}
      canRegister={true}
      canLogin={true}
      title={user.name}
    >
      <div className="flex max-w-7xl mx-auto flex-col lg:flex-row min-h-screen dark:bg-[#0F1014] ">
        {/* Mobile/Tablet header */}
        {(screenSize.isMobile || screenSize.isTablet) && (
          <div className="sticky top-0 z-10 p-4 flex justify-between items-center border-b bg-background">
            <h1 className="font-bold text-xl">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h1>
            <Button
              id="menu-button"
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        )}

        {renderOverlay()}

        {/* Sidebar */}
        <div
          id="sidebar"
          className={cn(
            'dark:bg-[#0F1014] lg:min-h-screen mt-5',
            screenSize.isMobile || screenSize.isTablet
              ? 'fixed inset-y-0 left-0 w-64 transform transition-transform duration-200 ease-in-out'
              : 'sticky top-16 h-screen w-60 overflow-y-auto border-r',
          )}
        >
          <div className="px-4 sm:px-5 py-4">
            <p className="w-full text-xs font-bold text-mutedText uppercase dark:text-gray-400">
              Dashboard
            </p>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="p-3 space-y-1">
              {sidebarItems.map(item => (
                <SidebarItem
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  isActive={activeSection === item.id}
                  onClick={() => handleSectionChange(item.id)}
                />
              ))}
              {page.props.jetstream.hasAccountDeletionFeatures && (
                <SidebarItem
                  icon={<UserX className="w-5 h-5" />}
                  title="Danger zone"
                  isActive={activeSection === 'delete-account'}
                  onClick={() => handleSectionChange('delete-account')}
                  variant="destructive"
                />
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Main content */}
        <div
          className={cn(
            'flex-1 p-4 sm:p-6 space-y-6',
            screenSize.isMobile || screenSize.isTablet ? 'pt-2' : 'border-l',
          )}
        >
          {sidebarItems.map(item => (
            <div
              key={item.id}
              id={item.id}
              className="p-2 sm:p-4 border rounded-lg shadow-xs"
            >
              <CardHeader className="px-2 sm:px-4 py-2 sm:py-4">
                <CardTitle className="text-lg sm:text-xl">
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-4 py-2 sm:py-4">
                {item.component}
              </CardContent>
            </div>
          ))}
          {page.props.jetstream.hasAccountDeletionFeatures && (
            <div
              id="delete-account"
              className="p-2 sm:p-4 border rounded-lg shadow-xs"
            >
              <CardHeader className="px-2 sm:px-4 py-2 sm:py-4">
                <CardTitle className="text-lg sm:text-xl">
                  Delete Account
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2 sm:px-4 py-2 sm:py-4">
                <DeleteUserForm />
              </CardContent>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
