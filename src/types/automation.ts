/**
 * Tipos para Automações
 * Automações são regras empresariais configuradas por caixa de entrada
 */

export type AutomationTrigger =
    | 'fluxo_unificado'
    | 'horario_atendimento'
    | 'conversa_criada'
    | 'mensagem_recebida'
    | 'mensagem_enviada'
    | 'conversa_finalizada'
    | 'contato_criado';

export interface AutomationNode {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: Record<string, any>;
}

export interface AutomationEdge {
    id: string;
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
    type?: string;
    markerEnd?: string | object;
}

export interface Automation {
    id: string;
    nome: string;
    caixaId: string;
    gatilho: AutomationTrigger;
    ativo: boolean;
    nodes: AutomationNode[];
    edges: AutomationEdge[];
    createdAt: Date;
    updatedAt: Date;
}

export interface TriggerConfig {
    label: string;
    icon: string;
    description: string;
    color: string;
}

export const TRIGGER_CONFIG: Record<AutomationTrigger, TriggerConfig> = {
    fluxo_unificado: {
        label: 'Fluxo de Atendimento',
        icon: 'Workflow',
        description: 'Gerencie todas as regras de atendimento em um único fluxo',
        color: '#6366f1' // Indigo
    },
    horario_atendimento: {
        label: 'Horário de Atendimento',
        icon: 'Clock',
        description: 'Responder dentro ou fora do horário comercial',
        color: '#F59E0B' // Amber
    },
    conversa_criada: {
        label: 'Conversa Criada',
        icon: 'MessageSquarePlus',
        description: 'Quando uma nova conversa é iniciada',
        color: '#10B981' // Emerald
    },
    mensagem_recebida: {
        label: 'Mensagem Recebida',
        icon: 'MessageSquare',
        description: 'Ao receber uma mensagem do contato',
        color: '#3B82F6' // Blue
    },
    mensagem_enviada: {
        label: 'Mensagem Enviada',
        icon: 'Send',
        description: 'Ao enviar uma mensagem para o contato',
        color: '#8B5CF6' // Violet
    },
    conversa_finalizada: {
        label: 'Conversa Finalizada',
        icon: 'CheckCircle2',
        description: 'Quando uma conversa é encerrada',
        color: '#EF4444' // Red
    },
    contato_criado: {
        label: 'Contato Criado',
        icon: 'UserPlus',
        description: 'Quando um novo contato é cadastrado',
        color: '#EC4899' // Pink
    },
};

// Lista ordenada de gatilhos para exibição
export const TRIGGER_ORDER: AutomationTrigger[] = [
    'fluxo_unificado',
];

// ============================================
// TIPOS DE BLOCOS PARA AUTOMAÇÕES
// ============================================

import type { WeekdayId } from './flow-config';

// Tipos de blocos de automação
export type AutomationBlockType =
    | 'start'
    | 'end'
    | 'start'
    | 'end'
    | 'trigger_message_received'
    | 'trigger_conversation_created'
    | 'trigger_conversation_closed'
    | 'trigger_manual'
    | 'trigger_contact_created'
    | 'availability_check'
    | 'message'
    | 'question'
    | 'action'
    | 'condition'
    | 'wait'
    | 'chat_flow'
    | 'task_flow';

// Intervalo de horário de atendimento
export interface BusinessHoursInterval {
    id: string;
    label: string;          // Nome customizável (ex: "Dias de Semana")
    days: WeekdayId[];      // Dias selecionados
    startTime: string;      // "09:00"
    endTime: string;        // "18:00"
}

// Dados do bloco de Disponibilidade (Unificação de Feriado + Horário)
export interface AvailabilityBlockData {
    type: 'availability_check';
    title: string;
    intervals: BusinessHoursInterval[];
}

// Configuração de blocos por gatilho
export interface AutomationBlockConfig {
    type: AutomationBlockType;
    label: string;
    icon: string;
    color: string;
    description: string;
}

