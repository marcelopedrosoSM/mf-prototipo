/**
 * Mock data for Automations
 */

import type { Automation, AutomationTrigger } from '@/types/automation';

// Helper to create default nodes for a new automation (only End node, user drags triggers)
export function createDefaultNodes(_gatilho: AutomationTrigger) {
    return {
        nodes: [
            {
                id: 'end-1',
                type: 'customNodeHorizontal',
                position: { x: 500, y: 200 },
                data: {
                    type: 'end',
                    title: 'Fim',
                },
            },
        ],
        edges: [],
    };
}

// Initial mock automations
export const MOCK_AUTOMATIONS: Automation[] = [
    {
        id: '1',
        nome: 'Automação Vendas',
        caixaId: '1',
        gatilho: 'fluxo_unificado',
        ativo: false,
        ...createDefaultNodes('fluxo_unificado'),
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:00:00Z'),
    },
    {
        id: '2',
        nome: 'Automação Suporte',
        caixaId: '2',
        gatilho: 'fluxo_unificado',
        ativo: false,
        ...createDefaultNodes('fluxo_unificado'),
        createdAt: new Date('2024-01-16T10:00:00Z'),
        updatedAt: new Date('2024-01-16T10:00:00Z'),
    }
];

// Get all automations
export function getAutomations(): Automation[] {
    return [...MOCK_AUTOMATIONS];
}

// Get automations by inbox
export function getAutomationsByInbox(caixaId: string): Automation[] {
    return MOCK_AUTOMATIONS.filter(a => a.caixaId === caixaId);
}

// Get automations by trigger type
export function getAutomationsByTrigger(caixaId: string, gatilho: AutomationTrigger): Automation[] {
    return MOCK_AUTOMATIONS.filter(a => a.caixaId === caixaId && a.gatilho === gatilho);
}
