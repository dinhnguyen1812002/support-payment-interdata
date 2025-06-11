import React, { useState, useCallback, useEffect } from 'react';
import { SidebarInset, SidebarProvider } from '@/Components/ui/sidebar';
import { AppSidebar } from '@/Components/dashboard/app-sidebar';
import { SiteHeader } from '@/Components/dashboard/site-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/Components/ui/tabs';
import { usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { route } from 'ziggy-js';
import { RoleDialog } from './RoleDialog';
import { PermissionDialog } from './PermissionDialog';
import { UserRoleDialog } from './UserRoleDialog';
import { UserPermissionDialog } from './UserPermissionDialog';
import { RolesTab } from './RolesTab';
import { PermissionsTab } from './PermissionsTab';
import { UsersTab } from './UsersTab';
import { 
  Role, 
  Permission, 
  User, 
  RolesPermissionsProps 
} from './types';

export default function RolesPermissions({
  roles: initialRoles,
  permissions: initialPermissions,
  users: initialUsers,
  filters,
}: RolesPermissionsProps) {
  const { url } = usePage();
  const searchParams = new URLSearchParams(url.split('?')[1]);
  const initialTab = searchParams.get('tab') || 'roles';
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isSaving, setIsSaving] = useState(false);
  
  // State for dialogs
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [userRoleDialogOpen, setUserRoleDialogOpen] = useState(false);
  const [userPermissionDialogOpen, setUserPermissionDialogOpen] = useState(false);
  
  // State for selected items
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // State for forms
  const [newRoleName, setNewRoleName] = useState('');
  const [newPermissionName, setNewPermissionName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedRoleForUser, setSelectedRoleForUser] = useState('');
  const [selectedPermissionsForUser, setSelectedPermissionsForUser] = useState<string[]>([]);
  
  // State for data
  const [roles, setRoles] = useState(initialRoles);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [users, setUsers] = useState(initialUsers);
  
  // State for search and pagination
  const [search, setSearch] = useState(filters.search);
  const [perPage, setPerPage] = useState(filters.per_page.toString());
  const [isLoading, setIsLoading] = useState(false);

  // Update URL when tab changes
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', value);
    window.history.pushState({}, '', newUrl.toString());
  }, []);

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

  const handleSaveRole = async (role: { id?: number; name: string; permissions: string[] }) => {
    setIsSaving(true);
    const url = role.id ? `/admin/roles/${role.id}` : '/admin/roles';
    const method = role.id ? 'put' : 'post';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({
          name: role.name,
          permissions: role.permissions,
        }),
      });

      if (!response.ok) throw new Error('Failed to save role');
      
      const savedRole = await response.json();
      
      if (role.id) {
        setRoles(prev => prev.map(r => r.id === role.id ? savedRole : r));
      } else {
        setRoles(prev => [...prev, savedRole]);
      }
      
      setRoleDialogOpen(false);
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setIsSaving(false);
    }
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

  const handleSavePermission = async (permission: { id?: number; name: string }) => {
    setIsSaving(true);
    const url = permission.id ? `/admin/permissions/${permission.id}` : '/admin/permissions';
    const method = permission.id ? 'put' : 'post';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ name: permission.name }),
      });

      if (!response.ok) throw new Error('Failed to save permission');
      
      const savedPermission = await response.json();
      
      if (permission.id) {
        setPermissions(prev => prev.map(p => p.id === permission.id ? savedPermission : p));
      } else {
        setPermissions(prev => [...prev, savedPermission]);
      }
      
      setPermissionDialogOpen(false);
    } catch (error) {
      console.error('Error saving permission:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // User role/permission handlers
  const handleAssignRole = (user: User) => {
    setSelectedUser(user);
    setSelectedRoleForUser(user.roles[0]?.id.toString() || '');
    setUserRoleDialogOpen(true);
  };

  const handleSaveUserRole = async (userId: number, roleId: number) => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/admin/users/${userId}/assign-role`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ role_id: roleId }),
      });

      if (!response.ok) throw new Error('Failed to assign role');
      
      const updatedUser = await response.json();
      
      setUsers(prev => ({
        ...prev,
        data: prev.data.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ),
      }));
      
      setUserRoleDialogOpen(false);
    } catch (error) {
      console.error('Error assigning role:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAssignPermissions = (user: User) => {
    setSelectedUser(user);
    setSelectedPermissionsForUser(user.permissions.map(p => p.name));
    setUserPermissionDialogOpen(true);
  };

  const handleSaveUserPermissions = async (userId: number, permissions: string[]) => {
    setIsSaving(true);
    
    try {
      const response = await fetch(`/admin/users/${userId}/assign-permissions`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) throw new Error('Failed to assign permissions');
      
      const updatedUser = await response.json();
      
      setUsers(prev => ({
        ...prev,
        data: prev.data.map(user => 
          user.id === updatedUser.id ? updatedUser : user
        ),
      }));
      
      setUserPermissionDialogOpen(false);
    } catch (error) {
      console.error('Error assigning permissions:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Search and pagination handlers
  const performSearch = useCallback(() => {
    setIsLoading(true);
    Inertia.get(
      route('admin.roles-permissions'),
      { 
        search, 
        per_page: perPage,
        tab: activeTab,
      },
      {
        preserveState: true,
        preserveScroll: true,
        only: ['users', 'filters'],
        onSuccess: () => setIsLoading(false),
        onError: () => setIsLoading(false),
      },
    );
  }, [search, perPage, activeTab]);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [search, perPage, performSearch]);

  const handlePageChange = (url: string | null) => {
    if (url) {
      setIsLoading(true);
      Inertia.visit(url, {
        preserveState: true,
        preserveScroll: true,
        only: ['users', 'filters'],
        onSuccess: () => setIsLoading(false),
        onError: () => setIsLoading(false),
      });
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Roles & Permissions" />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="roles">Roles</TabsTrigger>
                  <TabsTrigger value="permissions">Permissions</TabsTrigger>
                  <TabsTrigger value="users">User Assignments</TabsTrigger>
                </TabsList>

                <TabsContent value="roles">
                  <RolesTab 
                    roles={roles} 
                    permissions={permissions} 
                    onAddRole={handleAddRole}
                    onEditRole={handleEditRole}
                  />
                </TabsContent>

                <TabsContent value="permissions">
                  <PermissionsTab 
                    permissions={permissions}
                    onAddPermission={handleAddPermission}
                    onEditPermission={handleEditPermission}
                  />
                </TabsContent>

                <TabsContent value="users">
                  <UsersTab
                    users={users}
                    search={search}
                    perPage={perPage}
                    isLoading={isLoading}
                    onSearchChange={setSearch}
                    onPerPageChange={setPerPage}
                    onPageChange={handlePageChange}
                    onAssignRole={handleAssignRole}
                    onAssignPermissions={handleAssignPermissions}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </SidebarInset>

      {/* Dialogs */}
      <RoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        role={selectedRole ? { 
          id: selectedRole.id, 
          name: newRoleName, 
          permissions: selectedPermissions 
        } : null}
        permissions={permissions}
        onSave={handleSaveRole}
        isSaving={isSaving}
      />

      <PermissionDialog
        open={permissionDialogOpen}
        onOpenChange={setPermissionDialogOpen}
        permission={selectedPermission ? { 
          id: selectedPermission.id, 
          name: newPermissionName 
        } : null}
        onSave={handleSavePermission}
        isSaving={isSaving}
      />

      <UserRoleDialog
        open={userRoleDialogOpen}
        onOpenChange={setUserRoleDialogOpen}
        user={selectedUser}
        roles={roles}
        onSave={handleSaveUserRole}
        isSaving={isSaving}
      />

      <UserPermissionDialog
        open={userPermissionDialogOpen}
        onOpenChange={setUserPermissionDialogOpen}
        user={selectedUser}
        permissions={permissions}
        onSave={handleSaveUserPermissions}
        isSaving={isSaving}
      />
    </SidebarProvider>
  );
}
