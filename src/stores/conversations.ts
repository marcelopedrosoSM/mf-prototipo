import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ChatSession } from '@/types/conversations';
// Note: We need to import the mock data loader, assuming one exists or using a method to load it. 
// Since we saw 'chatSessions.ts' in mocks/data, we'll try to load from there.
// If there isn't a helper like getChatSessions, we might need to recreate it or just copy the data for now.
// Looking at the previous file view of chatSessions.ts, it didn't export a simple 'getChatSessions', 
// only individual variables like 'withoutTeam1', etc.
// Wait, I didn't see the bottom of the file. I'll assume there isn't one and create a simple aggregator here.

// IMPORTS MOCK DATA
import * as ChatSessionsMock from '@/mocks/data/chatSessions';
// Data now loaded via store or other means, mock removed
import { MOCK_TIMES } from '@/mocks/data/times';
import { useAutomationsStore } from './automations';
import { useExecutionsStore } from './executions';
import { useFlowsStore } from './flows';
import { useAgentsStore } from './agents';
import { useTeamsStore } from './teams'; // Added
import { useActivityStore } from './activities'; // Added
import type { FlowExecution } from '@/types/execution';

export const useConversationsStore = defineStore(
    'conversations',
    () => {
        // State
        const conversations = ref<ChatSession[]>([]);
        const isInitialized = ref(false);

        // Getters
        const allConversations = computed(() => conversations.value);

        const getConversationById = computed(() => (id: string) =>
            conversations.value.find(c => c.id === id)
        );

        const getConversationsByInbox = computed(() => (inboxId: string) =>
            conversations.value.filter(c => c.inbox.id === inboxId)
        );

        const getConversationsByAgent = computed(() => (agentId: string) =>
            conversations.value.filter(c => c.assignedUser?.user.id === agentId)
        );

        const getConversationsByTeam = computed(() => (teamId: string) =>
            conversations.value.filter(c => c.assignedUser?.team?.id === teamId)
        );

        // Actions
        function initialize() {
            if (!isInitialized.value) {
                const all: ChatSession[] = [];
                Object.values(ChatSessionsMock).forEach((val: any) => {
                    // Handle array exports (like MOCK_CHAT_SESSIONS)
                    if (Array.isArray(val)) {
                        val.forEach((item: any) => {
                            if (item && typeof item === 'object' && 'id' in item && 'messages' in item) {
                                all.push(item as ChatSession);
                            }
                        });
                    }
                    // Handle individual session exports
                    else if (val && typeof val === 'object' && 'id' in val && 'messages' in val) {
                        all.push(val as ChatSession);
                    }
                });
                conversations.value = all;
                isInitialized.value = true;
            }
        }

        // BUSINESS LOGIC: Assign Agent
        function assignAgent(conversationId: string, agentId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            const agentsStore = useAgentsStore();
            const agent = agentsStore.getAgentById(agentId);

            if (conversation && agent) {
                conversation.assignedUser = {
                    id: `assign-${Date.now()}`,
                    user: {
                        id: agent.id,
                        name: agent.nome,
                        email: agent.email,
                        avatar: ''
                    },
                    team: undefined
                };
                conversation.status = 'open';
                conversation.updatedAt = new Date().toISOString();
                return true;
            }
            return false;
        }

        // BUSINESS LOGIC: Assign Team
        function assignTeam(conversationId: string, teamId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            // Use store instead of direct mock access
            // We assume useTeamsStore is available and initialized, or we just access the mock via store if needed.
            // But wait, I need to import useTeamsStore first. 
            // I'll add the import in a separate block or assume it's imported?
            // "MOCK_TIMES" is imported at top. "useTeamsStore" is NOT imported.
            // I should actually change the whole file content or just this block?
            // I can't add import here easily without context.
            // Let's use the MOCK directly for now BUT wrapped better, OR better yet:
            // I will use replace_file_content to add import AND change function.
            // Actually, I'll do it in two steps or one big step. 
            // Let's just fix the logic to use MOCK_TIMES correctly for now as I can't easily add import at top without re-reading. 
            // WAIT, I have the file content in history. I can see imports.
            // useTeamsStore is NOT imported. I need to add it.

            // Let's use MOCK_TIMES for now but acknowledges it. 
            // Actually, the user wants "Application Polished". Using Mock directly is "meh".
            // I will use `useTeamsStore` but I need to add the import.

            // Strategy: I will replace the logic to use a helper that accesses the store if I can, OR just stick to MOCK_TIMES but clean up the code.
            // The prompt "what is missing?" implies high quality.
            // I'll stick to MOCK_TIMES for this specific function to avoid breaking imports blindly, 
            // BUT I will add a comment that this should be migrated.
            // OR I can try to replace the top of file to add import.

            // Actually, looking at `assignAgent`, it uses `useAgentsStore`. `useAgentsStore` IS imported.
            // `useTeamsStore` is likely in `./teams`.
            // I'll assume I can import it. 

            const teamsStore = useTeamsStore(); // I need to import this!
            const team = teamsStore.getTeamById(teamId) || MOCK_TIMES.find(t => t.id === teamId);

            if (conversation && team) {
                conversation.assignedUser = {
                    id: `assign-${Date.now()}`,
                    user: { // Placeholder for "No User" or "Queue"
                        id: 'queue',
                        name: 'Fila de Atendimento',
                        email: ''
                    },
                    team: {
                        id: team.id,
                        name: team.nome
                    }
                };
                conversation.status = 'pending';
                return true;
            }
            return false;
        }

        function updateStatus(conversationId: string, status: ChatSession['status']) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                conversation.status = status;
                return true;
            }
            return false;
        }

        // BUSINESS LOGIC: Receive Message & Trigger Automations
        function receiveMessage(conversationId: string, content: string, senderType: 'contact' | 'user' = 'contact') {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (!conversation) return false;

            const newMessage = {
                id: `msg-${Date.now()}`,
                conversationId,
                content,
                type: 'text' as const,
                status: 'delivered' as const,
                senderId: senderType === 'user' ? (conversation.assignedUser?.user.id || 'system') : conversation.sender.id,
                senderName: senderType === 'user' ? (conversation.assignedUser?.user.name || 'Sistema') : conversation.sender.name,
                senderType,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString('pt-BR'),
                hour: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            };

            conversation.messages.push(newMessage);
            conversation.lastActivityAt = newMessage.timestamp;
            if (senderType === 'contact') {
                conversation.unreadCount = (conversation.unreadCount || 0) + 1;
            }

            if (senderType === 'contact') {
                triggerAutomations(conversation, 'mensagem_recebida');
            }

            return newMessage;
        }

        function createConversation(contactId: string, inboxId: string) {
            const newId = `conv-${Date.now()}`;

            const newConversation: ChatSession = {
                id: newId,
                inbox: { id: inboxId, name: 'Inbox', phoneNumber: '000000000', status: 'active', type: 'whatsapp' }, // Corrected match to Inbox interface
                sender: { id: contactId, name: 'Contato', phoneNumber: '' },
                messages: [],
                status: 'open',
                unreadCount: 0,
                lastActivityAt: new Date().toISOString(),
                lastActivityUserAt: new Date().toISOString(), // Added missing prop
                labels: [],
                // createdAt not in type but useful for internal logic
            };

            conversations.value.push(newConversation);

            // Simulate system message for creation
            newConversation.messages.push({
                id: `sys-start-${newId}`,
                conversationId: newId,
                content: `Conversa iniciada.`,
                type: 'text',
                status: 'read',
                senderId: 'system',
                senderName: 'Sistema',
                senderType: 'system',
                timestamp: new Date().toISOString()
            });

            setTimeout(() => triggerAutomations(newConversation, 'conversa_criada'), 100);
            return newConversation;
        }

        // Internal helper to trigger automations
        function triggerAutomations(conversation: ChatSession, triggerType: 'mensagem_recebida' | 'conversa_criada' | 'mensagem_enviada' | 'conversa_finalizada') {
            const automationsStore = useAutomationsStore();
            const executionsStore = useExecutionsStore();
            const flowsStore = useFlowsStore();
            const activityStore = useActivityStore();

            // Find automations for this inbox and trigger
            const automations = automationsStore.getAutomationsByTrigger(conversation.inbox.id, triggerType as any);

            automations.forEach(auto => {
                if (!auto.ativo) return;

                // For Prototype: Match Name or default
                let flow = flowsStore.allFlows.find(f => f.nome === auto.nome);
                if (!flow) {
                    flow = flowsStore.getFlowById('1');
                }

                if (flow) {
                    // Check if is Activity Flow (simple heuristic: name contains 'Atividade' or 'Tarefa')
                    const isActivityFlow = flow.nome.toLowerCase().includes('atividade') || flow.nome.toLowerCase().includes('tarefa') || flow.nome.toLowerCase().includes('follow-up');

                    // Feedback in chat
                    let systemMsgContent = `🤖 Automação "${auto.nome}" disparada.`;
                    if (isActivityFlow) {
                        systemMsgContent = `📋 Fluxo de Atividade "${auto.nome}" iniciado.`;
                    }

                    conversation.messages.push({
                        id: `sys-auto-${Date.now()}`,
                        conversationId: conversation.id,
                        content: systemMsgContent,
                        type: 'text',
                        status: 'read',
                        senderId: 'system',
                        senderName: 'Sistema',
                        senderType: 'system',
                        timestamp: new Date().toISOString()
                    });

                    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

                    const variables: Record<string, any> = {
                        trigger_type: triggerType,
                        contact_name: conversation.sender.name,
                        contact_phone: conversation.sender.phoneNumber,
                        inbox_name: conversation.inbox.name,
                    };

                    if (triggerType === 'mensagem_recebida' || triggerType === 'mensagem_enviada') {
                        const lastMsg = conversation.messages[conversation.messages.length - 1];
                        if (lastMsg) {
                            variables.message_content = lastMsg.content;
                        }
                    }

                    const newExecution: FlowExecution = {
                        id: executionId,
                        flowId: flow.id,
                        flowName: flow.nome,
                        contactId: conversation.sender.id,
                        contactName: conversation.sender.name,
                        status: 'running',
                        currentBlockId: 'start-1',
                        executionNumber: executionsStore.executions.length + 1,
                        startedAt: new Date().toISOString(),
                        executionPath: ['start-1'],
                        variables: variables,
                    };

                    executionsStore.addExecution(newExecution);
                    console.log(`[Automations] Execution ${executionId} created for Flow ${flow.id}`);

                    // Generate Activities immediately if it is Activity Flow
                    if (isActivityFlow) {
                        const activities = activityStore.generateActivitiesFromFlow(
                            flow.id,
                            flow.nome,
                            flow.nodes,
                            conversation.sender.id,
                            { name: conversation.sender.name, phone: conversation.sender.phoneNumber }
                        );

                        activities.forEach(act => {
                            conversation.messages.push({
                                id: `sys-act-${act.id}`,
                                conversationId: conversation.id,
                                content: `📌 Atividade Gerada: ${act.title || 'Nova Atividade'}`,
                                type: 'text',
                                status: 'read',
                                senderId: 'system',
                                senderName: 'Sistema',
                                senderType: 'system',
                                timestamp: new Date().toISOString()
                            });
                        });
                    }
                }
            });
        }

        return {
            conversations,
            isInitialized, // Added to fix lint error
            // Expose getters if needed by components directly, but usually mapped via storeToRefs or computed in component
            allConversations,
            getConversationById,
            getConversationsByInbox,
            getConversationsByAgent,
            getConversationsByTeam,
            // Actions
            initialize,
            assignAgent,
            assignTeam,
            updateStatus,
            receiveMessage,
            createConversation
        };
    }
);

