<template>
  <AlertDialog v-model:open="isOpen">
    <AlertDialogContent>
      <AlertDialogHeader>
        <div class="flex items-center gap-3 mb-2">
          <div 
            class="h-10 w-10 rounded-full flex items-center justify-center"
            :class="iconBackgroundClass"
          >
            <component 
              :is="iconComponent" 
              class="h-5 w-5" 
              :class="iconColorClass"
            />
          </div>
          <AlertDialogTitle>{{ title }}</AlertDialogTitle>
        </div>
        <AlertDialogDescription>
          {{ description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      
      <!-- Preview of what will be affected -->
      <div v-if="affectedItems && affectedItems.length > 0" class="my-4">
        <p class="text-sm text-muted-foreground mb-2">Itens afetados:</p>
        <div class="max-h-32 overflow-y-auto space-y-1">
          <div 
            v-for="(item, index) in affectedItems.slice(0, 5)" 
            :key="index"
            class="text-sm px-3 py-1.5 bg-muted rounded-md"
          >
            {{ item }}
          </div>
          <div 
            v-if="affectedItems.length > 5" 
            class="text-xs text-muted-foreground px-3"
          >
            + {{ affectedItems.length - 5 }} mais...
          </div>
        </div>
      </div>
      
      <AlertDialogFooter>
        <AlertDialogCancel :disabled="loading">
          {{ cancelText }}
        </AlertDialogCancel>
        <AlertDialogAction 
          :class="actionButtonClass"
          :disabled="loading"
          @click="handleConfirm"
        >
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          {{ confirmText }}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Trash2, AlertTriangle, Archive, Ban, Loader2 } from 'lucide-vue-next'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type ActionType = 'delete' | 'archive' | 'warning' | 'danger'

interface Props {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  actionType?: ActionType
  affectedItems?: string[]
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  actionType: 'warning',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  'confirm': []
  'cancel': []
}>()

const loading = ref(false)

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const iconComponent = computed(() => {
  switch (props.actionType) {
    case 'delete': return Trash2
    case 'archive': return Archive
    case 'danger': return Ban
    default: return AlertTriangle
  }
})

const iconBackgroundClass = computed(() => {
  switch (props.actionType) {
    case 'delete': return 'bg-red-100 dark:bg-red-900/30'
    case 'archive': return 'bg-amber-100 dark:bg-amber-900/30'
    case 'danger': return 'bg-red-100 dark:bg-red-900/30'
    default: return 'bg-amber-100 dark:bg-amber-900/30'
  }
})

const iconColorClass = computed(() => {
  switch (props.actionType) {
    case 'delete': return 'text-red-600 dark:text-red-400'
    case 'archive': return 'text-amber-600 dark:text-amber-400'
    case 'danger': return 'text-red-600 dark:text-red-400'
    default: return 'text-amber-600 dark:text-amber-400'
  }
})

const actionButtonClass = computed(() => {
  switch (props.actionType) {
    case 'delete':
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white'
    default:
      return ''
  }
})

const handleConfirm = async () => {
  loading.value = true
  emit('confirm')
  // Parent should close the dialog after async operation
}

// Reset loading when dialog closes
const resetLoading = () => {
  loading.value = false
}

defineExpose({ resetLoading })
</script>
