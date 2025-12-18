<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>
          {{ flow ? 'Editar Fluxo' : 'Novo Fluxo' }}
        </DialogTitle>
        <DialogDescription>
          {{ flow ? 'Atualize as informações do fluxo' : 'Preencha os dados para criar um novo fluxo' }}
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
        <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-4">
        <div class="space-y-2">
          <Label for="nome">Nome *</Label>
          <Input
            id="nome"
            v-model="formData.nome"
            placeholder="Digite o nome do fluxo"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="descricao">Descrição</Label>
          <Textarea
            id="descricao"
            v-model="formData.descricao"
            placeholder="Digite uma descrição para o fluxo (opcional)"
            rows="3"
          />
        </div>

        <div class="space-y-2">
          <Label for="status">Status *</Label>
          <Select v-model="formData.status" required>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ativo">Ativo</SelectItem>
              <SelectItem value="inativo">Inativo</SelectItem>
              <SelectItem value="rascunho">Rascunho</SelectItem>
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
          {{ flow ? 'Salvar' : 'Criar' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
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
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Flow, FlowStatus } from '@/mocks/data/flows';

interface Props {
  open: boolean;
  flow?: Flow | null;
  flowType: 'atendimento' | 'atividades';
}

const props = withDefaults(defineProps<Props>(), {
  flow: null,
});

const emit = defineEmits<{
  'update:open': [open: boolean];
  save: [data: Omit<Flow, 'id' | 'createdAt' | 'updatedAt'>];
}>();

const formData = ref<{
  nome: string;
  descricao: string;
  status: FlowStatus;
}>({
  nome: '',
  descricao: '',
  status: 'rascunho',
});

watch(
  () => props.flow,
  (newFlow) => {
    if (newFlow) {
      formData.value = {
        nome: newFlow.nome,
        descricao: newFlow.descricao || '',
        status: newFlow.status,
      };
    } else {
      formData.value = {
        nome: '',
        descricao: '',
        status: 'rascunho',
      };
    }
  },
  { immediate: true }
);

function handleOpenChange(open: boolean) {
  emit('update:open', open);
}

function handleCancel() {
  handleOpenChange(false);
}

function handleSubmit() {
  emit('save', {
    ...formData.value,
    tipo: props.flowType,
  });
  handleOpenChange(false);
}
</script>


