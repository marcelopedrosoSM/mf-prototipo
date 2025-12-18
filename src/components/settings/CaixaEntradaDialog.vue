<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>
          {{ caixa ? 'Editar Caixa de Entrada' : 'Nova Caixa de Entrada' }}
        </DialogTitle>
        <DialogDescription>
          {{ caixa ? 'Atualize as informações da caixa de entrada' : 'Preencha os dados para criar uma nova caixa de entrada' }}
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
              placeholder="Nome da caixa de entrada"
              :class="errors.name ? 'border-destructive' : ''"
            />
            <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
          </div>

          <!-- Tipo (apenas na criação) -->
          <div v-if="!isEditMode" class="space-y-2">
            <Label>Tipo *</Label>
            <RadioGroup v-model="formData.tipo" class="flex gap-6">
              <div class="flex items-center space-x-2">
                <RadioGroupItem value="oficial" id="oficial" />
                <Label htmlFor="oficial" class="font-normal cursor-pointer">Oficial</Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem value="nao-oficial" id="nao-oficial" />
                <Label htmlFor="nao-oficial" class="font-normal cursor-pointer">Não Oficial</Label>
              </div>
            </RadioGroup>
          </div>

          <!-- Tipo (apenas na edição - read-only) -->
          <div v-else class="space-y-2">
            <Label>Tipo</Label>
            <div class="text-sm text-muted-foreground">
              {{ formData.tipo === 'oficial' ? 'Oficial' : 'Não Oficial' }}
            </div>
          </div>

          <!-- Campos para inbox oficial -->
          <template v-if="formData.tipo === 'oficial'">
            <!-- Telefone -->
            <div class="space-y-2">
              <Label htmlFor="phoneNumber">Número de telefone</Label>
              <Input
                id="phoneNumber"
                v-model="formData.phoneNumber"
                placeholder="+55 (00) 0 0000-0000"
                :disabled="isEditMode"
                :class="errors.phoneNumber ? 'border-destructive' : ''"
                @input="formatPhone"
              />
              <p v-if="errors.phoneNumber" class="text-sm text-destructive">{{ errors.phoneNumber }}</p>
            </div>

            <!-- Phone Number ID -->
            <div class="space-y-2">
              <Label htmlFor="phoneNumberId">ID do número de telefone <span v-if="!isEditMode">*</span></Label>
              <Input
                id="phoneNumberId"
                v-model="formData.phoneNumberId"
                placeholder="Digite o ID do telefone"
                :disabled="isEditMode"
                :class="errors.phoneNumberId ? 'border-destructive' : ''"
              />
              <p v-if="errors.phoneNumberId" class="text-sm text-destructive">{{ errors.phoneNumberId }}</p>
            </div>

            <!-- Business Account ID -->
            <div class="space-y-2">
              <Label htmlFor="businessAccountId">ID da conta de negócios <span v-if="!isEditMode">*</span></Label>
              <Input
                id="businessAccountId"
                v-model="formData.businessAccountId"
                placeholder="Digite o ID da conta de negócios"
                :disabled="isEditMode"
                :class="errors.businessAccountId ? 'border-destructive' : ''"
              />
              <p v-if="errors.businessAccountId" class="text-sm text-destructive">{{ errors.businessAccountId }}</p>
            </div>

            <!-- API Key -->
            <div class="space-y-2">
              <Label htmlFor="apiKey">Chave da API <span v-if="!isEditMode">*</span></Label>
              <Input
                id="apiKey"
                v-model="formData.apiKey"
                type="password"
                placeholder="Digite a chave da API"
                :disabled="isEditMode"
                :class="errors.apiKey ? 'border-destructive' : ''"
              />
              <p v-if="errors.apiKey" class="text-sm text-destructive">{{ errors.apiKey }}</p>
            </div>
          </template>
        </div>
      </ScrollArea>

      <DialogFooter class="flex-shrink-0 px-6 pb-6 pt-4 border-t">
        <Button variant="secondary" @click="handleOpenChange(false)">
          Cancelar
        </Button>
        <Button @click="handleSave" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          {{ caixa ? 'Salvar Alterações' : 'Criar Caixa de Entrada' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Loader2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import type { CaixaEntradaFormData } from '@/schemas/caixas-entrada';
import type { CaixaEntrada } from '@/types/caixas-entrada';

interface Props {
  open: boolean;
  caixa?: CaixaEntrada | null;
}

const props = withDefaults(defineProps<Props>(), {
  caixa: null,
});

const emit = defineEmits<{
  'open-change': [open: boolean];
  save: [data: CaixaEntradaFormData & { tipo: 'oficial' | 'nao-oficial' }];
}>();

const isEditMode = computed(() => !!props.caixa);

const formData = ref<CaixaEntradaFormData & { tipo: 'oficial' | 'nao-oficial' }>({
  name: '',
  tipo: 'oficial',
  phoneNumber: '',
  phoneNumberId: '',
  apiKey: '',
  businessAccountId: '',
});

const errors = ref<Record<string, string>>({});
const isSaving = ref(false);

watch(() => props.caixa, (newCaixa) => {
  if (newCaixa) {
    formData.value = {
      name: newCaixa.nome || '',
      tipo: newCaixa.tipo,
      phoneNumber: newCaixa.phoneNumber || '',
      phoneNumberId: newCaixa.phoneNumberId || '',
      apiKey: newCaixa.apiKey || '',
      businessAccountId: newCaixa.businessAccountId || '',
    };
  } else {
    formData.value = {
      name: '',
      tipo: 'oficial',
      phoneNumber: '',
      phoneNumberId: '',
      apiKey: '',
      businessAccountId: '',
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
  
  formData.value.phoneNumber = value;
}

function validate(): boolean {
  errors.value = {};
  
  // Para edição, só validar nome
  if (isEditMode.value) {
    if (!formData.value.name || formData.value.name.trim() === '') {
      errors.value.name = 'Nome obrigatório';
      return false;
    }
    return true;
  }
  
  // Para criação, validar baseado no tipo
  if (!formData.value.name || formData.value.name.trim() === '') {
    errors.value.name = 'Nome obrigatório';
    return false;
  }
  
  // Se for oficial, validar campos obrigatórios
  if (formData.value.tipo === 'oficial') {
    if (!formData.value.phoneNumberId || formData.value.phoneNumberId.trim() === '') {
      errors.value.phoneNumberId = 'ID do número de telefone obrigatório';
      return false;
    }
    if (!formData.value.apiKey || formData.value.apiKey.trim() === '') {
      errors.value.apiKey = 'Chave da API obrigatória';
      return false;
    }
    if (!formData.value.businessAccountId || formData.value.businessAccountId.trim() === '') {
      errors.value.businessAccountId = 'ID da conta de negócios obrigatório';
      return false;
    }
    // Validar telefone se preenchido
    if (formData.value.phoneNumber) {
      const replacedDoc = formData.value.phoneNumber.replace(/\D/g, '');
      if (replacedDoc.length < 13) {
        errors.value.phoneNumber = 'Telefone inválido';
        return false;
      }
    }
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
    });
    isSaving.value = false;
  }, 500);
}

function handleOpenChange(open: boolean) {
  emit('open-change', open);
}
</script>


