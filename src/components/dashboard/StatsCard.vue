<template>
  <Card class="relative overflow-hidden">
    <div class="p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div 
            class="flex h-10 w-10 items-center justify-center rounded-lg"
            :class="iconBgClass"
          >
            <component :is="icon" class="h-5 w-5" :class="iconClass" />
          </div>
          <div>
            <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
            <p class="text-2xl font-bold">{{ formattedValue }}</p>
          </div>
        </div>
        <div v-if="trend !== undefined" class="flex items-center gap-1" :class="trendClass">
          <TrendingUp v-if="trend > 0" class="h-4 w-4" />
          <TrendingDown v-else-if="trend < 0" class="h-4 w-4" />
          <Minus v-else class="h-4 w-4" />
          <span class="text-sm font-medium">{{ Math.abs(trend) }}%</span>
        </div>
      </div>
      <p v-if="description" class="mt-2 text-xs text-muted-foreground">
        {{ description }}
      </p>
    </div>
    <!-- Decorative gradient -->
    <div 
      class="absolute bottom-0 left-0 right-0 h-1"
      :class="accentClass"
    />
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TrendingUp, TrendingDown, Minus } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';

interface Props {
  title: string;
  value: number | string;
  icon: any;
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'info';
  trend?: number;
  description?: string;
  format?: 'number' | 'currency' | 'percentage';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  format: 'number',
});

const formattedValue = computed(() => {
  if (typeof props.value === 'string') return props.value;
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(props.value);
    case 'percentage':
      return `${props.value}%`;
    default:
      return new Intl.NumberFormat('pt-BR').format(props.value);
  }
});

const iconBgClass = computed(() => {
  const classes: Record<string, string> = {
    primary: 'bg-primary/10',
    success: 'bg-green-500/10',
    warning: 'bg-amber-500/10',
    danger: 'bg-red-500/10',
    info: 'bg-blue-500/10',
  };
  return classes[props.variant];
});

const iconClass = computed(() => {
  const classes: Record<string, string> = {
    primary: 'text-primary',
    success: 'text-green-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
    info: 'text-blue-500',
  };
  return classes[props.variant];
});

const accentClass = computed(() => {
  const classes: Record<string, string> = {
    primary: 'bg-gradient-to-r from-primary/50 to-primary',
    success: 'bg-gradient-to-r from-green-400/50 to-green-500',
    warning: 'bg-gradient-to-r from-amber-400/50 to-amber-500',
    danger: 'bg-gradient-to-r from-red-400/50 to-red-500',
    info: 'bg-gradient-to-r from-blue-400/50 to-blue-500',
  };
  return classes[props.variant];
});

const trendClass = computed(() => {
  if (props.trend === undefined || props.trend === 0) return 'text-muted-foreground';
  return props.trend > 0 ? 'text-green-500' : 'text-red-500';
});
</script>
