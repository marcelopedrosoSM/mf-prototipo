<template>
  <ToastRoot
    :class="cn(
      'group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full z-[101]',
      toastVariants({ variant: props.variant }),
      props.class
    )"
    :duration="duration"
    :open="open"
    @update:open="handleOpenChange"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    v-bind="$attrs"
  >
    <!-- Ícone -->
    <div :class="cn('flex-shrink-0 mt-0.5', iconColorClass)">
      <component :is="iconComponent" class="h-5 w-5" />
    </div>
    
    <!-- Conteúdo -->
    <div class="flex-1 min-w-0">
      <slot />
    </div>
    
    <!-- Barra de progresso -->
    <div
      v-if="duration > 0"
      class="absolute bottom-0 left-0 right-0 h-1 bg-foreground/10 overflow-hidden"
    >
      <div
        :class="cn('h-full transition-all ease-linear', progressBarColorClass)"
        :style="{
          width: `${progressPercentage}%`,
          transitionDuration: isPaused ? '0ms' : '100ms'
        }"
      />
    </div>
  </ToastRoot>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { ToastRoot } from 'radix-vue'
import { CheckCircle2, Info, AlertTriangle, XCircle, Bell } from 'lucide-vue-next'
import { cn } from '@/utils'
import { cva } from 'class-variance-authority'

const toastVariants = cva('', {
  variants: {
    variant: {
      default: 'border bg-card text-card-foreground',
      success: 'border-success/20 bg-card text-foreground',
      destructive: 'border-destructive/20 bg-card text-foreground',
      info: 'border-info/20 bg-card text-foreground',
      warning: 'border-warning/20 bg-card text-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

interface Props {
  variant?: 'default' | 'success' | 'destructive' | 'info' | 'warning'
  duration?: number
  class?: string
  open?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  duration: 5000,
  class: '',
  open: true,
})

const emit = defineEmits<{
  (e: 'update:open', value: boolean): void
}>()

const handleOpenChange = (value: boolean) => {
  emit('update:open', value)
}

// Ícones por variante
const iconComponent = computed(() => {
  switch (props.variant) {
    case 'success':
      return CheckCircle2
    case 'info':
      return Info
    case 'warning':
      return AlertTriangle
    case 'destructive':
      return XCircle
    default:
      return Bell
  }
})

// Cor do ícone por variante
const iconColorClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'text-success'
    case 'info':
      return 'text-info'
    case 'warning':
      return 'text-warning'
    case 'destructive':
      return 'text-destructive'
    default:
      return 'text-primary'
  }
})

// Cor da barra de progresso por variante
const progressBarColorClass = computed(() => {
  switch (props.variant) {
    case 'success':
      return 'bg-success'
    case 'info':
      return 'bg-info'
    case 'warning':
      return 'bg-warning'
    case 'destructive':
      return 'bg-destructive'
    default:
      return 'bg-primary'
  }
})

// Progresso da barra (0-100%)
const progressPercentage = ref(100)
const isPaused = ref(false)
let progressInterval: ReturnType<typeof setInterval> | null = null
let startTime = 0
let remainingTime = 0

const updateProgress = () => {
  if (!props.open || isPaused.value) {
    return
  }
  
  const elapsed = Date.now() - startTime
  remainingTime = Math.max(0, props.duration - elapsed)
  progressPercentage.value = (remainingTime / props.duration) * 100
  
  if (remainingTime <= 0) {
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
  }
}

onMounted(() => {
  if (props.duration > 0 && props.open) {
    startTime = Date.now()
    remainingTime = props.duration
    progressInterval = setInterval(updateProgress, 50) // Atualiza a cada 50ms
  }
})

// Pausar quando o mouse estiver sobre o toast
const handleMouseEnter = () => {
  if (progressInterval && !isPaused.value && props.open) {
    isPaused.value = true
  }
}

const handleMouseLeave = () => {
  if (isPaused.value && props.open && progressInterval) {
    // Ajustar o tempo restante baseado no tempo pausado
    startTime = Date.now() - (props.duration - remainingTime)
    isPaused.value = false
  }
}

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
})
</script>
