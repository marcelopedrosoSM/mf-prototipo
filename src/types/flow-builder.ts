/**
 * Tipos para o Flow Builder do Chatbot
 */

export type BlockType =
  | 'message'    // Mensagem
  | 'question'   // Pergunta
  | 'switch'     // Decisão
  | 'api'        // Integração
  | 'action'     // Ação
  | 'wait'       // Espera
  | 'trigger'    // Gatilho
  | 'note';      // Nota

export type ActionType =
  | 'add_tag'
  | 'assign_agent'
  | 'assign_team'
  | 'finish_conversation';

export type TriggerType =
  | 'message_received'
  | 'conversation_created'
  | 'conversation_finished'
  | 'schedule'
  | 'webhook'
  | 'manual';

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface Condition {
  label: string;
  value: string;
  variable?: string;
  operator?: string;
  valueType?: 'literal' | 'variable';
  literalValue?: string;
}

export interface CustomNodeData {
  title: string;
  type: BlockType;
  content?: string;
  variable?: string;
  conditions?: Condition[];
  options?: ChoiceOption[];
  actionType?: ActionType;
  triggerType?: TriggerType;
  api_method?: string;
  api_endpoint?: string;
  waitDuration?: number;
  [key: string]: unknown;
}

// Mapa de cores dos blocos
export const BLOCK_COLORS: Record<BlockType, string> = {
  message: '#3B82F6',   // Azul
  question: '#10B981',  // Verde
  switch: '#F97316',    // Laranja
  api: '#06B6D4',       // Ciano
  action: '#9333EA',    // Roxo
  wait: '#F59E0B',      // Âmbar
  trigger: '#8B5CF6',   // Roxo (Violet)
  note: '#FCD34D',      // Amarelo
};

export const ACTION_TYPES: Array<{ value: ActionType; label: string; section?: string }> = [
  { value: 'add_tag', label: 'Adicionar Etiqueta', section: 'myflows' },
  { value: 'assign_agent', label: 'Atribuir Agente', section: 'myflows' },
  { value: 'assign_team', label: 'Atribuir Time', section: 'myflows' },
  { value: 'finish_conversation', label: 'Finalizar Conversa', section: 'myflows' },
];

export const TRIGGER_TYPES: Array<{ value: TriggerType; label: string; description: string }> = [
  { value: 'message_received', label: 'Mensagem Recebida', description: 'Dispara quando uma mensagem é recebida' },
  { value: 'conversation_created', label: 'Conversa Iniciada', description: 'Dispara quando uma nova conversa é criada' },
  { value: 'conversation_finished', label: 'Conversa Finalizada', description: 'Dispara quando uma conversa é finalizada' },
  { value: 'schedule', label: 'Agendamento', description: 'Dispara em horários específicos (cron)' },
  { value: 'webhook', label: 'Webhook', description: 'Dispara via requisição HTTP' },
  { value: 'manual', label: 'Manual', description: 'Dispara manualmente para testes' },
];

