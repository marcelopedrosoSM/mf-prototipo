<template>
  <Card>
    <CardContent class="p-0">
      <div v-if="loading" class="flex items-center justify-center p-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="automations.length === 0" class="flex flex-col items-center justify-center p-8">
        <Zap class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-sm font-medium mb-1">Nenhuma automação encontrada</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando sua primeira automação
        </p>
        <Button @click="handleCreate">
          <Plus class="mr-2 h-4 w-4" />
          Adicionar Primeira Automação
        </Button>
      </div>
      <div v-else class="flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Gatilho</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="automation in automations" 
              :key="automation.id"
              class="cursor-pointer hover:bg-muted/50"
              @click="handleRowClick(automation)"
            >
              <TableCell class="font-medium">
                <div class="flex items-center gap-2 w-full">
                  <div 
                    class="flex h-7 w-7 items-center justify-center rounded-full flex-shrink-0"
                    :style="{ backgroundColor: getTriggerColor(automation.gatilho) + '20' }"
                  >
                    <component 
                      :is="getTriggerIcon(automation.gatilho)" 
                      class="h-3.5 w-3.5" 
                      :style="{ color: getTriggerColor(automation.gatilho) }"
                    />
                  </div>
                  <span class="truncate">{{ automation.nome }}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" class="text-xs">
                  {{ getTriggerLabel(automation.gatilho) }}
                </Badge>
              </TableCell>
              <TableCell @click.stop>
                <div class="flex items-center gap-2">
                  <Switch 
                    :checked="automation.ativo"
                    @update:checked="handleToggle(automation.id)"
                  />
                  <span class="text-sm text-muted-foreground">
                    {{ automation.ativo ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ formatDate(automation.updatedAt.toISOString()) }}
                </span>
              </TableCell>
              <TableCell class="text-right" @click.stop>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="handleEdit(automation)">
                      <Edit class="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleDelete(automation)" class="text-destructive">
                      <Trash2 class="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { 
  Plus, 
  Zap, 
  Loader2, 
  MoreVertical, 
  Edit, 
  Trash2,
  Clock,
  MessageSquarePlus,
  MessageSquare,
  Send,
  CheckCircle2
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { formatDate } from '@/utils/date';
import { TRIGGER_CONFIG, type Automation, type AutomationTrigger } from '@/types/automation';

interface Props {
  automations: Automation[];
  loading?: boolean;
  caixaId: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  edit: [automation: Automation];
  delete: [automation: Automation];
  toggle: [id: string];
  create: [caixaId: string];
  'row-click': [automation: Automation];
}>();

const ICON_MAP = {
  'Clock': Clock,
  'MessageSquarePlus': MessageSquarePlus,
  'MessageSquare': MessageSquare,
  'Send': Send,
  'CheckCircle2': CheckCircle2,
};

function getTriggerIcon(gatilho: AutomationTrigger) {
  const iconName = TRIGGER_CONFIG[gatilho].icon as keyof typeof ICON_MAP;
  return ICON_MAP[iconName] || Clock;
}

function getTriggerColor(gatilho: AutomationTrigger) {
  return TRIGGER_CONFIG[gatilho].color;
}

function getTriggerLabel(gatilho: AutomationTrigger) {
  return TRIGGER_CONFIG[gatilho].label;
}

function handleRowClick(automation: Automation) {
  emit('row-click', automation);
}

function handleEdit(automation: Automation) {
  emit('edit', automation);
}

function handleDelete(automation: Automation) {
  emit('delete', automation);
}

function handleToggle(id: string) {
  emit('toggle', id);
}

function handleCreate() {
  emit('create', props.caixaId);
}
</script>
