/**
 * Mock data for inboxes
 */

import type { Inbox } from '@/types/conversations';

export const MOCK_INBOXES: Inbox[] = [
  {
    id: '1',
    name: 'WhatsApp Oficial - Vendas',
    phoneNumber: '+5511987654321',
    status: 'active',
    type: 'whatsapp',
    unreadCount: 5,
  },
  {
    id: '2',
    name: 'WhatsApp Oficial - Suporte',
    phoneNumber: '+5511999887766',
    status: 'active',
    type: 'whatsapp',
    unreadCount: 3,
  },
  {
    id: '3',
    name: 'WhatsApp Não Oficial - Teste',
    phoneNumber: '+5511777665544',
    status: 'active',
    type: 'whatsapp_unofficial',
    unreadCount: 2,
  },
];

export function getInboxes(): Inbox[] {
  return [...MOCK_INBOXES];
}

export function getInboxById(id: string): Inbox | undefined {
  return MOCK_INBOXES.find((inbox) => inbox.id === id);
}





