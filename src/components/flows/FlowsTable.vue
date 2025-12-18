<template>
  <Card>
    <CardContent class="p-0">
      <div v-if="loading" class="flex items-center justify-center p-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="flows.length === 0" class="flex flex-col items-center justify-center p-8">
        <Workflow class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-sm font-medium mb-1">Nenhum fluxo encontrado</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando seu primeiro fluxo
        </p>
        <Button @click="handleCreate">
          <Plus class="mr-2 h-4 w-4" />
          Adicionar Primeiro Fluxo
        </Button>
      </div>
      <div v-else class="flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeadSortable
                sort-key="nome"
                :sort-direction="sortable.getSortDirection('nome')"
                @sort="handleSort"
              >
                Nome
              </TableHeadSortable>
              <TableHead>Descrição</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizado em</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow 
              v-for="flow in paginatedFlows" 
              :key="flow.id"
              class="cursor-pointer hover:bg-muted/50"
              @click="handleRowClick(flow)"
            >
            <TableCell class="font-medium">
              <div class="flex items-center gap-2 w-full">
                <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                  <component :is="getFlowIcon(flow)" class="h-3.5 w-3.5" />
                </div>
                <span class="truncate">{{ flow.nome }}</span>
              </div>
            </TableCell>
            <TableCell>
              <span class="text-muted-foreground">
                {{ flow.descricao || '-' }}
              </span>
            </TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(flow.status)">
                {{ getStatusLabel(flow.status) }}
              </Badge>
            </TableCell>
            <TableCell>
              <span class="text-sm text-muted-foreground">
                {{ formatDate(flow.updatedAt) }}
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
                  <DropdownMenuItem @click="handleEdit(flow)">
                    <Edit class="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleDelete(flow)" class="text-destructive">
                    <Trash2 class="mr-2 h-4 w-4" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <TablePagination
          v-if="flows.length > pageSize"
          :total="flows.length"
          :page-size="pageSize"
          :initial-page="currentPage"
          @update:page="handlePageChange"
          @update:pageSize="handlePageSizeChange"
        />
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Plus, Workflow, Loader2, MoreVertical, Edit, Trash2, BotIcon, CheckCircle2 } from 'lucide-vue-next';
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
import TableHeadSortable from '@/components/ui/table/TableHeadSortable.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import TablePagination from '@/components/ui/table/TablePagination.vue';
import { usePagination } from '@/composables/usePagination';
import { useSortable } from '@/composables/useSortable';
import { formatDate } from '@/utils/date';
import type { Flow } from '@/mocks/data/flows';

interface Props {
  flows: Flow[];
  loading?: boolean;
  onCreate?: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  onCreate: undefined,
});

const currentPage = ref(1);
const pageSize = ref(10);

// Sorting
const sortable = useSortable<Flow>(() => props.flows);

const pagination = usePagination({
  initialPage: 1,
  initialPageSize: 10,
  total: computed(() => sortable.sortedItems.value.length).value,
});

// Update total when sorted items change
watch(
  () => sortable.sortedItems.value.length,
  (newTotal) => {
    pagination.setTotal(newTotal);
  },
  { immediate: true }
);

// Update page size when it changes
watch(pageSize, (newSize) => {
  pagination.setPageSize(newSize);
});

// Update page when it changes
watch(currentPage, (newPage) => {
  pagination.goToPage(newPage);
});

const paginatedFlows = computed(() => {
  return pagination.paginate(sortable.sortedItems.value);
});

// Ícone condicional por tipo de flow (atendimento usa BotIcon, atividades usa CheckCircle2)
function getFlowIcon(flow: Flow) {
  return flow.tipo === 'atendimento' ? BotIcon : CheckCircle2;
}

function handleSort(key: string) {
  sortable.toggleSort(key);
  currentPage.value = 1; // Reset to first page when sorting
}

function handlePageChange(page: number) {
  currentPage.value = page;
}

function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize;
  currentPage.value = 1;
}

const emit = defineEmits<{
  edit: [flow: Flow];
  delete: [flow: Flow];
  create: [];
  'row-click': [flow: Flow];
}>();

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'ativo':
      return 'default';
    case 'inativo':
      return 'secondary';
    case 'rascunho':
      return 'outline';
    default:
      return 'secondary';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'ativo':
      return 'Ativo';
    case 'inativo':
      return 'Inativo';
    case 'rascunho':
      return 'Rascunho';
    default:
      return status;
  }
}


function handleRowClick(flow: Flow) {
  emit('row-click', flow);
}

function handleEdit(flow: Flow) {
  emit('edit', flow);
}

function handleDelete(flow: Flow) {
  emit('delete', flow);
}

function handleCreate() {
  if (props.onCreate) {
    props.onCreate();
  }
  emit('create');
}

// Expose onCreate for parent (for backward compatibility)
defineExpose({
  onCreate: handleCreate,
});
</script>

