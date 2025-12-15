<template>
  <Card>
    <CardContent class="p-0">
      <div v-if="loading" class="flex items-center justify-center p-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="times.length === 0" class="flex flex-col items-center justify-center p-8">
        <UsersRound class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-sm font-medium mb-1">Nenhum time encontrado</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando seu primeiro time
        </p>
        <Button v-if="onCreate" @click="onCreate">
          <Plus class="mr-2 h-4 w-4" />
          Adicionar Primeiro Time
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
              <TableHead>Agentes</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="time in paginatedTimes" :key="time.id">
              <TableCell class="font-medium">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <UsersRound class="h-3.5 w-3.5" />
                  </div>
                  <span>{{ time.nome }}</span>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="userId in time.users || []"
                    :key="userId"
                    variant="outline"
                    class="text-xs border-primary/30 text-primary bg-transparent"
                  >
                    {{ getAgenteNome(userId) }}
                  </Badge>
                  <span v-if="!time.users || time.users.length === 0" class="text-sm text-muted-foreground">
                    Nenhum agente
                  </span>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="handleEdit(time)">
                      <Edit class="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleDelete(time)" class="text-destructive">
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
          v-if="times.length > pageSize"
          :total="times.length"
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
import { Plus, UsersRound, Loader2, MoreVertical, Edit, Trash2 } from 'lucide-vue-next';
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
import type { Time } from '@/types/times';
import type { Agente } from '@/mocks/data/agentes';

interface Props {
  times: Time[];
  agentes: Agente[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const currentPage = ref(1);
const pageSize = ref(10);

// Sorting
const sortable = useSortable<Time>(() => props.times);

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

const paginatedTimes = computed(() => {
  return pagination.paginate(sortable.sortedItems.value);
});

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
  edit: [time: Time];
  delete: [time: Time];
  create: [];
}>();

const agentesMap = computed(() => {
  const map = new Map<string, string>();
  props.agentes.forEach(agente => {
    map.set(agente.id, agente.nome);
  });
  return map;
});

function getAgenteNome(userId: string): string {
  return agentesMap.value.get(userId) || userId;
}

function handleEdit(time: Time) {
  emit('edit', time);
}

function handleDelete(time: Time) {
  emit('delete', time);
}

// Expose onCreate for parent
defineExpose({
  onCreate: () => emit('create'),
});
</script>

