<template>
  <div 
    class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all"
    :class="[statusClasses, pulseClass]"
  >
    <span 
      class="w-2 h-2 rounded-full"
      :class="dotClasses"
    />
    <span>{{ label }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type StatusType = 'online' | 'offline' | 'away' | 'busy' | 'typing';

interface Props {
  status: StatusType;
  label?: string;
  pulse?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  pulse: false,
});

const statusConfig = {
  online: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    dot: 'bg-green-500',
    defaultLabel: 'Online',
  },
  offline: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    dot: 'bg-gray-400',
    defaultLabel: 'Offline',
  },
  away: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
    defaultLabel: 'Ausente',
  },
  busy: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
    defaultLabel: 'Ocupado',
  },
  typing: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500 animate-pulse',
    defaultLabel: 'Digitando...',
  },
};

const config = computed(() => statusConfig[props.status]);

const statusClasses = computed(() => `${config.value.bg} ${config.value.text}`);
const dotClasses = computed(() => config.value.dot);
const label = computed(() => props.label || config.value.defaultLabel);

const pulseClass = computed(() => {
  if (props.pulse && props.status === 'online') {
    return 'animate-pulse';
  }
  return '';
});
</script>
