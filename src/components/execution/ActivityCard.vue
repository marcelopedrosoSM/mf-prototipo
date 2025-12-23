<template>
  <div 
    class="w-full group p-4 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md"
    :class="[
      selected && 'ring-2 ring-primary',
      activity.status === 'completed' && 'opacity-60',
      isOverdue && 'border-destructive/50 dark:border-red-500/20',
      compact && 'p-3',
      activity.status === 'pending' && 'cursor-grab active:cursor-grabbing'
    ]"
    :draggable="activity.status === 'pending' || activity.status === 'in_progress'"
    @click="$emit('click', activity)"
    @dragstart="onDragStart"
  >
    <div class="flex items-start w-full gap-3">
      <!-- Checkbox (for list view, only for selectable activities, visible on hover or when selected) -->
      <div 
        v-if="!compact && isSelectable"
        class="pt-0.5 px-1 -ml-1 cursor-pointer flex items-center justify-center w-8 h-8 rounded-md hover:bg-muted/50 transition-all"
        :class="selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
        @click.stop="toggle"
      >
        <Checkbox :model-value="selected" class="pointer-events-none" />
      </div>
      <!-- Spacer for non-selectable activities to maintain alignment -->
      <div v-else-if="!compact" class="w-8 h-8 flex-shrink-0" />
      
      <!-- Icon -->
      <div 
        class="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center"
        :class="iconBgClass"
      >
        <component :is="activityIcon" class="h-5 w-5" :class="iconColorClass" />
      </div>
      
      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <div class="min-w-0 flex-1">
            <h4 class="font-medium text-sm truncate">{{ activity.title }}</h4>
            <div class="flex items-center gap-1.5 mt-0.5">
              <p class="text-xs text-muted-foreground">
                {{ activity.flowName }} • {{ activity.contactName }}
              </p>
            </div>
          </div>
          
          <!-- Step Indicator & Time -->
          <!-- Step Indicator & Time -->
          <div class="flex flex-col items-end gap-1.5 flex-shrink-0">
            <!-- Step Badge -->
            <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border">
              <span class="text-[10px] font-medium text-muted-foreground tracking-wider whitespace-nowrap">
                {{ activity.stepNumber }}/{{ activity.totalSteps }}
              </span>
            </div>

            <!-- Overdue Badge -->
            <div 
              v-if="activity.status === 'pending' && isOverdue"
              :class="['flex items-center gap-1 px-2 py-0.5 rounded-full border border-opacity-20', ACTIVITY_STATUS_METADATA.overdue.bgColorClass, 'border-red-500']"
            >
              <div :class="['w-1.5 h-1.5 rounded-full animate-pulse', ACTIVITY_STATUS_METADATA.overdue.dotClass]" />
              <span :class="['text-[10px] font-bold whitespace-nowrap', ACTIVITY_STATUS_METADATA.overdue.colorClass]">
                {{ overdueText.replace('Atrasado ', '') }}
              </span>
            </div>

            <!-- Completed/Skipped Time -->
            <div v-if="activity.status !== 'pending'" class="flex items-center gap-1.5 whitespace-nowrap px-1">
              <span class="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {{ completedTime }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Description (if not compact) -->
        <p 
          v-if="!compact && activity.description" 
          class="text-xs text-muted-foreground mt-1 line-clamp-1"
        >
          {{ activity.description }}
        </p>
      </div>
      
      <!-- Quick Execute Button -->
      <Button
        v-if="activity.status === 'pending'"
        class="h-8 w-8 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all hover:scale-110 bg-primary hover:bg-primary/90 text-primary-foreground"
        size="icon"
        title="Executar"
        @click.stop="$emit('execute', activity)"
      >
        <Play class="h-3.5 w-3.5 fill-current" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Mail, Phone, MessageSquare, CheckSquare, Workflow, Play } from 'lucide-vue-next';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ACTIVITY_STATUS_METADATA } from '@/constants/activities';
import type { Activity } from '@/types/activity';

const props = defineProps<{
  activity: Activity;
  selected?: boolean;
  compact?: boolean;
}>();

const emit = defineEmits<{
  click: [activity: Activity];
  'toggle-select': [id: string];
  execute: [activity: Activity];
}>();

// Toggle selection
const toggle = () => {
  emit('toggle-select', props.activity.id);
};

// Drag start handler
const onDragStart = (event: DragEvent) => {
  if (event.dataTransfer) {
    event.dataTransfer.setData('activityId', props.activity.id);
    event.dataTransfer.effectAllowed = 'move';
    
    // Create a ghost image if needed, but default is fine
  }
};

// Only pending and in_progress activities can be selected for bulk actions
const isSelectable = computed(() => 
  props.activity.status === 'pending' || props.activity.status === 'in_progress'
);

// Computed
const activityIcon = computed(() => {
  switch (props.activity.type) {
    case 'email': return Mail;
    case 'call': return Phone;
    case 'message': return MessageSquare;
    case 'task': return CheckSquare;
    case 'chat_flow': return Workflow;
    default: return CheckSquare;
  }
});

const iconBgClass = computed(() => {
  switch (props.activity.type) {
    case 'email': return 'bg-blue-100 dark:bg-blue-500/15';
    case 'call': return 'bg-teal-100 dark:bg-teal-500/15';
    case 'message': return 'bg-green-100 dark:bg-green-500/15';
    case 'task': return 'bg-amber-100 dark:bg-amber-500/15';
    case 'chat_flow': return 'bg-violet-100 dark:bg-violet-500/15';
    case 'wait': return 'bg-secondary/10 dark:bg-secondary/20';
    case 'action': return 'bg-indigo-100 dark:bg-indigo-500/15';
    default: return 'bg-muted dark:bg-muted/30';
  }
});

const iconColorClass = computed(() => {
  switch (props.activity.type) {
    case 'email': return 'text-blue-600 dark:text-blue-300';
    case 'call': return 'text-teal-600 dark:text-teal-300';
    case 'message': return 'text-green-600 dark:text-green-300';
    case 'task': return 'text-amber-600 dark:text-amber-300';
    case 'chat_flow': return 'text-violet-600 dark:text-violet-300';
    case 'wait': return 'text-muted-foreground';
    case 'action': return 'text-indigo-600 dark:text-indigo-300';
    default: return 'text-muted-foreground';
  }
});

// Check if overdue (only if dueDate is set)
const isOverdue = computed(() => {
  if (props.activity.status !== 'pending' || !props.activity.dueDate) return false;
  return new Date(props.activity.dueDate) < new Date();
});

// Overdue text for pending activities with dueDate
const overdueText = computed(() => {
  if (!props.activity.dueDate) return '';
  const dueDate = new Date(props.activity.dueDate);
  const now = new Date();
  const overdueMins = Math.floor((now.getTime() - dueDate.getTime()) / 60000);
  if (overdueMins < 60) return `Atrasado ${overdueMins}min`;
  const overdueHours = Math.floor(overdueMins / 60);
  if (overdueHours < 24) return `Atrasado ${overdueHours}h`;
  return `Atrasado ${Math.floor(overdueHours / 24)}d`;
});

// Time since completion (for completed/skipped activities)
const completedTime = computed(() => {
  const referenceDate = props.activity.completedAt || props.activity.updatedAt;
  const date = new Date(referenceDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins}min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  return `há ${diffDays}d`;
});

// Priority badge (Overdue/Today/Future)
// priorityBadge removed as it is no longer used after removing status badges.

// statusVariant removed as it is no longer used after switching from Badge to span.

// statusLabel removed as it is no longer used after removing status badges.
</script>
