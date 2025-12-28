import { initializeFlowIdCounter } from '@/utils/idGenerator';
import type { Node, Edge } from '@vue-flow/core';
import dagre from 'dagre';
import { Position } from '@vue-flow/core';

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

  metrics?: {
    activeCount: number;
    wonCount: number;
    lostCount: number;
    conversionRate: number; // percentage 0-100
    highPerformance?: boolean;
  };
}

// Interface para fluxo com nodes/edges (dados completos para o builder)
export interface FlowWithData extends Flow {
  nodes: Node[];
  edges: Edge[];
}

// ========================================
// Helper: Auto-layout usando dagre
// ========================================
function layoutNodes(nodes: Node[], edges: Edge[], direction = 'LR'): Node[] {
  if (nodes.length === 0) return nodes;

  const graph = new dagre.graphlib.Graph();
  graph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';

  graph.setGraph({
    rankdir: direction,
    ranksep: 100,
    nodesep: 50,
  });

  for (const node of nodes) {
    const width = 200;
    const height = 250;
    graph.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    graph.setEdge(edge.source, edge.target);
  }

  dagre.layout(graph);

  return nodes.map((node) => {
    const nodeWithPosition = graph.node(node.id);
    const width = 200;
    const height = 250;

    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - width / 2,
        y: nodeWithPosition.y - height / 2,
      },
    };
  });
}

// ========================================
// FLUXO 1: Atendimento Inicial
// TIPOS: start, message, question, switch (com conditions), action, wait, end
// ========================================
const FLOW_1_NODES_RAW: Node[] = [
  { id: 'start-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Início', type: 'start', content: 'Início do atendimento', wasExecuted: true } },
  { id: 'message-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Boas-vindas', type: 'message', content: 'Olá! Bem-vindo ao nosso atendimento.', wasExecuted: true } },
  { id: 'question-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Pergunta', type: 'question', content: 'Como posso ajudá-lo hoje?', wasExecuted: true } },
  {
    id: 'switch-1',
    type: 'customNodeHorizontal',
    position: { x: 0, y: 0 },
    data: {
      title: 'Decisão',
      type: 'switch',
      content: 'Verificar resposta',
      isExecuting: true,
      conditions: [
        { label: 'Suporte', value: 'suporte' },
        { label: 'Vendas', value: 'vendas' },
      ],
    }
  },
  { id: 'action-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Ação Suporte', type: 'action', content: 'Encaminhar para suporte' } },
  { id: 'action-2', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Ação Vendas', type: 'action', content: 'Encaminhar para vendas' } },
  { id: 'end-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim', type: 'end', content: 'Fim do atendimento' } },
];
const FLOW_1_EDGES: Edge[] = [
  { id: 'e1-1', source: 'start-1', target: 'message-1', type: 'smoothstep', data: { wasExecuted: true } },
  { id: 'e1-2', source: 'message-1', target: 'question-1', type: 'smoothstep', data: { wasExecuted: true } },
  { id: 'e1-3', source: 'question-1', target: 'switch-1', type: 'smoothstep', data: { wasExecuted: true } },
  { id: 'e1-4', source: 'switch-1', sourceHandle: 'condition-0', target: 'action-1', type: 'smoothstep' },
  { id: 'e1-5', source: 'switch-1', sourceHandle: 'condition-1', target: 'action-2', type: 'smoothstep' },
  { id: 'e1-6', source: 'action-1', target: 'end-1', type: 'smoothstep' },
  { id: 'e1-7', source: 'action-2', target: 'end-1', type: 'smoothstep' },
];
export const FLOW_1_NODES = layoutNodes(FLOW_1_NODES_RAW, FLOW_1_EDGES, 'LR');

