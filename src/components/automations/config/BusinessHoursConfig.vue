<template>
  <div class="space-y-4">
    <Tabs default-value="intervals" class="w-full">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="intervals">Horários</TabsTrigger>
        <TabsTrigger value="message">Mensagem de Ausência</TabsTrigger>
      </TabsList>
      
      <TabsContent value="intervals" class="space-y-4 mt-4">
        <div class="space-y-2">
          <Label class="text-sm font-medium">Horário de Atendimento</Label>
          <p class="text-xs text-muted-foreground">
            Configure o período em que o atendimento está disponível.
          </p>
        </div>

        <!-- Single Interval (garantir que sempre existe 1) -->
        <div 
          v-if="currentInterval"
          class="p-3 rounded-lg border bg-muted/20 space-y-3"
        >
          <!-- Interval Name -->
          <div class="space-y-2">
            <Label class="text-xs text-muted-foreground">Nome do Período</Label>
            <Input 
              v-model="currentInterval.label"
              class="h-8 text-sm font-medium"
              placeholder="Horário Comercial"
              @input="emitUpdate"
            />
          </div>

          <!-- Days Selection -->
          <div class="space-y-2">
            <Label class="text-xs text-muted-foreground">Dias da Semana</Label>
            <div class="flex flex-wrap gap-1">
              <button
                v-for="day in WEEK_DAYS"
                :key="day.id"
                class="px-2 py-1 text-xs rounded-md border transition-colors"
                :class="currentInterval.days.includes(day.id) 
                  ? 'bg-primary text-primary-foreground border-primary' 
                  : 'bg-background hover:bg-muted'"
                @click="toggleDay(currentInterval, day.id)"
              >
                {{ day.short }}
              </button>
            </div>
          </div>

          <!-- Time Range -->
          <div class="space-y-2">
            <Label class="text-xs text-muted-foreground">Horário</Label>
            <div class="flex items-center p-1 border rounded-md bg-background focus-within:ring-1 focus-within:ring-ring">
               <div class="flex-1 min-w-0">
                  <TimePicker 
                    v-model="currentInterval.startTime"
                    @update:model-value="emitUpdate"
                    class="border-0 shadow-none focus-visible:ring-0 h-8 px-0 w-full text-center"
                  />
               </div>
               <ArrowRight class="h-3 w-3 text-muted-foreground mx-1 shrink-0" />
               <div class="flex-1 min-w-0">
                  <TimePicker 
                    v-model="currentInterval.endTime"
                    @update:model-value="emitUpdate"
                    class="border-0 shadow-none focus-visible:ring-0 h-8 px-0 w-full text-center"
                  />
               </div>
            </div>
          </div>
        </div>

      </TabsContent>

      <TabsContent value="message" class="space-y-4 mt-4">
        <div class="bg-muted/20 p-4 rounded-lg border space-y-4">
          <div class="space-y-1">
            <h4 class="text-sm font-medium">Mensagem de Ausência</h4>
            <p class="text-xs text-muted-foreground">
              Esta mensagem será enviada automaticamente quando o contato interagir fora do horário de atendimento.
            </p>
          </div>
          
          <MessageConfig 
            :model-value="localAwayMessage" 
            @update:model-value="updateAwayMessage" 
          />
        </div>
      </TabsContent>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import { ArrowRight } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/time-picker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MessageConfig from '@/components/automations/config/MessageConfig.vue';
import { WEEK_DAYS } from '@/constants/flow-config-defaults';
import type { BusinessHoursInterval } from '@/types/automation';
import type { WeekdayId } from '@/types/flow-config';

interface Props {
  intervals: BusinessHoursInterval[];
  awayMessage?: any;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:intervals': [intervals: BusinessHoursInterval[]];
  'update:awayMessage': [message: any];
}>();

// Local copy of intervals for editing (always exactly 1)
const localIntervals = ref<BusinessHoursInterval[]>([]);
const localAwayMessage = ref<any>({});

// Default interval
const DEFAULT_INTERVAL: BusinessHoursInterval = {
  id: 'interval-default',
  label: 'Horário Comercial',
  days: ['seg', 'ter', 'qua', 'qui', 'sex'],
  startTime: '09:00',
  endTime: '18:00',
};

// Current (single) interval
const currentInterval = computed(() => localIntervals.value[0] || null);

onMounted(() => {
  const intervals = props.intervals || [];
  if (intervals.length === 0) {
    // Create default if none exists
    localIntervals.value = [{ ...DEFAULT_INTERVAL }];
  } else {
    // Use first interval only
    localIntervals.value = [JSON.parse(JSON.stringify(intervals[0]))];
  }
  localAwayMessage.value = JSON.parse(JSON.stringify(props.awayMessage || {}));
  emitUpdate();
});

watch(() => props.intervals, (newVal) => {
  if (newVal && newVal.length > 0) {
    localIntervals.value = [JSON.parse(JSON.stringify(newVal[0]))];
  }
}, { deep: true });

watch(() => props.awayMessage, (newVal) => {
  localAwayMessage.value = JSON.parse(JSON.stringify(newVal || {}));
}, { deep: true });

function updateAwayMessage(msg: any) {
  localAwayMessage.value = msg;
  emit('update:awayMessage', msg);
}

function emitUpdate() {
  emit('update:intervals', [...localIntervals.value]);
}

function toggleDay(interval: BusinessHoursInterval, dayId: WeekdayId) {
  const idx = interval.days.indexOf(dayId);
  if (idx === -1) {
    interval.days.push(dayId);
  } else {
    interval.days.splice(idx, 1);
  }
  // Sort days in order
  const order: WeekdayId[] = ['seg', 'ter', 'qua', 'qui', 'sex', 'sab', 'dom'];
  interval.days.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  emitUpdate();
}
</script>
