import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Pencil } from 'lucide-react';
import { Permission } from './types';

interface PermissionsTabProps {
  permissions: Permission[];
  onAddPermission: () => void;
  onEditPermission: (permission: Permission) => void;
}

export function PermissionsTab({ 
  permissions, 
  onAddPermission, 
  onEditPermission 
}: PermissionsTabProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="h-5 w-5 text-primary">🔑</span>
            Permissions
          </CardTitle>
          <CardDescription>
            Manage system permissions
          </CardDescription>
        </div>
        <Button
          onClick={onAddPermission}
          className="flex items-center gap-2"
        >
          <span>+</span> Add Permission
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Permission Name</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length > 0 ? (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">
                    {permission.name}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditPermission(permission)}
                      aria-label="Edit permission"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No permissions found. Create your first permission to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