// ========================================
// FLUXO 2: Suporte Técnico
// TIPOS: start, message, question, api, action, end
// ========================================
const FLOW_2_NODES_RAW: Node[] = [
  { id: 'start-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Início', type: 'start', content: 'Início do suporte' } },
  { id: 'message-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Mensagem', type: 'message', content: 'Olá! Sou o suporte técnico.' } },
  { id: 'question-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Pergunta', type: 'question', content: 'Qual o problema que você está enfrentando?' } },
  { id: 'api-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Integração', type: 'api', content: 'Consultar base de conhecimento' } },
  { id: 'action-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Ação', type: 'action', content: 'Criar ticket de suporte' } },
  { id: 'end-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim', type: 'end', content: 'Suporte finalizado' } },
];
const FLOW_2_EDGES: Edge[] = [
  { id: 'e2-1', source: 'start-1', target: 'message-1', type: 'smoothstep' },
  { id: 'e2-2', source: 'message-1', target: 'question-1', type: 'smoothstep' },
  { id: 'e2-3', source: 'question-1', target: 'api-1', type: 'smoothstep' },
  { id: 'e2-4', source: 'api-1', target: 'action-1', type: 'smoothstep' },
  { id: 'e2-5', source: 'action-1', target: 'end-1', type: 'smoothstep' },
];
export const FLOW_2_NODES = layoutNodes(FLOW_2_NODES_RAW, FLOW_2_EDGES, 'LR');

// ========================================
// FLUXO 3: Vendas
// TIPOS: start, message, question, switch (com conditions), message, action, wait, end
// ========================================
const FLOW_3_NODES_RAW: Node[] = [
  { id: 'start-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Início', type: 'start', content: 'Início de vendas' } },
  { id: 'message-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Mensagem', type: 'message', content: 'Olá! Tenho uma oferta especial para você.' } },
  { id: 'question-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Pergunta', type: 'question', content: 'Você tem interesse em saber mais?' } },
  {
    id: 'switch-1',
    type: 'customNodeHorizontal',
    position: { x: 0, y: 0 },
    data: {
      title: 'Decisão',
      type: 'switch',
      content: 'Verificar interesse',
      conditions: [
        { label: 'Sim', value: 'sim' },
        { label: 'Não', value: 'nao' },
      ],
    }
  },
  { id: 'message-2', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Detalhes', type: 'message', content: 'Ótimo! Aqui estão os detalhes...' } },
  { id: 'action-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Ação', type: 'action', content: 'Registrar como não interessado' } },
  { id: 'wait-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Espera', type: 'wait', content: 'Aguardar decisão' } },
  { id: 'end-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim', type: 'end', content: 'Fim do fluxo' } },
];
const FLOW_3_EDGES: Edge[] = [
  { id: 'e3-1', source: 'start-1', target: 'message-1', type: 'smoothstep' },
  { id: 'e3-2', source: 'message-1', target: 'question-1', type: 'smoothstep' },
  { id: 'e3-3', source: 'question-1', target: 'switch-1', type: 'smoothstep' },
  { id: 'e3-4', source: 'switch-1', sourceHandle: 'condition-0', target: 'message-2', type: 'smoothstep' },
  { id: 'e3-5', source: 'switch-1', sourceHandle: 'condition-1', target: 'action-1', type: 'smoothstep' },
  { id: 'e3-6', source: 'message-2', target: 'wait-1', type: 'smoothstep' },
  { id: 'e3-7', source: 'action-1', target: 'end-1', type: 'smoothstep' },
  { id: 'e3-8', source: 'wait-1', target: 'end-1', type: 'smoothstep' },
];
export const FLOW_3_NODES = layoutNodes(FLOW_3_NODES_RAW, FLOW_3_EDGES, 'LR');

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
    metrics: {
      activeCount: 32,
      wonCount: 38,
      lostCount: 5,
      conversionRate: 88.4,
      highPerformance: true,
    },
  },
  {
    id: '2',
    nome: 'Suporte',
    descricao: 'Fluxo para resolução de problemas técnicos',
    tipo: 'atendimento',
    status: 'ativo',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    metrics: {
      activeCount: 15,
      wonCount: 42,
      lostCount: 2,
      conversionRate: 95.5,
    },
  },
  {
    id: '3',
    nome: 'Vendas',
    descricao: 'Fluxo para qualificação e conversão de leads',
    tipo: 'atendimento',
    status: 'rascunho',
    createdAt: '2024-01-17T09:15:00Z',
    updatedAt: '2024-01-17T09:15:00Z',
    metrics: {
      activeCount: 0,
      wonCount: 0,
      lostCount: 0,
      conversionRate: 0,
    },
  },
];

