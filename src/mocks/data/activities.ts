/**
 * Mock data for Activity Execution Mode
 * Activities are queued sequentially per contact in each flow
 */

import type { Activity } from '@/types/activity';

// Helper for relative time calculation
const now = new Date();
const minutesAgo = (min: number) => new Date(now.getTime() - min * 60000).toISOString();
const hoursAgo = (hrs: number) => new Date(now.getTime() - hrs * 3600000).toISOString();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();
const daysFromNow = (days: number) => new Date(now.getTime() + days * 86400000).toISOString();

// Due date helpers
const today = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999); // End of today
  return d.toISOString();
};
const yesterday = () => daysAgo(1);
const tomorrow = () => daysFromNow(1);

export const MOCK_ACTIVITIES: Activity[] = [
  // ========================================
  // BLOCOS QUE REQUEREM DECISÃO (COM CONDITIONS)
  // ========================================

  // 📞 Ligação - COM decisão
  {
    id: 'act-call-decision',
    type: 'call',
    status: 'pending',
    title: 'Ligação de Qualificação',
    description: 'Escolha: Atendeu ou Não atendeu?',
    stepNumber: 2,
    totalSteps: 6,
    flowId: 'flow-followup-001',
    flowName: 'Follow-up de Clientes',
    blockId: 'call-1',
    contactId: '1',
    contactName: 'João Silva',
    contactPhone: '+55 11 98765-4321',
    data: {
      type: 'call',
      phone: '+55 11 98765-4321',
      script: 'Olá! Gostaríamos de saber como foi sua experiência...',
      hasDecision: true,
      conditions: [
        { label: 'Atendeu', value: 'answered' },
        { label: 'Não atendeu', value: 'no_answer' }
      ]
    },
    dueDate: yesterday(), // ATRASADA
    createdAt: minutesAgo(5),
    updatedAt: minutesAgo(5),
  },

  // 💬 WhatsApp - COM decisão
  {
    id: 'act-message-decision',
    type: 'message',
    status: 'pending',
    title: 'WhatsApp Check-in',
    description: 'Escolha: Respondeu ou Ignorou?',
    stepNumber: 3,
    totalSteps: 6,
    flowId: 'flow-followup-001',
    flowName: 'Follow-up de Clientes',
    blockId: 'message-1',
    contactId: '2',
    contactName: 'Maria Santos',
    contactPhone: '+55 (21) 99876-5432',
    data: {
      type: 'message',
      channel: 'whatsapp',
      phone: '+55 (21) 99876-5432',
      message: 'Olá! Como foi sua experiência com nosso produto?',
      hasDecision: true,
      conditions: [
        { label: 'Respondeu', value: 'replied' },
        { label: 'Ignorou', value: 'ignored' }
      ]
    },
    dueDate: today(), // HOJE
    createdAt: minutesAgo(10),
    updatedAt: minutesAgo(10),
  },

  // ✅ Tarefa - COM decisão
  {
    id: 'act-task-decision',
    type: 'task',
    status: 'pending',
    title: 'Tarefa: Entrar em contato',
    description: 'Escolha: Concluída ou Pendente?',
    stepNumber: 4,
    totalSteps: 6,
    flowId: 'flow-followup-001',
    flowName: 'Follow-up de Clientes',
    blockId: 'task-1',
    contactId: '3',
    contactName: 'Pedro Oliveira',
    contactEmail: 'pedro.oliveira@example.com',
    data: {
      type: 'task',
      taskTitle: 'Ligar para cliente',
      assignee: 'Vendedor Atual',
      priority: 'high',
      hasDecision: true,
      conditions: [
        { label: 'Concluída', value: 'done' },
        { label: 'Pendente', value: 'pending' }
      ]
    },
    dueDate: today(), // HOJE
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
  },

  // 🔄 Fluxo de Atendimento - COM decisão
  {
    id: 'act-chatflow-decision',
    type: 'chat_flow',
    status: 'pending',
    title: 'Iniciar Atendimento VIP',
    description: 'Escolha: Resolvido ou Escalonado?',
    stepNumber: 5,
    totalSteps: 6,
    flowId: 'flow-followup-001',
    flowName: 'Follow-up de Clientes',
    blockId: 'chat_flow-1',
    contactId: '4',
    contactName: 'Ana Costa',
    contactEmail: 'ana.costa@example.com',
    data: {
      type: 'chat_flow',
      flowId: '1',
      flowName: 'Atendimento Padrão',
      hasDecision: true,
      conditions: [
        { label: 'Resolvido', value: 'resolved' },
        { label: 'Escalonado', value: 'escalated' }
      ]
    },
    dueDate: daysAgo(2), // ATRASADA (2 dias)
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },

  // ========================================
  // BLOCOS QUE AUTO-AVANÇAM (SEM CONDITIONS)
  // ========================================

  // 📧 E-mail - SEM decisão (auto-avança)
  {
    id: 'act-email-auto',
    type: 'email',
    status: 'pending',
    title: 'E-mail de Boas-Vindas',
    description: 'Executa e avança automaticamente',
    stepNumber: 1,
    totalSteps: 4,
    flowId: 'flow-onboarding-001',
    flowName: 'Onboarding de Cliente',
    blockId: 'email-1',
    contactId: '5',
    contactName: 'Carlos Ferreira',
    contactEmail: 'carlos.ferreira@example.com',
    data: {
      type: 'email',
      to: 'carlos.ferreira@example.com',
      subject: 'Bem-vindo à nossa plataforma!',
      body: 'Olá Carlos, seja bem-vindo...',
      hasDecision: false
    },
    dueDate: tomorrow(), // FUTURA (amanhã)
    createdAt: minutesAgo(2),
    updatedAt: minutesAgo(2),
  },

  // ⚡ Ação - Manual (usuário executa)
  {
    id: 'act-action-auto',
    type: 'action',
    status: 'pending',
    title: 'Registrar no CRM',
    description: 'Executa e avança automaticamente',
    stepNumber: 3,
    totalSteps: 4,
    flowId: 'flow-onboarding-001',
    flowName: 'Onboarding de Cliente',
    blockId: 'action-1',
    contactId: '7',
    contactName: 'Juliana Alves',
    contactEmail: 'juliana.alves@example.com',
    data: {
      type: 'action',
      actionName: 'Atualizar status no CRM',
      hasDecision: false
    },
    dueDate: daysFromNow(3), // FUTURA (3 dias)
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },

  // ========================================
  // ATIVIDADE IGNORADA (EXEMPLO)
  // ========================================
  {
    id: 'act-skipped',
    type: 'message',
    status: 'skipped',
    title: 'Mensagem de Aniversário',
    description: 'Atividade ignorada manualmente',
    stepNumber: 3,
    totalSteps: 5,
    completedAt: hoursAgo(2),
    flowId: 'flow-relacionamento-001',
    flowName: 'Relacionamento com Cliente',
    blockId: 'message-bday',
    contactId: '9',
    contactName: 'Fernanda Souza',
    contactPhone: '+55 (11) 91234-5678',
    data: {
      type: 'message',
      channel: 'whatsapp',
      phone: '+55 (11) 91234-5678',
      message: 'Parabéns pelo seu aniversário!',
    },
    createdAt: hoursAgo(4),
    updatedAt: hoursAgo(2),
  },

  // ========================================
  // ATIVIDADE CONCLUÍDA (EXEMPLO)
  // ========================================
  {
    id: 'act-completed',
    type: 'email',
    status: 'completed',
    title: 'E-mail de Apresentação',
    description: 'Concluído com sucesso',
    stepNumber: 4,
    totalSteps: 4,
    completedAt: hoursAgo(1),
    flowId: 'flow-onboarding-001',
    flowName: 'Onboarding de Cliente',
    blockId: 'email-2',
    contactId: '8',
    contactName: 'Roberto Lima',
    contactEmail: 'roberto.lima@example.com',
    data: {
      type: 'email',
      to: 'roberto.lima@example.com',
      subject: 'Apresentação completa',
      body: 'Parabéns por completar o onboarding!',
    },
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(1),
  },

  // Additional activities to show multiple flows per contact
  {
    id: 'act-onboarding-joao',
    type: 'email',
    status: 'pending',
    title: 'Boas-vindas Comercial',
    description: 'E-mail de boas-vindas para o programa comercial',
    stepNumber: 1,
    totalSteps: 3,
    flowId: 'flow-onboarding-001',
    flowName: 'Onboarding de Cliente',
    blockId: 'email-welcome',
    contactId: '1',
    contactName: 'João Silva',
    contactEmail: 'joao.silva@example.com',
    data: {
      type: 'email',
      to: 'joao.silva@example.com',
      subject: 'Bem-vindo ao programa!',
      body: 'Olá João, seja bem-vindo...',
      hasDecision: false
    },
    dueDate: tomorrow(),
    createdAt: minutesAgo(30),
    updatedAt: minutesAgo(30),
  },
  {
    id: 'act-qualificacao-maria',
    type: 'call',
    status: 'pending',
    title: 'Ligação de Qualificação',
    description: 'Verificar interesse do lead',
    stepNumber: 1,
    totalSteps: 2,
    flowId: 'flow-qualificacao-001',
    flowName: 'Qualificação de Lead',
    blockId: 'call-qual',
    contactId: '2',
    contactName: 'Maria Santos',
    contactPhone: '+55 (21) 99876-5432',
    data: {
      type: 'call',
      phone: '+55 (21) 99876-5432',
      script: 'Verificar interesse e disponibilidade',
      hasDecision: true,
      conditions: [
        { label: 'Qualificado', value: 'qualified' },
        { label: 'Não qualificado', value: 'not_qualified' }
      ]
    },
    dueDate: today(),
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
  },
];

