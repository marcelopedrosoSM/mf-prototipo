<script setup lang="ts">
import { ref } from 'vue'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TimePicker } from '@/components/ui/time-picker'
import { WEEK_DAYS } from '@/constants/flow-config-defaults'
import type { HorarioFuncionamento, WeekdayId } from '@/types/flow-config'

interface Props {
  horario: HorarioFuncionamento
  continuarAtendimento: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:horario', value: HorarioFuncionamento): void
  (e: 'update:continuarAtendimento', value: boolean): void
}>()

const hoveredDia = ref<WeekdayId | null>(null)

// Clone do horário para manipulação
const updateHorario = (updates: Partial<HorarioFuncionamento>) => {
  emit('update:horario', { ...props.horario, ...updates })
}

const updateDia = (dia: WeekdayId, field: 'ativo' | 'horarioInicio' | 'horarioFim', value: boolean | string) => {
  const diaAtual = props.horario[dia]
  emit('update:horario', {
    ...props.horario,
    [dia]: { ...diaAtual, [field]: value }
  })
}

const aplicarParaTodos = (diaOrigem: WeekdayId) => {
  const config = props.horario[diaOrigem]
  const novoHorario = { ...props.horario }
  
  WEEK_DAYS.forEach(({ id }) => {
    novoHorario[id] = { 
      ...novoHorario[id], 
      horarioInicio: config.horarioInicio,
      horarioFim: config.horarioFim 
    }
  })
  
  emit('update:horario', novoHorario)
}
</script>

<template>
  <div class="space-y-4">
    <!-- Switch para continuar atendimento -->
    <div class="flex items-center justify-between mb-4">
      <div>
        <Label class="text-sm font-medium">Continuar atendimento automaticamente quando voltar para dentro do horário</Label>
        <p class="text-xs text-muted-foreground">
          Quando ativo, conversas iniciadas fora do horário serão continuadas automaticamente assim que o atendimento voltar a funcionar.
        </p>
      </div>
      <Switch
        :model-value="continuarAtendimento"
        @update:model-value="emit('update:continuarAtendimento', !!$event)"
      />
    </div>

    <div class="space-y-1">
      <Label class="text-sm font-medium">Horário de atendimento</Label>
      <p class="text-xs text-muted-foreground">
        Defina quando este fluxo pode iniciar conversas.
      </p>
    </div>

    <!-- Dias da semana -->
    <div class="space-y-3 border rounded-md bg-background p-3">
      <div
        v-for="{ id, label } in WEEK_DAYS"
        :key="id"
        class="flex flex-col gap-2 relative group"
        @mouseenter="hoveredDia = id"
        @mouseleave="hoveredDia = null"
      >
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-shrink-0">
            <Switch
              :model-value="horario[id].ativo"
              @update:model-value="(val) => updateDia(id, 'ativo', !!val)"
            />
            <span class="text-sm">{{ label }}</span>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <Button
              v-if="hoveredDia === id && horario[id].ativo"
              variant="outline"
              size="sm"
              class="h-7 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
              @click="aplicarParaTodos(id)"
            >
              Replicar
            </Button>
            <TimePicker
              :model-value="horario[id].horarioInicio"
              @update:model-value="updateDia(id, 'horarioInicio', $event)"
              :disabled="!horario[id].ativo"
            />
            <span class="text-xs text-muted-foreground flex-shrink-0">-</span>
            <TimePicker
              :model-value="horario[id].horarioFim"
              @update:model-value="updateDia(id, 'horarioFim', $event)"
              :disabled="!horario[id].ativo"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Mensagem fora do horário -->
    <div class="space-y-2">
      <Label class="text-sm">
        Mensagem fora do horário *
      </Label>
      <Textarea
        :value="horario.mensagemForaHorario"
        @input="updateHorario({ mensagemForaHorario: ($event.target as HTMLTextAreaElement).value })"
        :rows="3"
        :maxlength="1000"
        placeholder="Ex: Estamos fora do horário de atendimento. Retornaremos assim que possível."
      />
      <p class="text-xs text-muted-foreground text-right mt-1">
        {{ (horario.mensagemForaHorario || '').length }}/1000 caracteres
      </p>
    </div>

    <!-- Inativo em ausências -->
    <div class="flex items-center justify-between gap-3">
      <div>
        <Label class="text-sm font-medium">Inativo em dias de ausência</Label>
        <p class="text-xs text-muted-foreground">
          Quando ativo, enviamos a mensagem acima nos dias de ausência.
        </p>
      </div>
      <Switch
        :model-value="horario.inativoFeriados"
        @update:model-value="(val) => updateHorario({ inativoFeriados: !!val })"
      />
    </div>
  </div>
</template>
