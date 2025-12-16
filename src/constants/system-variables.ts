/**
 * Variáveis do sistema disponíveis para uso em blocos do flow builder
 */

export interface SystemVariable {
    name: string;
    description: string;
    category: 'data_hora' | 'execucao' | 'contato';
    example?: string;
}

export const SYSTEM_VARIABLES: SystemVariable[] = [
    // Data/Hora
    {
        name: 'data_atual',
        description: 'Data atual (DD/MM/YYYY)',
        category: 'data_hora',
        example: '25/12/2024',
    },
    {
        name: 'hora_atual',
        description: 'Hora atual (HH:MM)',
        category: 'data_hora',
        example: '14:30',
    },
    {
        name: 'data_hora_atual',
        description: 'Data e hora completa',
        category: 'data_hora',
        example: '25/12/2024 14:30:00',
    },
    {
        name: 'dia_semana',
        description: 'Nome completo do dia da semana',
        category: 'data_hora',
        example: 'Segunda-feira',
    },
    {
        name: 'mes_atual',
        description: 'Mês em número',
        category: 'data_hora',
        example: '12',
    },
    {
        name: 'ano_atual',
        description: 'Ano atual em número',
        category: 'data_hora',
        example: '2024',
    },
    {
        name: 'timestamp',
        description: 'Timestamp Unix em milissegundos',
        category: 'data_hora',
        example: '1703515200000',
    },
    // Execução
    {
        name: 'conversation_id',
        description: 'ID da conversa atual (gerado automaticamente em tempo de execução)',
        category: 'execucao',
        example: '123',
    },
    {
        name: 'inbox_id',
        description: 'ID da caixa de entrada (MyFlows)',
        category: 'execucao',
        example: '79',
    },
    {
        name: 'account_id',
        description: 'ID da conta (MyFlows)',
        category: 'execucao',
        example: '8',
    },
    {
        name: 'user_id',
        description: 'ID do agente atribuído à conversa (MyFlows)',
        category: 'execucao',
        example: '75',
    },
    {
        name: 'message_id',
        description: 'ID da mensagem recebida (MyFlows)',
        category: 'execucao',
        example: '12345',
    },
    // 🆕 Dados do Contato (extraídos do webhook)
    {
        name: 'contact_name',
        description: 'Nome do contato (extraído do webhook)',
        category: 'contato',
        example: 'João Silva',
    },
    {
        name: 'contact_phone',
        description: 'Telefone do contato (extraído do webhook)',
        category: 'contato',
        example: '+5511999999999',
    },
    {
        name: 'contact_id',
        description: 'ID do contato no MyFlows',
        category: 'contato',
        example: '12345',
    },
    {
        name: 'inbox_name',
        description: 'Nome da caixa de entrada',
        category: 'contato',
        example: 'WhatsApp Principal',
    },
];

/**
 * Labels das categorias
 */
export const CATEGORY_LABELS: Record<SystemVariable['category'], string> = {
    data_hora: 'Data/Hora',
    execucao: 'Execução',
    contato: '📇 Dados do Contato',
};
