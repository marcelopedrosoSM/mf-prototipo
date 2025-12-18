<script setup lang="ts">
import { computed } from 'vue'
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { RetomadaConfig } from '@/types/flow-config'

interface Agente {
  id: string
  nome: string
}

interface Time {
  id: string
  nome: string
}

interface Props {
  config: RetomadaConfig
  agentes?: Agente[]
  times?: Time[]
}

const props = withDefaults(defineProps<Props>(), {
  agentes: () => [],
  times: () => []
})

const emit = defineEmits<{
  (e: 'update:config', value: RetomadaConfig): void
}>()

const updateConfig = (updates: Partial<RetomadaConfig>) => {
  emit('update:config', { ...props.config, ...updates })
}

// Calcular valor exibido baseado na unidade
const intervaloExibido = computed(() => {
  if (props.config.intervaloUnidade === 'horas') {
    return Math.round(props.config.intervaloMinutos / 60)
  }
  return props.config.intervaloMinutos
})

const handleIntervaloChange = (value: string) => {
  const num = Number(value)
  if (Number.isFinite(num) && num > 0) {
    const minutos = props.config.intervaloUnidade === 'horas' ? num * 60 : num
    updateConfig({ intervaloMinutos: minutos })
  }
}

const handleUnidadeChange = (unidade: 'minutos' | 'horas') => {
  // Converter para a nova unidade mantendo proporção
  if (unidade === 'horas' && props.config.intervaloUnidade === 'minutos') {
    const horas = Math.max(1, Math.round(props.config.intervaloMinutos / 60))
    updateConfig({ intervaloUnidade: unidade, intervaloMinutos: horas * 60 })
  } else if (unidade === 'minutos' && props.config.intervaloUnidade === 'horas') {
    updateConfig({ intervaloUnidade: unidade })
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-1">
      <Label class="text-sm font-medium">Retomada automática</Label>
      <p class="text-xs text-muted-foreground">
        Escolha como este fluxo participa da retomada de conversas quando um contato fica sem responder.
      </p>
    </div>

    <!-- Mensagem de retomada -->
    <div class="space-y-2">
      <Label for="retomada-mensagem">Mensagem de retomada *</Label>
      <Textarea
        id="retomada-mensagem"
        :value="config.mensagem"
        @input="updateConfig({ mensagem: ($event.target as HTMLTextAreaElement).value })"
        :rows="3"
        placeholder="Ex: Olá! Passando para saber se posso te ajudar com a nossa última conversa."
      />
    </div>

    <!-- Intervalo e Tentativas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div class="space-y-2">
        <Label for="retomada-intervalo">Intervalo sem resposta</Label>
        <div class="flex gap-2">
          <Input
            id="retomada-intervalo"
            type="number"
            :min="config.intervaloUnidade === 'minutos' ? 1 : 1"
            :max="config.intervaloUnidade === 'minutos' ? 7200 : 120"
            :value="intervaloExibido"
            @input="handleIntervaloChange(($event.target as HTMLInputElement).value)"
            class="flex-1"
          />
          <Select 
            :model-value="config.intervaloUnidade" 
            @update:model-value="handleUnidadeChange"
          >
            <SelectTrigger class="w-[110px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minutos">Minutos</SelectItem>
              <SelectItem value="horas">Horas</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p class="text-xs text-muted-foreground">
          Tempo mínimo para que seja realizada a retomada.
        </p>
      </div>

      <div class="space-y-2">
        <Label for="retomada-max">Limite total de tentativas por conversa</Label>
        <Input
          id="retomada-max"
          type="number"
          :min="1"
          :max="5"
          :value="config.maxTentativas"
          @input="updateConfig({ maxTentativas: Math.max(1, Math.min(5, Number(($event.target as HTMLInputElement).value))) })"
        />
        <p class="text-xs text-muted-foreground">
          Quantidade máxima de tentativas de retomada por conversa.
        </p>
      </div>
    </div>

    <!-- Ação ao atingir limite -->
    <div class="space-y-3 border-t pt-4">
      <Label class="text-sm font-medium">Ao atingir limite de tentativas</Label>
      <RadioGroup
        :model-value="config.acaoLimite"
        @update:model-value="updateConfig({ acaoLimite: $event as 'finalizar' | 'transferir' })"
      >
        <div class="flex items-center space-x-2">
          <RadioGroupItem value="finalizar" id="retomada-finalizar" />
          <Label for="retomada-finalizar" class="font-normal cursor-pointer">
            Finalizar conversa
          </Label>
        </div>
        <div class="flex items-center space-x-2">
          <RadioGroupItem value="transferir" id="retomada-transferir" />
          <Label for="retomada-transferir" class="font-normal cursor-pointer">
            Transferir para time/agente
          </Label>
        </div>
      </RadioGroup>

      <!-- Mensagem antes de finalizar -->
      <div v-if="config.acaoLimite === 'finalizar'" class="pl-6 space-y-2 border-l-2">
        <Label for="retomada-msg-finalizar">
          Mensagem antes de finalizar 
          <span class="text-muted-foreground text-xs">(opcional)</span>
        </Label>
        <Textarea
          id="retomada-msg-finalizar"
          :value="config.mensagemFinalizar"
          @input="updateConfig({ mensagemFinalizar: ($event.target as HTMLTextAreaElement).value })"
          :rows="3"
          placeholder="Ex: Entendemos que você não está mais disponível..."
        />
      </div>

      <!-- Mensagem antes de transferir -->
      <template v-if="config.acaoLimite === 'transferir'">
        <div class="pl-6 space-y-2 border-l-2">
          <Label for="retomada-msg-transferir">
            Mensagem antes de transferir 
            <span class="text-muted-foreground text-xs">(opcional)</span>
          </Label>
          <Textarea
            id="retomada-msg-transferir"
            :value="config.mensagemTransferir"
            @input="updateConfig({ mensagemTransferir: ($event.target as HTMLTextAreaElement).value })"
            :rows="3"
            placeholder="Ex: Vamos transferir sua conversa para um de nossos atendentes..."
          />
        </div>

        <!-- Seletor de agente/time -->
        <div class="pl-6 space-y-2 border-l-2">
          <Label for="retomada-handoff">Encaminhar para *</Label>
          <Select
            :model-value="config.handoffAgentId"
            @update:model-value="updateConfig({ handoffAgentId: $event })"
          >
            <SelectTrigger id="retomada-handoff">
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
            Se for um time, a atribuição do agente será feita automaticamente.
          </p>
        </div>
      </template>
    </div>

    <p class="text-xs text-muted-foreground">
      A retomada só é enviada para contatos com fluxo ativo, sem resposta recente e dentro do horário de atendimento configurado.
    </p>
  </div>
</template>
