<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-3xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>Cadastrar token de API</DialogTitle>
        <DialogDescription>
          Preencha os dados para criar um novo token de API
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <div class="px-6 py-4 space-y-4">
          <!-- Título -->
          <div class="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              v-model="formData.title"
              placeholder="Digite o título para identificar o token"
              :class="errors.title ? 'border-destructive' : ''"
            />
            <p v-if="errors.title" class="text-sm text-destructive">{{ errors.title }}</p>
          </div>

          <!-- Data de Expiração -->
          <div class="space-y-2">
            <Label htmlFor="expiresAt">Data de expiração (opcional)</Label>
            <Input
              id="expiresAt"
              v-model="formData.expiresAt"
              type="date"
              placeholder="Selecione a data de expiração"
              :min="minExpirationDate"
              :max="maxExpirationDate"
              :class="errors.expiresAt ? 'border-destructive' : ''"
            />
            <p v-if="errors.expiresAt" class="text-sm text-destructive">{{ errors.expiresAt }}</p>
          </div>

          <!-- Permissões -->
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <Label>Permissões</Label>
              <div class="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="selectProfile('na')"
                >
                  Nenhuma
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="selectProfile('read')"
                >
                  Leitura
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  @click="selectProfile('all')"
                >
                  Todas
                </Button>
              </div>
            </div>

            <div class="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead class="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="group in permissionGroups" :key="group.name">
                    <TableCell class="font-medium">{{ group.name }}</TableCell>
                    <TableCell>
                      <RadioGroup
                        :model-value="getSelectedPermissionId(group.name)"
                        @update:model-value="(value) => handlePermissionChange(group.name, value as number)"
                        class="flex flex-col gap-2"
                      >
                        <div
                          v-for="permission in group.permissions"
                          :key="permission.id"
                          class="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            :value="permission.id"
                            :id="`permission-${permission.id}`"
                          />
                          <Label
                            :for="`permission-${permission.id}`"
                            class="font-normal cursor-pointer text-sm"
                          >
                            {{ permission.type === 'read' ? 'Leitura' : 'Escrita' }}
                          </Label>
                        </div>
                      </RadioGroup>
                    </TableCell>
                    <TableCell class="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        @click="clearGroup(group.name)"
                      >
                        Limpar
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter class="flex-shrink-0 px-6 pb-6 pt-4 border-t">
        <Button variant="secondary" @click="handleOpenChange(false)">
          Cancelar
        </Button>
        <Button @click="handleSave" :disabled="isSaving">
          <Loader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
          Gerar token
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { tokenApiSchema, type TokenApiFormData } from '@/schemas/tokens-api';
import { getPermissions, type PermissionGroup } from '@/mocks/data/tokens-api';
import type { PermissionProfileOption, SelectedPermissions } from '@/types/tokens-api';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'open-change': [open: boolean];
  save: [data: TokenApiFormData];
}>();

const permissionGroups = ref<PermissionGroup[]>(getPermissions());
const selectedPermissions = ref<SelectedPermissions>({});

const formData = ref<TokenApiFormData>({
  title: '',
  expiresAt: '',
  permissionIds: [],
});

const errors = ref<Record<string, string>>({});
const isSaving = ref(false);

// Date limits
const minExpirationDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
});

const maxExpirationDate = computed(() => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  return maxDate.toISOString().split('T')[0];
});

watch(() => props.open, (opened) => {
  if (opened) {
    formData.value = {
      title: '',
      expiresAt: '',
      permissionIds: [],
    };
    selectedPermissions.value = {};
    errors.value = {};
    selectProfile('all');
  }
});

function getSelectedPermissionId(groupName: string): number | undefined {
  return selectedPermissions.value[groupName];
}

function handlePermissionChange(groupName: string, permissionId: number) {
  selectedPermissions.value[groupName] = permissionId;
  updatePermissionIds();
}

function clearGroup(groupName: string) {
  delete selectedPermissions.value[groupName];
  updatePermissionIds();
}

function updatePermissionIds() {
  formData.value.permissionIds = Object.values(selectedPermissions.value)
    .filter((id): id is number => id !== undefined);
}

function getPermission(permissions: PermissionGroup['permissions'], type: 'read' | 'write') {
  return permissions.find((p) => p.type === type)?.id;
}

function selectProfile(profile: PermissionProfileOption) {
  switch (profile) {
    case 'na':
      selectedPermissions.value = {};
      break;
    case 'read':
      selectedPermissions.value = permissionGroups.value.reduce((values, { name, permissions }) => {
        const readId = getPermission(permissions, 'read');
        if (readId) {
          values[name] = readId;
        }
        return values;
      }, {} as SelectedPermissions);
      break;
    case 'all':
      selectedPermissions.value = permissionGroups.value.reduce((values, { name, permissions }) => {
        const writeId = getPermission(permissions, 'write');
        const readId = getPermission(permissions, 'read');
        values[name] = writeId ?? readId;
        return values;
      }, {} as SelectedPermissions);
      break;
  }
  updatePermissionIds();
}

function validate(): boolean {
  errors.value = {};
  
  const result = tokenApiSchema.safeParse(formData.value);
  
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
      expiresAt: formData.value.expiresAt || undefined,
    });
    isSaving.value = false;
  }, 500);
}

function handleOpenChange(open: boolean) {
  emit('open-change', open);
}
</script>


