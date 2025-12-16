/**
 * Mock data for labels
 * Com funções CRUD para gerenciar etiquetas
 */

import type { Label } from '@/types/conversations';

export type { Label };

// Estado mutável para permitir alterações durante a sessão
let _MOCK_LABELS: Label[] = [
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

let nextId = 6;

export const MOCK_LABELS = _MOCK_LABELS;

export function getLabels(): Label[] {
  return [..._MOCK_LABELS];
}

export function getLabelById(id: string): Label | undefined {
  // Retornar referência direta para que mudanças no CRUD sejam refletidas
  return _MOCK_LABELS.find((label) => label.id === id);
}

export interface CreateLabelData {
  name: string;
  color: string;
}

export interface UpdateLabelData {
  name?: string;
  color?: string;
}

/**
 * Cria uma nova etiqueta
 */
export function createLabel(data: CreateLabelData): Label {
  // Verificar se já existe uma etiqueta com o mesmo nome
  const existing = _MOCK_LABELS.find(
    (label) => label.name.toLowerCase() === data.name.toLowerCase().trim()
  );
  
  if (existing) {
    throw new Error('Já existe uma etiqueta com este nome');
  }

  const newLabel: Label = {
    id: String(nextId++),
    name: data.name.trim(),
    color: data.color,
  };

  _MOCK_LABELS.push(newLabel);
  return { ...newLabel };
}

/**
 * Atualiza uma etiqueta existente
 */
export function updateLabel(id: string, data: UpdateLabelData): Label {
  const index = _MOCK_LABELS.findIndex((label) => label.id === id);
  
  if (index === -1) {
    throw new Error('Etiqueta não encontrada');
  }

  // Verificar se o novo nome já existe em outra etiqueta
  if (data.name) {
    const existing = _MOCK_LABELS.find(
      (label) => label.id !== id && label.name.toLowerCase() === data.name!.toLowerCase().trim()
    );
    
    if (existing) {
      throw new Error('Já existe uma etiqueta com este nome');
    }
  }

  const updatedLabel: Label = {
    ..._MOCK_LABELS[index],
    ...(data.name && { name: data.name.trim() }),
    ...(data.color && { color: data.color }),
  };

  _MOCK_LABELS[index] = updatedLabel;
  return { ...updatedLabel };
}

/**
 * Exclui uma etiqueta
 */
export function deleteLabel(id: string): void {
  const index = _MOCK_LABELS.findIndex((label) => label.id === id);
  
  if (index === -1) {
    throw new Error('Etiqueta não encontrada');
  }

  _MOCK_LABELS.splice(index, 1);
}

/**
 * Busca etiquetas por nome
 */
export function searchLabels(query: string): Label[] {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) {
    return getLabels();
  }
  
  return _MOCK_LABELS.filter((label) =>
    label.name.toLowerCase().includes(lowerQuery)
  );
}





