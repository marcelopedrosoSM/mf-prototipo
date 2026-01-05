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

            // Notify user
            const activity = getActivityById(id);
            if (activity) {
                // We need to access the store instance inside the action to avoid circular dependency issues during setup if possible, 
                // but usually inside action is fine. However, pinning reference outside might be safer or just use imported store definition.
                // Let's assume standard Pinia usage.
                try {
                    // Dynamic import to avoid potential circular dependency if notifications store imports activities store (unlikely but safe)
                    // Actually, simpler: define store variable inside the store setup if we imported the definition.
                    // But since we are inside `defineStore` setup function, we can just use `useNotificationsStore()` if we imported it.
                    // Let's add the import at top of file first.
                    // Wait, I can't add import with this tool usage if I am targeting bottom.
                    // I will assume I need to do 2 edits.
                    // This edit will focus on the logic, I will add import in next step or use `import('@/stores/notifications').then...` which is messy.
                    // Better: I will use a separate tool call to add the import first.
                } catch (e) { }
            }
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
                if (activity.type === 'task' && activity.data && 'type' in activity.data && activity.data.type === 'task') {
                    const data = { ...activity.data, assignee: agentName };
                    updateActivity(id, { data: data as any });
                }
            }
        }


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
            transferActivity,
        };
    },
    {
        persist: true,
    }
);
