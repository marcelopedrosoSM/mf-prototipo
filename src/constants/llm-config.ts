/**
 * Configuração centralizada de modelos LLM
 * Baseado em painel-base/src/constants/llm-config.ts
 */

export const LLM_CONFIG = {
    MODELS: {
        PRIMARY: 'gpt-4.1-mini',
        FALLBACK: 'gpt-4o-mini',
    } as const,

    HIERARCHY: ['gpt-4.1-mini', 'gpt-4o-mini'] as const,

    MODEL_CONFIGS: {
        'gpt-4.1-mini': {
            name: 'GPT-4.1 Mini',
            description: 'Modelo principal - rápido e econômico',
            maxTokens: 4000,
            temperature: 0.7,
        },
        'gpt-4o-mini': {
            name: 'GPT-4o Mini',
            description: 'Fallback - inteligente e confiável',
            maxTokens: 4000,
            temperature: 0.7,
        },
    } as const,

    REQUIRED_PROVIDER: 'openai' as const,
} as const

export type ModelName = typeof LLM_CONFIG.HIERARCHY[number]

// Utilitários
export class LLMConfigHelper {
    static getPrimaryModel(): string {
        return LLM_CONFIG.MODELS.PRIMARY
    }

    static getFallbackModel(): string {
        return LLM_CONFIG.MODELS.FALLBACK
    }

    static getDisplayName(model: string): string {
        const config = LLM_CONFIG.MODEL_CONFIGS[model as keyof typeof LLM_CONFIG.MODEL_CONFIGS]
        return config?.name || model
    }

    static getDescription(model: string): string {
        const config = LLM_CONFIG.MODEL_CONFIGS[model as keyof typeof LLM_CONFIG.MODEL_CONFIGS]
        return config?.description || ''
    }
}
