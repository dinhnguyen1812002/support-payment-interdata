import React from 'react';
import { Button } from '@/Components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';

interface PermissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  permission: { id?: number; name: string } | null;
  onSave: (permission: { id?: number; name: string }) => void;
  isSaving: boolean;
}

export function PermissionDialog({ 
  open, 
  onOpenChange, 
  permission, 
  onSave, 
  isSaving 
}: PermissionDialogProps) {
  const [name, setName] = React.useState(permission?.name || '');

  React.useEffect(() => {
    if (permission) {
      setName(permission.name);
    } else {
      setName('');
    }
  }, [permission]);

  const handleSave = () => {
    onSave({
      id: permission?.id,
      name,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{permission ? 'Edit Permission' : 'Create New Permission'}</DialogTitle>
          <DialogDescription>
            {permission ? 'Update the permission details below.' : 'Fill in the details for the new permission.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="permissionName">Permission Name</Label>
            <Input
              id="permissionName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter permission name (e.g., create-user)"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !name.trim()}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
