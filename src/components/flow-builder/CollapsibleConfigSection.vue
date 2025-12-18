<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Switch } from '@/components/ui/switch'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  title: string
  defaultOpen?: boolean
  disabled?: boolean
  showSwitch?: boolean // Prop explícita para controlar se o switch deve ser mostrado
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  disabled: false,
  showSwitch: undefined // undefined = detectar automaticamente
})

// Usar defineModel apenas se enabled foi passado via v-model
const enabledModel = defineModel<boolean>('enabled', { required: false })

const isOpen = ref(props.defaultOpen)
const modelWasInitialized = ref(false)

// Watch para detectar se o modelo foi realmente inicializado
// Se o valor mudar de undefined para qualquer outro valor, significa que foi passado
watch(() => enabledModel.value, (newVal, oldVal) => {
  if (oldVal === undefined && newVal !== undefined) {
    modelWasInitialized.value = true
  } else if (newVal !== undefined) {
    modelWasInitialized.value = true
  }
}, { immediate: true })

// Verificar se o switch deve ser mostrado
// Se showSwitch foi passado explicitamente, usa esse valor
// Caso contrário, verifica se v-model:enabled foi passado
const hasSwitch = computed(() => {
  // Se showSwitch foi passado explicitamente, usa esse valor
  if (props.showSwitch !== undefined) {
    return props.showSwitch
  }
  
  // Caso contrário, verifica se v-model:enabled foi passado
  // Se o modelo foi inicializado (não é undefined), significa que foi passado
  return modelWasInitialized.value && enabledModel.value !== undefined
})

const enabled = computed({
  get: () => enabledModel.value ?? true,
  set: (value: boolean) => {
    if (hasSwitch.value && enabledModel.value !== undefined) {
      enabledModel.value = value
    }
  }
})

// Fechar/Abrir automaticamente baseado no estado do switch
watch(() => enabled.value, (val) => {
  if (hasSwitch.value) {
    if (val === false) {
      isOpen.value = false
    } else if (val === true) {
      isOpen.value = true
    }
  }
})

const canToggle = computed(() => {
  if (!hasSwitch.value) return true
  return (enabled.value !== false) && !props.disabled
})

const handleToggle = (open: boolean) => {
  if (canToggle.value || !open) {
    isOpen.value = open
  }
}


</script>

<template>
  <Collapsible
    :open="isOpen"
    @update:open="handleToggle"
    class="border border-dashed rounded-lg bg-muted/40"
  >
    <div class="flex items-center gap-2">
      <!-- Com Switch -->
      <template v-if="hasSwitch">
        <div class="flex items-center gap-2 flex-1">
          <CollapsibleTrigger as-child>
            <button
              type="button"
              :disabled="!canToggle"
              :class="cn(
                'flex items-center justify-between flex-1 p-4 hover:bg-muted/50 transition-colors rounded-lg text-left',
                !canToggle && 'opacity-60 cursor-not-allowed'
              )"
              @click="(e: MouseEvent) => { if (!canToggle) { e.preventDefault(); e.stopPropagation(); } }"
            >
              <div class="flex items-center gap-2">
                <slot name="icon" />
                <span class="font-medium text-sm">{{ title }}</span>
              </div>
              <ChevronDown v-if="isOpen" class="h-4 w-4 text-muted-foreground" />
              <ChevronRight v-else class="h-4 w-4 text-muted-foreground" />
            </button>
          </CollapsibleTrigger>
          <div @click.stop class="pr-2 flex-shrink-0">
            <Switch v-model="enabled" />
          </div>
        </div>
      </template>

      <!-- Sem Switch -->
      <template v-else>
        <CollapsibleTrigger as-child>
          <button
            type="button"
            class="flex items-center justify-between w-full p-4 hover:bg-muted/50 transition-colors rounded-lg text-left"
          >
            <div class="flex items-center gap-2">
              <slot name="icon" />
              <span class="font-medium text-sm">{{ title }}</span>
            </div>
            <ChevronDown v-if="isOpen" class="h-4 w-4 text-muted-foreground" />
            <ChevronRight v-else class="h-4 w-4 text-muted-foreground" />
          </button>
        </CollapsibleTrigger>
      </template>
    </div>

    <CollapsibleContent class="px-4 pb-4 space-y-4">
      <slot />
    </CollapsibleContent>
  </Collapsible>
</template>
