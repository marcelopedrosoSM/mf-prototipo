/**
 * Mock data for daily activities
 */

export interface Activity {
  id: string;
  type: 'message' | 'flow' | 'contact' | 'system';
  title: string;
  description: string;
  time: string;
  icon: string;
}

export const MOCK_ACTIVITIES_TODAY: Activity[] = [
  {
    id: '1',
    type: 'message',
    title: 'Nova mensagem recebida',
    description: 'João Silva enviou uma mensagem em WhatsApp Oficial - Vendas',
    time: new Date().toISOString(),
    icon: 'MessageSquare',
  },
  {
    id: '2',
    type: 'flow',
    title: 'Fluxo executado',
    description: 'Fluxo "Atendimento Inicial" foi executado com sucesso',
    time: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    icon: 'Workflow',
  },
  {
    id: '3',
    type: 'contact',
    title: 'Novo contato adicionado',
    description: 'Maria Santos foi adicionada aos contatos',
    time: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    icon: 'UserPlus',
  },
  {
    id: '4',
    type: 'message',
    title: 'Mensagem enviada',
    description: 'Mensagem enviada para Pedro Oliveira',
    time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    icon: 'Send',
  },
  {
    id: '5',
    type: 'system',
    title: 'Sistema atualizado',
    description: 'Nova versão do sistema foi instalada',
    time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    icon: 'RefreshCw',
  },
];

export function getActivitiesToday(): Activity[] {
  return [...MOCK_ACTIVITIES_TODAY].sort((a, b) => 
    new Date(b.time).getTime() - new Date(a.time).getTime()
  );
}


