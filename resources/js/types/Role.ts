// types.ts - Shared type definitions

export interface Permission {
  id: number;
  name: string;
}

export interface Role {
  id: number;
  name: string;
  permissions: Permission[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
}

export interface PaginatedUsers {
  data: User[];
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface Filters {
  search: string;
  per_page: number;
}

export interface RolesPermissionsProps {
  roles: Role[];
  permissions: Permission[];
  users: PaginatedUsers;
  filters: Filters;
}

// Form state interfaces
export interface RoleFormData {
  newRoleName: string;
  selectedPermissions: string[];
}

export interface PermissionFormData {
  newPermissionName: string;
}

export interface UserRoleFormData {
  selectedRoleForUser: string;
}

export interface UserPermissionFormData {
  selectedPermissionsForUser: string[];
}

export interface FormData
  extends RoleFormData,
    PermissionFormData,
    UserRoleFormData,
    UserPermissionFormData {}

// Dialog
