<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>
          {{ agente ? 'Editar Agente' : 'Novo Agente' }}
        </DialogTitle>
        <DialogDescription>
          {{ agente ? 'Atualize as informações do agente' : 'Preencha os dados para criar um novo agente' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div class="px-6 py-4 space-y-4">
          <!-- Nome -->
          <div class="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              v-model="formData.nome"
              placeholder="Nome do agente"
              :class="errors.nome ? 'border-destructive' : ''"
            />
            <p v-if="errors.nome" class="text-sm text-destructive">{{ errors.nome }}</p>
          </div>

          <!-- E-mail -->
          <div class="space-y-2">
            <Label htmlFor="email">E-mail *</Label>
            <Input
              id="email"
              v-model="formData.email"
              type="email"
              placeholder="email@exemplo.com"
              :class="errors.email ? 'border-destructive' : ''"
            />
            <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
          </div>

          <!-- Telefone -->
          <div class="space-y-2">
            <Label htmlFor="telefone">Telefone</Label>
            <Input
              id="telefone"
              v-model="formData.telefone"
              placeholder="+55 (00) 0 0000-0000"
              @input="formatPhone"
            />
          </div>

          <!-- Times -->
          <div class="space-y-2">
            <Label>Times</Label>
            <div v-if="times.length > 0" ref="timesContainer">
              <Popover :open="timesPopoverOpen" @update:open="setTimesPopoverOpen">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    role="combobox"
                    :aria-expanded="timesPopoverOpen"
                    class="w-full justify-between"
                    :class="errors.times ? 'border-destructive' : ''"
                  >
                    <span v-if="selectedTimes.length === 0" class="text-muted-foreground">
                      Selecione os times...
                    </span>
                    <span v-else class="truncate">
                      {{ selectedTimes.length }} time(s) selecionado(s)
                    </span>
                    <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent 
                  class="p-0" 
                  align="start"
                  :style="popoverWidth ? `width: ${popoverWidth}px; min-width: ${popoverWidth}px; max-width: ${popoverWidth}px;` : ''"
                >
                  <div class="p-1">
                    <div
                      v-for="time in times"
                      :key="time.id"
                      class="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none transition-colors hover:bg-[hsl(var(--interactive-hover-bg))] hover:text-[hsl(var(--interactive-hover-text))] focus:bg-[hsl(var(--interactive-hover-bg))] focus:text-[hsl(var(--interactive-hover-text))] cursor-pointer"
                      @click="() => handleCheckboxUpdate(time.id, !(formData.timesIds?.includes(time.id) ?? false))"
                    >
                      <Checkbox
                        :id="`time-${time.id}`"
                        :checked="formData.timesIds?.includes(time.id) ?? false"
                        @update:checked="(checked) => handleCheckboxUpdate(time.id, checked)"
                        @click.stop
                      />
                      <label
                        :for="`time-${time.id}`"
                        class="flex-1 text-sm font-medium leading-none cursor-pointer"
                      >
                        {{ time.nome }}
                      </label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p v-else class="text-sm text-muted-foreground">
              Nenhum time disponível. Crie times primeiro para vincular agentes.
            </p>
            <p v-if="errors.times" class="text-sm text-destructive">{{ errors.times }}</p>
          </div>
        </div>
      </div>

      <DialogFooter class="flex-shrink-0 px-6 pb-6 pt-4 border-t">
        <Button variant="secondary" @click="handleOpenChange(false)">
          Cancelar
        </Button>
        <Button @click="handleSave" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ agente ? 'Salvar Alterações' : 'Criar Agente' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { Loader2, ChevronsUpDown } from 'lucide-vue-next';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Agente, Time } from '@/mocks/data/agentes';

interface Props {
  open: boolean;
  agente?: Agente | null;
  times: Time[];
  existingAgentes?: Agente[];
}

const props = withDefaults(defineProps<Props>(), {
  agente: null,
  existingAgentes: () => [],
});

const emit = defineEmits<{
  'open-change': [open: boolean];
  save: [agente: Agente];
}>();

const formData = ref<Partial<Agente>>({
  nome: '',
  email: '',
  telefone: '',
  timesIds: [],
});

const errors = ref<Record<string, string>>({});
const isSaving = ref(false);
const timesPopoverOpen = ref(false);
const timesContainer = ref<HTMLElement | null>(null);
const popoverWidth = ref<number | null>(null);

watch(() => props.agente, (newAgente) => {
  if (newAgente) {
    // Garantir que timesIds seja sempre um array novo
    const timesIds = newAgente.timesIds && Array.isArray(newAgente.timesIds) 
      ? [...newAgente.timesIds] 
      : [];
    
    formData.value = {
      nome: newAgente.nome || '',
      email: newAgente.email || '',
      telefone: newAgente.telefone || '',
      timesIds: timesIds,
    };
  } else {
    formData.value = {
      nome: '',
      email: '',
      telefone: '',
      timesIds: [],
    };
  }
  errors.value = {};
}, { immediate: true, deep: true });

function formatPhone(event: Event) {
  const input = event.target as HTMLInputElement;
  let value = input.value.replace(/\D/g, '');
  
  if (value.length > 0) {
    if (value.length <= 2) {
      value = `+55 (${value}`;
    } else if (value.length <= 7) {
      value = `+55 (${value.slice(2, 4)}) ${value.slice(4)}`;
    } else if (value.length <= 11) {
      value = `+55 (${value.slice(2, 4)}) ${value.slice(4, 5)} ${value.slice(5, 9)}-${value.slice(9)}`;
    } else {
      value = `+55 (${value.slice(2, 4)}) ${value.slice(4, 5)} ${value.slice(5, 9)}-${value.slice(9, 13)}`;
    }
  }
  
  formData.value.telefone = value;
}

const selectedTimes = computed(() => {
  return props.times.filter(time => formData.value.timesIds?.includes(time.id) || false);
});

function isTimeSelected(timeId: string): boolean {
  if (!formData.value.timesIds) return false;
  return formData.value.timesIds.includes(timeId);
}

function setTimesPopoverOpen(open: boolean) {
  timesPopoverOpen.value = open;
  if (open) {
    nextTick(() => {
      if (timesContainer.value) {
        const button = timesContainer.value.querySelector('button');
        if (button) {
          popoverWidth.value = button.offsetWidth;
        }
      }
    });
  }
}

function toggleTime(timeId: string) {
  // Garantir que timesIds existe e é um array
  if (!formData.value.timesIds) {
    formData.value.timesIds = [];
  }
  
  // Criar uma cópia do array atual
  const currentValues = [...formData.value.timesIds];
  const index = currentValues.indexOf(timeId);
  
  if (index > -1) {
    // Remover se já existe
    currentValues.splice(index, 1);
  } else {
    // Adicionar se não existe
    currentValues.push(timeId);
  }
  
  // Atualizar com novo array para garantir reatividade
  formData.value.timesIds = currentValues;
}

function handleCheckboxUpdate(timeId: string, checked: boolean) {
  // Garantir que timesIds existe e é um array
  if (!formData.value.timesIds) {
    formData.value.timesIds = [];
  }
  
  // Criar uma cópia do array atual
  const currentValues = [...formData.value.timesIds];
  
  if (checked) {
    // Adicionar se não existe
    if (!currentValues.includes(timeId)) {
      currentValues.push(timeId);
    }
  } else {
    // Remover se existe
    const index = currentValues.indexOf(timeId);
    if (index > -1) {
      currentValues.splice(index, 1);
    }
  }
  
  // Atualizar com novo array para garantir reatividade
  formData.value.timesIds = currentValues;
}


function validate(): boolean {
  errors.value = {};

  if (!formData.value.nome || formData.value.nome.trim() === '') {
    errors.value.nome = 'Nome é obrigatório';
  }

  if (!formData.value.email || formData.value.email.trim() === '') {
    errors.value.email = 'E-mail é obrigatório';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.value.email)) {
      errors.value.email = 'E-mail inválido';
    } else {
      // Check for duplicate email (excluding current agent)
      const duplicate = props.existingAgentes?.find(
        a => a.email === formData.value.email && a.id !== props.agente?.id
      );
      if (duplicate) {
        errors.value.email = 'Este e-mail já está em uso';
      }
    }
  }

  return Object.keys(errors.value).length === 0;
}

function handleSave() {
  if (!validate()) {
    return;
  }

  isSaving.value = true;
  
  // Simulate API call
  setTimeout(() => {
    // Garantir que timesIds seja sempre um novo array
    const timesIds = formData.value.timesIds && Array.isArray(formData.value.timesIds)
      ? [...formData.value.timesIds]
      : [];
    
    emit('save', {
      ...formData.value,
      id: props.agente?.id || '',
      timesIds: timesIds,
    } as Agente);
    isSaving.value = false;
  }, 500);
}

function handleOpenChange(open: boolean) {
  emit('open-change', open);
}
</script>


