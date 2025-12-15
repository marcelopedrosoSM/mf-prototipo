/**
 * Types for Inboxes/Caixas de Entrada management
 */

export interface CaixaEntrada {
  id: string;
  nome: string;
  tipo: 'oficial' | 'nao-oficial';
  phoneNumber?: string;
  phoneNumberId?: string;
  apiKey?: string;
  businessAccountId?: string;
  createdAt?: string;
  updatedAt?: string;
}

