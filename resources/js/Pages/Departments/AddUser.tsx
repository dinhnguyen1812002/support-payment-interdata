import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/Components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
import { useToast } from '@/Hooks/use-toast';
import { Plus, Search, Loader2, User } from 'lucide-react';
import axios from 'axios';
import { Input } from '@/Components/ui/input';

interface Props {
  departmentId: string;
  departmentSlug: string;
}

interface User {
  id: number;
  name: string;
  email: string;
}

export default function AddUserToDepartment({
  departmentId,
  departmentSlug,
}: Props) {
  const [userId, setUserId] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch available users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          route('users.available', { department: departmentId }),
        );
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available users',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [departmentId]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers([]);
      setShowDropdown(false);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = users.filter(
        user =>
          user.name.toLowerCase().includes(lowercaseQuery) ||
          user.email.toLowerCase().includes(lowercaseQuery),
      );
      setFilteredUsers(filtered);
      setShowDropdown(true);
    }
  }, [searchQuery, users]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleUserSelect = (user: User) => {
    setUserId(user.id.toString());
    setSearchQuery(`${user.name} (${user.email})`);
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    // Only show dropdown on focus if there's a search query
    if (searchQuery.trim() !== '') {
      setShowDropdown(true);
    }
  };

  const handleAddUser = () => {
    router.post(
      route('departments.addUser', { department: departmentId }),
      { user_id: userId },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'User added to department',
          });
          // Redirect to employee page to see updated list
          router.visit(
            route('departments.employees', { slug: departmentSlug }),
          );
        },
        onError: errors => {
          toast({
            title: 'Error',
            description: errors.error || 'Failed to add user',
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={'default'} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Department</DialogTitle>
          <DialogDescription>
            Search for a user to add to this department.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {loading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading available users...</span>
            </div>
          ) : (
            <div className="relative" ref={searchInputRef}>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onFocus={handleInputFocus}
                />
              </div>

              {showDropdown && filteredUsers.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md border shadow-lg max-h-60 overflow-auto">
                  {filteredUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                      onClick={() => handleUserSelect(user)}
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {showDropdown &&
                filteredUsers.length === 0 &&
                searchQuery.trim() !== '' && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md border shadow-lg p-4 text-center">
                    No users found matching your search
                  </div>
                )}
            </div>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={handleAddUser}
              disabled={!userId || loading}
              className="w-full"
            >
              Add User
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
