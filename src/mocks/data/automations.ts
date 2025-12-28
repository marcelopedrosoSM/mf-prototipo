/**
 * Mock data for Automations
 */

import type { Automation, AutomationTrigger } from '@/types/automation';

// Map gatilho type to trigger block type
const GATILHO_TO_TRIGGER_BLOCK: Record<AutomationTrigger, string | null> = {
    conversa_criada: 'trigger_conversation_created',
    mensagem_recebida: 'trigger_message_received',
    mensagem_enviada: 'trigger_message_received',
    conversa_finalizada: 'trigger_conversation_closed',
    fluxo_unificado: null, // User selects trigger
    horario_atendimento: null,
};

// Trigger node data based on type
const TRIGGER_NODE_DATA: Record<string, { title: string; type: string }> = {
    trigger_conversation_created: { title: 'Conversa Criada', type: 'trigger_conversation_created' },
    trigger_message_received: { title: 'Mensagem Recebida', type: 'trigger_message_received' },
    trigger_conversation_closed: { title: 'Conversa Finalizada', type: 'trigger_conversation_closed' },
};

// Helper to create default nodes for a new automation
export function createDefaultNodes(gatilho: AutomationTrigger) {
    const triggerBlockType = GATILHO_TO_TRIGGER_BLOCK[gatilho];
    const nodes = [];
    const edges = [];

    // Add trigger node if there's a specific one for this gatilho
    if (triggerBlockType && TRIGGER_NODE_DATA[triggerBlockType]) {
        nodes.push({
            id: 'trigger-1',
            type: 'triggerNode',
            position: { x: 100, y: 200 },
            deletable: false, // Não permitir remoção do gatilho
            data: TRIGGER_NODE_DATA[triggerBlockType],
        });
    }

    // Always add End node
    nodes.push({
        id: 'end-1',
        type: 'customNodeHorizontal',
        position: { x: 500, y: 200 },
        deletable: false, // Não permitir remoção do bloco Fim
        data: {
            type: 'end',
            title: 'Fim',
        },
    });

    // Add edge between trigger and end if trigger exists
    if (triggerBlockType && TRIGGER_NODE_DATA[triggerBlockType]) {
        edges.push({
            id: 'edge-trigger-end',
            source: 'trigger-1',
            target: 'end-1',
            type: 'smoothstep',
        });
    }

    return { nodes, edges };
}

// Initial mock automations - empty by default (user creates their own)
export const MOCK_AUTOMATIONS: Automation[] = [];

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
