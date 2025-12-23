/**
 * Valores padrão para configuração de fluxos
 */

import type { WeekDay, FlowConfigData } from '@/types/flow-config'
import { LLM_CONFIG } from './llm-config'

// Dias da semana
export const WEEK_DAYS: readonly WeekDay[] = [
    { id: 'seg', label: 'Segunda-feira', short: 'Seg' },
    { id: 'ter', label: 'Terça-feira', short: 'Ter' },
    { id: 'qua', label: 'Quarta-feira', short: 'Qua' },
    { id: 'qui', label: 'Quinta-feira', short: 'Qui' },
    { id: 'sex', label: 'Sexta-feira', short: 'Sex' },
    { id: 'sab', label: 'Sábado', short: 'Sáb' },
    { id: 'dom', label: 'Domingo', short: 'Dom' },
] as const



// Mensagens padrão
export const DEFAULT_RETOMADA_MESSAGE = 'Olá! Podemos retomar nossa conversa?'
export const DEFAULT_HANDOFF_MESSAGE = 'Aguarde um momento, vou transferir você para um de nossos atendentes.'
export const DEFAULT_FINALIZAR_MESSAGE = 'Entendemos que você não está mais disponível. Vamos finalizar esta conversa. Se precisar de ajuda no futuro, estaremos aqui!'
export const DEFAULT_TRANSFERIR_MESSAGE = 'Vamos transferir sua conversa para um de nossos atendentes que poderá te ajudar melhor!'

// Configuração padrão completa
export const getDefaultFlowConfig = (): FlowConfigData => ({
    nome: '',
    descricao: '',
    llmProvider: 'openai',
    llmModel: LLM_CONFIG.MODELS.PRIMARY,

    retomada: {
        enabled: false,
        mensagem: DEFAULT_RETOMADA_MESSAGE,
        intervaloMinutos: 1440, // 24 horas
        intervaloUnidade: 'horas',
        maxTentativas: 1,
        acaoLimite: 'finalizar',
        mensagemFinalizar: DEFAULT_FINALIZAR_MESSAGE,
        mensagemTransferir: DEFAULT_TRANSFERIR_MESSAGE,
        handoffAgentId: '',
    },
    transferencia: {
        enabled: false,
        maxIaAttempts: 3,
        handoffAgentId: '',
        fallbackMessage: DEFAULT_HANDOFF_MESSAGE,
    },
})
