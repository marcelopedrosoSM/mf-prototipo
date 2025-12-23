import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { FlowExecution, ExecutionStatus } from '@/types/execution';

export const useExecutionsStore = defineStore(
    'executions',
    () => {
        // State
        const executions = ref<FlowExecution[]>([]);
        const selectedExecutionId = ref<string | null>(null);
        const isInitialized = ref(false);

        // Getters
        const selectedExecution = computed(() =>
            executions.value.find(e => e.id === selectedExecutionId.value) || null
        );

        const executionsByFlowId = (flowId: string) =>
            executions.value.filter(e => e.flowId === flowId);

        const runningExecutions = computed(() =>
            executions.value.filter(e => e.status === 'running')
        );

        const completedExecutions = computed(() =>
            executions.value.filter(e => e.status === 'completed')
        );

        const errorExecutions = computed(() =>
            executions.value.filter(e => e.status === 'error')
        );

        // Group executions by status for a specific flow
        const getGroupedExecutions = (flowId: string) => {
            const flowExecutions = executionsByFlowId(flowId);

            const groups: { status: ExecutionStatus; label: string; executions: FlowExecution[] }[] = [];

            const running = flowExecutions.filter(e => e.status === 'running');
            if (running.length > 0) {
                groups.push({ status: 'running', label: `Em Andamento (${running.length})`, executions: running });
            }

            const paused = flowExecutions.filter(e => e.status === 'paused');
            if (paused.length > 0) {
                groups.push({ status: 'paused', label: `Pausadas (${paused.length})`, executions: paused });
            }

            const completed = flowExecutions.filter(e => e.status === 'completed');
            if (completed.length > 0) {
                groups.push({ status: 'completed', label: `Concluídas (${completed.length})`, executions: completed });
            }

            const error = flowExecutions.filter(e => e.status === 'error');
            if (error.length > 0) {
                groups.push({ status: 'error', label: `Com Erro (${error.length})`, executions: error });
            }

            return groups;
        };

        // Actions
        const selectExecution = (id: string | null) => {
            selectedExecutionId.value = id;
        };

        const addExecution = (execution: FlowExecution) => {
            executions.value.push(execution);
        };

        const updateExecution = (id: string, updates: Partial<FlowExecution>) => {
            const index = executions.value.findIndex(e => e.id === id);
            if (index !== -1) {
                executions.value[index] = { ...executions.value[index], ...updates };
            }
        };

        // Initialize with seed data (force = true will reload even if already initialized)
        const initializeWithSeedData = (seedExecutions: FlowExecution[], force = false) => {
            if (force || executions.value.length === 0) {
                executions.value = seedExecutions;
                isInitialized.value = true;
            }
        };

        const clearExecutions = () => {
            executions.value = [];
            selectedExecutionId.value = null;
        };

        return {
            // State
            executions,
            selectedExecutionId,
            isInitialized,
            // Getters
            selectedExecution,
            executionsByFlowId,
            runningExecutions,
            completedExecutions,
            errorExecutions,
            getGroupedExecutions,
            // Actions
            selectExecution,
            addExecution,
            updateExecution,
            initializeWithSeedData,
            clearExecutions,
        };
    }
    // NOTA: Removida persistência para que os mocks resetem ao atualizar a página
);
