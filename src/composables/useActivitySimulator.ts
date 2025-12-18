/**
 * useActivitySimulator - Composable para simulação de fluxos de atividades
 * 
 * Permite executar fluxos de atividades passo a passo,
 * mostrando uma timeline de execução com preview de cada ação.
 */

import { ref, computed, type Ref, type ComputedRef } from 'vue';
import type { Node, Edge } from '@vue-flow/core';
import type { CustomNodeData, BlockType } from '@/types/flow-builder';

// Status de cada step na timeline
export type StepStatus = 'pending' | 'running' | 'completed' | 'skipped' | 'error';

// Estado da simulação
export type SimulatorState = 'idle' | 'running' | 'paused' | 'completed';

// Preview de ação específica por tipo de bloco
export interface ActionPreview {
    email?: {
        to: string;
        subject: string;
        body: string;
    };
    call?: {
        phone: string;
        script: string;
    };
    task?: {
        title: string;
        assignee: string;
        dueDate?: string;
    };
    chatFlow?: {
        flowName: string;
        flowId: string;
    };
    wait?: {
        duration: number;
        unit: 'minutes' | 'hours' | 'days';
        until?: Date;
    };
}

// Representa um passo na timeline de execução
export interface ActivityStep {
    id: string;
    blockId: string;
    type: BlockType;
    title: string;
    description: string;
    status: StepStatus;
    scheduledAt?: Date;
    completedAt?: Date;
    preview: ActionPreview;
    error?: string;
}

// Opções do composable
export interface UseActivitySimulatorOptions {
    nodes: Ref<Node<CustomNodeData>[]>;
    edges: Ref<Edge[]>;
    onBlockExecute?: (blockId: string) => void;
    onBlockComplete?: (blockId: string) => void;
    onFlowComplete?: () => void;
    onError?: (error: string, blockId?: string) => void;
    stepDelay?: number; // Delay entre steps em ms (default: 1000)
}

// Retorno do composable
export interface UseActivitySimulatorReturn {
    steps: Ref<ActivityStep[]>;
    currentStepIndex: Ref<number>;
    state: Ref<SimulatorState>;

    // Actions
    start: () => void;
    pause: () => void;
    resume: () => void;
    nextStep: () => Promise<void>;
    previousStep: () => void;
    reset: () => void;
    skipWait: () => void;
    goToStep: (index: number) => void;

    // Computed
    currentStep: ComputedRef<ActivityStep | null>;
    isCompleted: ComputedRef<boolean>;
    isRunning: ComputedRef<boolean>;
    isPaused: ComputedRef<boolean>;
    canGoNext: ComputedRef<boolean>;
    canGoPrevious: ComputedRef<boolean>;
    executionPath: ComputedRef<string[]>;
    progress: ComputedRef<number>;
}

