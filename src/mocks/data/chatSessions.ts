/**
 * Mock data for chat sessions
 * Conversas melhoradas com nomes brasileiros, variações por status,
 * mensagens de áudio, arquivos, anotações e sistema
 */

import type { ChatSession, Message } from '@/types/conversations';
import { MOCK_INBOXES } from './inboxes';
import { getLabelById } from './labels';
import { MOCK_AGENTES } from './agentes';
import { MOCK_TIMES } from './times';

// Nomes brasileiros realistas
// const NOMES_BRASILEIROS = [
//   'Ana Paula Silva',
//   'Carlos Eduardo Santos',
//   'Mariana Costa',
//   'Rafael Oliveira',
//   'Juliana Ferreira',
//   'Bruno Almeida',
//   'Fernanda Lima',
//   'Lucas Rodrigues',
//   'Patrícia Souza',
//   'Thiago Martins',
//   'Camila Ribeiro',
//   'Gabriel Pereira',
//   'Isabela Araújo',
//   'Diego Carvalho',
//   'Larissa Barbosa',
//   'Rodrigo Nascimento',
//   'Amanda Teixeira',
//   'Felipe Rocha',
//   'Beatriz Moura',
//   'Gustavo Dias',
// ];

// const CIDADES_BRASILEIRAS = [
//   { city: 'São Paulo', state: 'SP' },
//   { city: 'Rio de Janeiro', state: 'RJ' },
//   { city: 'Belo Horizonte', state: 'MG' },
//   { city: 'Curitiba', state: 'PR' },
//   { city: 'Porto Alegre', state: 'RS' },
//   { city: 'Brasília', state: 'DF' },
//   { city: 'Salvador', state: 'BA' },
//   { city: 'Fortaleza', state: 'CE' },
//   { city: 'Recife', state: 'PE' },
//   { city: 'Goiânia', state: 'GO' },
// ];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function createMessage(
  id: string,
  conversationId: string,
  baseDate: Date,
  minutesOffset: number,
  isUser: boolean,
  content: string,
  type: Message['type'] = 'text',
  status: Message['status'] = 'delivered',
  attachments?: Message['attachments'],
  senderType: Message['senderType'] = isUser ? 'user' : 'contact',
  senderName?: string
): Message {
  const timestamp = new Date(baseDate.getTime() - minutesOffset * 60 * 1000);
  const date = timestamp.toLocaleDateString('pt-BR');
  const hour = timestamp.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return {
    id,
    conversationId,
    content,
    type,
    status,
    senderId: isUser ? '1' : conversationId,
    senderName: senderName || (isUser ? 'Você' : 'Contato'),
    senderType,
    timestamp: timestamp.toISOString(),
    date,
    hour,
    attachments,
  };
}

function createSystemMessage(
  id: string,
  conversationId: string,
  baseDate: Date,
  minutesOffset: number,
  content: string
): Message {
  return createMessage(
    id,
    conversationId,
    baseDate,
    minutesOffset,
    false,
    content,
    'text',
    'delivered',
    undefined,
    'system',
    'Sistema'
  );
}

function createAudioMessage(
  id: string,
  conversationId: string,
  baseDate: Date,
  minutesOffset: number,
  isUser: boolean,
  duration: number = 30
): Message {
  return createMessage(
    id,
    conversationId,
    baseDate,
    minutesOffset,
    isUser,
    '',
    'audio',
    'delivered',
    [
      {
        id: `audio-${id}`,
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        type: 'audio',
        name: `Áudio de ${duration}s`,
        size: duration * 16000, // ~16KB por segundo
        mimeType: 'audio/ogg; codecs=opus',
      },
    ]
  );
}

function createFileMessage(
  id: string,
  conversationId: string,
  baseDate: Date,
  minutesOffset: number,
  isUser: boolean,
  fileName: string,
  fileType: 'file' | 'image' | 'video' = 'file'
): Message {
  const extensions = {
    file: ['pdf', 'docx', 'xlsx', 'zip'],
    image: ['jpg', 'png', 'gif'],
    video: ['mp4', 'mov', 'avi'],
  };

  const ext = getRandomElement(extensions[fileType]);
  const sizes = {
    file: [1024 * 100, 1024 * 500, 1024 * 1024 * 2], // 100KB a 2MB
    image: [1024 * 200, 1024 * 500, 1024 * 1024], // 200KB a 1MB
    video: [1024 * 1024 * 5, 1024 * 1024 * 10, 1024 * 1024 * 20], // 5MB a 20MB
  };

  return createMessage(
    id,
    conversationId,
    baseDate,
    minutesOffset,
    isUser,
    fileName,
    fileType === 'image' ? 'image' : fileType === 'video' ? 'video' : 'file',
    'delivered',
    [
      {
        id: `file-${id}`,
        url: `https://example.com/files/${fileName}.${ext}`,
        type: fileType,
        name: `${fileName}.${ext}`,
        size: getRandomElement(sizes[fileType]),
        mimeType: fileType === 'image' ? `image/${ext}` : fileType === 'video' ? `video/${ext}` : `application/${ext}`,
      },
    ]
  );
}