// Mapeamento de flowId para nodes/edges (será atualizado após definir os fluxos de atividades)
// Definido após os fluxos de atividades abaixo

// ========================================
// FLUXO 4: Follow-up Completo
// TODOS OS BLOCOS: start, end, email, message, call, action, task, wait, chat_flow, note
// ========================================
const FLOW_4_NODES_RAW: Node[] = [
  { id: 'start-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Início', type: 'start', content: 'Cliente finalizou compra', wasExecuted: true } },
  // E-mail SEM condições - executa e segue automaticamente
  {
    id: 'email-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: '📧 E-mail Boas-vindas', type: 'email', content: 'Agradecer pela compra (auto)',
      subject: 'Obrigado!', body: 'Olá {{nome}}...'
      // SEM conditions = auto-avança
    }
  },
  // Espera SEM condições - executa e segue automaticamente
  {
    id: 'wait-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: '⏳ Espera 2 dias', type: 'wait', content: 'Aguardar (auto)',
      duration: 2, unit: 'days'
      // SEM conditions = auto-avança
    }
  },
  // WhatsApp COM condições - requer escolha do usuário
  {
    id: 'message-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: '💬 WhatsApp Check-in', type: 'message', content: 'Requer decisão!',
      conditions: [{ label: 'Respondeu', value: 'replied' }, { label: 'Ignorou', value: 'ignored' }]
    }
  },
  // Ligação COM condições - requer escolha do usuário
  {
    id: 'call-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: '📞 Ligação Follow-up', type: 'call', content: 'Requer decisão!',
      phoneField: 'mobile', script: 'Olá! Gostaríamos de saber...',
      conditions: [{ label: 'Atendeu', value: 'answered' }, { label: 'Não atendeu', value: 'no_answer' }]
    }
  },
  // Ação SEM condições - executa e segue automaticamente
  {
    id: 'action-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: '⚡ Registrar no CRM', type: 'action', content: 'Atualiza dados (auto)'
      // SEM conditions = auto-avança
    }
  },
  // Tarefa COM condições - requer escolha do usuário
  {
    id: 'task-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: '✅ Tarefa Manual', type: 'task', content: 'Requer decisão!',
      description: 'Anotar feedback no CRM', dueInDays: 1,
      conditions: [{ label: 'Concluída', value: 'done' }, { label: 'Pendente', value: 'pending' }]
    }
  },
  {
    id: 'chat_flow-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: 'Suporte VIP', type: 'chat_flow', content: 'Iniciar atendimento especial',
      flowId: '1',
      conditions: [{ label: 'Resolvido', value: 'resolved' }, { label: 'Escalonado', value: 'escalated' }]
    }
  },
  { id: 'end-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim - Sucesso', type: 'end', content: 'Cliente satisfeito' } },
  { id: 'end-2', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim - Reagendar', type: 'end', content: 'Tentar novamente' } },
  // NOTA
  { id: 'note-1', type: 'noteNode', position: { x: 50, y: 500 }, data: { type: 'note', title: 'Nota', content: 'Este fluxo demonstra TODOS os tipos de blocos de atividades.', color: 'yellow' } },
];
const FLOW_4_EDGES: Edge[] = [
  // Start -> E-mail (auto)
  { id: 'e4-1', source: 'start-1', target: 'email-1', type: 'smoothstep' },
  // E-mail -> Wait (auto, sem sourceHandle)
  { id: 'e4-2', source: 'email-1', target: 'wait-1', type: 'smoothstep' },
  // Wait -> Message (auto, sem sourceHandle)
  { id: 'e4-3', source: 'wait-1', target: 'message-1', type: 'smoothstep' },
  // Message -> Call (COM decisão: Respondeu)
  { id: 'e4-4', source: 'message-1', sourceHandle: 'condition-0', target: 'call-1', type: 'smoothstep' },
  // Message -> End (COM decisão: Ignorou)
  { id: 'e4-5', source: 'message-1', sourceHandle: 'condition-1', target: 'end-2', type: 'smoothstep' },
  // Call -> Action (COM decisão: Atendeu)
  { id: 'e4-6', source: 'call-1', sourceHandle: 'condition-0', target: 'action-1', type: 'smoothstep' },
  // Call -> End (COM decisão: Não atendeu)
  { id: 'e4-7', source: 'call-1', sourceHandle: 'condition-1', target: 'end-2', type: 'smoothstep' },
  // Action -> Task (auto, sem sourceHandle)
  { id: 'e4-8', source: 'action-1', target: 'task-1', type: 'smoothstep' },
  // Task -> Chat_flow (COM decisão: Concluída)
  { id: 'e4-9', source: 'task-1', sourceHandle: 'condition-0', target: 'chat_flow-1', type: 'smoothstep' },
  // Task -> End (COM decisão: Pendente)
  { id: 'e4-10', source: 'task-1', sourceHandle: 'condition-1', target: 'end-2', type: 'smoothstep' },
  // Chat_flow -> End (COM decisão: Resolvido)
  { id: 'e4-11', source: 'chat_flow-1', sourceHandle: 'condition-0', target: 'end-1', type: 'smoothstep' },
  // Chat_flow -> End (COM decisão: Escalonado)
  { id: 'e4-12', source: 'chat_flow-1', sourceHandle: 'condition-1', target: 'end-2', type: 'smoothstep' },
];
export const FLOW_4_NODES = layoutNodes(FLOW_4_NODES_RAW, FLOW_4_EDGES, 'LR');

