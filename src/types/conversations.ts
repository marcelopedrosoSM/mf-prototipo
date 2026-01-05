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

export type MessageType =
  | 'text'
  | 'image'
  | 'audio'
  | 'video'
  | 'file'
  | 'location'
  | 'sticker'
  | 'contact'
  | 'interactive'
  | 'template'
  | 'reaction'
  | 'order'
  | 'note'
  | 'system'
  | 'unsupported';

export type MessageStatus = 'sent' | 'delivered' | 'read' | 'failed';
export type SenderType = 'user' | 'contact' | 'system' | 'bot';

/** Type of flow that can be linked to a conversation or message */
export type FlowType = 'service' | 'activity';

/** Context of the flow that generated a message */
export interface MessageFlowContext {
  flowId: string;
  flowName: string;
  flowType: FlowType;
  stepId?: string;
  stepName?: string;
  stepNumber?: number;
  totalSteps?: number;
}

export interface ContactPayload {
  name: {
    formatted_name: string;
    first_name: string;
  };
  phones: {
    phone: string;
    type?: string;
    wa_id?: string;
  }[];
}

export interface InteractivePayload {
  type: 'button' | 'list';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    image?: { link: string };
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    buttons?: {
      type: 'reply';
      reply: {
        id: string;
        title: string;
      };
    }[];
    button?: string;
    sections?: {
      title: string;
      rows: {
        id: string;
        title: string;
        description?: string;
      }[];
    }[];
  };
}

export interface OrderPayload {
  catalog_id: string;
  text?: string;
  product_items: {
    product_retailer_id: string;
    quantity: string;
    item_price: string;
    currency: string;
  }[];
}

export interface Reaction {
  emoji: string;
  userId: string;
  userName: string;
  timestamp: string;
}

export interface ReactionPayload {
  message_id: string;
  emoji: string;
}

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
    duration?: number;
  }[];
  quotedMessageId?: string;
  quotedMessage?: Message;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
  contactPayload?: ContactPayload;
  interactivePayload?: InteractivePayload;
  orderPayload?: OrderPayload;
  reactions?: Reaction[];
  isPinned?: boolean;
  /** Context of the flow that sent this message (for bot messages) */
  flowContext?: MessageFlowContext;
}

export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface AssignedUser {
  id: string;
  user?: {
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
  isTyping?: boolean;
  updatedAt?: string;
  /** Linked Service Flow (chatbot) - max 1 */
  linkedServiceFlow?: {
    flowId: string;
    flowName: string;
    status: 'active' | 'paused' | 'completed';
  };
  /** Linked Activity Flow (cadence) - max 1 */
  linkedActivityFlow?: {
    flowId: string;
    flowName: string;
    currentStep: number;
    totalSteps: number;
    currentStepName?: string;
  };
}

