/**
 * Mock data for labels
 */

import type { Label } from '@/types/conversations';

export const MOCK_LABELS: Label[] = [
  {
    id: '1',
    name: 'Importante',
    color: '#FF6B6B', // Vermelho coral
  },
  {
    id: '2',
    name: 'Cliente VIP',
    color: '#8B5CF6', // Roxo (primary)
  },
  {
    id: '3',
    name: 'Follow-up',
    color: '#F97316', // Laranja
  },
  {
    id: '4',
    name: 'Urgente',
    color: '#EF4444', // Vermelho
  },
  {
    id: '5',
    name: 'Vendas',
    color: '#6366F1', // Índigo
  },
];

export function getLabels(): Label[] {
  return [...MOCK_LABELS];
}

export function getLabelById(id: string): Label | undefined {
  return MOCK_LABELS.find((label) => label.id === id);
}





