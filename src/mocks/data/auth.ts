/**
 * Mock authentication data
 * Centralized mock credentials for the prototype
 */

export const MOCK_CREDENTIALS = {
  email: 'user@myflows.com.br',
  password: 'M1nh4S3nh4!',
} as const;

export const MOCK_USER = {
  id: '1',
  email: MOCK_CREDENTIALS.email,
  name: 'Usuário Protótipo',
} as const;

