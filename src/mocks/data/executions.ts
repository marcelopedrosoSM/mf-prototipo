/**
 * Mock data for Flow Executions
 */

import type { FlowExecution } from '@/types/execution';

// Helper for relative time calculation
const now = new Date();
const minutesAgo = (min: number) => new Date(now.getTime() - min * 60000).toISOString();
const hoursAgo = (hrs: number) => new Date(now.getTime() - hrs * 3600000).toISOString();
const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

// ========================================
// EXECUÇÕES DE ATENDIMENTO (Fluxos 1-3)
// ========================================
export const MOCK_EXECUTIONS_ATENDIMENTO: FlowExecution[] = [
    {
        id: 'exec-atend-001',
        executionNumber: 1001,
        flowId: '1',
        flowName: 'Fluxo de Atendimento Padrão',
        contactId: 'contact-001',
        contactName: 'Maria Silva',
        startedAt: minutesAgo(10),
        status: 'running',
        currentBlockId: 'switch-1',
        currentBlockTitle: 'Decisão',
        executionPath: ['start-1', 'message-1', 'question-1', 'switch-1'],
        variables: { nome: 'Maria Silva', departamento: 'Suporte' },
    },
    {
        id: 'exec-atend-002',
        executionNumber: 1000,
        flowId: '1',
        flowName: 'Fluxo de Atendimento Padrão',
        contactId: 'contact-002',
        contactName: 'João Santos',
        startedAt: hoursAgo(1),
        completedAt: minutesAgo(30),
        status: 'completed',
        currentBlockId: 'end-1',
        currentBlockTitle: 'Fim',
        executionPath: ['start-1', 'message-1', 'question-1', 'switch-1', 'action-1', 'end-1'],
        variables: { nome: 'João Santos', departamento: 'Vendas' },
    },
    {
        id: 'exec-atend-003',
        executionNumber: 999,
        flowId: '2',
        flowName: 'Vendas Diretas',
        contactId: 'contact-003',
        contactName: 'Ana Costa',
        startedAt: hoursAgo(3),
        status: 'paused',
        currentBlockId: 'api-1',
        currentBlockTitle: 'Integração',
        executionPath: ['start-1', 'message-1', 'question-1', 'api-1'],
        variables: { nome: 'Ana Costa' },
    },
    {
        id: 'exec-atend-004',
        executionNumber: 998,
        flowId: '3',
        flowName: 'Suporte VIP',
        contactId: 'contact-004',
        contactName: 'Pedro Oliveira',
        startedAt: daysAgo(1),
        status: 'error',
        currentBlockId: 'switch-1',
        currentBlockTitle: 'Decisão',
        executionPath: ['start-1', 'message-1', 'question-1', 'switch-1'],
        error: 'Condição inválida',
        variables: { nome: 'Pedro Oliveira' },
    },
];

