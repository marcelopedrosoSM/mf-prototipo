/**
 * Types for conversations feature
 */

export enum SidebarStatusType {
  ALL_CHATS = 'all_chats',
  WITHOUT_TEAM = 'without_team',
  IN_SERVICE = 'in_service',
  MENTION = 'mention',
  FINISHED = 'finished',
  QUEUE = 'queue',
}

export type ConversationStatus = 'open' | 'closed' | 'waiting' | 'pending';

export type MessageType = 'text' | 'image' | 'audio' | 'video' | 'file' | 'location' | 'unsupported';
export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type SenderType = 'user' | 'contact' | 'system';

export interface Message {
  id: string;
  conversationId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  senderId: string;
  senderName: string;
  senderType: SenderType;
  timestamp: string;
  date?: string;
  hour?: string;
  attachments?: {
    id: string;
    url: string;
    type: 'image' | 'audio' | 'video' | 'file';
    name: string;
    size: number;
    mimeType: string;
  }[];
  quotedMessageId?: string;
  quotedMessage?: Message;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface AssignedUser {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  team?: {
    id: string;
    name: string;
  };
}

export interface Inbox {
  id: string;
  name: string;
  phoneNumber: string;
  status: 'active' | 'inactive';
  type: 'whatsapp' | 'whatsapp_unofficial';
  unreadCount?: number;
}

export interface ChatSessionSender {
  id: string;
  name: string;
  phoneNumber: string;
  phoneNumbers?: Array<{ number: string; type: string }>;
  emails?: Array<{ email: string; type: string }>;
  avatar?: string;
  city?: string;
  state?: string;
  company?: string;
  jobTitle?: string;
  lastActivityAt?: string;
  notes?: string;
}

export interface ChatSession {
  id: string;
  sender: ChatSessionSender;
  unreadCount: number;
  labels: Label[];
  messages: Message[];
  lastActivityAt: string;
  lastActivityUserAt: string;
  assignedUser?: AssignedUser;
  status: ConversationStatus;
  inbox: Inbox;
  mentioned?: boolean;
  updatedAt?: string;
}

