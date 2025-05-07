import React, { useState } from 'react';
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

interface Props {
  departmentId: number;
  users: { id: number; name: string; email: string }[];
}

export default function AddUserToDepartment({ departmentId, users }: Props) {
  const [userId, setUserId] = useState('');
  const { toast } = useToast();

  const handleAddUser = () => {
    router.post(
      route('departments.addUser', { id: departmentId }),
      { user_id: userId },
      {
        onSuccess: () => {
          toast({
            title: 'Success',
            description: 'User added to department',
          });
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
          <Plus className="h-4 w-4" /> Add
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
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button
              onClick={handleAddUser}
              disabled={!userId}
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
