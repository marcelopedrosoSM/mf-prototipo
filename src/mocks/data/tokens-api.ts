/**
 * Mock data for API tokens
 */

import type { TokenAPI, PermissionGroup } from '@/types/tokens-api';

export type { PermissionGroup };

export const MOCK_TOKENS_API: TokenAPI[] = [
  {
    id: '1',
    title: 'Token de Desenvolvimento',
    expiresAt: '2025-12-31T23:59:59Z',
    permissionIds: [1, 2, 3, 4],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Token de Produção',
    expiresAt: '2025-06-30T23:59:59Z',
    permissionIds: [1, 3],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

export const MOCK_PERMISSIONS: PermissionGroup[] = [
  {
    name: 'Conversas',
    permissions: [
      { id: 1, name: 'Ler conversas', type: 'read', group: 'Conversas' },
      { id: 2, name: 'Escrever conversas', type: 'write', group: 'Conversas' },
    ],
  },
  {
    name: 'Contatos',
    permissions: [
      { id: 3, name: 'Ler contatos', type: 'read', group: 'Contatos' },
      { id: 4, name: 'Escrever contatos', type: 'write', group: 'Contatos' },
    ],
  },
  {
    name: 'Flows',
    permissions: [
      { id: 5, name: 'Ler flows', type: 'read', group: 'Flows' },
      { id: 6, name: 'Escrever flows', type: 'write', group: 'Flows' },
    ],
  },
  {
    name: 'Configurações',
    permissions: [
      { id: 7, name: 'Ler configurações', type: 'read', group: 'Configurações' },
      { id: 8, name: 'Escrever configurações', type: 'write', group: 'Configurações' },
    ],
  },
];

let nextId = 3;

export function getTokensApi(): TokenAPI[] {
  return [...MOCK_TOKENS_API];
}

export function getTokenApiById(id: string): TokenAPI | undefined {
  return MOCK_TOKENS_API.find((token) => token.id === id);
}

export function addTokenApi(data: Omit<TokenAPI, 'id' | 'createdAt' | 'updatedAt' | 'token'>): TokenAPI {
  const newToken: TokenAPI = {
    ...data,
    id: String(nextId++),
    token: `mf_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_TOKENS_API.push(newToken);
  return newToken;
}

export function deleteTokenApi(id: string): boolean {
  const index = MOCK_TOKENS_API.findIndex((token) => token.id === id);
  if (index === -1) return false;
  MOCK_TOKENS_API.splice(index, 1);
  return true;
}

export function getPermissions(): PermissionGroup[] {
  return [...MOCK_PERMISSIONS];
}

