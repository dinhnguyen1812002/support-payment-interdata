import React from 'react';
import { useState } from 'react';
import { AppLayout } from '@/Components/Ticket/app-layout';
import { TooltipProvider } from '@/Components/ui/tooltip';
import { Toaster } from 'sonner';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Input } from '@/Components/ui/input';
import { Search, HelpCircle, LogOut, User } from 'lucide-react';
import useTypedPage from '@/Hooks/useTypedPage';
import { Link } from '@inertiajs/react';
import { route } from 'ziggy-js';
import UserCard from '@/Components/Ticket/user-card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import NotificationsDropdown from '@/Components/NotificationsDropdown';

interface UserType {
  id: number;
  name: string;
  email: string;
  profile_photo_path?: string;
}

export default function Employee({ user }: { user: UserType[] }) {
  const page = useTypedPage();
  const currentUser = page.props.auth?.user || null;
  const [searchQuery, setSearchQuery] = useState('');

  // Filter employees based on search query
  const filteredEmployees = user.filter(
    employee =>
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <TooltipProvider>
      <AppLayout title={'hhhh'}>
        {/* Search and Filter Section */}
        <div className="p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search employees..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="default">Add Employee</Button>
          </div>
        </div>

        {/* Employee List */}
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map(employee => (
                <UserCard
                  key={employee.id}
                  id={employee.id}
                  name={employee.name}
                  email={employee.email}
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
        </div>
      </AppLayout>
      <Toaster />
    </TooltipProvider>
  );
}
