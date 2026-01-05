<template>
  <Card class="p-6 flex flex-col" style="height: 296px;">
    <!-- Header -->
    <div class="mb-4">
      <h3 class="text-sm font-medium text-muted-foreground">{{ title }}</h3>
      <p v-if="subtitle" class="text-xs text-muted-foreground mt-0.5">{{ subtitle }}</p>
    </div>
    
    <!-- Content -->
    <div class="flex items-center gap-6 flex-1 min-h-0">
      <!-- Donut Container -->
      <div class="w-32 h-32 flex-shrink-0">
        <svg viewBox="0 0 100 100" class="w-full h-full">
          <g transform="translate(50, 50)">
            <path
              v-for="(segment, index) in computedSegments"
              :key="index"
              :d="segment.path"
              :fill="segment.color"
            />
          </g>
        </svg>
      </div>
      
      <!-- Legend -->
      <div class="flex-1 space-y-2">
        <div 
          v-for="segment in chartData" 
          :key="segment.label"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2">
            <div 
              class="h-3 w-3 rounded-full flex-shrink-0" 
              :style="{ backgroundColor: segment.color }"
            />
            <span class="text-sm">{{ segment.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm font-medium">{{ segment.value }}</span>
            <span class="text-xs text-muted-foreground">({{ segment.percentage }}%)</span>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Card } from '@/components/ui/card';

interface ChartSegment {
  label: string;
  value: number;
  color: string;
  percentage?: number;
}

interface Props {
  title: string;
  subtitle?: string;
  data: ChartSegment[];
}

const props = defineProps<Props>();

const chartData = computed(() => {
  const total = props.data.reduce((sum, d) => sum + d.value, 0);
  return props.data.map(d => ({
    ...d,
    percentage: total > 0 ? Math.round((d.value / total) * 100) : 0,
  }));
});

// Custom SVG donut chart
const computedSegments = computed(() => {
  const total = props.data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return [];
  
  const radius = 40;
  const innerRadius = 25;
  let currentAngle = -Math.PI / 2; // Start from top
  
  return props.data.map(segment => {
    const angle = (segment.value / total) * Math.PI * 2;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;
    
    // Calculate arc path
    const x1 = Math.cos(startAngle) * radius;
    const y1 = Math.sin(startAngle) * radius;
    const x2 = Math.cos(endAngle) * radius;
    const y2 = Math.sin(endAngle) * radius;
    const x3 = Math.cos(endAngle) * innerRadius;
    const y3 = Math.sin(endAngle) * innerRadius;
    const x4 = Math.cos(startAngle) * innerRadius;
    const y4 = Math.sin(startAngle) * innerRadius;
    
    const largeArc = angle > Math.PI ? 1 : 0;
    
    const path = [
      `M ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${x3} ${y3}`,
      `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${x4} ${y4}`,
      'Z'
    ].join(' ');
    
    return {
      path,
      color: segment.color,
    };
  });
});
</script>
