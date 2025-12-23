<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { FileText, Sparkles, RefreshCw, User, Loader2 } from 'lucide-vue-next'
import CollapsibleConfigSection from './CollapsibleConfigSection.vue'
import InformacoesGeraisSection from './sections/InformacoesGeraisSection.vue'
import ModeloIASection from './sections/ModeloIASection.vue'
import RetomadaAutomaticaSection from './sections/RetomadaAutomaticaSection.vue'
import TransferenciaSection from './sections/TransferenciaSection.vue'
import type { FlowConfigData } from '@/types/flow-config'
import { getDefaultFlowConfig } from '@/constants/flow-config-defaults'

interface Agente {
  id: string
  nome: string
}

interface Time {
  id: string
  nome: string
}

interface Props {
  open: boolean
  initialConfig?: Partial<FlowConfigData>
  agentes?: Agente[]
  times?: Time[]
}

const props = withDefaults(defineProps<Props>(), {
  initialConfig: () => ({}),
  agentes: () => [],
  times: () => []
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'save', config: FlowConfigData): void
}>()

// Estado local de configuração
const config = ref<FlowConfigData>(getDefaultFlowConfig())
const isSaving = ref(false)

// Controle de alterações não salvas
const hasUnsavedChanges = ref(false)

// Inicializar com dados existentes
watch(() => props.open, (isOpen) => {
  if (isOpen) {
    config.value = {
      ...getDefaultFlowConfig(),
      ...props.initialConfig
    }
    hasUnsavedChanges.value = false
  }
}, { immediate: true })

// Controle de switches


const retomadaEnabled = computed({
  get: () => config.value.retomada.enabled,
  set: (value: boolean) => {
    config.value.retomada.enabled = value
    hasUnsavedChanges.value = true
  }
})

const transferenciaEnabled = computed({
  get: () => config.value.transferencia.enabled,
  set: (value: boolean) => {
    config.value.transferencia.enabled = value
    hasUnsavedChanges.value = true
  }
})

// Handlers
const handleClose = () => {
  emit('update:open', false)
}

const handleSave = async () => {
  isSaving.value = true
  try {
    emit('save', config.value)
    hasUnsavedChanges.value = false
    emit('update:open', false)
  } finally {
    isSaving.value = false
  }
}

// Marcar como alterado
const markChanged = () => {
  hasUnsavedChanges.value = true
}
</script>

<template>
  <Sheet :open="open" @update:open="emit('update:open', $event)">
    <SheetContent class="!w-[min(600px,95vw)] !max-w-[min(600px,95vw)] p-0" side="right">
      <div class="flex h-full flex-col">
        <SheetHeader class="px-6 pt-6 pb-4 border-b space-y-2 text-left">
          <SheetTitle class="text-lg font-semibold">Configurar Assistente de IA</SheetTitle>
          <SheetDescription class="text-sm text-muted-foreground">
            Ajuste as informações gerais e personalize como o atendimento é encaminhado.
          </SheetDescription>
        </SheetHeader>

        <ScrollArea class="flex-1">
          <div class="px-6 py-4 space-y-4">
            <!-- Seção: Informações Gerais -->
            <CollapsibleConfigSection
              title="Informações Gerais"
              :default-open="true"
            >
              <template #icon>
                <FileText class="h-4 w-4 text-muted-foreground" />
              </template>
              <InformacoesGeraisSection
                :nome="config.nome"
                :descricao="config.descricao"
                @update:nome="config.nome = $event; markChanged()"
                @update:descricao="config.descricao = $event; markChanged()"
              />
            </CollapsibleConfigSection>

            <!-- Seção: Modelo de IA -->
            <CollapsibleConfigSection
              title="Modelo de IA"
              :default-open="false"
              :show-switch="false"
            >
              <template #icon>
                <Sparkles class="h-4 w-4 text-muted-foreground" />
              </template>
              <ModeloIASection />
            </CollapsibleConfigSection>



            <!-- Seção: Retomada Automática -->
            <CollapsibleConfigSection
              title="Retomada Automática"
              :default-open="false"
              v-model:enabled="retomadaEnabled"
            >
              <template #icon>
                <RefreshCw class="h-4 w-4 text-muted-foreground" />
              </template>
              <RetomadaAutomaticaSection
                :config="config.retomada"
                :agentes="agentes"
                :times="times"
                @update:config="config.retomada = $event; markChanged()"
              />
            </CollapsibleConfigSection>

            <!-- Seção: Transferência Automática -->
            <CollapsibleConfigSection
              title="Transferência Automática"
              :default-open="false"
              v-model:enabled="transferenciaEnabled"
            >
              <template #icon>
                <User class="h-4 w-4 text-muted-foreground" />
              </template>
              <TransferenciaSection
                :config="config.transferencia"
                :agentes="agentes"
                :times="times"
                @update:config="config.transferencia = $event; markChanged()"
              />
            </CollapsibleConfigSection>
          </div>
        </ScrollArea>

        <SheetFooter class="px-6 py-4 border-t flex gap-2">
          <Button variant="outline" @click="handleClose" :disabled="isSaving">
            Cancelar
          </Button>
          <Button @click="handleSave" :disabled="isSaving">
            <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            Salvar
          </Button>
        </SheetFooter>
      </div>
    </SheetContent>
  </Sheet>
</template>
