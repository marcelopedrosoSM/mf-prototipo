/**
 * Mock data for conversations
 */

export interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  inboxName: string;
  inboxId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'open' | 'waiting' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    contactName: 'João Silva',
    contactPhone: '+5511999999999',
    inboxName: 'WhatsApp Oficial - Vendas',
    inboxId: '1',
    lastMessage: 'Olá, gostaria de saber mais sobre o produto',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    unreadCount: 2,
    status: 'waiting',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    contactName: 'Maria Santos',
    contactPhone: '+5511888888888',
    inboxName: 'WhatsApp Oficial - Suporte',
    inboxId: '2',
    lastMessage: 'Obrigada pela ajuda!',
    lastMessageTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    unreadCount: 0,
    status: 'open',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    contactName: 'Pedro Oliveira',
    contactPhone: '+5511777777777',
    inboxName: 'WhatsApp Oficial - Vendas',
    inboxId: '1',
    lastMessage: 'Qual o prazo de entrega?',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    unreadCount: 1,
    status: 'waiting',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    contactName: 'Ana Costa',
    contactPhone: '+5511666666666',
    inboxName: 'WhatsApp Oficial - Suporte',
    inboxId: '2',
    lastMessage: 'Preciso de ajuda com minha conta',
    lastMessageTime: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    unreadCount: 3,
    status: 'waiting',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    contactName: 'Carlos Mendes',
    contactPhone: '+5511555555555',
    inboxName: 'WhatsApp Oficial - Vendas',
    inboxId: '1',
    lastMessage: 'Vou pensar e te aviso',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    status: 'open',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    contactName: 'Juliana Ferreira',
    contactPhone: '+5511444444444',
    inboxName: 'WhatsApp Oficial - Suporte',
    inboxId: '2',
    lastMessage: 'Problema resolvido, obrigada!',
    lastMessageTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    unreadCount: 0,
    status: 'open',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
];

export function getOpenConversations(): Conversation[] {
  return MOCK_CONVERSATIONS.filter(
    (c) => c.status === 'open' || c.status === 'waiting'
  );
}

export function getConversationsToday(): Conversation[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return MOCK_CONVERSATIONS.filter((c) => {
    const conversationDate = new Date(c.createdAt);
    conversationDate.setHours(0, 0, 0, 0);
    return conversationDate.getTime() === today.getTime();
  });
}

export function getTotalMessagesToday(): number {
  // Mock: retorna um número baseado nas conversas de hoje
  const conversationsToday = getConversationsToday();
  // Simula ~10 mensagens por conversa
  return conversationsToday.length * 10 + 15; // 15 mensagens extras
}

