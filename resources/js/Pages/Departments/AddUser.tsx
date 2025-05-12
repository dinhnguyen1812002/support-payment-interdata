import React, { useState, useEffect } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { router } from '@inertiajs/core';
import { route } from 'ziggy-js';
import { useToast } from '@/Hooks/use-toast';
import { Plus } from 'lucide-react';
import axios from 'axios';

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
  const [loading, setLoading] = useState(false);
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
          <Plus className="h-4 w-4" /> Add User
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add User to Department</DialogTitle>
          <DialogDescription>
            Select a user to add to this department.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {loading ? (
            <p>Loading available users...</p>
          ) : users.length === 0 ? (
            <p>No available users to add</p>
          ) : (
            <Select onValueChange={setUserId} value={userId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a user" />
              </SelectTrigger>
              <SelectContent>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