// ========================================
// ========================================
// FLUXO 5: Pesquisa NPS Completa
// TODOS OS BLOCOS: start, end, email, message, call, action, task, wait, chat_flow, note
// ========================================
const FLOW_5_NODES_RAW: Node[] = [
  { id: 'start-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Início', type: 'start', content: 'Pesquisa de satisfação', wasExecuted: true } },
  {
    id: 'email-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: 'E-mail Convite', type: 'email', content: 'Convidar para pesquisa',
      subject: 'Queremos ouvir você!', body: 'Olá {{nome}}, sua opinião...',
      wasExecuted: true,
      conditions: [{ label: 'Clicou link', value: 'clicked' }, { label: 'Não abriu', value: 'not_opened' }]
    }
  },
  { id: 'wait-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Espera 1 dia', type: 'wait', content: 'Aguardar', duration: 1, unit: 'days', isExecuting: true } },
  {
    id: 'message-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: 'WhatsApp Lembrete', type: 'message', content: 'Ainda não respondeu...',
      conditions: [{ label: 'Respondeu', value: 'replied' }, { label: 'Ignorou', value: 'ignored' }]
    }
  },
  {
    id: 'call-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: 'Ligação Pesquisa', type: 'call', content: 'Coletar feedback por telefone',
      phoneField: 'mobile', script: 'Olá! Pode nos dar sua opinião?',
      conditions: [{ label: 'Respondeu', value: 'answered' }, { label: 'Não atendeu', value: 'no_answer' }]
    }
  },
  {
    id: 'action-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: 'Classificar NPS', type: 'action', content: 'Avaliar score',
      conditions: [{ label: 'Promotor (9-10)', value: 'promoter' }, { label: 'Neutro (7-8)', value: 'neutral' }, { label: 'Detrator (0-6)', value: 'detractor' }]
    }
  },
  {
    id: 'task-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: 'Ação Urgente', type: 'task', content: 'Contatar detrator',
      description: 'Resolver problema urgente', dueInDays: 1,
      conditions: [{ label: 'Resolvido', value: 'resolved' }, { label: 'Pendente', value: 'pending' }]
    }
  },
  {
    id: 'chat_flow-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: 'Programa VIP', type: 'chat_flow', content: 'Iniciar programa de fidelidade',
      flowId: '1',
      conditions: [{ label: 'Inscrito', value: 'enrolled' }, { label: 'Recusou', value: 'declined' }]
    }
  },
  { id: 'end-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim - Sucesso', type: 'end', content: 'Pesquisa concluída' } },
  { id: 'end-2', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim - Sem resposta', type: 'end', content: 'Cliente não respondeu' } },
  // NOTA
  { id: 'note-1', type: 'noteNode', position: { x: 50, y: 500 }, data: { type: 'note', title: 'Nota', content: 'NPS: Promotor > VIP, Detrator > Ação urgente', color: 'blue' } },
];
const FLOW_5_EDGES: Edge[] = [
  { id: 'e5-1', source: 'start-1', target: 'email-1', type: 'smoothstep', data: { wasExecuted: true } },
  { id: 'e5-2', source: 'email-1', sourceHandle: 'condition-0', target: 'action-1', type: 'smoothstep', data: { wasExecuted: true } },
  { id: 'e5-3', source: 'email-1', sourceHandle: 'condition-1', target: 'wait-1', type: 'smoothstep', data: { wasExecuted: true } },
  { id: 'e5-4', source: 'wait-1', target: 'message-1', type: 'smoothstep' },
  { id: 'e5-5', source: 'message-1', sourceHandle: 'condition-0', target: 'action-1', type: 'smoothstep' },
  { id: 'e5-6', source: 'message-1', sourceHandle: 'condition-1', target: 'call-1', type: 'smoothstep' },
  { id: 'e5-7', source: 'call-1', sourceHandle: 'condition-0', target: 'action-1', type: 'smoothstep' },
  { id: 'e5-8', source: 'call-1', sourceHandle: 'condition-1', target: 'end-2', type: 'smoothstep' },
  { id: 'e5-9', source: 'action-1', sourceHandle: 'condition-0', target: 'chat_flow-1', type: 'smoothstep' },
  { id: 'e5-10', source: 'action-1', sourceHandle: 'condition-1', target: 'end-1', type: 'smoothstep' },
  { id: 'e5-11', source: 'action-1', sourceHandle: 'condition-2', target: 'task-1', type: 'smoothstep' },
  { id: 'e5-12', source: 'task-1', sourceHandle: 'condition-0', target: 'end-1', type: 'smoothstep' },
  { id: 'e5-13', source: 'task-1', sourceHandle: 'condition-1', target: 'end-2', type: 'smoothstep' },
  { id: 'e5-14', source: 'chat_flow-1', sourceHandle: 'condition-0', target: 'end-1', type: 'smoothstep' },
  { id: 'e5-15', source: 'chat_flow-1', sourceHandle: 'condition-1', target: 'end-1', type: 'smoothstep' },
];
export const FLOW_5_NODES = layoutNodes(FLOW_5_NODES_RAW, FLOW_5_EDGES, 'LR');

