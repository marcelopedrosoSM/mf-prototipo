/**
 * Mock data for inboxes/caixas de entrada
 */

import type { CaixaEntrada } from '@/types/caixas-entrada';

export const MOCK_CAIXAS_ENTRADA: CaixaEntrada[] = [
  {
    id: '1',
    nome: 'Vendas',
    tipo: 'nao-oficial',
    phoneNumber: '+5511987654321',
    phoneNumberId: '123456789',
    apiKey: 'EAABwzLixnY0BO7ZC...',
    businessAccountId: '987654321',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    nome: 'Suporte',
    tipo: 'nao-oficial',
    phoneNumber: '+5511999887766',
    phoneNumberId: '987654321',
    apiKey: 'EAABwzLixnY0BO7ZC...',
    businessAccountId: '123456789',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
];

let nextId = 4;

export function getCaixasEntrada(): CaixaEntrada[] {
  return [...MOCK_CAIXAS_ENTRADA];
}

export function getCaixaEntradaById(id: string): CaixaEntrada | undefined {
  return MOCK_CAIXAS_ENTRADA.find((caixa) => caixa.id === id);
}

export function addCaixaEntrada(data: Omit<CaixaEntrada, 'id' | 'createdAt' | 'updatedAt'>): CaixaEntrada {
  const newCaixa: CaixaEntrada = {
    ...data,
    id: String(nextId++),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_CAIXAS_ENTRADA.push(newCaixa);
  return newCaixa;
}

export function updateCaixaEntrada(id: string, data: Partial<Omit<CaixaEntrada, 'id' | 'createdAt'>>): CaixaEntrada | null {
  const index = MOCK_CAIXAS_ENTRADA.findIndex((caixa) => caixa.id === id);
  if (index === -1) return null;

  MOCK_CAIXAS_ENTRADA[index] = {
    ...MOCK_CAIXAS_ENTRADA[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_CAIXAS_ENTRADA[index];
}

export function deleteCaixaEntrada(id: string): boolean {
  const index = MOCK_CAIXAS_ENTRADA.findIndex((caixa) => caixa.id === id);
  if (index === -1) return false;
  MOCK_CAIXAS_ENTRADA.splice(index, 1);
  return true;
}
