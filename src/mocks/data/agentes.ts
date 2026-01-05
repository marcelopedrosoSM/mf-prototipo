/**
 * Mock data for agents
 */

export interface Agente {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  timesIds?: string[];
  myflows_id?: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Time {
  id: string;
  nome: string;
}

export const MOCK_TIMES: Time[] = [
  { id: '1', nome: 'Atendimento' },
  { id: '2', nome: 'Vendas' },
  { id: '3', nome: 'Suporte Técnico' },
  { id: '4', nome: 'Financeiro' },
];

export const MOCK_AGENTES: Agente[] = [
  {
    id: '1',
    nome: 'Usuário Protótipo',
    email: 'user@myflows.com.br',
    telefone: '+55 (11) 98765-4321',
    timesIds: ['1', '2', '3', '4'],
    myflows_id: 'AG001',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    nome: 'João Silva',
    email: 'joao.silva@myflows.com.br',
    telefone: '+55 (11) 98765-4321',
    timesIds: ['1', '2'],
    myflows_id: 'AG002',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    nome: 'Maria Santos',
    email: 'maria.santos@myflows.com.br',
    telefone: '+55 (21) 99876-5432',
    timesIds: ['1', '3'],
    myflows_id: 'AG003',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    nome: 'Pedro Oliveira',
    email: 'pedro.oliveira@myflows.com.br',
    telefone: '+55 (11) 91234-5678',
    timesIds: ['2', '4'],
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
  {
    id: '5',
    nome: 'Larissa Barbosa',
    email: 'larissa.barbosa@myflows.com.br',
    telefone: '+55 (11) 95555-4444',
    timesIds: ['1', '2'],
    createdAt: '2024-01-19T10:00:00Z',
    updatedAt: '2024-01-19T10:00:00Z',
  },
];

export function getAgentes(): Agente[] {
  return [...MOCK_AGENTES];
}
