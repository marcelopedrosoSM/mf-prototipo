<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface Props {
  nome: string
  descricao: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:nome', value: string): void
  (e: 'update:descricao', value: string): void
}>()
</script>

<template>
  <div class="space-y-4">
    <!-- Nome do assistente -->
    <div class="space-y-2">
      <Label for="assistente-nome">Nome do assistente de IA *</Label>
      <Input
        id="assistente-nome"
        :value="nome"
        disabled
        class="bg-muted"
        placeholder="Ex: Atendimento Inicial"
      />
    </div>

    <!-- Descrição -->
    <div class="space-y-2">
      <Label for="assistente-descricao">Descrição</Label>
      <Textarea
        id="assistente-descricao"
        :value="descricao"
        disabled
        class="bg-muted"
        placeholder="Descreva o propósito do fluxo..."
        :rows="3"
      />
    </div>
  </div>
</template>
