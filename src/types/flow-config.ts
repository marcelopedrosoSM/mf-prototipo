/**
 * Tipos para configuração de fluxos de atendimento
 */



// Configuração de retomada automática
export interface RetomadaConfig {
    enabled: boolean
    mensagem: string
    intervaloMinutos: number
    intervaloUnidade: 'minutos' | 'horas'
    maxTentativas: number
    acaoLimite: 'finalizar' | 'transferir'
    mensagemFinalizar: string
    mensagemTransferir: string
    handoffAgentId: string
}

// Configuração de transferência automática
export interface TransferenciaConfig {
    enabled: boolean
    maxIaAttempts: number
    handoffAgentId: string
    fallbackMessage: string
}

// Configuração completa do fluxo
export interface FlowConfigData {
    // Informações Gerais
    nome: string
    descricao: string

    // Modelo de IA
    llmProvider: 'openai'
    llmModel: string



    // Retomada Automática
    retomada: RetomadaConfig

    // Transferência Automática
    transferencia: TransferenciaConfig
}

// Tipo para dias da semana
export type WeekdayId = 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab' | 'dom'

// Informação de dia da semana
export interface WeekDay {
    id: WeekdayId
    label: string
    short: string
}
