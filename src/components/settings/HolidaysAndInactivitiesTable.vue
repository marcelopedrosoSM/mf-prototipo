<template>
  <Card>
    <CardContent class="p-0">
      <div v-if="loading" class="flex items-center justify-center p-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="holidaysAndInactivities.length === 0" class="flex flex-col items-center justify-center p-8">
        <CalendarOff class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-sm font-medium mb-1">Nenhum feriado ou inatividade encontrado</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando seu primeiro feriado ou inatividade
        </p>
        <Button v-if="onCreate" @click="onCreate">
          <Plus class="mr-2 h-4 w-4" />
          Adicionar Primeiro Item
        </Button>
      </div>
      <div v-else class="flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeadSortable
                sort-key="name"
                :sort-direction="sortable.getSortDirection('name')"
                @sort="handleSort"
              >
                Nome
              </TableHeadSortable>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Periodicidade</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in paginatedItems" :key="item.id">
            <TableCell class="font-medium">
              <button
                @click="handleEdit(item)"
                class="text-left hover:text-primary transition-colors cursor-pointer flex items-center gap-2.5"
              >
                <SoftIcon class="h-7 w-7 rounded-full">
                  <CalendarOff class="h-3.5 w-3.5" />
                </SoftIcon>
                <span>{{ item.name }}</span>
              </button>
            </TableCell>
            <TableCell>
              <span class="text-sm text-muted-foreground">
                {{ formatDate(item.date) }}
              </span>
            </TableCell>
            <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ getTypeLabel(item.type) }}
                </span>
            </TableCell>
            <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ getPeriodicityLabel(item.periodicity) }}
                </span>
            </TableCell>
            <TableCell class="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon">
                    <MoreVertical class="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem @click="handleEdit(item)">
                    <Edit class="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem @click="handleDelete(item)" class="text-destructive">
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
          v-if="holidaysAndInactivities.length > pageSize"
          :total="holidaysAndInactivities.length"
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
import { Plus, CalendarOff, Loader2, MoreVertical, Edit, Trash2 } from 'lucide-vue-next';
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
import TablePagination from '@/components/ui/table/TablePagination.vue';
import { usePagination } from '@/composables/usePagination';
import { useSortable } from '@/composables/useSortable';
import { formatDate } from '@/utils/date';
import type { HolidayAndInactivity } from '@/types/holidays-and-inactivities';
import SoftIcon from '@/components/ui/icon/SoftIcon.vue';

interface Props {
  holidaysAndInactivities: HolidayAndInactivity[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const currentPage = ref(1);
const pageSize = ref(10);

// Sorting
const sortable = useSortable<HolidayAndInactivity>(() => props.holidaysAndInactivities);

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

const paginatedItems = computed(() => {
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
  edit: [item: HolidayAndInactivity];
  delete: [item: HolidayAndInactivity];
  create: [];
}>();

function getTypeLabel(type: string): string {
  switch (type) {
    case 'holiday':
      return 'Feriado';
    case 'inactivity':
      return 'Inatividade';
    default:
      return type;
  }
}

function getPeriodicityLabel(periodicity: string): string {
  switch (periodicity) {
    case 'annual':
      return 'Anual';
    case 'one-time':
      return 'Único';
    default:
      return periodicity;
  }
}

function handleEdit(item: HolidayAndInactivity) {
  emit('edit', item);
}

function handleDelete(item: HolidayAndInactivity) {
  emit('delete', item);
}

// Expose onCreate for parent
defineExpose({
  onCreate: () => emit('create'),
});
</script>

