import React, { useState } from 'react';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/Components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { Button } from '@/Components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/Components/ui/dialog';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { Label } from '@/Components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/Components/ui/select';
import { Inertia, Method } from '@inertiajs/inertia';
import {
  Shield,
  UserCog,
  Plus,
  Pencil,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Search,
} from 'lucide-react';
import { route } from 'ziggy-js';

interface Permission {
  id: number;
  name: string;
}

interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

interface Filters {
  search: string;
  per_page: number;
}

interface RolesPermissionsProps {
  roles: Role[];
  permissions: Permission[];
  users: {
    data: User[];
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    next_page_url: string | null;
    prev_page_url: string | null;
  };
  filters: Filters;
}

export default function RolesPermissions({
  roles,
  permissions,
  users,
  filters,
}: RolesPermissionsProps) {
  const [activeTab, setActiveTab] = useState('users');
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
  const [userPermissionDialogOpen, setUserPermissionDialogOpen] =
    useState(false);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [newRoleName, setNewRoleName] = useState('');
  const [newPermissionName, setNewPermissionName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRoleForUser, setSelectedRoleForUser] = useState('');
  const [selectedPermissionsForUser, setSelectedPermissionsForUser] = useState<
    string[]
  >([]);

  // Thêm state cho tìm kiếm và phân trang
  const [search, setSearch] = useState(filters.search);
  const [perPage, setPerPage] = useState(filters.per_page.toString());
  const [isLoading, setIsLoading] = useState(false);

  // Hàm xử lý tìm kiếm
  const handleSearch = () => {
    setIsLoading(true);
    Inertia.get(
      route('admin.roles-permissions'),
      {
        search,
        per_page: perPage,
        page: 1, // Reset về trang 1 khi tìm kiếm
      },
      {
        preserveState: true,
        onSuccess: () => setIsLoading(false),
        onError: () => setIsLoading(false),
      },
    );
  };

  // Hàm xử lý thay đổi số lượng item mỗi trang
  const handlePerPageChange = (value: string) => {
    setPerPage(value);
    setIsLoading(true);
    Inertia.get(
      route('admin.roles-permissions'),
      {
        search,
        per_page: value,
        page: 1, // Reset về trang 1 khi thay đổi số lượng item
      },
      {
        preserveState: true,
        onSuccess: () => setIsLoading(false),
        onError: () => setIsLoading(false),
      },
    );
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (url: string | null) => {
    if (url) {
      setIsLoading(true);
      Inertia.visit(url, {
        preserveState: true,
        onSuccess: () => setIsLoading(false),
        onError: () => setIsLoading(false),
      });
    }
  };

  // Role handlers
  const handleAddRole = () => {
    setSelectedRole(null);
    setNewRoleName('');
    setSelectedPermissions([]);
    setRoleDialogOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setNewRoleName(role.name);
    setSelectedPermissions(role.permissions.map(p => p.name));
    setRoleDialogOpen(true);
  };

  const handleSaveRole = () => {
    const url = selectedRole
      ? `/admin/roles/${selectedRole.id}`
      : '/admin/roles';
    const method = (selectedRole ? 'put' : 'post') as Method;

    Inertia.visit(url, {
      method,
      data: {
        name: newRoleName,
        permissions: selectedPermissions,
      },
      onSuccess: () => {
        setRoleDialogOpen(false);
      },
    });
  };

  // Permission handlers
  const handleAddPermission = () => {
    setSelectedPermission(null);
    setNewPermissionName('');
    setPermissionDialogOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setSelectedPermission(permission);
    setNewPermissionName(permission.name);
    setPermissionDialogOpen(true);
  };

  const handleSavePermission = () => {
    const url = selectedPermission
      ? `/admin/permissions/${selectedPermission.id}`
      : '/admin/permissions';
    const method = (selectedPermission ? 'put' : 'post') as Method;

    Inertia.visit(url, {
      method,
      data: {
        name: newPermissionName,
      },
      onSuccess: () => {
        setPermissionDialogOpen(false);
      },
    });
  };

  const handleDeletePermission = (permission: Permission) => {
    if (
      confirm(
        `Are you sure you want to delete the permission "${permission.name}"?`,
      )
    ) {
      Inertia.delete(`/admin/permissions/${permission.id}`, {
        onSuccess: () => {
          // Permission deleted successfully
        },
      });
    }
  };

  // User role/permission handlers
  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleForUser(user.roles.length > 0 ? user.roles[0].name : '');
    setUserRoleDialogOpen(true);
  };

  const handleAssignPermissions = (user: User) => {
    setSelectedUser(user);
    setSelectedPermissionsForUser(user.permissions.map(p => p.name));
    setUserPermissionDialogOpen(true);
  };

  const handleSaveUserRole = () => {
    if (!selectedUser?.id) return;

    const selectedRoleObj = roles.find(r => r.name === selectedRoleForUser);
    if (!selectedRoleObj) return;

    // Optimistic update
    const updatedUser = {
      ...selectedUser,
      roles: [selectedRoleObj],
    };

    Inertia.post(
      '/users/assign-role',
      {
        user_id: selectedUser.id,
        role: selectedRoleForUser,
      },
      {
        onSuccess: () => {
          setUserRoleDialogOpen(false);
        },
        onError: () => {
          // Revert optimistic update on error
        },
      },
    );
  };

  const handleSaveUserPermissions = () => {
    if (!selectedUser?.id) return;

    const selectedPermissionsObj = permissions.filter(p =>
      selectedPermissionsForUser.includes(p.name),
    );

    // Optimistic update
    const updatedUser = {
      ...selectedUser,
      permissions: selectedPermissionsObj,
    };
    // updateUsersOptimistically(updatedUser);

    Inertia.post(
      '/users/assign-permissions',
      {
        user_id: selectedUser.id,
        permissions: selectedPermissionsForUser,
      },
      {
        onSuccess: () => {
          setUserPermissionDialogOpen(false);
        },
        onError: () => {
          // Revert optimistic update on error
          // setUsers(initialUsers);
        },
      },
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Roles & Permissions" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="users">User Assignments</TabsTrigger>
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                </TabsList>

                {/* Roles Tab */}
                <TabsContent value="roles">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          Roles
                        </CardTitle>
                        <CardDescription>
                          Manage user roles and their permissions
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handleAddRole}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Role
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Role Name</TableHead>
                            <TableHead>Permissions</TableHead>
                            <TableHead className="w-24">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {roles.map(role => (
                            <TableRow key={role.id}>
                              <TableCell className="font-medium">
                                {role.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {role.permissions.map(permission => (
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditRole(role)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Permissions Tab */}
                <TabsContent value="permissions">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Shield className="h-5 w-5 text-primary" />
                          Permissions
                        </CardTitle>
                        <CardDescription>
                          Manage system permissions
                        </CardDescription>
                      </div>
                      <Button
                        onClick={handleAddPermission}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" /> Add Permission
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
                          {permissions.map(permission => (
                            <TableRow key={permission.id}>
                              <TableCell className="font-medium">
                                {permission.name}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleEditPermission(permission)
                                    }
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleDeletePermission(permission)
                                    }
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Users Tab - Thêm tìm kiếm và phân trang */}
                <TabsContent value="users">
                  <Card>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
                        <div>
                          <CardTitle className="text-xl flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-primary" />
                            User Role & Permission Assignments
                          </CardTitle>
                          <CardDescription>
                            Assign roles and permissions to users
                          </CardDescription>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                          <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="search"
                              placeholder="Search users..."
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                              onKeyDown={e =>
                                e.key === 'Enter' && handleSearch()
                              }
                              className="pl-8 pr-4"
                            />
                          </div>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="shrink-0"
                          >
                            {isLoading ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                            ) : (
                              <Search className="h-4 w-4" />
                            )}
                            <span className="sr-only">Search</span>
                          </Button>
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
                              users.data.map(user => (
                                <TableRow key={user.id}>
                                  <TableCell className="font-medium">
                                    {user.name}
                                  </TableCell>
                                  <TableCell>{user.email}</TableCell>
                                  <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                      {user.roles.map(role => (
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
                                      {user.permissions.map(permission => (
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
                                        onClick={() => handleAssignRole(user)}
                                      >
                                        Assign Role
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() =>
                                          handleAssignPermissions(user)
                                        }
                                      >
                                        Assign Permissions
                                      </Button>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={5}
                                  className="text-center h-32"
                                >
                                  <div className="flex flex-col items-center justify-center gap-2">
                                    <UserCog className="h-8 w-8 text-muted-foreground/50" />
                                    <p className="text-muted-foreground">
                                      No users found matching your criteria.
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setSearch('');
                                        Inertia.get(
                                          route('admin.roles-permissions'),
                                        );
                                      }}
                                      className="mt-2"
                                    >
                                      Reset filters
                                    </Button>
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
                            <Select
                              value={perPage}
                              onValueChange={handlePerPageChange}
                            >
                              <SelectTrigger className="w-[80px]">
                                <SelectValue placeholder="10" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                              </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">
                              per page
                            </span>
                          </div>

                          <div className="text-sm text-muted-foreground">
                            Showing{' '}
                            <span className="font-medium">
                              {(users.current_page - 1) * users.per_page + 1}
                            </span>{' '}
                            to{' '}
                            <span className="font-medium">
                              {Math.min(
                                users.current_page * users.per_page,
                                users.total,
                              )}
                            </span>{' '}
                            of{' '}
                            <span className="font-medium">{users.total}</span>{' '}
                            users
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handlePageChange(users.prev_page_url)
                              }
                              disabled={!users.prev_page_url || isLoading}
                            >
                              <ChevronLeft className="h-4 w-4" />
                              <span className="sr-only">Previous page</span>
                            </Button>

                            <span className="text-sm">
                              Page{' '}
                              <span className="font-medium">
                                {users.current_page}
                              </span>{' '}
                              of{' '}
                              <span className="font-medium">
                                {users.last_page}
                              </span>
                            </span>

                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() =>
                                handlePageChange(users.next_page_url)
                              }
                              disabled={!users.next_page_url || isLoading}
                            >
                              <ChevronRight className="h-4 w-4" />
                              <span className="sr-only">Next page</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Role Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedRole ? 'Edit Role' : 'Add New Role'}
            </DialogTitle>
            <DialogDescription>
              {selectedRole
                ? 'Update role details and permissions'
                : 'Create a new role with permissions'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="role-name">Role Name</Label>
              <Input
                id="role-name"
                value={newRoleName}
                onChange={e => setNewRoleName(e.target.value)}
                placeholder="Enter role name"
              />
            </div>
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {permissions.map(permission => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={selectedPermissions.includes(permission.name)}
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedPermissions([
                            ...selectedPermissions,
                            permission.name,
                          ]);
                        } else {
                          setSelectedPermissions(
                            selectedPermissions.filter(
                              p => p !== permission.name,
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`permission-${permission.id}`}>
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveRole}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Permission Dialog */}
      <Dialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedPermission ? 'Edit Permission' : 'Add New Permission'}
            </DialogTitle>
            <DialogDescription>
              {selectedPermission
                ? 'Update permission details'
                : 'Create a new permission'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="permission-name">Permission Name</Label>
              <Input
                id="permission-name"
                value={newPermissionName}
                onChange={e => setNewPermissionName(e.target.value)}
                placeholder="Enter permission name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPermissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSavePermission}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Role Dialog */}
      <Dialog open={userRoleDialogOpen} onOpenChange={setUserRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Role to {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Select a role to assign to this user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="user-role">Role</Label>
              <Select
                value={selectedRoleForUser}
                onValueChange={setSelectedRoleForUser}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.name}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserRoleDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUserRole}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Permissions Dialog */}
      <Dialog
        open={userPermissionDialogOpen}
        onOpenChange={setUserPermissionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Permissions to {selectedUser?.name}
            </DialogTitle>
            <DialogDescription>
              Select permissions to assign to this user
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Permissions</Label>
              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                {permissions.map(permission => (
                  <div
                    key={permission.id}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`user-permission-${permission.id}`}
                      checked={selectedPermissionsForUser.includes(
                        permission.name,
                      )}
                      onCheckedChange={checked => {
                        if (checked) {
                          setSelectedPermissionsForUser([
                            ...selectedPermissionsForUser,
                            permission.name,
                          ]);
                        } else {
                          setSelectedPermissionsForUser(
                            selectedPermissionsForUser.filter(
                              p => p !== permission.name,
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={`user-permission-${permission.id}`}>
                      {permission.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserPermissionDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveUserPermissions}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