// ========================================
// FLUXO 6: Cobrança Inteligente (COM CONDIÇÕES)
// Demonstra: todos os blocos com ramificações
// ========================================
const FLOW_6_NODES_RAW: Node[] = [
  { id: 'start-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Início', type: 'start', content: 'Pagamento pendente detectado', wasExecuted: true } },
  {
    id: 'email-1',
    type: 'customNodeHorizontal',
    position: { x: 0, y: 0 },
    data: {
      title: 'E-mail Lembrete',
      type: 'email',
      content: 'Lembrete gentil de pagamento',
      subject: 'Lembrete de pagamento',
      wasExecuted: true,
      conditions: [
        { label: 'Pagou', value: 'paid' },
        { label: 'Ignorou', value: 'ignored' },
      ]
    }
  },
  {
    id: 'wait-1',
    type: 'customNodeHorizontal',
    position: { x: 0, y: 0 },
    data: {
      title: 'Espera 3 dias',
      type: 'wait',
      content: 'Aguardar pagamento',
      wasExecuted: true,
      duration: 3,
      unit: 'days',
      conditions: [
        { label: 'Pagou no prazo', value: 'paid' },
        { label: 'Expirou', value: 'expired' },
      ]
    }
  },
  {
    id: 'message-1',
    type: 'customNodeHorizontal',
    position: { x: 0, y: 0 },
    data: {
      title: 'WhatsApp Cobrança',
      type: 'message',
      wasExecuted: true,
      content: 'Olá! Notamos um pagamento pendente...',
      conditions: [
        { label: 'Respondeu', value: 'replied' },
        { label: 'Visualizou', value: 'seen' },
        { label: 'Não viu', value: 'not_seen' },
      ]
    }
  },
  {
    id: 'call-1',
    type: 'customNodeHorizontal',
    position: { x: 0, y: 0 },
    data: {
      title: 'Ligação Cobrança',
      type: 'call',
      content: 'Contato telefônico',
      hasError: true,
      script: 'Boa tarde! Estou ligando sobre a fatura em aberto...',
      conditions: [
        { label: 'Prometeu pagar', value: 'promised' },
        { label: 'Recusou', value: 'refused' },
        { label: 'Não atendeu', value: 'no_answer' },
      ]
    }
  },
  {
    id: 'task-1',
    type: 'customNodeHorizontal',
    position: { x: 0, y: 0 },
    data: {
      title: 'Negociar',
      type: 'task',
      content: 'Negociar forma de pagamento',
      description: 'Entrar em contato para negociação',
      conditions: [
        { label: 'Acordo fechado', value: 'deal' },
        { label: 'Sem acordo', value: 'no_deal' },
      ]
    }
  },
  {
    id: 'action-1',
    type: 'customNodeHorizontal',
    position: { x: 0, y: 0 },
    data: {
      title: 'Atualizar Status',
      type: 'action',
      content: 'Marcar como inadimplente no CRM',
      conditions: [
        { label: 'Marcado', value: 'marked' },
      ]
    }
  },
  {
    id: 'chat_flow-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 },
    data: {
      title: 'Atendimento Cobrança', type: 'chat_flow', content: 'Iniciar fluxo de negociação',
      flowId: '2',
      conditions: [{ label: 'Negociou', value: 'negotiated' }, { label: 'Desistiu', value: 'abandoned' }]
    }
  },
  { id: 'end-1', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim - Pago', type: 'end', content: 'Pagamento recebido' } },
  { id: 'end-2', type: 'customNodeHorizontal', position: { x: 0, y: 0 }, data: { title: 'Fim - Inadimplente', type: 'end', content: 'Cliente inadimplente' } },
  // NOTA
  { id: 'note-1', type: 'noteNode', position: { x: 50, y: 500 }, data: { type: 'note', title: 'Nota', content: 'Fluxo completo de cobrança com escalação gradual.', color: 'pink' } },
];
const FLOW_6_EDGES: Edge[] = [
  { id: 'e6-1', source: 'start-1', target: 'email-1', type: 'smoothstep', data: { wasExecuted: true } },
  { id: 'e6-2', source: 'email-1', sourceHandle: 'condition-0', target: 'end-1', type: 'smoothstep' }, // Pagou
  { id: 'e6-3', source: 'email-1', sourceHandle: 'condition-1', target: 'wait-1', type: 'smoothstep', data: { wasExecuted: true } }, // Ignorou
  { id: 'e6-4', source: 'wait-1', sourceHandle: 'condition-0', target: 'end-1', type: 'smoothstep' }, // Pagou no prazo
  { id: 'e6-5', source: 'wait-1', sourceHandle: 'condition-1', target: 'message-1', type: 'smoothstep', data: { wasExecuted: true } }, // Expirou
  { id: 'e6-6', source: 'message-1', sourceHandle: 'condition-0', target: 'task-1', type: 'smoothstep' }, // Respondeu
  { id: 'e6-7', source: 'message-1', sourceHandle: 'condition-1', target: 'call-1', type: 'smoothstep', data: { wasExecuted: true } }, // Visualizou
  { id: 'e6-8', source: 'message-1', sourceHandle: 'condition-2', target: 'call-1', type: 'smoothstep' }, // Não viu
  { id: 'e6-9', source: 'call-1', sourceHandle: 'condition-0', target: 'task-1', type: 'smoothstep' }, // Prometeu pagar
  { id: 'e6-10', source: 'call-1', sourceHandle: 'condition-1', target: 'action-1', type: 'smoothstep' }, // Recusou
  { id: 'e6-11', source: 'call-1', sourceHandle: 'condition-2', target: 'action-1', type: 'smoothstep' }, // Não atendeu
  { id: 'e6-12', source: 'task-1', sourceHandle: 'condition-0', target: 'end-1', type: 'smoothstep' }, // Acordo
  { id: 'e6-13', source: 'task-1', sourceHandle: 'condition-1', target: 'chat_flow-1', type: 'smoothstep' }, // Sem acordo -> Chat
  { id: 'e6-14', source: 'action-1', sourceHandle: 'condition-0', target: 'chat_flow-1', type: 'smoothstep' }, // Marcado -> Chat
  { id: 'e6-15', source: 'chat_flow-1', sourceHandle: 'condition-0', target: 'end-1', type: 'smoothstep' }, // Negociou
  { id: 'e6-16', source: 'chat_flow-1', sourceHandle: 'condition-1', target: 'end-2', type: 'smoothstep' }, // Desistiu
];
export const FLOW_6_NODES = layoutNodes(FLOW_6_NODES_RAW, FLOW_6_EDGES, 'LR');

