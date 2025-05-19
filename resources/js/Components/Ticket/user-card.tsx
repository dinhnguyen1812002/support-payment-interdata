import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/Components/ui/card';
import { Label } from '@/Components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/Components/ui/avatar';
import {
  User as UserIcon,
  Mail,
  Briefcase,
  UserRoundMinus,
  Pencil,
  Shield,
  Loader2,
  UserCog,
} from 'lucide-react';
import { router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/Components/ui/dialog';
import { Checkbox } from '@/Components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';

interface UserCardProps {
  id: number;
  name: string;
  email: string;
  roles: string;
  profile_photo_path?: string;
  departmentId: string;
  permissions?: string[];
}

export default function UserCard({
  id,
  name,
  email,
  roles,
  profile_photo_path,
  departmentId,
  permissions = [],
}: UserCardProps) {
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedPermissions, setSelectedPermissions] =
    useState<string[]>(permissions);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>(
    [],
  );
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState<string>(
    roles.split(', ')[0] || '',
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fetch available permissions from the database
  useEffect(() => {
    if (isPermissionDialogOpen) {
      setIsLoading(true);
      axios
        .get(route('permissions.index'))
        .then(response => {
          setAvailablePermissions(response.data.map((p: any) => p.name));
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch permissions:', error);
          setIsLoading(false);
        });
    }
  }, [isPermissionDialogOpen]);

  // Fetch available roles from the database
  useEffect(() => {
    if (isRoleDialogOpen) {
      setIsLoading(true);
      axios
        .get(route('roles.index'))
        .then(response => {
          setAvailableRoles(response.data.map((r: any) => r.name));
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Failed to fetch roles:', error);
          setIsLoading(false);
        });
    }
  }, [isRoleDialogOpen]);

  const nameParts = name?.split(' ') || ['U'];
  const initials =
    nameParts.length > 1
      ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`
      : nameParts[0][0] || 'U';

  const handleRemoveUser = () => {
    if (
      confirm(`Are you sure you want to remove ${name} from this department?`)
    ) {
      router.delete(
        route('departments.removeUser', { department: departmentId, user: id }),
        {
          onSuccess: () => {
            // Success notification is handled by the redirect in the controller
          },
        },
      );
    }
  };
  const saveRole = () => {
    setIsLoading(true);
    router.post(
      route('users.assign-role'),
      {
        user_id: id,
        role: selectedRole,
      },
      {
        onSuccess: () => {
          setIsRoleDialogOpen(false);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };
  const handlePermissionChange = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission],
    );
  };

  const savePermissions = () => {
    setIsLoading(true);
    router.post(
      route('users.assignPermissions'),
      {
        user_id: id,
        permissions: selectedPermissions,
      },
      {
        onSuccess: () => {
          setIsPermissionDialogOpen(false);
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <Card className="@container/card">
      <CardHeader className="pb-2" />

      <CardContent>
        <div className="flex items-start gap-4">
          {/* Avatar bên trái */}
          <Avatar className="h-20 w-20 rounded-lg">
            <AvatarImage src={profile_photo_path} alt={`${name}'s photo`} />
            <AvatarFallback className="bg-primary/20 text-primary text-lg">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* Thông tin bên phải */}
          <div className="flex flex-col justify-center space-y-3 w-full">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <Label className="flex w-full gap-x-1">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{name}</span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label className="flex w-full gap-x-1">
                <span className="text-muted-foreground">Email: </span>
                <span className="font-medium">{email}</span>
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <Label className="flex w-full gap-x-1">
                <span className="text-muted-foreground">Employee ID:</span>
                <span className="font-medium">{id}</span>
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <UserCog className="h-4 w-4 text-muted-foreground" />
              <Label className="flex w-full gap-x-1">
                <span className="text-muted-foreground">Roles:</span>
                <span className="font-medium">{roles}</span>
              </Label>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex gap-x-1 border-t pt-4">
        <Button variant="outline">
          <Pencil />
        </Button>

        {/* Role Management Dialog */}
        <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <UserCog className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Role to {name}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading roles...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <Label htmlFor="role-select">Select Role</Label>
                  <Select value={selectedRole} onValueChange={setSelectedRole}>
                    <SelectTrigger id="role-select">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={saveRole} disabled={isLoading || !selectedRole}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Assign Role
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Permission Management Dialog */}
        <Dialog
          open={isPermissionDialogOpen}
          onOpenChange={setIsPermissionDialogOpen}
        >
          <DialogTrigger asChild>
            <Button variant="outline">
              <Shield className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Permissions for {name}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-2 py-4 max-h-[60vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading permissions...</span>
                </div>
              ) : (
                availablePermissions.map(permission => (
                  <div key={permission} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission}`}
                      checked={selectedPermissions.includes(permission)}
                      onCheckedChange={() => handlePermissionChange(permission)}
                    />
                    <label
                      htmlFor={`permission-${permission}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission}
                    </label>
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={savePermissions} disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Permissions
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Button variant="secondary" onClick={handleRemoveUser}>
          <UserRoundMinus />
        </Button>
      </CardFooter>
    </Card>
  );
}
