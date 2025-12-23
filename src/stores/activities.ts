import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Activity, ActivityStatus, ActivityType } from '@/types/activity';
import type { Node } from '@vue-flow/core';
import type { CustomNodeData, BlockType } from '@/types/flow-builder';

// Map flow block types to activity types
const BLOCK_TO_ACTIVITY_TYPE: Partial<Record<BlockType, ActivityType>> = {
    email: 'email',
    call: 'call',
    task: 'task',
    message: 'message',
    chat_flow: 'chat_flow',
};

// Block types that generate activities
const ACTIVITY_BLOCK_TYPES: BlockType[] = ['email', 'call', 'task', 'message', 'chat_flow'];

export const useActivityStore = defineStore(
    'activities',
    () => {
        // State
        const activities = ref<Activity[]>([]);
        const isInitialized = ref(false);

        // Getters
        const pendingActivities = computed(() =>
            activities.value.filter(a => a.status === 'pending')
        );

        const inProgressActivities = computed(() =>
            activities.value.filter(a => a.status === 'in_progress')
        );

        const completedActivities = computed(() =>
            activities.value.filter(a => a.status === 'completed' || a.status === 'skipped')
        );

        const activitiesByFlow = computed(() => {
            const grouped: Record<string, Activity[]> = {};
            activities.value.forEach(a => {
                if (!grouped[a.flowId]) grouped[a.flowId] = [];
                grouped[a.flowId].push(a);
            });
            return grouped;
        });

        const activitiesByContact = computed(() => {
            const grouped: Record<string, Activity[]> = {};
            activities.value.forEach(a => {
                if (!grouped[a.contactId]) grouped[a.contactId] = [];
                grouped[a.contactId].push(a);
            });
            return grouped;
        });

        const pendingCount = computed(() => pendingActivities.value.length);
        const totalCount = computed(() => activities.value.length);

        // Actions
        function generateActivitiesFromFlow(
            flowId: string,
            flowName: string,
            nodes: Node<CustomNodeData>[],
            contactId: string,
            contactData: { name: string; email?: string; phone?: string }
        ): Activity[] {
            // Filter nodes that are activity blocks
            const activityNodes = nodes.filter(
                node => ACTIVITY_BLOCK_TYPES.includes(node.data?.type)
            );

            // Create activities from nodes
            const newActivities: Activity[] = [];

            activityNodes.forEach((node, index) => {
                const activity = createActivityFromNode(
                    flowId,
                    flowName,
                    node,
                    contactId,
                    contactData,
                    index,
                    activityNodes.length
                );
                if (activity) {
                    // createActivityFromNode already adds to store, just collecting here for return
                    newActivities.push(activity);
                }
            });

            // Note: createActivityFromNode already pushed to state
            return newActivities;
        }

        function buildActivityData(
            type: ActivityType,
            nodeData: CustomNodeData,
            contactData: { name: string; email?: string; phone?: string }
        ) {
            switch (type) {
                case 'email':
                    return {
                        type: 'email' as const,
                        to: contactData.email || '',
                        subject: String(nodeData.subject || ''),
                        body: String(nodeData.content || ''),
                    };
                case 'call':
                    return {
                        type: 'call' as const,
                        phone: contactData.phone || '',
                        script: String(nodeData.content || ''),
                    };
                case 'message':
                    return {
                        type: 'message' as const,
                        channel: 'whatsapp' as const,
                        phone: contactData.phone || '',
                        message: String(nodeData.content || ''),
                    };
                case 'task':
                    return {
                        type: 'task' as const,
                        taskTitle: String(nodeData.title || ''),
                        priority: 'medium' as const,
                    };
                case 'chat_flow':
                    return {
                        type: 'chat_flow' as const,
                        targetFlowId: String(nodeData.targetFlowId || ''),
                        targetFlowName: String(nodeData.targetFlowName || ''),
                    };
                default:
                    return { type: 'task' as const, taskTitle: '' };
            }
        }

        function createActivityFromNode(
            flowId: string,
            flowName: string,
            node: Node<CustomNodeData>,
            contactId: string,
            contactData: { name: string; email?: string; phone?: string },
            stepIndex: number = 0,
            totalSteps: number = 1
        ): Activity | null {
            if (!ACTIVITY_BLOCK_TYPES.includes(node.data?.type)) {
                return null;
            }

            const activityType = BLOCK_TO_ACTIVITY_TYPE[node.data.type] || 'task';
            const now = new Date().toISOString();

            const activity: Activity = {
                id: `act-${flowId}-${contactId}-${node.id}-${Date.now()}`,
                type: activityType,
                status: 'pending' as ActivityStatus,
                title: node.data.title || `Atividade ${stepIndex + 1}`,
                description: node.data.content,
                stepNumber: stepIndex + 1,
                totalSteps: totalSteps,
                flowId,
                flowName,
                blockId: node.id,
                contactId,
                contactName: contactData.name,
                contactEmail: contactData.email,
                contactPhone: contactData.phone,
                data: buildActivityData(activityType, node.data, contactData),
                createdAt: now,
                updatedAt: now,
            };

            addActivity(activity);
            return activity;
        }

        function addActivity(activity: Activity) {
            activities.value.push(activity);
        }

        function updateActivity(id: string, updates: Partial<Activity>) {
            const index = activities.value.findIndex(a => a.id === id);
            if (index !== -1) {
                activities.value[index] = {
                    ...activities.value[index],
                    ...updates,
                    updatedAt: new Date().toISOString(),
                };
            }
        }

        function executeActivity(id: string) {
            updateActivity(id, {
                status: 'completed',
                completedAt: new Date().toISOString(),
            });
        }

        function skipActivity(id: string) {
            updateActivity(id, {
                status: 'skipped',
                completedAt: new Date().toISOString(),
            });
        }

        function bulkExecute(ids: string[]) {
            ids.forEach(id => executeActivity(id));
        }

        function bulkSkip(ids: string[]) {
            ids.forEach(id => skipActivity(id));
        }

        function deleteActivity(id: string) {
            activities.value = activities.value.filter(a => a.id !== id);
        }

        function clearAllActivities() {
            activities.value = [];
        }

        // Action to transfer activity to another agent
        function transferActivity(id: string, agentId: string, agentName: string) {
            const index = activities.value.findIndex(a => a.id === id);
            if (index !== -1) {
                const activity = activities.value[index];

                // Update assignment fields
                updateActivity(id, {
                    assignedAgentId: agentId,
                    assignedAgentName: agentName
                });

                // Also update data.assignee if it's a task, for consistency
                if (activity.type === 'task' && activity.data && (activity.data as any).type === 'task') {
                    // We cast to any or check type safely because TS inheritance can be tricky in partial updates
                    // But here we are just modifying the object in the array via updateActivity which merges.
                    // The simple updateActivity above is enough for the base fields.
                    // Optionally we update the nested 'assignee' for display purposes in task view.
                    const data = { ...activity.data, assignee: agentName };
                    updateActivity(id, { data: data as any });
                }
            }
        }

        // Action to transfer activity to another agent (manual or automated)
        function transferActivity(id: string, agentId: string, agentName: string) {
            updateActivity(id, {
                // In a real app we would have an 'assignedTo' field. 
                // For this prototype, we'll store it in metadata or add the field to the type if needed.
                // Checking Activity type definition might be needed, but for now safely defaulting to metadata logic or just logging it.
                // Wait, I should verify the Activity type. 
                // Let's assume we can add 'assignedAgentId' to the updates.
                // If the type doesn't support it, I might need to update the type or just use the description as a hack for prototype.
                // Giving the user "option to transfer" usually implies a UI action.
                // I will add a system-like update to the description to log the transfer for now if the type forbids it.
                // BETTER: Add `assignedTo` to type in next step if missing.
            });
            // Actually, let's verify type first. 
            // I'll add the function but comment on the type check.
        }

        function transferActivityToAgent(id: string, agentId: string) {
            const index = activities.value.findIndex(a => a.id === id);
            if (index !== -1) {
                // For prototype, we'll assume the activity can hold assignment info 
                // We will update the activity with a new property even if strict TS complains, or cast it.
                // But better to be safe.
                // Let's check Activity type in a sec.
                // For now, I will just log it in history/description
                const activity = activities.value[index];
                const newHistory = `Transferido para agente ${agentId}`;
                // ...
            }
        }

        // RE-WRITING STRATEGY: 
        // I will add the method simply updating a hypothetical 'assignedTo' and see if it compiles later? 
        // No, I want to be precise.
        // I will check the type file first.

        // Aborting this specific tool call to check type file first.


        function getActivityById(id: string): Activity | undefined {
            return activities.value.find(a => a.id === id);
        }

        // Initialize with seed data if empty
        function initializeWithSeedData(seedActivities: Activity[]) {
            if (!isInitialized.value && activities.value.length === 0) {
                activities.value = seedActivities;
                isInitialized.value = true;
            }
        }

        return {
            // State
            activities,
            isInitialized,
            // Getters
            pendingActivities,
            inProgressActivities,
            completedActivities,
            activitiesByFlow,
            activitiesByContact,
            pendingCount,
            totalCount,
            // Actions
            generateActivitiesFromFlow,
            addActivity,
            updateActivity,
            executeActivity,
            skipActivity,
            bulkExecute,
            bulkSkip,
            deleteActivity,
            clearAllActivities,
            getActivityById,
            initializeWithSeedData,
            createActivityFromNode,
        };
    }
    // NOTA: Removida persistência para que os mocks resetem ao atualizar a página
);
