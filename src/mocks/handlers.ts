import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { MOCK_CREDENTIALS, MOCK_USER } from './data/auth';
import { MOCK_CHAT_SESSIONS, getChatSessionById } from './data/chatSessions';
import { MOCK_INBOXES, getInboxById } from './data/inboxes';
import { MOCK_LABELS } from './data/labels';
import { getContacts } from './data/contacts';
import { MOCK_FLOWS_ATENDIMENTO, MOCK_FLOWS_ATIVIDADES, type Flow } from './data/flows';
import { generateFlowId } from '@/utils/idGenerator';
import type { Message, ChatSession } from '@/types/conversations';

// Store para fluxos (simula banco de dados)
const flowsStore: Flow[] = [...MOCK_FLOWS_ATENDIMENTO, ...MOCK_FLOWS_ATIVIDADES];

// Example API handlers
export const handlers = [
  // Example: GET /api/users
  http.get('/api/users', () => {
    return HttpResponse.json({
      users: Array.from({ length: 10 }, () => ({
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        avatar: faker.image.avatar(),
      })),
    });
  }),

  // Example: GET /api/users/:id
  http.get('/api/users/:id', ({ params }) => {
    return HttpResponse.json({
      id: params.id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      bio: faker.person.bio(),
    });
  }),

  // Example: POST /api/users
  http.post('/api/users', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(
      {
        id: faker.string.uuid(),
        ...(body as object),
        createdAt: new Date().toISOString(),
      },
      { status: 201 }
    );
  }),

  // Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Validate credentials
    if (body.email === MOCK_CREDENTIALS.email && body.password === MOCK_CREDENTIALS.password) {
      return HttpResponse.json(
        {
          token: 'mock-jwt-token-' + Date.now(),
          user: {
            ...MOCK_USER,
            avatar: faker.image.avatar(),
          },
        },
        { status: 200 }
      );
    }

    // Invalid credentials
    return HttpResponse.json(
      {
        error: 'Credenciais inválidas',
        message: 'E-mail ou senha incorretos',
      },
      { status: 401 }
    );
  }),

  // Chat Sessions
  http.get('/api/chat/conversations', ({ request }) => {
    const url = new URL(request.url);
    const inboxId = url.searchParams.get('inboxId');
    const status = url.searchParams.get('status');
    const search = url.searchParams.get('search');

    let filtered = [...MOCK_CHAT_SESSIONS];

    if (inboxId) {
      filtered = filtered.filter((chat) => chat.inbox.id === inboxId);
    }

    if (status) {
      // Filtrar por status se necessário
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (chat) =>
          chat.sender.name.toLowerCase().includes(searchLower) ||
          chat.sender.phoneNumber.includes(search)
      );
    }

    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
    });
  }),

  // Inboxes
  http.get('/api/inboxes', () => {
    return HttpResponse.json({
      data: MOCK_INBOXES,
    });
  }),

  // Labels
  http.get('/api/labels', () => {
    return HttpResponse.json({
      data: MOCK_LABELS,
    });
  }),

  // Contacts
  http.get('/api/contacts', () => {
    return HttpResponse.json({
      data: getContacts(),
    });
  }),

  // Buscar mensagens de uma conversa
  http.get('/api/chat/conversations/:id/messages', ({ params }) => {
    const conversationId = params.id as string;
    const chatSession = getChatSessionById(conversationId);

    if (!chatSession) {
      return HttpResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Ordenar mensagens por timestamp (mais antigas primeiro)
    const sortedMessages = [...chatSession.messages].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateA - dateB; // Ordem crescente: mais antigas primeiro
    });

    return HttpResponse.json({
      data: sortedMessages,
      total: sortedMessages.length,
    });
  }),

  // Enviar mensagem
  http.post('/api/chat/conversations/:id/messages', async ({ params, request }) => {
    const conversationId = params.id as string;
    const body = (await request.json()) as { content: string; type?: string };

    const chatSession = getChatSessionById(conversationId);

    if (!chatSession) {
      return HttpResponse.json(
        { error: 'Conversa não encontrada' },
        { status: 404 }
      );
    }

    // Criar nova mensagem
    const newMessage: Message = {
      id: `msg-${Date.now()}-${faker.string.alphanumeric(6)}`,
      conversationId,
      content: body.content,
      type: (body.type as any) || 'text',
      status: 'sent',
      senderId: 'current-user',
      senderName: 'Você',
      senderType: 'user',
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString('pt-BR'),
      hour: new Date().toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    // Adicionar mensagem à conversa (em produção, isso seria feito no backend)
    chatSession.messages.push(newMessage);
    chatSession.lastActivityAt = new Date().toISOString();
    chatSession.lastActivityUserAt = new Date().toISOString();

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 300));

    return HttpResponse.json(
      {
        data: newMessage,
      },
      { status: 201 }
    );
  }),

  // Criar nova conversa
  http.post('/api/chat/conversations', async ({ request }) => {
    const body = (await request.json()) as {
      inboxId: string;
      sender: { name: string; phoneNumber: string };
      initialMessage?: string;
    };

    const inbox = getInboxById(body.inboxId);
    if (!inbox) {
      return HttpResponse.json(
        { error: 'Caixa de entrada não encontrada' },
        { status: 404 }
      );
    }

    // Simular delay de rede
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Criar nova conversa
    const conversationId = `conv-${Date.now()}-${faker.string.alphanumeric(6)}`;
    
    // Garantir formato de telefone correto
    let phoneNumber = body.sender.phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    
    const newConversation: ChatSession = {
      id: conversationId,
      sender: {
        id: `contact-${Date.now()}-${faker.string.alphanumeric(6)}`,
        name: body.sender.name,
        phoneNumber,
        city: faker.location.city(),
        state: faker.location.state({ abbreviated: true }),
      },
      unreadCount: 0,
      labels: [],
      messages: body.initialMessage
        ? [
            {
              id: `msg-${Date.now()}-${faker.string.alphanumeric(6)}`,
              conversationId,
              content: body.initialMessage,
              type: 'text',
              status: 'sent',
              senderId: 'current-user',
              senderName: 'Você',
              senderType: 'user',
              timestamp: new Date().toISOString(),
              date: new Date().toLocaleDateString('pt-BR'),
              hour: new Date().toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ]
        : [],
      lastActivityAt: new Date().toISOString(),
      lastActivityUserAt: new Date().toISOString(),
      status: 'open',
      inbox,
      mentioned: false,
    };

    // Adicionar à lista de conversas (em produção, isso seria feito no backend)
    MOCK_CHAT_SESSIONS.unshift(newConversation);

    return HttpResponse.json(
      {
        data: newConversation,
      },
      { status: 201 }
    );
  }),

  // Fluxos - GET /api/flows
  http.get('/api/flows', ({ request }) => {
    const url = new URL(request.url);
    const tipo = url.searchParams.get('tipo');
    
    let filtered = [...flowsStore];
    
    if (tipo) {
      filtered = filtered.filter(flow => flow.tipo === tipo);
    }
    
    return HttpResponse.json({
      data: filtered,
      total: filtered.length,
    });
  }),

  // Fluxos - GET /api/flows/:id
  http.get('/api/flows/:id', ({ params }) => {
    const flowId = params.id as string;
    const flow = flowsStore.find(f => f.id === flowId);
    
    if (!flow) {
      return HttpResponse.json(
        { error: 'Fluxo não encontrado' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({
      data: flow,
    });
  }),

  // Fluxos - POST /api/flows
  http.post('/api/flows', async ({ request }) => {
    const body = (await request.json()) as Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>;
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const newFlow: Flow = {
      ...body,
      id: generateFlowId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    flowsStore.push(newFlow);
    
    return HttpResponse.json(
      {
        data: newFlow,
      },
      { status: 201 }
    );
  }),

  // Fluxos - PUT /api/flows/:id
  http.put('/api/flows/:id', async ({ params, request }) => {
    const flowId = params.id as string;
    const body = (await request.json()) as Partial<Flow>;
    
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const index = flowsStore.findIndex(f => f.id === flowId);
    
    if (index === -1) {
      return HttpResponse.json(
        { error: 'Fluxo não encontrado' },
        { status: 404 }
      );
    }
    
    const updatedFlow: Flow = {
      ...flowsStore[index],
      ...body,
      id: flowId,
      updatedAt: new Date().toISOString(),
    };
    
    flowsStore[index] = updatedFlow;
    
    return HttpResponse.json({
      data: updatedFlow,
    });
  }),

  // Fluxos - DELETE /api/flows/:id
  http.delete('/api/flows/:id', ({ params }) => {
    const flowId = params.id as string;
    const index = flowsStore.findIndex(f => f.id === flowId);
    
    if (index === -1) {
      return HttpResponse.json(
        { error: 'Fluxo não encontrado' },
        { status: 404 }
      );
    }
    
    flowsStore.splice(index, 1);
    
    return HttpResponse.json(
      { message: 'Fluxo excluído com sucesso' },
      { status: 200 }
    );
  }),
];

