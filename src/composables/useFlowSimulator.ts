/**
 * useFlowSimulator - Composable para simulação de fluxos
 * 
 * Permite executar fluxos passo a passo no modo simulação,
 * gerenciando estado, mensagens e navegação entre blocos.
 */

import { ref, computed, type Ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import type { CustomNodeData, BlockType, Condition } from '@/types/flow-builder';
import { evaluateSwitch } from '@/utils/flowExecution';
import { useActivityStore } from '@/stores/activities';
import { useConversationsStore } from '@/stores/conversations';

// Tipos de mensagens no chat
export type MessageType = 'bot' | 'user' | 'system';

export interface SimulatorMessage {
    id: string;
    type: MessageType;
    text: string;
    timestamp: number;
    blockId?: string;
    metadata?: Record<string, unknown>;
}

// Estados possíveis da simulação (Compatível com painel-base)
export type FlowState =
    | 'IDLE'           // Não iniciado
    | 'RUNNING'        // Executando lógica
    | 'TYPING'         // Simulando digitação
    | 'WAITING_INPUT'  // Aguardando input do usuário
    | 'bit'            // (Opcional) Estado intermediário
    | 'PAUSED'         // Pausado
    | 'ENDED'          // Fluxo finalizado sucesso
    | 'ERROR';         // Erro na execução

export interface FlowSimulatorOptions {
    nodes: Ref<Node<CustomNodeData>[]>;
    edges: Ref<Edge[]>;
    onBlockExecute?: (blockId: string) => void;
    onBlockComplete?: (blockId: string) => void;
    onFlowComplete?: () => void;
    onError?: (error: string, blockId?: string) => void;
    typingDelay?: number; // Delay padrão de digitação em ms
    flowId?: string;
    flowName?: string;
    contactId?: string;
    contactData?: { name: string; email?: string; phone?: string };
}

// Mapa centralizado de status (usado em header e mensagens de sistema)
export const SIM_STATUS_TEXT: Record<FlowState, string> = {
    IDLE: 'Aguardando início',
    RUNNING: 'Executando...',
    TYPING: 'Executando...', // Mantido para compatibilidade, mas não usado
    WAITING_INPUT: 'Aguardando resposta',
    bit: 'Processando...',
    PAUSED: 'Pausado',
    ENDED: 'Fluxo finalizado',
    ERROR: 'Erro'
};

declare global {
    interface Window {
        myflowsDebug?: {
            getExecutionInfo?: () => { executionPath: string[]; errorBlocks: string[]; variables: Record<string, unknown>; state: string };
        };
    }
}

export function useFlowSimulator(options: FlowSimulatorOptions) {
    const {
        nodes,
        edges,
        onBlockExecute,
        onBlockComplete,
        onFlowComplete,
        onError,
        flowId,
        flowName,
        contactId,
        contactData,
    } = options;

    const activityStore = useActivityStore();
    const conversationsStore = useConversationsStore();

    // Estado da simulação
    const state = ref<FlowState>('IDLE');
    const messages = ref<SimulatorMessage[]>([]);
    const variables = ref<Record<string, unknown>>({});
    const currentBlockId = ref<string | null>(null);
    const flowPath = ref<string[]>([]); // Renomeado de executionPath
    const errorBlocks = ref<Set<string>>(new Set());
    const waitingForInput = ref(false);
    const expectedVariable = ref<string | null>(null);

    // Helpers
    const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const addMessage = async (type: MessageType, text: string, blockId?: string, metadata?: Record<string, unknown>) => {
        console.log(`[useFlowSimulator] addMessage: Adicionando mensagem tipo="${type}", text="${text}", blockId="${blockId}"`);
        const message: SimulatorMessage = {
            id: generateId(),
            type,
            text,
            timestamp: Date.now(),
            blockId,
            metadata
        };
        messages.value.push(message);
        console.log(`[useFlowSimulator] addMessage: Mensagem adicionada ao array. Total de mensagens: ${messages.value.length}`);

        // Aguardar que o Vue renderize a mensagem no DOM
        await nextTick();

        return message;
    };

    const findNodeById = (id: string): Node<CustomNodeData> | undefined => {
        return nodes.value.find(n => n.id === id);
    };

    const findStartNode = (): Node<CustomNodeData> | undefined => {
        // Prioritize manual trigger for testing
        const manualTrigger = nodes.value.find(n => n.data.type === 'trigger_manual');
        if (manualTrigger) return manualTrigger;

        // Fallback to any trigger or legacy start
        return nodes.value.find(n =>
            (n.data.type && typeof n.data.type === 'string' && n.data.type.startsWith('trigger_')) ||
            n.data.type === 'start'
        );
    };

    const findNextBlockId = (fromBlockId: string, handleId?: string): string | null => {
        // Buscar edge que sai desse bloco
        const edge = edges.value.find(e => {
            if (e.source !== fromBlockId) return false;
            if (handleId && e.sourceHandle !== handleId) return false;
            return true;
        });
        return edge?.target || null;
    };

    const resolveVariables = (text: string): string => {
        if (!text) return '';
        return text.replace(/\{\{([^}]+)\}\}/g, (_, varName) => {
            const value = variables.value[varName.trim()];
            return value !== undefined ? String(value) : `{{${varName}}}`;
        });
    };

    // Delay helper
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Executa um bloco específico
    const executeBlock = async (blockId: string): Promise<string | null> => {
        console.log(`[useFlowSimulator] executeBlock: Executando bloco ${blockId}`);
        const node = findNodeById(blockId);
        if (!node) {
            console.log(`[useFlowSimulator] executeBlock: ERRO - Bloco ${blockId} não encontrado`);
            await addMessage('system', `Erro: Bloco ${blockId} não encontrado`, blockId);
            state.value = 'ERROR';
            onError?.(`Bloco não encontrado: ${blockId}`, blockId);
            return null;
        }

        console.log(`[useFlowSimulator] executeBlock: Bloco encontrado, tipo=${node.data.type}`);
        currentBlockId.value = blockId;
        flowPath.value.push(blockId); // Tracking path
        onBlockExecute?.(blockId);
        console.log(`[useFlowSimulator] executeBlock: Bloco marcado visualmente`);

        const data = node.data;
        const blockType = data.type as BlockType;

        try {
            switch (blockType) {
                case 'start':
                case 'trigger_manual':
                case 'trigger_message_received':
                case 'trigger_conversation_created':
                case 'trigger_conversation_closed':
                    // Start já foi processado no start(), apenas navegar para o próximo
                    console.log(`[useFlowSimulator] executeBlock: Start/Trigger - apenas navegando para próximo`);
                    break;

                case 'message':
                    // Enviar mensagem do bot
                    const messageText = resolveVariables(data.content || '');
                    if (messageText) {
                        await addMessage('bot', messageText, blockId, { messageType: data.messageType });
                    }
                    break;

                case 'question':
                    // Enviar pergunta e aguardar resposta
                    const questionText = resolveVariables(data.content || '');
                    if (questionText) {
                        await addMessage('bot', questionText, blockId);
                    }

                    // Se tem opções, mostrar
                    if (data.options && data.options.length > 0) {
                        const optionsText = data.options.map((opt, i) =>
                            `${data.optionPrefix === 'letter' ? String.fromCharCode(65 + i) : i + 1}. ${opt.label}`
                        ).join('\n');
                        await addMessage('bot', optionsText, blockId, { isOptions: true });
                    }

                    await addMessage('system', 'Aguardando Resposta', blockId);

                    // Aguardar input
                    state.value = 'WAITING_INPUT';
                    waitingForInput.value = true;
                    expectedVariable.value = data.variable || null;
                    return null; // Para a execução, aguarda input

                case 'switch':
                    // Avaliar condições usando utilitário compartilhado
                    if (data.conditions && data.conditions.length > 0) {
                        const context = {
                            variables: variables.value,
                            currentBlockId: blockId
                        };

                        // Casting explícito pois data.conditions vem como any/unknown em alguns casos
                        const conditions = data.conditions as Condition[];
                        const matchedHandle = evaluateSwitch(conditions, context);

                        if (matchedHandle) {
                            onBlockComplete?.(blockId);
                            return findNextBlockId(blockId, matchedHandle);
                        }

                        // Nenhuma condição match - usar default
                        onBlockComplete?.(blockId);
                        return findNextBlockId(blockId, 'default');
                    }
                    break;

                case 'email':
                case 'call':
                case 'task':
                case 'chat_flow':
                    // Gerar atividade na store se tivermos contexto
                    if (flowId && contactId && contactData) {
                        try {
                            const activity = activityStore.createActivityFromNode(
                                flowId,
                                flowName || 'Fluxo sem nome',
                                node,
                                contactId,
                                contactData
                            );

                            if (activity) {
                                await addMessage('system', `📝 Atividade criada: ${activity.title} (${activity.type})`, blockId);
                            }
                        } catch (err) {
                            console.error('Erro ao criar atividade:', err);
                            await addMessage('system', `❌ Erro ao criar atividade: ${err}`, blockId);
                        }
                    } else {
                        await addMessage('system', `⚠️ Atividade simulada (sem contexto de execução): ${blockType}`, blockId);
                    }
                    break;

                case 'action':
                    // Simular ação
                    const actionTypeStr = (data.actionType as string) || '';

                    if (actionTypeStr === 'finish_conversation') {
                        state.value = 'ENDED';
                        // Clear current block so it doesn't stay 'Executing'
                        currentBlockId.value = null;
                        onFlowComplete?.();
                        return null;
                    }
                    else if (actionTypeStr === 'assign_agent') {
                        // Tentar atribuir usando a store
                        const targetConvId = contactId || 'mock-conv-id';
                        const assigned = data.agentId ? conversationsStore.assignAgent(targetConvId, data.agentId as string) : false;

                        const statusMsg = assigned ? '✅ Sucesso' : '⚠️ Simulada (sem ID real)';
                        await addMessage('system', `🔄 Atribuído ao agente: ${data.agentId || 'Não especificado'} (${statusMsg})`, blockId);
                    }
                    else if (actionTypeStr === 'assign_team') {
                        const targetConvId = contactId || 'mock-conv-id';
                        const assigned = data.teamId ? conversationsStore.assignTeam(targetConvId, data.teamId as string) : false;

                        const statusMsg = assigned ? '✅ Sucesso' : '⚠️ Simulada (sem ID real)';
                        await addMessage('system', `👥 Atribuído ao time: ${data.teamId || 'Não especificado'} (${statusMsg})`, blockId);
                    }
                    else if (actionTypeStr === 'add_tag') {
                        const tags = Array.isArray(data.tags) ? data.tags : [];
                        if (tags.length > 0 && contactId) {
                            // Tentar adicionar tags na store
                            // TODO: Implementar método addTags na store de conversas se não existir
                        }
                        await addMessage('system', `🏷️ Tags adicionadas: ${tags.join(', ') || 'Nenhuma'}`, blockId);
                    }
                    break;

                case 'api':
                    // Mock de resposta (Simulando delay de rede)
                    await delay(500);

                    const mockResponse = { success: true, data: { message: 'Mock response' } };
                    if (data.api_response_variable && typeof data.api_response_variable === 'string') {
                        variables.value[data.api_response_variable] = mockResponse;
                    }
                    break;

                case 'wait':
                    // Aqui poderíamos usar o delay real se quiséssemos
                    // const waitTime = data.waitDuration || 0;
                    // await delay(waitTime); 
                    break;

                case 'note':
                    // Notas não fazem nada na execução
                    break;

                case 'end':
                    state.value = 'ENDED';
                    // Clear current block so it doesn't stay 'Executing'
                    currentBlockId.value = null;
                    onFlowComplete?.();
                    return null;

                case 'condition_holiday':
                case 'condition_weekday':
                case 'condition_time_range':
                    // Por enquanto tratamos como no-op (segue o fluxo padrão)
                    // No futuro, a lógica de avaliação será implementada aqui
                    break;

                default:
                    await addMessage('system', `⚠️ Tipo de bloco desconhecido: ${blockType}`, blockId);
            }

            onBlockComplete?.(blockId);

            // Navegar para próximo bloco
            return findNextBlockId(blockId);

        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Erro desconhecido';
            await addMessage('system', `❌ Erro: ${errorMsg}`, blockId);
            errorBlocks.value.add(blockId);
            state.value = 'ERROR';
            onError?.(errorMsg, blockId);
            return null;
        }
    };

    // Loop de execução
    const runExecutionLoop = async () => {
        console.log('[useFlowSimulator] runExecutionLoop: Loop iniciado');
        // O loop roda enquanto estiver em RUNNING
        // Verificações de ERROR/ENDED dentro do loop são redundantes para o compilador TS se o while já filtra
        // mas em runtime JS podem ser úteis. Para satisfazer o TS e lógica:

        while (state.value === 'RUNNING' && currentBlockId.value) {
            console.log(`[useFlowSimulator] runExecutionLoop: Iteração do loop - estado=${state.value}, currentBlockId=${currentBlockId.value}`);

            // Re-verificar estado atual para garantir
            if (state.value !== 'RUNNING') {
                console.log('[useFlowSimulator] runExecutionLoop: Estado não é RUNNING, saindo do loop');
                break;
            }

            console.log('[useFlowSimulator] runExecutionLoop: Executando bloco...');
            const nextBlockId = await executeBlock(currentBlockId.value);
            console.log(`[useFlowSimulator] runExecutionLoop: Bloco executado, nextBlockId=${nextBlockId}`);

            // TypeScript narrowing fix: state.value changed during await executeBlock
            const currentState = state.value as FlowState;

            // Se o estado mudou para WAITING_INPUT, ENDED ou ERROR durante a execução do bloco
            if (currentState === 'WAITING_INPUT' || currentState === 'ENDED' || currentState === 'ERROR') {
                break;
            }

            if (!nextBlockId) {
                // Se não tem próximo bloco mas ainda está rodando, finalizar
                if (state.value === 'RUNNING') {
                    state.value = 'ENDED';
                    // Clear current block so it doesn't stay 'Executing'
                    currentBlockId.value = null;
                    onFlowComplete?.();
                }
                break;
            }

            currentBlockId.value = nextBlockId;
            console.log(`[useFlowSimulator] runExecutionLoop: currentBlockId atualizado para ${nextBlockId}`);
        }
        console.log('[useFlowSimulator] runExecutionLoop: Loop finalizado');
    };

    // API pública
    const start = async () => {
        console.log('[useFlowSimulator] start: Iniciando simulação...');
        const startNode = findStartNode();
        if (!startNode) {
            console.log('[useFlowSimulator] start: ERRO - Nenhum bloco de início encontrado');
            await addMessage('system', '❌ Erro: Nenhum bloco de início encontrado');
            state.value = 'ERROR';
            return;
        }

        console.log('[useFlowSimulator] start: Start Node encontrado:', startNode.id);

        // Reset
        messages.value = [];
        variables.value = {};
        flowPath.value = [];
        errorBlocks.value = new Set();
        waitingForInput.value = false;
        console.log('[useFlowSimulator] start: Reset concluído');

        // Marcar o bloco de início visualmente PRIMEIRO
        currentBlockId.value = startNode.id;
        onBlockExecute?.(startNode.id);
        console.log('[useFlowSimulator] start: Bloco de início marcado visualmente');

        // CRÍTICO: Adicionar a primeira mensagem ANTES de mudar o estado para RUNNING
        // Isso garante que a mensagem apareça antes do indicador "Executando..."
        console.log('[useFlowSimulator] start: Adicionando mensagem "Fluxo Iniciado" ANTES de mudar estado...');
        await addMessage('system', 'Fluxo Iniciado', startNode.id);
        console.log('[useFlowSimulator] start: Mensagem "Fluxo Iniciado" adicionada');

        // Aguardar múltiplos frames para garantir renderização visual completa
        console.log('[useFlowSimulator] start: Aguardando múltiplos requestAnimationFrame para renderização visual...');
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => requestAnimationFrame(resolve));
        console.log('[useFlowSimulator] start: Após múltiplos requestAnimationFrame');

        // SÓ AGORA mudar o estado para RUNNING (depois que a mensagem já apareceu)
        console.log('[useFlowSimulator] start: Mudando estado para RUNNING...');
        state.value = 'RUNNING';
        console.log('[useFlowSimulator] start: Estado mudado para RUNNING');
        console.log('[useFlowSimulator] start: Iniciando runExecutionLoop()...');

        // Agora iniciar o loop de execução
        runExecutionLoop();
        console.log('[useFlowSimulator] start: runExecutionLoop() chamado (não aguardado)');
    };

    const reset = () => {
        state.value = 'IDLE';
        messages.value = [];
        variables.value = {};
        currentBlockId.value = null;
        flowPath.value = [];
        errorBlocks.value = new Set();
        waitingForInput.value = false;
        expectedVariable.value = null;
    };

    const sendUserMessage = async (text: string) => {
        if (!waitingForInput.value) return;

        // Adicionar mensagem do usuário
        await addMessage('user', text, currentBlockId.value || undefined);

        // Salvar variável se esperada
        if (expectedVariable.value) {
            variables.value[expectedVariable.value] = text;
        }

        // Tentar identificar qual opção foi escolhida (se for bloco de pergunta)
        let matchedHandleId: string | undefined;
        const currentNode = currentBlockId.value ? findNodeById(currentBlockId.value) : undefined;

        if (currentNode && currentNode.data.type === 'question' && currentNode.data.options && currentNode.data.options.length > 0) {
            const options = currentNode.data.options;
            const cleanInput = text.trim().toLowerCase();
            const numInput = parseInt(cleanInput);

            // 1. Tentar por número (1, 2, 3...)
            if (!isNaN(numInput) && numInput >= 1 && numInput <= options.length) {
                matchedHandleId = `option-${numInput - 1}`;
            }
            // 2. Tentar por texto exato (label)
            else {
                const index = options.findIndex(opt => opt.label.toLowerCase() === cleanInput);
                if (index !== -1) {
                    matchedHandleId = `option-${index}`;
                }
            }
        }

        // Continuar execução
        waitingForInput.value = false;
        expectedVariable.value = null;
        state.value = 'RUNNING';

        // Navegar para próximo bloco (usando o handle compatível se encontrado)
        const nextBlockId = findNextBlockId(currentBlockId.value || '', matchedHandleId);

        if (nextBlockId) {
            currentBlockId.value = nextBlockId;
            runExecutionLoop();
        } else {
            state.value = 'ENDED';
            // Clear current block so it doesn't stay 'Executing'
            currentBlockId.value = null;
            onFlowComplete?.();
        }
    };

    // Expor debug info na window (similar ao painel-base)
    onMounted(() => {
        if (typeof window !== 'undefined') {
            window.myflowsDebug = {
                getExecutionInfo: () => ({
                    executionPath: flowPath.value,
                    errorBlocks: Array.from(errorBlocks.value),
                    variables: variables.value,
                    state: state.value
                })
            };
        }
    });

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            delete window.myflowsDebug;
        }
    });

    // Computed
    const isRunning = computed(() => state.value === 'RUNNING');
    const isWaiting = computed(() => state.value === 'WAITING_INPUT');
    const isCompleted = computed(() => state.value === 'ENDED');
    const isIdle = computed(() => state.value === 'IDLE');
    const hasError = computed(() => state.value === 'ERROR');

    // Mensagens de sistema apenas para estados específicos
    watch(state, async (newState) => {
        // Apenas adicionar mensagem quando o fluxo finalizar
        if (newState === 'ENDED') {
            const txt = SIM_STATUS_TEXT[newState];
            if (txt) await addMessage('system', txt);
        }
    });

    return {
        // Estado
        state,
        messages,
        variables,
        currentBlockId,
        flowPath,
        errorBlocks,
        waitingForInput,

        // Computed
        isRunning,
        isWaiting,
        isCompleted,
        isIdle,
        hasError,

        // Ações
        start,
        reset,
        sendUserMessage
    };
}
