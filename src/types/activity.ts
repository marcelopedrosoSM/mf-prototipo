/**
 * Types for Activity Execution Mode
 * Activities are generated from workflow flows and queued for execution
 */

// Activity types matching flow block types
export type ActivityType = 'email' | 'call' | 'task' | 'chat_flow' | 'message' | 'action' | 'wait' | 'registry';

// Activity execution status
export type ActivityStatus = 'pending' | 'in_progress' | 'completed' | 'skipped' | 'failed';

// Base activity interface
export interface Activity {
    id: string;
    type: ActivityType;
    status: ActivityStatus;
    title: string;
    description?: string;

    // Sequential flow position
    stepNumber: number;      // Current step (1, 2, 3...)
    totalSteps: number;      // Total steps in flow for this contact
    lastExecutedAt?: string; // When previous step was executed (ISO date)
    dueDate?: string;        // Optional deadline/SLA (ISO date)
    completedAt?: string;

    // Origin flow
    flowId: string;
    flowName: string;
    blockId: string;

    // Contact context
    contactId: string;
    contactName: string;
    contactEmail?: string;
    contactPhone?: string;

    // Type-specific data
    data: ActivityData;

    // Metadata
    createdAt: string;
    updatedAt: string;

    // Assignment
    assignedAgentId?: string; // Added for transfer functionality
    assignedAgentName?: string;
}

// Type-specific activity data
export type ActivityData =
    | EmailActivityData
    | CallActivityData
    | TaskActivityData
    | ChatFlowActivityData
    | MessageActivityData
    | ActionActivityData
    | WaitActivityData;

export interface EmailActivityData {
    type: 'email';
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
}

export interface CallActivityData {
    type: 'call';
    phone: string;
    script?: string;
    duration?: number; // in seconds
    notes?: string;
    hasDecision?: boolean;
    conditions?: { label: string; value: string }[];
}

export interface TaskActivityData {
    type: 'task';
    taskTitle: string;
    assignee?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
}

export interface ChatFlowActivityData {
    type: 'chat_flow';
    targetFlowId?: string;
    targetFlowName?: string;
    flowId?: string;
    flowName?: string;
    hasDecision?: boolean;
    conditions?: { label: string; value: string }[];
}

export interface MessageActivityData {
    type: 'message';
    channel: 'whatsapp' | 'sms' | 'telegram';
    phone: string;
    message: string;
    hasDecision?: boolean;
    conditions?: { label: string; value: string }[];
}

export interface ActionActivityData {
    type: 'action';
    actionType?: string;
    actionName?: string;
    parameters?: Record<string, unknown>;
    hasDecision?: boolean;
    conditions?: { label: string; value: string }[];
}

export interface WaitActivityData {
    type: 'wait';
    duration: number;
    unit: 'minutes' | 'hours' | 'days';
    hasDecision?: boolean;
    conditions?: { label: string; value: string }[];
}

export interface EmailActivityData {
    type: 'email';
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
    hasDecision?: boolean;
    conditions?: { label: string; value: string }[];
}

export interface TaskActivityData {
    type: 'task';
    taskTitle: string;
    assignee?: string;
    dueDate?: string;
    priority?: 'low' | 'medium' | 'high';
    notes?: string;
    hasDecision?: boolean;
    conditions?: { label: string; value: string }[];
}

// Filter options for activity list
export interface ActivityFilters {
    status?: ActivityStatus[];
    type?: ActivityType[];
    flowId?: string;
    contactId?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}

// Grouped activities by status
export interface ActivityGroup {
    status: ActivityStatus | 'overdue';
    label: string; // "Pendentes", "Em Andamento", "Concluídas", "Puladas", "Atrasadas"
    activities: Activity[];
}
