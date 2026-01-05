/**
 * Mock data for inboxes
 */

import type { Inbox } from '@/types/conversations';

// Extended Inbox type to include API details (Merging concepts)
export interface InboxDetailed extends Inbox {
  phoneNumberId?: string;
  apiKey?: string;
  businessAccountId?: string;
}

export const MOCK_INBOXES: InboxDetailed[] = [
  {
    id: '1',
    name: 'Vendas',
    phoneNumber: '+5511987654321',
    status: 'active',
    type: 'whatsapp',
    unreadCount: 5,
    phoneNumberId: '123456789',
    apiKey: 'EAABwzLixnY0BO7ZC...',
    businessAccountId: '987654321',
  },
  {
    id: '2',
    name: 'Suporte',
    phoneNumber: '+5511999887766',
    status: 'active',
    type: 'whatsapp',
    unreadCount: 3,
    phoneNumberId: '987654321',
    apiKey: 'EAABwzLixnY0BO7ZC...',
    businessAccountId: '123456789',
  },
  {
    id: '3',
    name: 'Engenharia',
    phoneNumber: '+5511988887777',
    status: 'active',
    type: 'whatsapp',
    unreadCount: 2,
    phoneNumberId: '456789123',
    apiKey: 'EAABwzLixnY0BO7ZC...',
    businessAccountId: '321654987',
  },
];

export function getInboxes(): InboxDetailed[] {
  return [...MOCK_INBOXES];
}

export function getInboxById(id: string): InboxDetailed | undefined {
  return MOCK_INBOXES.find((inbox) => inbox.id === id);
}





