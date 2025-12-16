/**
 * Mock data for chat sessions
 * 2 conversas de cada status, vinculadas a times e agentes mockados
 * Usa faker para gerar nomes genéricos
 */

import { faker } from '@faker-js/faker';
import type { ChatSession, Message } from '@/types/conversations';
import { MOCK_INBOXES } from './inboxes';
import { MOCK_LABELS } from './labels';
import { MOCK_AGENTES } from './agentes';
import { MOCK_TIMES } from './times';

function createMessage(
  id: string,
  conversationId: string,
  index: number,
  isUser: boolean,
  content: string
): Message {
  const timestamp = new Date(Date.now() - index * 60 * 1000);
  return {
    id,
    conversationId,
    content,
    type: 'text',
    status: 'delivered',
    senderId: isUser ? '1' : conversationId,
    senderName: isUser ? 'Você' : 'Contato',
    senderType: isUser ? 'user' : 'contact',
    timestamp: timestamp.toISOString(),
    date: timestamp.toLocaleDateString('pt-BR'),
    hour: timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

// 2 conversas SEM TIME ATRIBUÍDO (WITHOUT_TEAM)
const withoutTeam1: ChatSession = {
  id: '1',
  sender: {
    id: 'contact-1',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 3,
  labels: [MOCK_LABELS[0]],
  messages: [
    createMessage('msg-1-1', '1', 0, false, 'Olá, preciso de ajuda'),
    createMessage('msg-1-2', '1', 1, true, 'Olá! Como posso ajudar?'),
    createMessage('msg-1-3', '1', 2, false, 'Tenho uma dúvida sobre o produto'),
  ],
  lastActivityAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  status: 'waiting',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

const withoutTeam2: ChatSession = {
  id: '2',
  sender: {
    id: 'contact-2',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 1,
  labels: [],
  messages: [
    createMessage('msg-2-1', '2', 0, false, 'Bom dia!'),
    createMessage('msg-2-2', '2', 1, false, 'Gostaria de informações'),
  ],
  lastActivityAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  status: 'waiting',
  inbox: MOCK_INBOXES[1],
  mentioned: false,
};

// 2 conversas EM ATENDIMENTO (IN_SERVICE) - com user e team
const inService1: ChatSession = {
  id: '3',
  sender: {
    id: 'contact-3',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
    company: faker.company.name(),
  },
  unreadCount: 0,
  labels: [MOCK_LABELS[1], MOCK_LABELS[2]],
  messages: [
    createMessage('msg-3-1', '3', 0, false, 'Preciso de suporte'),
    createMessage('msg-3-2', '3', 1, true, 'Claro, vou te ajudar'),
    createMessage('msg-3-3', '3', 2, false, 'Obrigada!'),
  ],
  lastActivityAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-1',
    user: {
      id: MOCK_AGENTES[0].id,
      name: MOCK_AGENTES[0].nome,
      email: MOCK_AGENTES[0].email,
    },
    team: {
      id: MOCK_TIMES[0].id,
      name: MOCK_TIMES[0].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

const inService2: ChatSession = {
  id: '4',
  sender: {
    id: 'contact-4',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 2,
  labels: [MOCK_LABELS[0]],
  messages: [
    createMessage('msg-4-1', '4', 0, false, 'Olá, tenho uma dúvida'),
    createMessage('msg-4-2', '4', 1, true, 'Qual sua dúvida?'),
    createMessage('msg-4-3', '4', 2, false, 'Sobre o pagamento'),
  ],
  lastActivityAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-2',
    user: {
      id: MOCK_AGENTES[1].id,
      name: MOCK_AGENTES[1].nome,
      email: MOCK_AGENTES[1].email,
    },
    team: {
      id: MOCK_TIMES[1].id,
      name: MOCK_TIMES[1].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[1],
  mentioned: false,
};

// 2 conversas COM MENÇÕES (MENTION)
const mention1: ChatSession = {
  id: '5',
  sender: {
    id: 'contact-5',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 5,
  labels: [MOCK_LABELS[3]],
  messages: [
    createMessage('msg-5-1', '5', 0, false, 'Olá @joao'),
    createMessage('msg-5-2', '5', 1, false, 'Preciso de ajuda urgente'),
  ],
  lastActivityAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-3',
    user: {
      id: MOCK_AGENTES[0].id,
      name: MOCK_AGENTES[0].nome,
      email: MOCK_AGENTES[0].email,
    },
    team: {
      id: MOCK_TIMES[0].id,
      name: MOCK_TIMES[0].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[0],
  mentioned: true,
};

const mention2: ChatSession = {
  id: '6',
  sender: {
    id: 'contact-6',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 1,
  labels: [],
  messages: [
    createMessage('msg-6-1', '6', 0, false, '@maria preciso de suporte'),
  ],
  lastActivityAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-4',
    user: {
      id: MOCK_AGENTES[2].id,
      name: MOCK_AGENTES[2].nome,
      email: MOCK_AGENTES[2].email,
    },
    team: {
      id: MOCK_TIMES[2].id,
      name: MOCK_TIMES[2].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[1],
  mentioned: true,
};

// 2 conversas FINALIZADAS (FINISHED)
const finished1: ChatSession = {
  id: '7',
  sender: {
    id: 'contact-7',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 0,
  labels: [MOCK_LABELS[4]],
  messages: [
    createMessage('msg-7-1', '7', 0, false, 'Obrigada pelo atendimento'),
    createMessage('msg-7-2', '7', 1, true, 'De nada! Fico feliz em ajudar'),
    createMessage('msg-7-3', '7', 2, false, 'Até logo!'),
  ],
  lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-5',
    user: {
      id: MOCK_AGENTES[1].id,
      name: MOCK_AGENTES[1].nome,
      email: MOCK_AGENTES[1].email,
    },
    team: {
      id: MOCK_TIMES[1].id,
      name: MOCK_TIMES[1].nome,
    },
  },
  status: 'closed',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

const finished2: ChatSession = {
  id: '8',
  sender: {
    id: 'contact-8',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 0,
  labels: [],
  messages: [
    createMessage('msg-8-1', '8', 0, false, 'Problema resolvido'),
    createMessage('msg-8-2', '8', 1, true, 'Ótimo! Fico feliz'),
  ],
  lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-6',
    user: {
      id: MOCK_AGENTES[2].id,
      name: MOCK_AGENTES[2].nome,
      email: MOCK_AGENTES[2].email,
    },
    team: {
      id: MOCK_TIMES[2].id,
      name: MOCK_TIMES[2].nome,
    },
  },
  status: 'closed',
  inbox: MOCK_INBOXES[1],
  mentioned: false,
};

// 2 conversas NA FILA DE ESPERA (QUEUE) - com team mas sem user específico
// Na fila, o assignedUser tem team mas não tem user (ou user genérico)
const queue1: ChatSession = {
  id: '9',
  sender: {
    id: 'contact-9',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 2,
  labels: [],
  messages: [
    createMessage('msg-9-1', '9', 0, false, 'Preciso de ajuda'),
    createMessage('msg-9-2', '9', 1, false, 'Alguém pode me atender?'),
  ],
  lastActivityAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-7',
    user: {
      id: 'queue-user',
      name: 'Fila de Espera',
      email: 'queue@myflows.com.br',
    },
    team: {
      id: MOCK_TIMES[0].id,
      name: MOCK_TIMES[0].nome,
    },
  },
  status: 'pending',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

const queue2: ChatSession = {
  id: '10',
  sender: {
    id: 'contact-10',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 1,
  labels: [MOCK_LABELS[2]],
  messages: [
    createMessage('msg-10-1', '10', 0, false, 'Olá, tenho uma questão'),
  ],
  lastActivityAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-8',
    user: {
      id: 'queue-user',
      name: 'Fila de Espera',
      email: 'queue@myflows.com.br',
    },
    team: {
      id: MOCK_TIMES[1].id,
      name: MOCK_TIMES[1].nome,
    },
  },
  status: 'pending',
  inbox: MOCK_INBOXES[1],
  mentioned: false,
};

// 2 conversas adicionais para ALL_CHATS (diversos status)
const allChats1: ChatSession = {
  id: '11',
  sender: {
    id: 'contact-11',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 0,
  labels: [],
  messages: [
    createMessage('msg-11-1', '11', 0, false, 'Bom dia'),
    createMessage('msg-11-2', '11', 1, true, 'Bom dia! Como posso ajudar?'),
  ],
  lastActivityAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-9',
    user: {
      id: MOCK_AGENTES[3].id,
      name: MOCK_AGENTES[3].nome,
      email: MOCK_AGENTES[3].email,
    },
    team: {
      id: MOCK_TIMES[3].id,
      name: MOCK_TIMES[3].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

const allChats2: ChatSession = {
  id: '12',
  sender: {
    id: 'contact-12',
    name: faker.person.fullName(),
    phoneNumber: faker.phone.number('+55###########'),
    city: faker.location.city(),
    state: faker.location.state({ abbreviated: true }),
  },
  unreadCount: 4,
  labels: [MOCK_LABELS[1]],
  messages: [
    createMessage('msg-12-1', '12', 0, false, 'Preciso de informações'),
    createMessage('msg-12-2', '12', 1, false, 'Sobre o produto X'),
  ],
  lastActivityAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
  status: 'waiting',
  inbox: MOCK_INBOXES[1],
  mentioned: false,
};

export const MOCK_CHAT_SESSIONS: ChatSession[] = [
  // WITHOUT_TEAM (2)
  withoutTeam1,
  withoutTeam2,
  // IN_SERVICE (2)
  inService1,
  inService2,
  // MENTION (2)
  mention1,
  mention2,
  // FINISHED (2)
  finished1,
  finished2,
  // QUEUE (2)
  queue1,
  queue2,
  // ALL_CHATS (2 adicionais)
  allChats1,
  allChats2,
];

export function getChatSessions(): ChatSession[] {
  return [...MOCK_CHAT_SESSIONS];
}

export function getChatSessionById(id: string): ChatSession | undefined {
  return MOCK_CHAT_SESSIONS.find((session) => session.id === id);
}

export function getChatSessionsByStatus(status: string): ChatSession[] {
  return MOCK_CHAT_SESSIONS.filter((session) => session.status === status);
}