export function useActivitySimulator(options: UseActivitySimulatorOptions): UseActivitySimulatorReturn {
    const {
        nodes,
        edges,
        onBlockExecute,
        onBlockComplete,
        onFlowComplete,
        onError,
        stepDelay = 1000,
    } = options;

    // Estado interno
    const steps = ref<ActivityStep[]>([]);
    const currentStepIndex = ref(-1);
    const state = ref<SimulatorState>('idle');
    let executionTimer: ReturnType<typeof setTimeout> | null = null;

    // Helpers
    const generateId = () => `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const findNodeById = (id: string): Node<CustomNodeData> | undefined => {
        return nodes.value.find(n => n.id === id);
    };

    const findStartNode = (): Node<CustomNodeData> | undefined => {
        return nodes.value.find(n => n.data.type === 'start');
    };

    const findNextBlockId = (fromBlockId: string, handleId?: string): string | null => {
        const edge = edges.value.find(e => {
            if (handleId) {
                return e.source === fromBlockId && e.sourceHandle === handleId;
            }
            return e.source === fromBlockId;
        });
        return edge?.target || null;
    };

    // Gera preview de ação baseado no tipo de bloco
    const generatePreview = (node: Node<CustomNodeData>): ActionPreview => {
        const data = node.data;
        const preview: ActionPreview = {};

        switch (data.type) {
            case 'email':
                preview.email = {
                    to: data.email_to || '{{contato.email}}',
                    subject: data.email_subject || 'Sem assunto',
                    body: data.content || 'Conteúdo do e-mail...',
                };
                break;
            case 'call':
                preview.call = {
                    phone: data.call_phone || '{{contato.telefone}}',
                    script: data.content || 'Script da ligação...',
                };
                break;
            case 'task':
                preview.task = {
                    title: data.task_title || data.title || 'Nova Tarefa',
                    assignee: data.task_assignee || '{{usuario.nome}}',
                    dueDate: data.task_due_date,
                };
                break;
            case 'chat_flow':
                preview.chatFlow = {
                    flowName: data.flow_name || 'Fluxo de Atendimento',
                    flowId: data.flow_id || '',
                };
                break;
            case 'wait':
                const duration = data.waitDuration || 60000;
                const unit = duration >= 86400000 ? 'days' : duration >= 3600000 ? 'hours' : 'minutes';
                const value = unit === 'days' ? duration / 86400000 : unit === 'hours' ? duration / 3600000 : duration / 60000;
                preview.wait = {
                    duration: value,
                    unit,
                    until: new Date(Date.now() + duration),
                };
                break;
        }

        return preview;
    };

    // Constrói a lista de steps a partir do fluxo
    const buildSteps = (): ActivityStep[] => {
        const result: ActivityStep[] = [];
        const startNode = findStartNode();

        if (!startNode) return result;

        let currentId: string | null = startNode.id;
        const visited = new Set<string>();

        while (currentId && !visited.has(currentId)) {
            visited.add(currentId);
            const node = findNodeById(currentId);

            if (!node) break;

            // Adiciona step (exceto para blocos especiais que não geram ação)
            const step: ActivityStep = {
                id: generateId(),
                blockId: node.id,
                type: node.data.type as BlockType,
                title: node.data.title || node.data.type,
                description: node.data.content || '',
                status: 'pending',
                preview: generatePreview(node),
            };

            result.push(step);

            // Se for fim, para
            if (node.data.type === 'end') break;

            // Encontra próximo bloco
            currentId = findNextBlockId(node.id);
        }

        return result;
    };

    // Executa o step atual
    const executeCurrentStep = async (): Promise<void> => {
        if (currentStepIndex.value < 0 || currentStepIndex.value >= steps.value.length) return;

        const step = steps.value[currentStepIndex.value];
        step.status = 'running';
        step.scheduledAt = new Date();

        onBlockExecute?.(step.blockId);

        // Simula tempo de execução
        await new Promise(resolve => setTimeout(resolve, stepDelay));

        step.status = 'completed';
        step.completedAt = new Date();

        onBlockComplete?.(step.blockId);
    };

    // Loop de execução automática
    const runExecutionLoop = async () => {
        if (state.value !== 'running') return;

        while (currentStepIndex.value < steps.value.length - 1 && state.value === 'running') {
            currentStepIndex.value++;
            await executeCurrentStep();

            const currentStep = steps.value[currentStepIndex.value];

            // Se for bloco de espera, pausa automaticamente
            if (currentStep.type === 'wait' && state.value === 'running') {
                state.value = 'paused';
                return;
            }

            // Se for fim, completa
            if (currentStep.type === 'end') {
                state.value = 'completed';
                onFlowComplete?.();
                return;
            }
        }

        // Se chegou ao final
        if (currentStepIndex.value >= steps.value.length - 1) {
            state.value = 'completed';
            onFlowComplete?.();
        }
    };

    // API Pública

    const start = () => {
        if (state.value === 'running') return;

        // Rebuild steps if needed
        if (steps.value.length === 0 || state.value === 'completed') {
            steps.value = buildSteps();
            currentStepIndex.value = -1;
        }

        state.value = 'running';
        runExecutionLoop();
    };

    const pause = () => {
        if (state.value === 'running') {
            state.value = 'paused';
            if (executionTimer) {
                clearTimeout(executionTimer);
                executionTimer = null;
            }
        }
    };

    const resume = () => {
        if (state.value === 'paused') {
            state.value = 'running';
            runExecutionLoop();
        }
    };

    const nextStep = async () => {
        if (currentStepIndex.value >= steps.value.length - 1) return;

        currentStepIndex.value++;
        await executeCurrentStep();

        const current = steps.value[currentStepIndex.value];
        if (current.type === 'end') {
            state.value = 'completed';
            onFlowComplete?.();
        }
    };

    const previousStep = () => {
        if (currentStepIndex.value <= 0) return;

        // Mark current as pending again
        if (currentStepIndex.value >= 0 && currentStepIndex.value < steps.value.length) {
            steps.value[currentStepIndex.value].status = 'pending';
            steps.value[currentStepIndex.value].completedAt = undefined;
        }

        currentStepIndex.value--;
    };

    const reset = () => {
        state.value = 'idle';
        currentStepIndex.value = -1;
        steps.value = buildSteps();

        if (executionTimer) {
            clearTimeout(executionTimer);
            executionTimer = null;
        }
    };

    const skipWait = () => {
        const current = steps.value[currentStepIndex.value];
        if (current?.type === 'wait') {
            current.status = 'skipped';
            current.completedAt = new Date();

            if (state.value === 'paused') {
                state.value = 'running';
                runExecutionLoop();
            }
        }
    };

    const goToStep = (index: number) => {
        if (index < 0 || index >= steps.value.length) return;

        // Reset all steps after the target
        for (let i = index + 1; i < steps.value.length; i++) {
            steps.value[i].status = 'pending';
            steps.value[i].completedAt = undefined;
        }

        currentStepIndex.value = index;
        state.value = 'paused';
    };

    // Computed
    const currentStep = computed(() => {
        if (currentStepIndex.value < 0 || currentStepIndex.value >= steps.value.length) {
            return null;
        }
        return steps.value[currentStepIndex.value];
    });

    const isCompleted = computed(() => state.value === 'completed');
    const isRunning = computed(() => state.value === 'running');
    const isPaused = computed(() => state.value === 'paused');

    const canGoNext = computed(() => {
        return currentStepIndex.value < steps.value.length - 1;
    });

    const canGoPrevious = computed(() => {
        return currentStepIndex.value > 0;
    });

    const executionPath = computed(() => {
        return steps.value
            .filter(s => s.status === 'completed' || s.status === 'skipped')
            .map(s => s.blockId);
    });

    const progress = computed(() => {
        if (steps.value.length === 0) return 0;
        const completed = steps.value.filter(s => s.status === 'completed' || s.status === 'skipped').length;
        return Math.round((completed / steps.value.length) * 100);
    });

    return {
        steps,
        currentStepIndex,
        state,

        start,
        pause,
        resume,
        nextStep,
        previousStep,
        reset,
        skipWait,
        goToStep,

        currentStep,
        isCompleted,
        isRunning,
        isPaused,
        canGoNext,
        canGoPrevious,
        executionPath,
        progress,
    };
}
