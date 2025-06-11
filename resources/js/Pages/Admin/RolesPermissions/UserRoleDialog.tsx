import React from 'react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Label } from '@/Components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Role } from './types';

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: { id: number; name: string; roles: Role[] } | null;
  roles: Role[];
  onSave: (userId: number, roleId: number) => void;
  isSaving: boolean;
}

export function UserRoleDialog({ 
  open, 
  onOpenChange, 
  user, 
  roles, 
  onSave, 
  isSaving 
}: UserRoleDialogProps) {
  const [selectedRole, setSelectedRole] = React.useState('');

  React.useEffect(() => {
    if (user && user.roles.length > 0) {
      setSelectedRole(user.roles[0].id.toString());
    } else if (roles.length > 0) {
      setSelectedRole(roles[0].id.toString());
    } else {
      setSelectedRole('');
    }
  }, [user, roles]);

  const handleSave = () => {
    if (user && selectedRole) {
      onSave(user.id, parseInt(selectedRole, 10));
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Role to {user.name}</DialogTitle>
          <DialogDescription>
            Select a role to assign to this user.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.id} value={role.id.toString()}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || !selectedRole}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
