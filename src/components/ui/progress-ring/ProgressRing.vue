<template>
  <div class="flex items-center gap-2">
    <div class="relative">
      <!-- Background circle -->
      <svg 
        class="transform -rotate-90" 
        :width="size" 
        :height="size"
      >
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :stroke="trackColor"
          :stroke-width="strokeWidth"
        />
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :stroke="progressColor"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeDashoffset"
          stroke-linecap="round"
          class="transition-all duration-500 ease-out"
        />
      </svg>
      
      <!-- Center content -->
      <div 
        class="absolute inset-0 flex items-center justify-center"
      >
        <slot>
          <span 
            class="font-semibold"
            :class="textSizeClass"
          >
            {{ displayValue }}
          </span>
        </slot>
      </div>
    </div>
    
    <!-- Label -->
    <div v-if="label || $slots.label" class="flex flex-col">
      <slot name="label">
        <span class="text-sm font-medium">{{ label }}</span>
        <span v-if="sublabel" class="text-xs text-muted-foreground">{{ sublabel }}</span>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  progressColor?: string;
  showPercentage?: boolean;
  label?: string;
  sublabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  size: 80,
  strokeWidth: 8,
  trackColor: 'hsl(var(--muted))',
  progressColor: 'hsl(var(--primary))',
  showPercentage: true,
});

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const percentage = computed(() => Math.min(100, Math.max(0, (props.value / props.max) * 100)));
const strokeDashoffset = computed(() => circumference.value - (percentage.value / 100) * circumference.value);

const displayValue = computed(() => {
  if (props.showPercentage) {
    return `${Math.round(percentage.value)}%`;
  }
  return `${props.value}/${props.max}`;
});

const textSizeClass = computed(() => {
  if (props.size < 60) return 'text-xs';
  if (props.size < 100) return 'text-sm';
  return 'text-base';
});
</script>
