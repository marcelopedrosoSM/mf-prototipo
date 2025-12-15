/**
 * Types for API Tokens/Tokens de API management
 */

export interface TokenAPI {
  id: string;
  title: string;
  expiresAt?: string;
  permissionIds: number[];
  token?: string; // Only available after creation
  createdAt?: string;
  updatedAt?: string;
}

export interface Permission {
  id: number;
  name: string;
  type: 'read' | 'write';
  group: string;
}

export interface PermissionGroup {
  name: string;
  permissions: Permission[];
}

export type PermissionProfileOption = 'na' | 'read' | 'all';

export type SelectedPermissions = Record<string, number | undefined>;

