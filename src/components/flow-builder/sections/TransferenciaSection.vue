<script setup lang="ts">
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import type { TransferenciaConfig } from '@/types/flow-config'

interface Agente {
  id: string
  nome: string
}

interface Time {
  id: string
  nome: string
}

interface Props {
  config: TransferenciaConfig
  agentes?: Agente[]
  times?: Time[]
}

const props = withDefaults(defineProps<Props>(), {
  agentes: () => [],
  times: () => []
})

const emit = defineEmits<{
  (e: 'update:config', value: TransferenciaConfig): void
}>()

const updateConfig = (updates: Partial<TransferenciaConfig>) => {
  emit('update:config', { ...props.config, ...updates })
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <Label class="text-sm font-medium">Transferência automática</Label>
      <p class="text-xs text-muted-foreground">
        Configure quando e como transferir conversas. A transferência acontece automaticamente quando o número máximo de tentativas de IA é atingido no mesmo bloco.
      </p>
    </div>

    <!-- Agente/Time + Tentativas -->
    <div class="space-y-4">
      <div class="space-y-2">
        <Label for="transferencia-handoff">Encaminhar para *</Label>
        <template v-if="agentes.length === 0 && times.length === 0">
          <div class="p-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
            Nenhum agente ou time configurado ainda.
          </div>
        </template>
        <template v-else>
          <Select
            :model-value="config.handoffAgentId || ''"
            @update:model-value="updateConfig({ handoffAgentId: $event as string })"
          >
            <SelectTrigger id="transferencia-handoff">
              <SelectValue placeholder="Selecione agente ou time" />
            </SelectTrigger>
            <SelectContent>
              <template v-if="agentes.length > 0">
                <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Agentes
                </div>
                <SelectItem v-for="agente in agentes" :key="agente.id" :value="agente.id">
                  {{ agente.nome }}
                </SelectItem>
              </template>
              <template v-if="times.length > 0">
                <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-1">
                  Times
                </div>
                <SelectItem v-for="time in times" :key="time.id" :value="time.id">
                  {{ time.nome }}
                </SelectItem>
              </template>
            </SelectContent>
          </Select>
          <p class="text-xs text-muted-foreground">
            Se for um time, a atribuição será feita automaticamente.
          </p>
        </template>
      </div>

      <div class="space-y-2">
        <Label for="transferencia-tentativas">Tentativas máx. de IA</Label>
        <Input
          id="transferencia-tentativas"
          type="number"
          :min="1"
          :max="10"
          :value="config.maxIaAttempts"
          @input="updateConfig({ maxIaAttempts: Math.max(1, Math.min(10, Number(($event.target as HTMLInputElement).value))) })"
        />
        <p class="text-xs text-muted-foreground">
          Por bloco
        </p>
      </div>
    </div>

    <!-- Mensagem de handoff -->
    <div class="space-y-2">
      <Label for="transferencia-mensagem">Mensagem de transferência</Label>
      <Textarea
        id="transferencia-mensagem"
        :value="config.fallbackMessage"
        @input="updateConfig({ fallbackMessage: ($event.target as HTMLTextAreaElement).value })"
        :rows="3"
        placeholder="Ex: Aguarde um momento, vou transferir você para um de nossos atendentes."
      />
      <p class="text-xs text-muted-foreground">
        Esta mensagem será enviada antes de transferir a conversa para o agente/time selecionado.
      </p>
    </div>
  </div>
</template>
