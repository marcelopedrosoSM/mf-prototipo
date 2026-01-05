<template>
  <Card class="p-6 overflow-hidden">
    <div class="flex items-center justify-between mb-4">
      <div>
        <h3 class="text-sm font-medium text-muted-foreground">{{ title }}</h3>
        <p v-if="subtitle" class="text-xs text-muted-foreground mt-0.5">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </div>
    <div class="h-[200px]">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'vue-chartjs';
import { Card } from '@/components/ui/card';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DataPoint {
  x: number;
  y: number;
  label?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  data: DataPoint[];
  xAxisType?: 'date' | 'number' | 'category';
}

const props = withDefaults(defineProps<Props>(), {
  xAxisType: 'date',
});

const chartData = computed(() => {
  const labels = props.data.map(d => {
    if (props.xAxisType === 'date') {
      const date = new Date(d.x);
      return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
    return d.label || String(d.x);
  });

  return {
    labels,
    datasets: [
      {
        label: props.title,
        data: props.data.map(d => d.y),
        fill: true,
        borderColor: 'hsl(270 54% 55%)',
        backgroundColor: 'hsla(270, 54%, 55%, 0.15)',
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: 'hsl(270 54% 55%)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      }
    ]
  };
});

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'hsl(0 0% 10%)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'hsl(0 0% 25%)',
      borderWidth: 1,
      padding: 12,
      cornerRadius: 8,
      displayColors: false,
    },
  },
  scales: {
    x: {
      grid: {
        color: 'hsla(0, 0%, 50%, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: 'hsl(0 0% 50%)',
        font: {
          size: 11,
        },
      },
    },
    y: {
      grid: {
        color: 'hsla(0, 0%, 50%, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: 'hsl(0 0% 50%)',
        font: {
          size: 11,
        },
        callback: (value: number) => {
          if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
          }
          return value;
        },
      },
      beginAtZero: true,
    },
  },
}));
</script>
