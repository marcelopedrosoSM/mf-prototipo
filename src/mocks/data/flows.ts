export type FlowType = 'atendimento' | 'atividades';

export type FlowStatus = 'ativo' | 'inativo' | 'rascunho';

export interface Flow {
  id: string;
  nome: string;
  descricao?: string;
  tipo: FlowType;
  status: FlowStatus;
  createdAt: string;
  updatedAt: string;
}

// Mock data para Fluxos de Atendimento por IA
export const MOCK_FLOWS_ATENDIMENTO: Flow[] = [
  {
    id: '1',
    nome: 'Atendimento Inicial',
    descricao: 'Fluxo para primeiro contato com o cliente',
    tipo: 'atendimento',
    status: 'ativo',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    nome: 'Suporte Técnico',
    descricao: 'Fluxo para resolução de problemas técnicos',
    tipo: 'atendimento',
    status: 'ativo',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
  },
  {
    id: '3',
    nome: 'Vendas',
    descricao: 'Fluxo para qualificação e conversão de leads',
    tipo: 'atendimento',
    status: 'rascunho',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
  },
];

// Mock data para Fluxos de Atividades
export const MOCK_FLOWS_ATIVIDADES: Flow[] = [
  {
    id: '4',
    nome: 'Follow-up de Clientes',
    descricao: 'Atividade de acompanhamento pós-venda',
    tipo: 'atividades',
    status: 'ativo',
    createdAt: '2024-01-18T11:00:00Z',
    updatedAt: '2024-01-18T11:00:00Z',
  },
  {
    id: '5',
    nome: 'Envio de Relatórios',
    descricao: 'Atividade automática de envio de relatórios mensais',
    tipo: 'atividades',
    status: 'ativo',
    createdAt: '2024-01-19T08:45:00Z',
    updatedAt: '2024-01-19T08:45:00Z',
  },
  {
    id: '6',
    nome: 'Lembrete de Pagamento',
    descricao: 'Atividade para lembrar clientes sobre pagamentos pendentes',
    tipo: 'atividades',
    status: 'inativo',
    createdAt: '2024-01-20T13:20:00Z',
    updatedAt: '2024-01-20T13:20:00Z',
  },
];