// ============================================================================
// CONVERSAS SEM TIME ATRIBUÍDO (WITHOUT_TEAM / WAITING)
// ============================================================================

// Variação 1: Com etiquetas, sem usuário
const withoutTeam1: ChatSession = {
  id: '1',
  sender: {
    id: 'contact-1',
    name: 'Ana Paula Silva',
    phoneNumber: '+5511987654321',
    city: 'São Paulo',
    state: 'SP',
  },
  unreadCount: 3,
  labels: [
    getLabelById('1')!, // Importante
    getLabelById('3')!, // Follow-up
  ].filter(Boolean),
  messages: [
    createMessage('msg-1-1', '1', new Date(), 25, false, 'Olá, bom dia! Gostaria de informações sobre os planos disponíveis.'),
    createMessage('msg-1-2', '1', new Date(), 20, true, 'Bom dia Ana Paula! Claro, temos três planos: Básico, Profissional e Enterprise. Qual te interessa mais?'),
    createMessage('msg-1-3', '1', new Date(), 15, false, 'O Profissional parece interessante. Quais são os recursos inclusos?'),
    createMessage('msg-1-4', '1', new Date(), 10, true, 'O plano Profissional inclui até 5 usuários, integração com WhatsApp, relatórios avançados e suporte prioritário. Quer que eu envie mais detalhes?'),
    createMessage('msg-1-5', '1', new Date(), 5, false, 'Sim, por favor! Pode enviar também os valores?'),
  ],
  lastActivityAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  status: 'waiting',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

// Variação 2: Sem etiquetas, sem usuário
const withoutTeam2: ChatSession = {
  id: '2',
  sender: {
    id: 'contact-2',
    name: 'Carlos Eduardo Santos',
    phoneNumber: '+5521987654321',
    city: 'Rio de Janeiro',
    state: 'RJ',
  },
  unreadCount: 1,
  labels: [
    getLabelById('4')!, // Urgente
  ].filter(Boolean),
  messages: [
    createMessage('msg-2-1', '2', new Date(), 45, false, 'Boa tarde! Estou com problema para acessar minha conta.'),
    createMessage('msg-2-2', '2', new Date(), 40, true, 'Boa tarde Carlos! Vou verificar isso para você. Pode me informar seu email cadastrado?'),
    createMessage('msg-2-3', '2', new Date(), 35, false, 'carlos.santos@email.com'),
    createMessage('msg-2-4', '2', new Date(), 30, true, 'Encontrei sua conta. O problema parece ser com a senha. Vou enviar um link para redefinição.'),
    createMessage('msg-2-5', '2', new Date(), 25, false, 'Perfeito, obrigado!'),
  ],
  lastActivityAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  status: 'waiting',
  inbox: MOCK_INBOXES[1],
  mentioned: false,
};

// Variação 3: Com etiqueta, com mensagem de sistema
const withoutTeam3: ChatSession = {
  id: '3',
  sender: {
    id: 'contact-3',
    name: 'Mariana Costa',
    phoneNumber: '+5531987654321',
    city: 'Belo Horizonte',
    state: 'MG',
  },
  unreadCount: 2,
  labels: [
    getLabelById('1')!, // Importante
  ].filter(Boolean),
  messages: [
    createSystemMessage('msg-3-1', '3', new Date(), 60, 'Conversa iniciada'),
    createMessage('msg-3-2', '3', new Date(), 50, false, 'Olá! Preciso de ajuda urgente com um pedido.'),
    createMessage('msg-3-3', '3', new Date(), 45, true, 'Olá Mariana! Claro, vou te ajudar. Qual o número do pedido?'),
    createMessage('msg-3-4', '3', new Date(), 40, false, 'É o pedido #12345'),
    createMessage('msg-3-5', '3', new Date(), 35, true, 'Vou verificar o status agora mesmo.'),
  ],
  lastActivityAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  status: 'waiting',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

// ============================================================================
// CONVERSAS EM ATENDIMENTO (IN_SERVICE / OPEN)
// ============================================================================

// Variação 1: Com etiquetas, com usuário e time
const inService1: ChatSession = {
  id: '4',
  sender: {
    id: 'contact-4',
    name: 'Rafael Oliveira',
    phoneNumber: '+5541987654321',
    city: 'Curitiba',
    state: 'PR',
    company: 'Tech Solutions LTDA',
  },
  unreadCount: 0,
  labels: [
    getLabelById('2')!, // Cliente VIP
    getLabelById('5')!, // Vendas
  ].filter(Boolean),
  messages: [
    createMessage('msg-4-1', '4', new Date(), 120, false, 'Bom dia! Gostaria de negociar um plano corporativo.'),
    createMessage('msg-4-2', '4', new Date(), 115, true, 'Bom dia Rafael! Fico feliz em ajudar. Quantos usuários vocês precisam?', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[0].nome),
    createMessage('msg-4-3', '4', new Date(), 110, false, 'Somos uma equipe de 15 pessoas.'),
    createMessage('msg-4-4', '4', new Date(), 105, true, 'Perfeito! Para esse volume, recomendo o plano Enterprise. Vou preparar uma proposta personalizada.', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[0].nome),
    createFileMessage('msg-4-5', '4', new Date(), 100, true, 'proposta_comercial', 'file'),
    createMessage('msg-4-6', '4', new Date(), 95, false, 'Recebi! Vou analisar e retorno em breve.'),
  ],
  lastActivityAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 100 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-1',
    user: {
      id: MOCK_AGENTES[0].id,
      name: MOCK_AGENTES[0].nome,
      email: MOCK_AGENTES[0].email,
    },
    team: {
      id: MOCK_TIMES[1].id,
      name: MOCK_TIMES[1].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

// Variação 2: Sem etiquetas, com usuário
const inService2: ChatSession = {
  id: '5',
  sender: {
    id: 'contact-5',
    name: 'Juliana Ferreira',
    phoneNumber: '+5551987654321',
    city: 'Porto Alegre',
    state: 'RS',
  },
  unreadCount: 2,
  labels: [
    getLabelById('3')!, // Follow-up
  ].filter(Boolean),
  messages: [
    createMessage('msg-5-1', '5', new Date(), 90, false, 'Oi! Preciso de ajuda com a integração da API.'),
    createMessage('msg-5-2', '5', new Date(), 85, true, 'Oi Juliana! Claro, qual endpoint está dando problema?', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[1].nome),
    createMessage('msg-5-3', '5', new Date(), 80, false, 'O endpoint de mensagens está retornando erro 500.'),
    createMessage('msg-5-4', '5', new Date(), 75, true, 'Vou verificar isso. Pode me enviar o log do erro?', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[1].nome),
    createFileMessage('msg-5-5', '5', new Date(), 70, false, 'log_erro', 'file'),
    createMessage('msg-5-6', '5', new Date(), 65, true, 'Recebi! Vou analisar e te retorno em até 2 horas.', 'text', 'read', undefined, 'user', MOCK_AGENTES[1].nome),
  ],
  lastActivityAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-2',
    user: {
      id: MOCK_AGENTES[1].id,
      name: MOCK_AGENTES[1].nome,
      email: MOCK_AGENTES[1].email,
    },
    team: {
      id: MOCK_TIMES[2].id,
      name: MOCK_TIMES[2].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[1],
  mentioned: false,
};

// Variação 3: Com etiqueta, com áudio e imagem
const inService3: ChatSession = {
  id: '6',
  sender: {
    id: 'contact-6',
    name: 'Bruno Almeida',
    phoneNumber: '+5561987654321',
    city: 'Brasília',
    state: 'DF',
  },
  unreadCount: 0,
  labels: [
    getLabelById('4')!, // Urgente
  ].filter(Boolean),
  messages: [
    createMessage('msg-6-1', '6', new Date(), 55, false, 'Olá! Preciso de suporte urgente.'),
    createMessage('msg-6-2', '6', new Date(), 50, true, 'Olá Bruno! Estou aqui para ajudar. Qual o problema?', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[2].nome),
    createAudioMessage('msg-6-3', '6', new Date(), 45, false, 25),
    createMessage('msg-6-4', '6', new Date(), 40, true, 'Entendi pelo áudio! Vou resolver isso agora mesmo.', 'text', 'read', undefined, 'user', MOCK_AGENTES[2].nome),
    createFileMessage('msg-6-5', '6', new Date(), 35, true, 'solucao', 'image'),
    createMessage('msg-6-6', '6', new Date(), 30, false, 'Perfeito! Muito obrigado pela rapidez!'),
  ],
  lastActivityAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-3',
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
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

// ============================================================================
// CONVERSAS COM MENÇÕES (MENTION)
// ============================================================================

// Variação 1: Com etiqueta, com menção
const mention1: ChatSession = {
  id: '7',
  sender: {
    id: 'contact-7',
    name: 'Fernanda Lima',
    phoneNumber: '+5571987654321',
    city: 'Salvador',
    state: 'BA',
  },
  unreadCount: 5,
  labels: [
    getLabelById('5')!, // Vendas
  ].filter(Boolean),
  messages: [
    createMessage('msg-7-1', '7', new Date(), 20, false, 'Olá @joao, preciso de ajuda urgente!'),
    createMessage('msg-7-2', '7', new Date(), 18, false, 'Alguém pode me atender?'),
    createMessage('msg-7-3', '7', new Date(), 15, true, 'Olá Fernanda! Estou aqui. Qual o problema?', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[0].nome),
    createMessage('msg-7-4', '7', new Date(), 12, false, 'Preciso fechar uma venda hoje e tenho dúvidas sobre o desconto.'),
    createMessage('msg-7-5', '7', new Date(), 10, true, 'Claro! Para compras acima de R$ 10.000 temos 15% de desconto. Quer que eu prepare a proposta?', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[0].nome),
    createMessage('msg-7-6', '7', new Date(), 8, false, 'Sim, por favor!'),
  ],
  lastActivityAt: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-4',
    user: {
      id: MOCK_AGENTES[0].id,
      name: MOCK_AGENTES[0].nome,
      email: MOCK_AGENTES[0].email,
    },
    team: {
      id: MOCK_TIMES[1].id,
      name: MOCK_TIMES[1].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[0],
  mentioned: true,
};

// Variação 2: Sem etiqueta, com menção
const mention2: ChatSession = {
  id: '8',
  sender: {
    id: 'contact-8',
    name: 'Lucas Rodrigues',
    phoneNumber: '+5581987654321',
    city: 'Fortaleza',
    state: 'CE',
  },
  unreadCount: 1,
  labels: [
    getLabelById('4')!, // Urgente
  ].filter(Boolean),
  messages: [
    createMessage('msg-8-1', '8', new Date(), 25, false, '@maria preciso de suporte técnico'),
    createMessage('msg-8-2', '8', new Date(), 20, true, 'Olá Lucas! Em que posso ajudar?', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[2].nome),
    createMessage('msg-8-3', '8', new Date(), 15, false, 'O sistema está muito lento hoje.'),
    createMessage('msg-8-4', '8', new Date(), 10, true, 'Vou verificar isso imediatamente. Pode me informar qual navegador você está usando?', 'text', 'read', undefined, 'user', MOCK_AGENTES[2].nome),
    createMessage('msg-8-5', '8', new Date(), 5, false, 'Chrome, versão mais recente.'),
  ],
  lastActivityAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-5',
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

// Variação 3: Com etiqueta, com menção e arquivo
const mention3: ChatSession = {
  id: '9',
  sender: {
    id: 'contact-9',
    name: 'Patrícia Souza',
    phoneNumber: '+5591987654321',
    city: 'Recife',
    state: 'PE',
  },
  unreadCount: 3,
  labels: [
    getLabelById('1')!, // Importante
  ].filter(Boolean),
  messages: [
    createMessage('msg-9-1', '9', new Date(), 18, false, '@pedro preciso de ajuda com este arquivo'),
    createFileMessage('msg-9-2', '9', new Date(), 16, false, 'documento_importante', 'file'),
    createMessage('msg-9-3', '9', new Date(), 14, true, 'Olá Patrícia! Recebi o arquivo. Vou analisar e te retorno.', 'text', 'delivered', undefined, 'user', MOCK_AGENTES[3].nome),
    createMessage('msg-9-4', '9', new Date(), 12, false, 'Obrigada! É urgente.'),
  ],
  lastActivityAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-6',
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
  mentioned: true,
};

// ============================================================================
// CONVERSAS FINALIZADAS (FINISHED / CLOSED)
// ============================================================================

// Variação 1: Com etiqueta, finalizada há 2 dias
const finished1: ChatSession = {
  id: '10',
  sender: {
    id: 'contact-10',
    name: 'Thiago Martins',
    phoneNumber: '+5511987654322',
    city: 'São Paulo',
    state: 'SP',
  },
  unreadCount: 0,
  labels: [
    getLabelById('5')!, // Vendas
  ].filter(Boolean),
  messages: [
    createMessage('msg-10-1', '10', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 120, false, 'Olá! Gostaria de informações sobre o produto.'),
    createMessage('msg-10-2', '10', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 115, true, 'Olá Thiago! Claro, qual produto te interessa?', 'text', 'read', undefined, 'user', MOCK_AGENTES[1].nome),
    createMessage('msg-10-3', '10', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 110, false, 'O plano Enterprise.'),
    createMessage('msg-10-4', '10', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 105, true, 'Perfeito! O plano Enterprise inclui recursos avançados. Vou enviar a proposta.', 'text', 'read', undefined, 'user', MOCK_AGENTES[1].nome),
    createMessage('msg-10-5', '10', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 100, false, 'Obrigado! Vou analisar e retorno.'),
    createMessage('msg-10-6', '10', new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 95, true, 'Perfeito! Qualquer dúvida, estou à disposição.', 'text', 'read', undefined, 'user', MOCK_AGENTES[1].nome),
  ],
  lastActivityAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 95 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 - 95 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-7',
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

// Variação 2: Sem etiqueta, finalizada há 5 dias
const finished2: ChatSession = {
  id: '11',
  sender: {
    id: 'contact-11',
    name: 'Camila Ribeiro',
    phoneNumber: '+5521987654322',
    city: 'Rio de Janeiro',
    state: 'RJ',
  },
  unreadCount: 0,
  labels: [
    getLabelById('2')!, // Cliente VIP
  ].filter(Boolean),
  messages: [
    createMessage('msg-11-1', '11', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 60, false, 'Boa tarde! Problema resolvido, obrigada pelo suporte!'),
    createMessage('msg-11-2', '11', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 55, true, 'Que bom Camila! Fico feliz em ter ajudado. Qualquer coisa, estou aqui!', 'text', 'read', undefined, 'user', MOCK_AGENTES[2].nome),
    createMessage('msg-11-3', '11', new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 50, false, 'Muito obrigada mesmo! Até logo!'),
  ],
  lastActivityAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 50 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 - 55 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-8',
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

// Variação 3: Com etiqueta, finalizada há 1 dia, com mensagem de sistema
const finished3: ChatSession = {
  id: '12',
  sender: {
    id: 'contact-12',
    name: 'Gabriel Pereira',
    phoneNumber: '+5531987654322',
    city: 'Belo Horizonte',
    state: 'MG',
  },
  unreadCount: 0,
  labels: [
    getLabelById('3')!, // Follow-up
  ].filter(Boolean),
  messages: [
    createSystemMessage('msg-12-1', '12', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 180, 'Conversa iniciada'),
    createMessage('msg-12-2', '12', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 170, false, 'Olá! Preciso cancelar minha assinatura.'),
    createMessage('msg-12-3', '12', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 165, true, 'Olá Gabriel! Lamento saber disso. Posso perguntar o motivo?', 'text', 'read', undefined, 'user', MOCK_AGENTES[0].nome),
    createMessage('msg-12-4', '12', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 160, false, 'Não estou usando mais o sistema.'),
    createMessage('msg-12-5', '12', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 155, true, 'Entendo. Vou processar o cancelamento. Você receberá um email de confirmação.', 'text', 'read', undefined, 'user', MOCK_AGENTES[0].nome),
    createSystemMessage('msg-12-6', '12', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 150, 'Conversa finalizada'),
  ],
  lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 150 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 155 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-9',
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
  status: 'closed',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

// ============================================================================
// CONVERSAS NA FILA DE ESPERA (QUEUE / PENDING)
// ============================================================================

// Variação 1: Sem etiqueta, sem usuário, com time
const queue1: ChatSession = {
  id: '13',
  sender: {
    id: 'contact-13',
    name: 'Isabela Araújo',
    phoneNumber: '+5541987654322',
    city: 'Curitiba',
    state: 'PR',
  },
  unreadCount: 2,
  labels: [
    getLabelById('1')!, // Importante
  ].filter(Boolean),
  messages: [
    createMessage('msg-13-1', '13', new Date(), 40, false, 'Olá! Preciso de ajuda com minha conta.'),
    createMessage('msg-13-2', '13', new Date(), 35, false, 'Alguém pode me atender?'),
  ],
  lastActivityAt: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(0).toISOString(),
  assignedUser: {
    id: 'assign-10',
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

// Variação 2: Com etiqueta, sem usuário, com time
const queue2: ChatSession = {
  id: '14',
  sender: {
    id: 'contact-14',
    name: 'Diego Carvalho',
    phoneNumber: '+5551987654322',
    city: 'Porto Alegre',
    state: 'RS',
  },
  unreadCount: 1,
  labels: [
    getLabelById('4')!, // Urgente
  ].filter(Boolean),
  messages: [
    createMessage('msg-14-1', '14', new Date(), 50, false, 'Boa tarde! Tenho uma questão urgente.'),
    createMessage('msg-14-2', '14', new Date(), 45, false, 'Preciso de resposta rápida, por favor.'),
  ],
  lastActivityAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(0).toISOString(),
  assignedUser: {
    id: 'assign-11',
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

// Variação 3: Sem etiqueta, sem usuário, com time, com mensagem de sistema
const queue3: ChatSession = {
  id: '15',
  sender: {
    id: 'contact-15',
    name: 'Larissa Barbosa',
    phoneNumber: '+5561987654322',
    city: 'Brasília',
    state: 'DF',
  },
  unreadCount: 3,
  labels: [
    getLabelById('5')!, // Vendas
  ].filter(Boolean),
  messages: [
    createSystemMessage('msg-15-1', '15', new Date(), 30, 'Conversa iniciada'),
    createMessage('msg-15-2', '15', new Date(), 25, false, 'Olá! Gostaria de informações sobre os planos.'),
    createMessage('msg-15-3', '15', new Date(), 20, false, 'Alguém pode me ajudar?'),
  ],
  lastActivityAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(0).toISOString(),
  assignedUser: {
    id: 'assign-12',
    user: {
      id: 'queue-user',
      name: 'Fila de Espera',
      email: 'queue@myflows.com.br',
    },
    team: {
      id: MOCK_TIMES[2].id,
      name: MOCK_TIMES[2].nome,
    },
  },
  status: 'pending',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

// ============================================================================
// CONVERSA COM MUITAS MENSAGENS PARA TESTAR SCROLL
// ============================================================================

const longConversation: ChatSession = {
  id: '16',
  sender: {
    id: 'contact-16',
    name: 'Rodrigo Nascimento',
    phoneNumber: '+5511999887766',
    city: 'São Paulo',
    state: 'SP',
    company: 'Empresa Grande LTDA',
  },
  unreadCount: 0,
  labels: [
    getLabelById('2')!, // Cliente VIP
    getLabelById('5')!, // Vendas
  ].filter(Boolean),
  messages: (() => {
    const messages: Message[] = [];
    const baseDate = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 dias atrás
    let msgIndex = 0;
    let minutesOffset = 1440; // 24 horas em minutos

    // Mensagem de sistema inicial
    messages.push(createSystemMessage(`msg-16-${msgIndex++}`, '16', baseDate, minutesOffset, 'Conversa iniciada'));
    minutesOffset -= 5;

    // Primeira interação
    messages.push(createMessage(`msg-16-${msgIndex++}`, '16', baseDate, minutesOffset, false, 'Bom dia! Gostaria de informações sobre o produto Enterprise.'));
    minutesOffset -= 3;
    messages.push(createMessage(`msg-16-${msgIndex++}`, '16', baseDate, minutesOffset, true, 'Bom dia Rodrigo! Claro, vou te ajudar. Qual sua necessidade específica?', 'text', 'read', undefined, 'user', MOCK_AGENTES[0].nome));
    minutesOffset -= 2;

    // Conversa longa com vários tipos de mensagens
    const conversationFlow = [
      { user: false, text: 'Precisamos de uma solução para nossa equipe de 50 pessoas.' },
      { user: true, text: 'Perfeito! O plano Enterprise é ideal para vocês. Vou preparar uma proposta.', agent: MOCK_AGENTES[0].nome },
      { user: false, text: 'Ótimo! Pode incluir também informações sobre integração com nosso CRM?' },
      { user: true, text: 'Claro! Temos integração nativa com os principais CRMs. Qual vocês usam?', agent: MOCK_AGENTES[0].nome },
      { user: false, text: 'Usamos o SolarMarket.' },
      { user: true, text: 'Excelente! Temos integração completa com SolarMarket. Vou incluir na proposta.', agent: MOCK_AGENTES[0].nome },
      { user: false, text: 'Perfeito! E sobre treinamento da equipe?' },
      { user: true, text: 'Incluímos treinamento completo para até 10 usuários. Para mais, temos pacotes adicionais.', agent: MOCK_AGENTES[0].nome },
      { user: false, text: 'Entendi. E o suporte técnico?' },
      { user: true, text: 'Suporte 24/7 com SLA de 1 hora para críticos. Incluído no plano Enterprise.', agent: MOCK_AGENTES[0].nome },
      { user: false, text: 'Excelente! Pode enviar a proposta?' },
      { user: true, text: 'Claro! Vou preparar agora mesmo.', agent: MOCK_AGENTES[0].nome },
      { user: true, file: 'proposta_enterprise', fileType: 'file' as const, agent: MOCK_AGENTES[0].nome },
      { user: false, text: 'Recebi! Vou analisar e retorno em breve.' },
      { user: true, text: 'Perfeito! Qualquer dúvida, estou à disposição.', agent: MOCK_AGENTES[0].nome },
      { user: false, text: 'Obrigado pela atenção!' },
      { user: true, text: 'De nada! Fico no aguardo.', agent: MOCK_AGENTES[0].nome },
    ];

    // Adiciona mensagens do fluxo, alternando dias
    let currentDay = 0;
    for (let i = 0; i < conversationFlow.length; i++) {
      const msg = conversationFlow[i];
      const dayOffset = Math.floor(i / 8); // Muda de dia a cada 8 mensagens
      if (dayOffset > currentDay) {
        currentDay = dayOffset;
        minutesOffset = 1440 - (dayOffset * 1440); // Reset para novo dia
        messages.push(createSystemMessage(`msg-16-${msgIndex++}`, '16', new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000), minutesOffset, 'Nova mensagem'));
        minutesOffset -= 2;
      }

      if (msg.file) {
        messages.push(createFileMessage(`msg-16-${msgIndex++}`, '16', new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000), minutesOffset, msg.user, msg.file, msg.fileType));
      } else {
        messages.push(createMessage(
          `msg-16-${msgIndex++}`,
          '16',
          new Date(baseDate.getTime() + dayOffset * 24 * 60 * 60 * 1000),
          minutesOffset,
          msg.user,
          msg.text,
          'text',
          msg.user ? 'read' : 'delivered',
          undefined,
          msg.user ? 'user' : 'contact',
          msg.user ? msg.agent : undefined
        ));
      }
      minutesOffset -= Math.random() * 5 + 2; // 2-7 minutos entre mensagens
    }

    // Adiciona mais mensagens variadas
    for (let i = 0; i < 15; i++) {
      const isUser = i % 3 === 0;
      // const msgTypes = ['text', 'audio', 'image', 'file'] as const;
      const msgType = i % 4 === 0 && !isUser ? getRandomElement(['audio', 'image', 'file'] as const) : 'text';

      if (msgType === 'audio') {
        messages.push(createAudioMessage(`msg-16-${msgIndex++}`, '16', new Date(), minutesOffset, isUser, Math.floor(Math.random() * 30 + 10)));
      } else if (msgType === 'image') {
        messages.push(createFileMessage(`msg-16-${msgIndex++}`, '16', new Date(), minutesOffset, isUser, `imagem_${i}`, 'image'));
      } else if (msgType === 'file') {
        messages.push(createFileMessage(`msg-16-${msgIndex++}`, '16', new Date(), minutesOffset, isUser, `arquivo_${i}`, 'file'));
      } else {
        const texts = isUser
          ? ['Entendi!', 'Perfeito!', 'Vou verificar.', 'Claro!', 'Ótimo!']
          : ['Obrigado!', 'Entendi.', 'Perfeito!', 'Vou analisar.', 'Ok!'];
        messages.push(createMessage(
          `msg-16-${msgIndex++}`,
          '16',
          new Date(),
          minutesOffset,
          isUser,
          getRandomElement(texts),
          'text',
          isUser ? 'read' : 'delivered',
          undefined,
          isUser ? 'user' : 'contact',
          isUser ? MOCK_AGENTES[0].nome : undefined
        ));
      }
      minutesOffset -= Math.random() * 10 + 5;
    }

    return messages.reverse(); // Mais recentes primeiro
  })(),
  lastActivityAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-13',
    user: {
      id: MOCK_AGENTES[0].id,
      name: MOCK_AGENTES[0].nome,
      email: MOCK_AGENTES[0].email,
    },
    team: {
      id: MOCK_TIMES[1].id,
      name: MOCK_TIMES[1].nome,
    },
  },
  status: 'open',
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

// ============================================================================
// CONVERSAS ADICIONAIS COM DIFERENTES DIAS
// ============================================================================

// Conversa de ontem
const yesterdayConversation: ChatSession = {
  id: '17',
  sender: {
    id: 'contact-17',
    name: 'Amanda Teixeira',
    phoneNumber: '+5511988776655',
    city: 'São Paulo',
    state: 'SP',
  },
  unreadCount: 0,
  labels: [
    getLabelById('3')!, // Follow-up
  ].filter(Boolean),
  messages: [
    createMessage('msg-17-1', '17', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 480, false, 'Bom dia! Gostaria de agendar uma demonstração.'),
    createMessage('msg-17-2', '17', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 475, true, 'Bom dia Amanda! Claro, temos disponibilidade hoje à tarde. Qual horário te convém?', 'text', 'read', undefined, 'user', MOCK_AGENTES[1].nome),
    createMessage('msg-17-3', '17', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 470, false, 'Às 15h seria perfeito!'),
    createMessage('msg-17-4', '17', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 465, true, 'Perfeito! Vou enviar o link da reunião por email.', 'text', 'read', undefined, 'user', MOCK_AGENTES[1].nome),
    createMessage('msg-17-5', '17', new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), 460, false, 'Obrigada! Até mais tarde então.'),
  ],
  lastActivityAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 460 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000 - 465 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-14',
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
  inbox: MOCK_INBOXES[0],
  mentioned: false,
};

// Conversa de 3 dias atrás
const threeDaysAgoConversation: ChatSession = {
  id: '18',
  sender: {
    id: 'contact-18',
    name: 'Felipe Rocha',
    phoneNumber: '+5521998877665',
    city: 'Rio de Janeiro',
    state: 'RJ',
  },
  unreadCount: 0,
  labels: [
    getLabelById('2')!, // Cliente VIP
    getLabelById('3')!, // Follow-up
  ].filter(Boolean),
  messages: [
    createMessage('msg-18-1', '18', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 300, false, 'Olá! Preciso de suporte com a API.'),
    createMessage('msg-18-2', '18', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 295, true, 'Olá Felipe! Qual o problema específico?', 'text', 'read', undefined, 'user', MOCK_AGENTES[2].nome),
    createMessage('msg-18-3', '18', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 290, false, 'O endpoint de webhook não está funcionando.'),
    createMessage('msg-18-4', '18', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 285, true, 'Vou verificar isso. Pode me enviar os logs?', 'text', 'read', undefined, 'user', MOCK_AGENTES[2].nome),
    createFileMessage('msg-18-5', '18', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 280, false, 'logs_erro', 'file'),
    createMessage('msg-18-6', '18', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 275, true, 'Recebi! Vou analisar e te retorno.', 'text', 'read', undefined, 'user', MOCK_AGENTES[2].nome),
    createMessage('msg-18-7', '18', new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 270, false, 'Obrigado!'),
  ],
  lastActivityAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 270 * 60 * 1000).toISOString(),
  lastActivityUserAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 275 * 60 * 1000).toISOString(),
  assignedUser: {
    id: 'assign-15',
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
  mentioned: false,
};

// Array inicial sem ordenação
const _MOCK_CHAT_SESSIONS: ChatSession[] = [
  // WITHOUT_TEAM (3 variações)
  withoutTeam1,
  withoutTeam2,
  withoutTeam3,
  // IN_SERVICE (3 variações)
  inService1,
  inService2,
  inService3,
  // MENTION (3 variações)
  mention1,
  mention2,
  mention3,
  // FINISHED (3 variações)
  finished1,
  finished2,
  finished3,
  // QUEUE (3 variações)
  queue1,
  queue2,
  queue3,
  // CONVERSA LONGA PARA SCROLL
  longConversation,
  // CONVERSAS DE DIAS DIFERENTES
  yesterdayConversation,
  threeDaysAgoConversation,
];

// Ordenar por última atividade (mais recente primeiro)
export const MOCK_CHAT_SESSIONS: ChatSession[] = [..._MOCK_CHAT_SESSIONS].sort((a, b) => {
  const dateA = new Date(a.lastActivityAt).getTime();
  const dateB = new Date(b.lastActivityAt).getTime();
  return dateB - dateA; // Mais recente primeiro
});

export function getChatSessions(): ChatSession[] {
  return [...MOCK_CHAT_SESSIONS];
}

export function getChatSessionById(id: string): ChatSession | undefined {
  return MOCK_CHAT_SESSIONS.find((session) => session.id === id);
}

export function getChatSessionsByStatus(status: string): ChatSession[] {
  return MOCK_CHAT_SESSIONS.filter((session) => session.status === status);
}