// Helper to get unique flows from activities
export const MOCK_FLOWS_FROM_ACTIVITIES = [
  { id: 'flow-onboarding-001', name: 'Onboarding de Cliente' },
  { id: 'flow-qualificacao-001', name: 'Qualificação de Lead' },
  { id: 'flow-vendas-001', name: 'Pipeline de Vendas' },
];

// Function to get fresh seed activities (with updated timestamps)
export function getSeedActivities(): Activity[] {
  // Re-calculate timestamps on each call for fresh data
  const now = new Date();
  const minutesAgo = (min: number) => new Date(now.getTime() - min * 60000).toISOString();
  const hoursAgo = (hrs: number) => new Date(now.getTime() - hrs * 3600000).toISOString();

  return MOCK_ACTIVITIES.map(activity => ({
    ...activity,
    createdAt: activity.status === 'pending' ? hoursAgo(2) : hoursAgo(4),
    updatedAt: activity.status === 'pending' ? hoursAgo(1) : hoursAgo(2),
    completedAt: activity.completedAt ? hoursAgo(2) : undefined,
    lastExecutedAt: activity.lastExecutedAt ? minutesAgo(30) : undefined,
  }));
}

// Interface para atividades do dashboard
export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  icon: string;
  time: string;
}

// Função para obter atividades de hoje no formato do dashboard
export function getActivitiesToday(): DashboardActivity[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Filtra atividades criadas hoje
  const todayActivities = MOCK_ACTIVITIES.filter(activity => {
    const activityDate = new Date(activity.createdAt);
    return activityDate >= today;
  });

  // Mapeia para o formato esperado pelo dashboard
  return todayActivities.map(activity => {
    // Mapeia o tipo de atividade para o nome do ícone
    const iconMap: Record<string, string> = {
      'email': 'Send',
      'call': 'Phone',
      'message': 'MessageSquare',
      'task': 'CheckSquare',
      'chat_flow': 'Workflow',
      'action': 'RefreshCw',
      'wait': 'Clock',
    };

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description || `${activity.flowName} • ${activity.contactName}`,
      icon: iconMap[activity.type] || 'Activity',
      time: activity.createdAt,
    };
  }).slice(0, 10); // Limita a 10 atividades
}