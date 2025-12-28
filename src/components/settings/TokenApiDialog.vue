<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-3xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>Cadastrar token de API</DialogTitle>
        <DialogDescription>
          Preencha os dados para criar um novo token de API
        </DialogDescription>
      </DialogHeader>

      <ScrollArea class="flex-1 min-h-0">
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
            <Popover>
              <PopoverTrigger as-child>
                <Button
                  variant="outline"
                  :class="[
                    'w-full justify-start text-left font-normal',
                    !displayDate && 'text-muted-foreground',
                    errors.expiresAt ? 'border-destructive' : ''
                  ]"
                >
                  <CalendarIcon class="mr-2 h-4 w-4" />
                  {{ displayDate || 'DD/MM/AAAA' }}
                </Button>
              </PopoverTrigger>
              <PopoverContent class="w-auto p-0" align="start">
                <Calendar
                  v-model="selectedDate"
                  :min="minDate"
                  :max="maxDate"
                  @update:model-value="handleDateSelect"
                />
              </PopoverContent>
            </Popover>
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
                        :model-value="String(getSelectedPermissionId(group.name) || '')"
                        @update:model-value="(value) => handlePermissionChange(group.name, Number(value))"
                        class="flex flex-col gap-2"
                      >
                        <div
                          v-for="permission in group.permissions"
                          :key="permission.id"
                          class="flex items-center space-x-2"
                        >
                          <RadioGroupItem
                            :value="String(permission.id)"
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
      </ScrollArea>

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
import { Loader2, CalendarIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/utils/date';

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

// Date picker state
const selectedDate = ref<Date | undefined>(undefined);
const displayDate = computed(() => {
  if (!formData.value.expiresAt) return '';
  return formatDate(formData.value.expiresAt);
});

// Date limits
const minDate = computed(() => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
});

const maxDate = computed(() => {
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 10);
  return maxDate;
});

function handleDateSelect(date: Date | undefined) {
  if (date) {
    // Convert Date to YYYY-MM-DD format for storage
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    formData.value.expiresAt = `${year}-${month}-${day}`;
  } else {
    formData.value.expiresAt = '';
  }
}

watch(() => props.open, (opened) => {
  if (opened) {
    formData.value = {
      title: '',
      expiresAt: '',
      permissionIds: [],
    };
    selectedDate.value = undefined;
    selectedPermissions.value = {};
    errors.value = {};
    selectProfile('all');
  }
});

// Sync selectedDate with formData.expiresAt
watch(() => formData.value.expiresAt, (dateString) => {
  if (dateString) {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      selectedDate.value = date;
    }
  } else {
    selectedDate.value = undefined;
  }
}, { immediate: true });

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