// ========================================
// EXECUÇÕES DE ATIVIDADES (Fluxos 4-6)
// ========================================
export const MOCK_EXECUTIONS_ATIVIDADES: FlowExecution[] = [
    // FLUXO 4 - Follow-up Completo - TODOS OS TIPOS DE BLOCOS

    // 1. Parado no E-mail (aguardando abertura)
    {
        id: 'exec-ativ-email',
        executionNumber: 510,
        flowId: '4',
        flowName: 'Follow-up Completo',
        contactId: 'contact-email',
        contactName: '📧 João - No E-mail',
        startedAt: minutesAgo(2),
        status: 'running',
        currentBlockId: 'email-1',
        currentBlockTitle: 'E-mail Boas-vindas',
        executionPath: ['start-1', 'email-1'],
        variables: { nome: 'João Silva', empresa: 'Empresa A' },
    },
    {
        id: 'exec-ativ-wait',
        executionNumber: 509,
        flowId: '4',
        flowName: 'Follow-up Completo',
        contactId: 'contact-wait',
        contactName: '⏳ Maria - Na Espera',
        startedAt: minutesAgo(10),
        status: 'running',
        currentBlockId: 'wait-1',
        currentBlockTitle: 'Espera 2 dias',
        executionPath: ['start-1', 'email-1', 'wait-1'],
        variables: { nome: 'Maria Santos', empresa: 'Empresa B' },
    },
    {
        id: 'exec-ativ-message',
        executionNumber: 508,
        flowId: '4',
        flowName: 'Follow-up Completo',
        contactId: 'contact-message',
        contactName: '💬 Pedro - No WhatsApp',
        startedAt: minutesAgo(30),
        status: 'running',
        currentBlockId: 'message-1',
        currentBlockTitle: 'WhatsApp Check-in',
        executionPath: ['start-1', 'email-1', 'wait-1', 'message-1'],
        variables: { nome: 'Pedro Costa', empresa: 'Empresa C' },
    },
    {
        id: 'exec-ativ-call',
        executionNumber: 507,
        flowId: '4',
        flowName: 'Follow-up Completo',
        contactId: 'contact-call',
        contactName: '📞 Ana - Na Ligação',
        startedAt: hoursAgo(1),
        status: 'running',
        currentBlockId: 'call-1',
        currentBlockTitle: 'Ligação Follow-up',
        executionPath: ['start-1', 'email-1', 'wait-1', 'message-1', 'call-1'],
        variables: { nome: 'Ana Lima', empresa: 'Empresa D' },
    },
    {
        id: 'exec-ativ-action',
        executionNumber: 506,
        flowId: '4',
        flowName: 'Follow-up Completo',
        contactId: 'contact-action',
        contactName: '⚡ Carlos - Na Ação',
        startedAt: hoursAgo(2),
        status: 'running',
        currentBlockId: 'action-1',
        currentBlockTitle: 'Avaliar NPS',
        executionPath: ['start-1', 'email-1', 'wait-1', 'message-1', 'call-1', 'action-1'],
        variables: { nome: 'Carlos Mendes', empresa: 'Empresa E' },
    },
    {
        id: 'exec-ativ-task',
        executionNumber: 505,
        flowId: '4',
        flowName: 'Follow-up Completo',
        contactId: 'contact-task',
        contactName: '✅ Lucia - Na Tarefa',
        startedAt: hoursAgo(3),
        status: 'running',
        currentBlockId: 'task-1',
        currentBlockTitle: 'Registrar Feedback',
        executionPath: ['start-1', 'email-1', 'wait-1', 'message-1', 'call-1', 'action-1', 'task-1'],
        variables: { nome: 'Lucia Ferreira', empresa: 'Empresa F' },
    },
    {
        id: 'exec-ativ-chatflow',
        executionNumber: 504,
        flowId: '4',
        flowName: 'Follow-up Completo',
        contactId: 'contact-chatflow',
        contactName: '🔄 Roberto - No Atendimento',
        startedAt: hoursAgo(4),
        status: 'running',
        currentBlockId: 'chat_flow-1',
        currentBlockTitle: 'Suporte VIP',
        executionPath: ['start-1', 'email-1', 'wait-1', 'message-1', 'call-1', 'action-1', 'chat_flow-1'],
        variables: { nome: 'Roberto Alves', empresa: 'Empresa G' },
    },
    {
        id: 'exec-ativ-complete',
        executionNumber: 503,
        flowId: '4',
        flowName: 'Follow-up Completo',
        contactId: 'contact-complete',
        contactName: '🎉 Fernanda - Concluído',
        startedAt: hoursAgo(5),
        completedAt: hoursAgo(4),
        status: 'completed',
        currentBlockId: 'end-1',
        currentBlockTitle: 'Fim - Sucesso',
        executionPath: ['start-1', 'email-1', 'wait-1', 'message-1', 'call-1', 'action-1', 'chat_flow-1', 'end-1'],
        variables: { nome: 'Fernanda Lima', nps: 'Promotor' },
    },
    {
        id: 'exec-ativ-003',
        executionNumber: 499,
        flowId: '5',
        flowName: 'Pesquisa NPS',
        contactId: 'contact-103',
        contactName: 'Roberto Alves',
        startedAt: hoursAgo(4),
        status: 'paused',
        currentBlockId: 'wait-1',
        currentBlockTitle: 'Espera 1 dia',
        executionPath: ['start-1', 'email-1', 'wait-1'],
        variables: { nome: 'Roberto Alves' },
    },
    {
        id: 'exec-ativ-004',
        executionNumber: 498,
        flowId: '5',
        flowName: 'Pesquisa NPS',
        contactId: 'contact-104',
        contactName: 'Juliana Rocha',
        startedAt: daysAgo(1),
        completedAt: hoursAgo(20),
        status: 'completed',
        currentBlockId: 'end-1',
        currentBlockTitle: 'Fim - Sucesso',
        executionPath: ['start-1', 'email-1', 'action-1', 'chat_flow-1', 'end-1'],
        variables: { nome: 'Juliana Rocha', nps: 'Promotor' },
    },
    {
        id: 'exec-ativ-005',
        executionNumber: 497,
        flowId: '6',
        flowName: 'Fluxo Recorrência',
        contactId: 'contact-105',
        contactName: 'Marcos Souza',
        startedAt: hoursAgo(6),
        status: 'running',
        currentBlockId: 'message-1',
        currentBlockTitle: 'WhatsApp Cobrança',
        executionPath: ['start-1', 'email-1', 'wait-1', 'message-1'],
        variables: { nome: 'Marcos Souza', valor_pendente: 'R$ 500,00' },
    },
    {
        id: 'exec-ativ-006',
        executionNumber: 496,
        flowId: '6',
        flowName: 'Fluxo Recorrência',
        contactId: 'contact-106',
        contactName: 'Patricia Gomes',
        startedAt: daysAgo(2),
        status: 'error',
        currentBlockId: 'call-1',
        currentBlockTitle: 'Ligação Cobrança',
        executionPath: ['start-1', 'email-1', 'wait-1', 'message-1', 'call-1'],
        error: 'Número inválido',
        variables: { nome: 'Patricia Gomes', valor_pendente: 'R$ 1.200,00' },
    },
];

// Combined mock executions
export const MOCK_EXECUTIONS: FlowExecution[] = [
    ...MOCK_EXECUTIONS_ATENDIMENTO,
    ...MOCK_EXECUTIONS_ATIVIDADES,
];

// Function to get fresh seed executions with updated timestamps
export function getSeedExecutions(): FlowExecution[] {
    const now = new Date();
    const minutesAgo = (min: number) => new Date(now.getTime() - min * 60000).toISOString();
    const hoursAgo = (hrs: number) => new Date(now.getTime() - hrs * 3600000).toISOString();
    const daysAgo = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

    return MOCK_EXECUTIONS.map((exec) => {
        let startedAt = exec.startedAt;
        let completedAt = exec.completedAt;

        // Recalculate based on status
        if (exec.status === 'running') {
            startedAt = minutesAgo(Math.floor(Math.random() * 30) + 5);
        } else if (exec.status === 'paused') {
            startedAt = hoursAgo(Math.floor(Math.random() * 6) + 1);
        } else if (exec.status === 'completed') {
            startedAt = hoursAgo(Math.floor(Math.random() * 24) + 1);
            completedAt = minutesAgo(Math.floor(Math.random() * 60) + 10);
        } else if (exec.status === 'error') {
            startedAt = daysAgo(Math.floor(Math.random() * 3) + 1);
        }

        return { ...exec, startedAt, completedAt };
    });
}

