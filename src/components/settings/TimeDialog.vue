<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>
          {{ time ? 'Editar Time' : 'Novo Time' }}
        </DialogTitle>
        <DialogDescription>
          {{ time ? 'Atualize as informações do time' : 'Preencha os dados para criar um novo time' }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <div class="px-6 py-4 space-y-4">
          <!-- Nome -->
          <div class="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              v-model="formData.name"
              placeholder="Nome do time"
              :class="errors.name ? 'border-destructive' : ''"
            />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </div>

          <!-- Agentes -->
          <div class="space-y-2">
            <Label>Agentes</Label>
            <div v-if="agentes.length > 0" ref="agentesContainer">
              <Popover :open="agentesPopoverOpen" @update:open="setAgentesPopoverOpen">
                <PopoverTrigger as-child>
                  <Button
                    variant="outline"
                    role="combobox"
                    :aria-expanded="agentesPopoverOpen"
                    class="w-full justify-between"
                  >
                    <span v-if="selectedAgentes.length === 0" class="text-muted-foreground">
                      Selecione os agentes...
                    </span>
                    <span v-else class="truncate">
                      {{ selectedAgentes.length }} agente(s) selecionado(s)
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
                      v-for="agente in agentes"
                      :key="agente.id"
                      class="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground outline-none transition-colors hover:bg-[hsl(var(--interactive-hover-bg))] hover:text-[hsl(var(--interactive-hover-text))] focus:bg-[hsl(var(--interactive-hover-bg))] focus:text-[hsl(var(--interactive-hover-text))] cursor-pointer"
                      @click="() => handleCheckboxUpdate(agente.id, !(formData.users?.includes(agente.id) ?? false))"
                    >
                      <Checkbox
                        :id="`agente-${agente.id}`"
                        :model-value="formData.users?.includes(agente.id) ?? false"
                        @update:model-value="(checked) => handleCheckboxUpdate(agente.id, !!checked)"
                        @click.stop
                      />
                      <label
                        :for="`agente-${agente.id}`"
                        class="flex-1 text-sm font-medium leading-none cursor-pointer"
                      >
                        {{ agente.nome }}
                      </label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <p v-else class="text-sm text-muted-foreground">
              Nenhum agente disponível. Crie agentes primeiro para vincular ao time.
            </p>
          </div>
        </div>
      </ScrollArea>

      <DialogFooter class="flex-shrink-0 px-6 pb-6 pt-4 border-t">
        <Button variant="secondary" @click="handleOpenChange(false)">
          Cancelar
        </Button>
        <Button @click="handleSave" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ time ? 'Salvar Alterações' : 'Criar Time' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { Loader2, ChevronsUpDown } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { timeSchema, type TimeFormData } from '@/schemas/times';
import type { Time } from '@/types/times';
import type { Agente } from '@/mocks/data/agentes';

interface Props {
  open: boolean;
  time?: Time | null;
  agentes: Agente[];
}

const props = withDefaults(defineProps<Props>(), {
  time: null,
});

const emit = defineEmits<{
  'open-change': [open: boolean];
  save: [data: TimeFormData];
}>();

const formData = ref<TimeFormData>({
  name: '',
  users: [],
});

const errors = ref<Record<string, string>>({});
const isSaving = ref(false);
const agentesPopoverOpen = ref(false);
const agentesContainer = ref<HTMLElement | null>(null);
const popoverWidth = ref<number | null>(null);

watch(() => props.time, (newTime) => {
  if (newTime) {
    formData.value = {
      name: newTime.nome || '',
      users: newTime.users ? [...newTime.users] : [],
    };
  } else {
    formData.value = {
      name: '',
      users: [],
    };
  }
  errors.value = {};
}, { immediate: true, deep: true });

const selectedAgentes = computed(() => {
  return props.agentes.filter(agente => formData.value.users?.includes(agente.id) || false);
});

function setAgentesPopoverOpen(open: boolean) {
  agentesPopoverOpen.value = open;
  if (open) {
    nextTick(() => {
      if (agentesContainer.value) {
        const button = agentesContainer.value.querySelector('button');
        if (button) {
          popoverWidth.value = button.offsetWidth;
        }
      }
    });
  }
}

function handleCheckboxUpdate(agenteId: string, checked: boolean) {
  if (!formData.value.users) {
    formData.value.users = [];
  }
  
  const currentValues = [...formData.value.users];
  
  if (checked) {
    if (!currentValues.includes(agenteId)) {
      currentValues.push(agenteId);
    }
  } else {
    const index = currentValues.indexOf(agenteId);
    if (index > -1) {
      currentValues.splice(index, 1);
    }
  }
  
  formData.value.users = currentValues;
}

function validate(): boolean {
  errors.value = {};
  
  const result = timeSchema.safeParse(formData.value);
  
  if (!result.success) {
    result.error.errors.forEach((error) => {
      if (error.path[0]) {
        errors.value[error.path[0] as string] = error.message;
      }
    });
    return false;
  }
  
  return true;
}

function handleSave() {
  if (!validate()) {
    return;
  }

  isSaving.value = true;
  
  // Simulate API call
  setTimeout(() => {
    emit('save', {
      ...formData.value,
      users: formData.value.users || [],
    });
    isSaving.value = false;
  }, 500);
}

function handleOpenChange(open: boolean) {
  emit('open-change', open);
}
</script>


