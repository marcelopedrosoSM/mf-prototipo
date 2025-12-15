/**
 * Mock authentication data
 * Centralized mock credentials for the prototype
 */

export const MOCK_CREDENTIALS = {
  email: 'user@myflows.com.br',
  password: '123456',
} as const;

export const MOCK_USER = {
  id: '1',
  email: MOCK_CREDENTIALS.email,
  name: 'Usuário Protótipo',
} as const;

