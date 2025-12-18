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
  | 'start'      // Início
  | 'end'        // Fim
  | 'note'       // Nota
  | 'condition_holiday'    // Condição: Feriado
  | 'condition_weekday'    // Condição: Dia da Semana
  | 'condition_time_range' // Condição: Horário
  // Activity-specific blocks
  | 'email'      // E-mail
  | 'call'       // Ligação
  | 'task'       // Tarefa
  | 'chat_flow'; // Fluxo de Atendimento

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
  // Para condition_weekday e condition_time_range o value será usado
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
  // Execution State
  hasError?: boolean;
  isExecuting?: boolean;
  wasExecuted?: boolean;
  [key: string]: unknown;
}

// Mapa de cores dos blocos
export const BLOCK_COLORS: Record<BlockType, string> = {
  start: 'hsl(var(--primary))',             // Roxo primário
  end: '#ef4444',                           // Vermelho
  message: 'hsl(var(--success))',           // Verde
  question: 'hsl(var(--success))',          // Verde
  switch: 'hsl(var(--warning))',            // Amarelo
  api: '#3B82F6',                           // Azul
  action: 'hsl(var(--primary-lighten-1))',  // Roxo secundário
  wait: 'hsl(var(--secondary))',            // Cinza
  note: 'hsl(var(--warning))',              // Amarelo
  condition_holiday: '#F59E0B',             // Ambar 
  condition_weekday: '#F59E0B',             // Ambar
  condition_time_range: '#F59E0B',          // Ambar
  // Activity-specific blocks
  email: '#3B82F6',                         // Azul
  call: '#14B8A6',                          // Teal
  task: '#F59E0B',                          // Ambar
  chat_flow: 'hsl(var(--primary))',         // Roxo
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