// Blocos disponíveis para cada gatilho
export const AUTOMATION_BLOCKS: Record<AutomationTrigger, AutomationBlockConfig[]> = {
    fluxo_unificado: [
        // GATILHOS
        {
            type: 'trigger_message_received',
            label: 'Mensagem Recebida',
            icon: 'MessageSquare',
            color: '#3B82F6', // Blue
            description: 'Dispara quando o contato envia qualquer mensagem',
        },
        {
            type: 'trigger_conversation_created',
            label: 'Conversa Criada',
            icon: 'MessageSquarePlus',
            color: '#10B981', // Emerald
            description: 'Dispara apenas na primeira mensagem da conversa',
        },
        {
            type: 'trigger_conversation_closed',
            label: 'Conversa Finalizada',
            icon: 'CheckCircle2',
            color: '#EF4444', // Red
            description: 'Dispara quando a conversa é resolvida',
        },

        // AÇÕES E CONDIÇÕES

        {
            type: 'availability_check',
            label: 'Disponibilidade',
            icon: 'CalendarClock',
            color: '#F59E0B', // Amber
            description: 'Verifica horário de atendimento e feriados',
        },
        {
            type: 'message',
            label: 'Mensagem',
            icon: 'MessageSquare',
            color: '#10B981', // Emerald
            description: 'Enviar mensagem ao contato',
        },
        {
            type: 'question',
            label: 'Pergunta',
            icon: 'HelpCircle',
            color: '#10B981', // Emerald
            description: 'Fazer pergunta e salvar resposta',
        },
        {
            type: 'action',
            label: 'Ação',
            icon: 'Sparkles',
            color: '#8B5CF6', // Violet
            description: 'Executar ação do sistema',
        },
        {
            type: 'wait',
            label: 'Espera',
            icon: 'Clock',
            color: '#F97316', // Orange
            description: 'Pausar execução',
        },
        {
            type: 'chat_flow',
            label: 'Fluxo de Atendimento',
            icon: 'Workflow',
            color: '#8B5CF6', // Violet
            description: 'Disparar um fluxo de atendimento',
        },
        {
            type: 'task_flow',
            label: 'Fluxo de Atividades',
            icon: 'ListTodo',
            color: '#10B981', // Emerald
            description: 'Disparar um fluxo de atividades',
        },
    ],
    horario_atendimento: [
        {
            type: 'availability_check',
            label: 'Verificar Disponibilidade',
            icon: 'CalendarClock',
            color: '#F59E0B', // Amber
            description: 'Verifica feriados e horário de atendimento',
        },
        {
            type: 'message',
            label: 'Mensagem',
            icon: 'MessageSquare',
            color: '#10B981', // Emerald
            description: 'Enviar mensagem ao contato',
        },
    ],
    conversa_criada: [],
    mensagem_recebida: [],
    mensagem_enviada: [],
    conversa_finalizada: [],
    contato_criado: [
        {
            type: 'trigger_contact_created',
            label: 'Contato Criado',
            icon: 'UserPlus',
            color: '#EC4899', // Pink
            description: 'Dispara quando um novo contato é adicionado',
        },
        {
            type: 'task_flow',
            label: 'Fluxo de Atividades',
            icon: 'ListTodo',
            color: '#10B981', // Emerald
            description: 'Iniciar uma cadência de atividades',
        },
        {
            type: 'chat_flow',
            label: 'Fluxo de Atendimento',
            icon: 'Workflow',
            color: '#8B5CF6', // Violet
            description: 'Disparar um fluxo de atendimento (se houver canal)',
        },
        {
            type: 'wait',
            label: 'Espera',
            icon: 'Clock',
            color: '#F97316', // Orange
            description: 'Aguardar um tempo',
        },
        {
            type: 'condition', // Added missing generic condition block type if needed, or re-use others.
            label: 'Condição', // Assuming 'condition' type exists or we need to add it to AutomationBlockType if it wasn't there (it is in list above)
            icon: 'Split', // Assuming Split icon or similar exists, using HelpCircle/GitBranch metaphor
            color: '#64748B', // Slate
            description: 'Verificar condições do contato',
        },
        {
            type: 'action',
            label: 'Ação',
            icon: 'Sparkles',
            color: '#8B5CF6', // Violet
            description: 'Executar ação do sistema',
        },
    ],
};

// Dados padrão para novos blocos
export function getDefaultBlockData(type: AutomationBlockType): Record<string, any> {
    switch (type) {
        case 'availability_check':
            return {
                type: 'availability_check',
                title: 'Disponibilidade',
                intervals: [
                    {
                        id: 'interval-1',
                        label: 'Horário Comercial',
                        days: ['seg', 'ter', 'qua', 'qui', 'sex'],
                        startTime: '09:00',
                        endTime: '18:00',
                    },
                ],
            };
        case 'start':
            return { type: 'start', title: 'Início' };
        case 'end':
            return { type: 'end', title: 'Fim' };
        case 'trigger_message_received':
            return { type: 'trigger_message_received', title: 'Mensagem Recebida' };
        case 'trigger_conversation_created':
            return { type: 'trigger_conversation_created', title: 'Conversa Criada' };
        case 'trigger_conversation_closed':
            return { type: 'trigger_conversation_closed', title: 'Conversa Finalizada' };
        case 'trigger_contact_created':
            return { type: 'trigger_contact_created', title: 'Contato Criado' };

        case 'message':
            return {
                type: 'message',
                title: 'Mensagem',
                messageType: 'text',
                content: '',
            };
        case 'question':
            return {
                type: 'question',
                title: 'Pergunta',
                content: '',
            };
        case 'action':
            return {
                type: 'action',
                title: 'Ação',
            };
        case 'wait':
            return {
                type: 'wait',
                title: 'Espera',
                waitDuration: 0,
            };
        case 'chat_flow':
            return {
                type: 'chat_flow',
                title: 'Fluxo de Atendimento',
                conditions: ['Ganho', 'Perdido'],
            };
        case 'task_flow':
            return {
                type: 'task_flow',
                title: 'Fluxo de Atividades',
                conditions: ['Ganho', 'Perdido'],
            };
        default:
            return { type };
    }
}
