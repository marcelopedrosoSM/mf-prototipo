/**
 * Mock data for conversations
 */

export interface Conversation {
  id: string;
  contactName: string;
  contactPhone: string;
  lastMessage: string;
  lastMessageTime: string;
  status: 'open' | 'closed' | 'waiting';
  unreadCount: number;
  inboxName: string;
}

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    contactName: 'João Silva',
    contactPhone: '+55 11 98765-4321',
    lastMessage: 'Olá, preciso de ajuda com meu pedido',
    lastMessageTime: new Date().toISOString(),
    status: 'open',
    unreadCount: 2,
    inboxName: 'WhatsApp Oficial - Vendas',
  },
  {
    id: '2',
    contactName: 'Maria Santos',
    contactPhone: '+55 21 99876-5432',
    lastMessage: 'Obrigado pelo atendimento!',
    lastMessageTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    status: 'waiting',
    unreadCount: 0,
    inboxName: 'WhatsApp Oficial - Suporte',
  },
  {
    id: '3',
    contactName: 'Pedro Oliveira',
    contactPhone: '+55 11 91234-5678',
    lastMessage: 'Quando meu produto será entregue?',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    unreadCount: 1,
    inboxName: 'WhatsApp Oficial - Vendas',
  },
  {
    id: '4',
    contactName: 'Ana Costa',
    contactPhone: '+55 11 92345-6789',
    lastMessage: 'Preciso cancelar minha assinatura',
    lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    status: 'open',
    unreadCount: 0,
    inboxName: 'WhatsApp Não Oficial - Teste',
  },
];

export function getOpenConversations(): Conversation[] {
  return MOCK_CONVERSATIONS.filter(c => c.status === 'open');
}

export function getConversationsToday(): Conversation[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return MOCK_CONVERSATIONS.filter(c => {
    const msgDate = new Date(c.lastMessageTime);
    return msgDate >= today;
  });
}

export function getTotalMessagesToday(): number {
  // Mock: retorna um número baseado nas conversas
  return MOCK_CONVERSATIONS.reduce((sum, c) => sum + (c.unreadCount || 0), 0) + 15;
}


