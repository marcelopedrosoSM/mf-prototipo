/**
 * Mock data for teams/times
 */

import type { Time } from '@/types/times';

export type { Time };

export const MOCK_TIMES: Time[] = [
  {
    id: '1',
    nome: 'Atendimento',
    users: ['1', '2', '3'],
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    nome: 'Vendas',
    users: ['1', '2', '4'],
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    nome: 'Suporte Técnico',
    users: ['3'],
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    nome: 'Financeiro',
    users: ['4'],
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
];

let nextId = 5;

export function getTimes(): Time[] {
  return [...MOCK_TIMES];
}

export function getTimeById(id: string): Time | undefined {
  return MOCK_TIMES.find((time) => time.id === id);
}

export function addTime(data: Omit<Time, 'id' | 'createdAt' | 'updatedAt'>): Time {
  const newTime: Time = {
    ...data,
    id: String(nextId++),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_TIMES.push(newTime);
  return newTime;
}

export function updateTime(id: string, data: Partial<Omit<Time, 'id' | 'createdAt'>>): Time | null {
  const index = MOCK_TIMES.findIndex((time) => time.id === id);
  if (index === -1) return null;

  MOCK_TIMES[index] = {
    ...MOCK_TIMES[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_TIMES[index];
}

export function deleteTime(id: string): boolean {
  const index = MOCK_TIMES.findIndex((time) => time.id === id);
  if (index === -1) return false;
  MOCK_TIMES.splice(index, 1);
  return true;
}

