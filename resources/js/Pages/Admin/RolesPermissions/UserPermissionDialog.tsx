import React from 'react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Checkbox } from '@/Components/ui/checkbox';
import { Permission } from './types';

interface UserPermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: number; name: string; permissions: Permission[] } | null;
  permissions: Permission[];
  onSave: (userId: number, permissions: string[]) => void;
  isSaving: boolean;
}

export function UserPermissionDialog({ 
  open, 
  onOpenChange, 
  user, 
  permissions, 
  onSave, 
  isSaving 
}: UserPermissionDialogProps) {
  const [selectedPermissions, setSelectedPermissions] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (user) {
      setSelectedPermissions(user.permissions.map(p => p.name));
    } else {
      setSelectedPermissions([]);
    }
  }, [user]);

  const handleSave = () => {
    if (user) {
      onSave(user.id, selectedPermissions);
    }
  };

  const togglePermission = (permissionName: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    );
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Permissions to {user.name}</DialogTitle>
          <DialogDescription>
            Select permissions to assign to this user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Permissions</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto p-2">
              {permissions.map((permission) => (
                <div key={permission.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-perm-${permission.id}`}
                    checked={selectedPermissions.includes(permission.name)}
                    onCheckedChange={() => togglePermission(permission.name)}
                  />
                  <label
                    htmlFor={`user-perm-${permission.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {permission.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
