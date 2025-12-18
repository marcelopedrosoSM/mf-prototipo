/**
 * Tipos para configuração de fluxos de atendimento
 */

// Configuração de horário por dia
export interface HorarioDia {
    ativo: boolean
    horarioInicio: string
    horarioFim: string
}

// Configuração completa de horário de funcionamento
export interface HorarioFuncionamento {
    ativo: boolean
    seg: HorarioDia
    ter: HorarioDia
    qua: HorarioDia
    qui: HorarioDia
    sex: HorarioDia
    sab: HorarioDia
    dom: HorarioDia
    mensagemForaHorario: string
    inativoFeriados: boolean
    diasInatividade?: string[] // Formato: "MM-dd"
}

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

    // Horário de Atendimento
    horarioFuncionamento: HorarioFuncionamento
    continuarAtendimentoHorario: boolean

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
