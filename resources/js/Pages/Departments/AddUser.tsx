import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
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
    <div className="p-4 border rounded">
      <h3 className="text-lg font-medium mb-2">Add User to Department</h3>
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
      <Button onClick={handleAddUser} className="mt-2">
        Add User
      </Button>
    </div>
  );
}
