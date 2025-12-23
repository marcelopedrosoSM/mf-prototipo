/**
 * Types for Flow Execution tracking
 */

export type ExecutionStatus = 'running' | 'completed' | 'error' | 'paused';

export interface FlowExecution {
    id: string;
    executionNumber: number; // e.g., #589
    flowId: string;
    flowName: string; // Added to match store usage
    contactId: string;
    contactName: string;
    startedAt: string;
    completedAt?: string;
    status: ExecutionStatus;
    currentBlockId?: string;
    currentBlockTitle?: string;
    executionPath: string[]; // Block IDs that were executed
    variables?: Record<string, unknown>;
    error?: string;
}

export interface ExecutionGroup {
    status: ExecutionStatus;
    label: string;
    executions: FlowExecution[];
}
