import React, { useState } from 'react';
import { AppLayout } from '@/Components/Ticket/app-layout';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { Toaster } from 'sonner';
import { Input } from '@/Components/ui/input';
import { Search } from 'lucide-react';
import useTypedPage from '@/Hooks/useTypedPage';
import UserCard from '@/Components/Ticket/user-card';
import AddUserToDepartment from '@/Pages/Departments/AddUser';
import { Pagination } from '@/Components/ui/pagination';
import { Button } from '@/Components/ui/button';
import { Head, Link } from '@inertiajs/react';
import type { Department, Notification } from '@/types';
import type { PaginatedData } from '@/types';

import { PageTransition } from '@/Components/ui/page-transition';

import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
interface UserType {
  id: number;
  name: string;
  email: string;
  roles: string;
  profile_photo_path?: string;
}

interface Props {
  users: PaginatedData<UserType>;
  department: Department;
  notifications: Notification[];
}

export default function Employee({ users, department, notifications }: Props) {
  const page = useTypedPage();
  const currentUser = page.props.auth?.user || null;
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmployees = searchQuery
    ? users.data.filter(
        employee =>
          employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          employee.email.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : users.data;

  return (

<SidebarProvider>
      <Head title="Tickets" />
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title={'Nhân viên phòng ' + department.name} />
        <PageTransition>
          <div className="p-4  pl-9">
          <div className="flex gap-4">
            <div className="relative w-64">
              {' '}
              {/* Giới hạn chiều rộng thanh tìm kiếm */}
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <AddUserToDepartment
              departmentId={department.id}
              departmentSlug={department.slug}
            />
          </div>
        </div>

        <div className="p-4">
          <div
            className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t
         *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6 md:grid-cols-3  "
          >
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(employee => (
                <UserCard
                  key={employee.id}
                  id={employee.id}
                  name={employee.name}
                  email={employee.email}
                  roles={employee.roles}
                  profile_photo_path={employee.profile_photo_path}
                  departmentId={department.id}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">
                  No employees found matching your search.
                </p>
              </div>
            )}
          </div>

          {users.last_page > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex space-x-2">
                {users.links.map(
                  (
                    link: { url: string | null; label: string; active: any },
                    i: React.Key | null | undefined,
                  ) => {
                    if (link.url === null) {
                      return (
                        <Button
                          key={i}
                          disabled
                          variant="outline"
                          className="px-4"
                        >
                          {link.label
                            .replace('&laquo;', '«')
                            .replace('&raquo;', '»')}
                        </Button>
                      );
                    }

                    return (
                      <Link
                        key={i}
                        href={link.url}
                        className={`${
                          link.active
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'bg-background hover:bg-muted'
                        } px-4 py-2 rounded-md text-sm font-medium transition-colors`}
                      >
                        {link.label
                          .replace('&laquo;', '«')
                          .replace('&raquo;', '»')}
                      </Link>
                    );
                  },
                )}
              </div>
            </div>
          )}
        </div>

        </PageTransition>
      </SidebarInset>
    </SidebarProvider>


    // <TooltipProvider>
    //   <AppLayout
    //     title={department.name}
    //     department={department}
    //     notifications={notifications}
    //   >
      
    //   </AppLayout>
    //   <Toaster />
    // </TooltipProvider>
  );
}
