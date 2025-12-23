<template>
  <Teleport to="body">
    <Transition name="bottom-sheet">
      <div 
        v-if="open" 
        class="fixed inset-0 z-50"
        @keydown.escape="$emit('close')"
        @keydown.left="$emit('previous')"
        @keydown.right="$emit('next')"
      >
        <!-- Overlay -->
        <div 
          class="absolute inset-0 bg-black/50 backdrop-blur-sm"
          @click="$emit('close')"
        />
        
        <!-- Bottom Sheet -->
        <div 
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-[95vh] bg-background rounded-t-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
            <div class="flex items-center gap-3">
              <!-- Navigation Arrows -->
              <div class="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8"
                  :disabled="!hasPrevious"
                  @click="$emit('previous')"
                  title="Anterior (←)"
                >
                  <ChevronLeft class="h-4 w-4" />
                </Button>
                <span class="text-xs text-muted-foreground min-w-[60px] text-center">
                  {{ currentIndex + 1 }} / {{ totalCount }}
                </span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  class="h-8 w-8"
                  :disabled="!hasNext"
                  @click="$emit('next')"
                  title="Próximo (→)"
                >
                  <ChevronRight class="h-4 w-4" />
                </Button>
              </div>
              
              <!-- Title -->
              <div class="flex items-center gap-2">
                <div 
                  class="h-8 w-8 rounded-full flex items-center justify-center"
                  :class="iconBgClass"
                >
                  <component :is="activityIcon" class="h-4 w-4" :class="iconColorClass" />
                </div>
                <div>
                  <h2 class="font-semibold">{{ title }}</h2>
                  <p class="text-xs text-muted-foreground">{{ subtitle }}</p>
                </div>
              </div>
            </div>
            
            <!-- Close Button -->
            <Button 
              variant="ghost" 
              size="icon" 
              class="h-8 w-8"
              @click="$emit('close')"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
          
          <!-- Content -->
          <ScrollArea class="flex-1">
            <slot />
          </ScrollArea>
          
          <!-- Footer with Actions -->
          <div class="px-6 py-4 border-t bg-muted/20">
            <slot name="actions" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { X, ChevronLeft, ChevronRight, Mail, Phone, MessageSquare, CheckSquare, Workflow } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const props = defineProps<{
  open: boolean;
  title: string;
  subtitle?: string;
  activityType?: string;
  currentIndex?: number;
  totalCount?: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  previous: [];
  next: [];
}>();

// Keyboard navigation
const handleKeydown = (e: KeyboardEvent) => {
  if (!props.open) return;
  
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'ArrowLeft' && props.hasPrevious) {
    emit('previous');
  } else if (e.key === 'ArrowRight' && props.hasNext) {
    emit('next');
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

// Icon based on activity type
const activityIcon = computed(() => {
  switch (props.activityType) {
    case 'email': return Mail;
    case 'call': return Phone;
    case 'message': return MessageSquare;
    case 'task': return CheckSquare;
    case 'chat_flow': return Workflow;
    default: return CheckSquare;
  }
});

const iconBgClass = computed(() => {
  switch (props.activityType) {
    case 'email': return 'bg-blue-100 dark:bg-blue-900/30';
    case 'call': return 'bg-green-100 dark:bg-green-900/30';
    case 'message': return 'bg-purple-100 dark:bg-purple-900/30';
    case 'task': return 'bg-orange-100 dark:bg-orange-900/30';
    case 'chat_flow': return 'bg-cyan-100 dark:bg-cyan-900/30';
    default: return 'bg-gray-100 dark:bg-gray-900/30';
  }
});

const iconColorClass = computed(() => {
  switch (props.activityType) {
    case 'email': return 'text-blue-600';
    case 'call': return 'text-green-600';
    case 'message': return 'text-purple-600';
    case 'task': return 'text-orange-600';
    case 'chat_flow': return 'text-cyan-600';
    default: return 'text-gray-600';
  }
});
</script>

<style scoped>
.bottom-sheet-enter-from,
.bottom-sheet-leave-to {
  opacity: 0;
}

.bottom-sheet-enter-from .absolute.bottom-0,
.bottom-sheet-leave-to .absolute.bottom-0 {
  transform: translateX(-50%) translateY(100%);
}

.bottom-sheet-enter-active,
.bottom-sheet-leave-active {
  transition: opacity 0.3s ease;
}

.bottom-sheet-enter-active .absolute.bottom-0,
.bottom-sheet-leave-active .absolute.bottom-0 {
  transition: transform 0.3s ease;
}
</style>
