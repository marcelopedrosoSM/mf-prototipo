/**
 * Mock data for quick messages/mensagens rápidas
 */

import type { MensagemRapida } from '@/types/mensagens-rapidas';

export const MOCK_MENSAGENS_RAPIDAS: MensagemRapida[] = [
  {
    id: '1',
    title: 'Boas-vindas',
    content: 'Olá! Bem-vindo ao nosso atendimento. Como posso ajudá-lo hoje?',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    title: 'Horário de atendimento',
    content: 'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h. Fora deste horário, responderemos assim que possível.',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
  },
  {
    id: '3',
    title: 'Agradecimento',
    content: 'Obrigado por entrar em contato conosco! Ficamos felizes em ajudar.',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
  },
  {
    id: '4',
    title: 'Solicitação de informações',
    content: 'Para melhor atendê-lo, preciso de algumas informações. Pode me passar seu nome e o assunto?',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
  },
];

let nextId = 5;

export function getMensagensRapidas(): MensagemRapida[] {
  return [...MOCK_MENSAGENS_RAPIDAS];
}

export function getMensagemRapidaById(id: string): MensagemRapida | undefined {
  return MOCK_MENSAGENS_RAPIDAS.find((msg) => msg.id === id);
}

export function addMensagemRapida(data: Omit<MensagemRapida, 'id' | 'createdAt' | 'updatedAt'>): MensagemRapida {
  const newMsg: MensagemRapida = {
    ...data,
    id: String(nextId++),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_MENSAGENS_RAPIDAS.push(newMsg);
  return newMsg;
}

export function updateMensagemRapida(id: string, data: Partial<Omit<MensagemRapida, 'id' | 'createdAt'>>): MensagemRapida | null {
  const index = MOCK_MENSAGENS_RAPIDAS.findIndex((msg) => msg.id === id);
  if (index === -1) return null;

  MOCK_MENSAGENS_RAPIDAS[index] = {
    ...MOCK_MENSAGENS_RAPIDAS[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_MENSAGENS_RAPIDAS[index];
}

export function deleteMensagemRapida(id: string): boolean {
  const index = MOCK_MENSAGENS_RAPIDAS.findIndex((msg) => msg.id === id);
  if (index === -1) return false;
  MOCK_MENSAGENS_RAPIDAS.splice(index, 1);
  return true;
}

