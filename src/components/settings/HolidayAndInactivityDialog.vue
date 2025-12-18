<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>
          {{ item ? 'Editar Feriado/Inatividade' : 'Novo Feriado/Inatividade' }}
        </DialogTitle>
        <DialogDescription>
          {{ item ? 'Atualize as informações do feriado ou inatividade' : 'Preencha os dados para criar um novo feriado ou inatividade' }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-4">
        <div class="space-y-2">
          <Label for="name">Nome *</Label>
          <Input
            id="name"
            v-model="formData.name"
            placeholder="Digite o nome do feriado ou inatividade"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="date">Data *</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="[
                  'w-full justify-start text-left font-normal',
                  !displayDate && 'text-muted-foreground'
                ]"
              >
                <CalendarIcon class="mr-2 h-4 w-4" />
                {{ displayDate || 'DD/MM/AAAA' }}
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0" align="start">
              <Calendar
                v-model="selectedDate"
                @update:model-value="handleDateSelect"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div class="space-y-2">
          <Label for="type">Tipo *</Label>
          <Select v-model="formData.type" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="holiday">Feriado</SelectItem>
              <SelectItem value="inactivity">Inatividade</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="periodicity">Periodicidade *</Label>
          <Select v-model="formData.periodicity" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione a periodicidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="annual">Anual</SelectItem>
              <SelectItem value="one-time">Único</SelectItem>
            </SelectContent>
          </Select>
        </div>
        </form>
      </ScrollArea>

      <DialogFooter class="flex-shrink-0 px-6 pb-6 pt-4 border-t">
        <Button type="button" variant="outline" @click="handleCancel">
          Cancelar
        </Button>
        <Button type="submit" @click="handleSubmit">
          {{ item ? 'Salvar' : 'Criar' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { CalendarIcon } from 'lucide-vue-next';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatDate } from '@/utils/date';
import type { HolidayAndInactivity, HolidayAndInactivityType, HolidayAndInactivityPeriodicity } from '@/types/holidays-and-inactivities';
import { DEFAULT_HOLIDAY_AND_INACTIVITY } from '@/types/holidays-and-inactivities';

interface Props {
  open: boolean;
  item?: HolidayAndInactivity | null;
}

const props = withDefaults(defineProps<Props>(), {
  item: null,
});

const emit = defineEmits<{
  'update:open': [open: boolean];
  save: [data: Omit<HolidayAndInactivity, 'id' | 'createdAt'>];
}>();

const formData = ref<{
  name: string;
  date: string;
  type: HolidayAndInactivityType;
  periodicity: HolidayAndInactivityPeriodicity;
}>({
  name: '',
  date: '',
  type: 'holiday',
  periodicity: 'one-time',
});

// Date picker state
const selectedDate = ref<Date | undefined>(undefined);
const displayDate = computed(() => {
  if (!formData.value.date) return '';
  return formatDate(formData.value.date);
});

function handleDateSelect(date: Date | undefined) {
  if (date) {
    // Convert Date to YYYY-MM-DD format for storage
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    formData.value.date = `${year}-${month}-${day}`;
  } else {
    formData.value.date = '';
  }
}

watch(
  () => props.item,
  (newItem) => {
    if (newItem) {
      formData.value = {
        name: newItem.name,
        date: newItem.date,
        type: newItem.type,
        periodicity: newItem.periodicity,
      };
    } else {
      formData.value = {
        name: DEFAULT_HOLIDAY_AND_INACTIVITY.name,
        date: DEFAULT_HOLIDAY_AND_INACTIVITY.date || new Date().toISOString().split('T')[0],
        type: DEFAULT_HOLIDAY_AND_INACTIVITY.type,
        periodicity: DEFAULT_HOLIDAY_AND_INACTIVITY.periodicity,
      };
    }
    // Sync selectedDate with formData.date
    if (formData.value.date) {
      const date = new Date(formData.value.date);
      if (!isNaN(date.getTime())) {
        selectedDate.value = date;
      }
    } else {
      selectedDate.value = undefined;
    }
  },
  { immediate: true }
);

// Sync selectedDate when formData.date changes
watch(() => formData.value.date, (dateString) => {
  if (dateString) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      selectedDate.value = date;
    }
  } else {
    selectedDate.value = undefined;
  }
});

function handleOpenChange(open: boolean) {
  emit('update:open', open);
}

function handleCancel() {
  handleOpenChange(false);
}

function handleSubmit() {
  emit('save', formData.value);
  handleOpenChange(false);
}
</script>


