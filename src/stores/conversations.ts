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

        // Contador de conversas ativas por agente
        const getActiveConversationsByAgent = computed(() => (agentId: string) => {
            return conversations.value.filter(
                c => c.assignedUser?.user?.id === agentId && c.status !== 'closed'
            ).length;
        });

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
                if (!conversation.assignedUser) {
                    conversation.assignedUser = {
                        id: `assign-${Date.now()}`
                    };
                }

                conversation.assignedUser.user = {
                    id: agent.id,
                    name: agent.nome,
                    email: agent.email,
                    avatar: ''
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
            const teamsStore = useTeamsStore();
            const team = teamsStore.getTeamById(teamId);

            if (conversation && team) {
                if (!conversation.assignedUser) {
                    conversation.assignedUser = {
                        id: `assign-${Date.now()}`
                    };
                }

                conversation.assignedUser.team = {
                    id: team.id,
                    name: team.nome
                };

                // If there's no user, it might be pending queue, but if there's already a user, we keep it open
                if (!conversation.assignedUser.user) {
                    conversation.status = 'pending';
                }

                conversation.updatedAt = new Date().toISOString();
                return true;
            }
            return false;
        }

        function unassign(conversationId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                conversation.assignedUser = undefined;
                conversation.status = 'open';
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

        function addLabel(conversationId: string, label: any) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                // Check if label already exists
                if (!conversation.labels.some(l => l.id === label.id)) {
                    conversation.labels.push(label);
                    return true;
                }
            }
            return false;
        }

        function removeLabel(conversationId: string, labelId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                conversation.labels = conversation.labels.filter(l => l.id !== labelId);
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

        // REACTIONS
        function addReaction(conversationId: string, messageId: string, emoji: string, userId: string = 'current-user', userName: string = 'Você') {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                const message = conversation.messages.find(m => m.id === messageId);
                if (message) {
                    if (!message.reactions) message.reactions = [];

                    // Check if user already reacted with this emoji
                    const existing = message.reactions.find(r => r.userId === userId && r.emoji === emoji);
                    if (!existing) {
                        message.reactions.push({
                            emoji,
                            userId,
                            userName,
                            timestamp: new Date().toISOString()
                        });
                        return true;
                    }
                }
            }
            return false;
        }

        function removeReaction(conversationId: string, messageId: string, emoji: string, userId: string = 'current-user') {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                const message = conversation.messages.find(m => m.id === messageId);
                if (message && message.reactions) {
                    message.reactions = message.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
                    return true;
                }
            }
            return false;
        }

        // INTERNAL NOTES
        function addInternalNote(conversationId: string, content: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                const note: any = {
                    id: `note-${Date.now()}`,
                    conversationId,
                    content,
                    type: 'note',
                    status: 'read',
                    senderId: 'current-user',
                    senderName: 'Você',
                    senderType: 'user',
                    timestamp: new Date().toISOString()
                };
                conversation.messages.push(note);
                return true;
            }
            return false;
        }

        // EDIT INTERNAL NOTE
        function editNote(conversationId: string, noteId: string, content: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                const note = conversation.messages.find(m => m.id === noteId && m.type === 'note');
                if (note) {
                    note.content = content;
                    (note as any).editedAt = new Date().toISOString();
                    return true;
                }
            }
            return false;
        }

        // DELETE INTERNAL NOTE
        function deleteNote(conversationId: string, noteId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                const noteIndex = conversation.messages.findIndex(m => m.id === noteId && m.type === 'note');
                if (noteIndex !== -1) {
                    conversation.messages.splice(noteIndex, 1);
                    return true;
                }
            }
            return false;
        }

        // CLOSE CONVERSATION
        function closeConversation(conversationId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                conversation.status = 'closed';
                conversation.updatedAt = new Date().toISOString();

                // Add system message
                const systemMsg: any = {
                    id: `sys-close-${Date.now()}`,
                    conversationId,
                    content: 'Conversa finalizada',
                    type: 'text',
                    status: 'read',
                    senderId: 'system',
                    senderName: 'Sistema',
                    senderType: 'system',
                    timestamp: new Date().toISOString()
                };
                conversation.messages.push(systemMsg);
                return true;
            }
            return false;
        }

        // PIN/UNPIN MESSAGES
        function pinMessage(conversationId: string, messageId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                const message = conversation.messages.find(m => m.id === messageId);
                if (message) {
                    message.isPinned = true;
                    return true;
                }
            }
            return false;
        }

        function unpinMessage(conversationId: string, messageId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                const message = conversation.messages.find(m => m.id === messageId);
                if (message) {
                    message.isPinned = false;
                    return true;
                }
            }
            return false;
        }

        // REOPEN CONVERSATION
        function reopenConversation(conversationId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                conversation.status = 'open';
                conversation.updatedAt = new Date().toISOString();

                // Add system message
                const systemMsg: any = {
                    id: `sys-reopen-${Date.now()}`,
                    conversationId,
                    content: 'Conversa reaberta',
                    type: 'text',
                    status: 'read',
                    senderId: 'system',
                    senderName: 'Sistema',
                    senderType: 'system',
                    timestamp: new Date().toISOString()
                };
                conversation.messages.push(systemMsg);
                return true;
            }
            return false;
        }

        // AUTO-ASSIGN: Atribuir para mim
        function assignToMe(conversationId: string, currentUserId: string, currentUserName: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation) {
                conversation.assignedUser = {
                    id: `assign-${Date.now()}`,
                    user: {
                        id: currentUserId,
                        name: currentUserName,
                        email: 'user@myflows.com.br' // Email padrão para usuário atual
                    },
                    team: conversation.assignedUser?.team
                };
                conversation.updatedAt = new Date().toISOString();
                return true;
            }
            return false;
        }

        // PAUSE SERVICE FLOW: Transfer to human
        function pauseServiceFlow(conversationId: string) {
            const conversation = conversations.value.find(c => c.id === conversationId);
            if (conversation && conversation.linkedServiceFlow) {
                conversation.linkedServiceFlow.status = 'paused';
                conversation.updatedAt = new Date().toISOString();
                // Add system message
                const systemMsg = {
                    id: `msg-${Date.now()}`,
                    conversationId,
                    content: 'Fluxo de atendimento pausado. Conversa transferida para agente humano.',
                    type: 'system' as const,
                    status: 'sent' as const,
                    senderId: 'system',
                    senderName: 'Sistema',
                    senderType: 'system' as const,
                    timestamp: new Date().toISOString(),
                };
                conversation.messages.push(systemMsg);
                return true;
            }
            return false;
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
            getActiveConversationsByAgent,
            // Actions
            initialize,
            assignAgent,
            assignTeam,
            unassign,
            updateStatus,
            addLabel,
            removeLabel,
            receiveMessage,
            createConversation,
            addReaction,
            removeReaction,
            addInternalNote,
            editNote,
            deleteNote,
            closeConversation,
            reopenConversation,
            pinMessage,
            unpinMessage,
            assignToMe,
            pauseServiceFlow
        };
    }
);

