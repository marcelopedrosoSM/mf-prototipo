<template>
  <div class="space-y-4">
    <Tabs default-value="intervals" class="w-full">
      <TabsList class="grid w-full grid-cols-2">
        <TabsTrigger value="intervals">Horários</TabsTrigger>
        <TabsTrigger value="message">Mensagem de Ausência</TabsTrigger>
      </TabsList>
      
      <TabsContent value="intervals" class="space-y-4 mt-4">
        <div class="space-y-2">
          <Label class="text-sm font-medium">Intervalos de Horário</Label>
          <p class="text-xs text-muted-foreground">
            Configure os períodos de atendimento. Cada intervalo gera uma saída no bloco.
          </p>
        </div>

        <!-- Intervals List -->
        <div class="space-y-3">
          <div 
            v-for="(interval, index) in localIntervals" 
            :key="interval.id"
            class="p-3 rounded-lg border bg-muted/20 space-y-3"
          >
            <!-- Interval Header -->
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div 
                  class="h-3 w-3 rounded-full"
                  :style="{ backgroundColor: '#3B82F6' }"
                />
                <Input 
                  v-model="interval.label"
                  class="h-8 w-40 text-sm font-medium"
                  placeholder="Nome do intervalo"
                  @input="emitUpdate"
                />
              </div>
              <div class="flex items-center gap-1">
                <Button 
                  v-if="localIntervals.length > 1"
                  variant="ghost" 
                  size="icon"
                  class="h-7 w-7"
                  :disabled="index === 0"
                  @click="moveInterval(index, -1)"
                  title="Mover para cima (Aumentar prioridade)"
                >
                  <ArrowUp class="h-4 w-4" />
                </Button>
                <Button 
                  v-if="localIntervals.length > 1"
                  variant="ghost" 
                  size="icon"
                  class="h-7 w-7"
                  :disabled="index === localIntervals.length - 1"
                  @click="moveInterval(index, 1)"
                  title="Mover para baixo (Diminuir prioridade)"
                >
                  <ArrowDown class="h-4 w-4" />
                </Button>
                <Button 
                  v-if="localIntervals.length > 1"
                  variant="ghost" 
                  size="icon"
                  class="h-7 w-7 text-muted-foreground hover:text-destructive"
                  @click="removeInterval(index)"
                  title="Remover intervalo"
                >
                  <Trash2 class="h-4 w-4" />
                </Button>
              </div>
            </div>

            <!-- Days Selection -->
            <div class="space-y-2">
              <Label class="text-xs text-muted-foreground">Dias da Semana</Label>
              <div class="flex flex-wrap gap-1">
                <button
                  v-for="day in WEEK_DAYS"
                  :key="day.id"
                  class="px-2 py-1 text-xs rounded-md border transition-colors"
                  :class="interval.days.includes(day.id) 
                    ? 'bg-primary text-primary-foreground border-primary' 
                    : 'bg-background hover:bg-muted'"
                  @click="toggleDay(interval, day.id)"
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
                      v-model="interval.startTime"
                      @update:model-value="emitUpdate"
                      class="border-0 shadow-none focus-visible:ring-0 h-8 px-0 w-full text-center"
                    />
                 </div>
                 <ArrowRight class="h-3 w-3 text-muted-foreground mx-1 shrink-0" />
                 <div class="flex-1 min-w-0">
                    <TimePicker 
                      v-model="interval.endTime"
                      @update:model-value="emitUpdate"
                      class="border-0 shadow-none focus-visible:ring-0 h-8 px-0 w-full text-center"
                    />
                 </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Add Interval Button -->
        <Button 
          variant="outline" 
          size="sm" 
          class="w-full"
          @click="addInterval"
        >
          <Plus class="h-4 w-4 mr-2" />
          Adicionar Intervalo
        </Button>

        <!-- Info -->
        <div class="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs flex gap-2">
          <AlertTriangle class="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <p class="font-medium text-amber-800 dark:text-amber-400">Ordem de Prioridade</p>
            <p class="text-amber-700 dark:text-amber-500 leading-relaxed">
              Se o horário atual coincidir com múltiplos intervalos, <strong>será considerado apenas o primeiro da lista</strong> (de cima para baixo). Use as setas para ajustar a prioridade.
            </p>
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
import { ref, watch, onMounted } from 'vue';
import { Plus, Trash2, ArrowUp, ArrowDown, AlertTriangle, ArrowRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
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

// Local copy of intervals for editing
const localIntervals = ref<BusinessHoursInterval[]>([]);
const localAwayMessage = ref<any>({});

onMounted(() => {
  localIntervals.value = JSON.parse(JSON.stringify(props.intervals || []));
  localAwayMessage.value = JSON.parse(JSON.stringify(props.awayMessage || {}));
});

watch(() => props.intervals, (newVal) => {
  localIntervals.value = JSON.parse(JSON.stringify(newVal || []));
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

function addInterval() {
  const newInterval: BusinessHoursInterval = {
    id: `interval-${Date.now()}`,
    label: `Intervalo ${localIntervals.value.length + 1}`,
    days: ['seg', 'ter', 'qua', 'qui', 'sex'],
    startTime: '09:00',
    endTime: '18:00',
  };
  localIntervals.value.push(newInterval);
  emitUpdate();
}

function removeInterval(index: number) {
  localIntervals.value.splice(index, 1);
  emitUpdate();
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

function moveInterval(index: number, direction: number) {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= localIntervals.value.length) return;
  
  const temp = localIntervals.value[index];
  localIntervals.value[index] = localIntervals.value[newIndex];
  localIntervals.value[newIndex] = temp;
  
  emitUpdate();
}
</script>