// Mapeamento de flowId para nodes/edges
export const FLOW_DATA_MAP: Record<string, { nodes: Node[]; edges: Edge[] }> = {
  '1': { nodes: FLOW_1_NODES, edges: FLOW_1_EDGES },
  '2': { nodes: FLOW_2_NODES, edges: FLOW_2_EDGES },
  '3': { nodes: FLOW_3_NODES, edges: FLOW_3_EDGES },
  '4': { nodes: FLOW_4_NODES, edges: FLOW_4_EDGES },
  '5': { nodes: FLOW_5_NODES, edges: FLOW_5_EDGES },
  '6': { nodes: FLOW_6_NODES, edges: FLOW_6_EDGES },
};

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
    metrics: {
      activeCount: 120,
      wonCount: 110,
      lostCount: 10,
      conversionRate: 91.6,
      highPerformance: true,
    },
  },
  {
    id: '6',
    nome: 'Lembrete de Pagamento',
    descricao: 'Atividade para lembrar clientes sobre pagamentos pendentes',
    tipo: 'atividades',
    status: 'ativo',
    createdAt: '2024-01-20T13:20:00Z',
    updatedAt: '2024-01-20T13:20:00Z',
  },
];

// Inicializar contador de IDs baseado nos mocks existentes
const allFlows = [...MOCK_FLOWS_ATENDIMENTO, ...MOCK_FLOWS_ATIVIDADES];
const maxId = Math.max(...allFlows.map(f => parseInt(f.id) || 0), 0);
initializeFlowIdCounter(maxId);

