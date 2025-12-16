import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';
import { MOCK_CREDENTIALS, MOCK_USER } from './data/auth';
import { MOCK_CHAT_SESSIONS } from './data/chatSessions';
import { MOCK_INBOXES } from './data/inboxes';
import { MOCK_LABELS } from './data/labels';

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
];

