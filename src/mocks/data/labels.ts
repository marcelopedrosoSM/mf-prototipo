/**
 * Mock data for labels
 */

import type { Label } from '@/types/conversations';

export const MOCK_LABELS: Label[] = [
  {
    id: '1',
    name: 'Importante',
    color: '#FF6B6B',
  },
  {
    id: '2',
    name: 'Cliente VIP',
    color: '#4ECDC4',
  },
  {
    id: '3',
    name: 'Follow-up',
    color: '#FFE66D',
  },
  {
    id: '4',
    name: 'Urgente',
    color: '#FF4757',
  },
  {
    id: '5',
    name: 'Vendas',
    color: '#5352ED',
  },
];

export function getLabels(): Label[] {
  return [...MOCK_LABELS];
}

export function getLabelById(id: string): Label | undefined {
  return MOCK_LABELS.find((label) => label.id === id);
}




