import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/Components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Search, X } from 'lucide-react';
import { User, Role, Permission } from './types';

interface UsersTabProps {
  users: {
    data: User[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
  search: string;
  perPage: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onPerPageChange: (value: string) => void;
  onPageChange: (url: string | null) => void;
  onAssignRole: (user: User) => void;
  onAssignPermissions: (user: User) => void;
}

export function UsersTab({
  users,
  search,
  perPage,
  isLoading,
  onSearchChange,
  onPerPageChange,
  onPageChange,
  onAssignRole,
  onAssignPermissions,
}: UsersTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="h-5 w-5 text-primary">👥</span>
              User Role & Permission Assignments
            </CardTitle>
            <CardDescription>
              Assign roles and permissions to users
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9 pr-10"
                disabled={isLoading}
              />
              {search && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full aspect-square rounded-l-none"
                  onClick={() => onSearchChange('')}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Clear search</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead className="w-48">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.length > 0 ? (
                users.data.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                          >
                            {role.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.permissions.map((permission) => (
                          <span
                            key={permission.id}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                          >
                            {permission.name}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => onAssignRole(user)}
                          disabled={isLoading}
                        >
                          Assign Role
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onAssignPermissions(user)}
                          disabled={isLoading}
                        >
                          Assign Permissions
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="h-8 w-8 text-muted-foreground/50">👤</span>
                      <p className="text-muted-foreground">
                        {search
                          ? 'No users found matching your criteria.'
                          : 'No users found.'}
                      </p>
                      {search && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onSearchChange('')}
                          className="mt-2"
                          disabled={isLoading}
                        >
                          Reset filters
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {users.data.length > 0 && (
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <select
                value={perPage}
                onChange={(e) => onPerPageChange(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                disabled={isLoading}
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
              <span className="text-sm text-muted-foreground">
                {`Showing ${(users.current_page - 1) * users.per_page + 1} to ${Math.min(
                  users.current_page * users.per_page,
                  users.total
                )} of ${users.total} entries`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(users.prev_page_url)}
                disabled={!users.prev_page_url || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(users.next_page_url)}
                disabled={!users.next_page_url || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
