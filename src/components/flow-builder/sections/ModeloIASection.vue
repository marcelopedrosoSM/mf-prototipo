<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { LLM_CONFIG, LLMConfigHelper } from '@/constants/llm-config'
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <Label class="text-sm font-medium">Modelo de IA</Label>
      <p class="text-xs text-muted-foreground">
        Selecione o provedor e modelo de IA que será usado para processar as mensagens.
      </p>
    </div>

    <div class="space-y-3">
      <!-- Provedor de LLM -->
      <div class="space-y-2">
        <Label for="llm-provider">Provedor de IA *</Label>
        <Input
          id="llm-provider"
          value="OpenAI"
          disabled
          class="bg-muted"
        />
        <p class="text-xs text-muted-foreground">
          Usa a API da OpenAI para processamento de linguagem natural.
        </p>
      </div>

      <!-- Modelo de LLM -->
      <div class="space-y-2">
        <Label for="llm-model">Modelo *</Label>
        <div class="text-sm text-muted-foreground mb-2">
          Sistema usa {{ LLMConfigHelper.getDisplayName(LLM_CONFIG.MODELS.PRIMARY) }}
          com fallback automático para {{ LLMConfigHelper.getDisplayName(LLM_CONFIG.MODELS.FALLBACK) }}
        </div>
        <Input
          :value="`${LLMConfigHelper.getDisplayName(LLM_CONFIG.MODELS.PRIMARY)} + ${LLMConfigHelper.getDisplayName(LLM_CONFIG.MODELS.FALLBACK)} (fallback automático)`"
          disabled
          class="bg-muted"
        />
        <p class="text-xs text-muted-foreground">
          Configuração otimizada: {{ LLMConfigHelper.getDescription(LLM_CONFIG.MODELS.PRIMARY) }}
        </p>
      </div>
    </div>
  </div>
</template>
