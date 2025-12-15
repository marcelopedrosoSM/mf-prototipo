<template>
  <Card>
    <CardContent class="p-0">
      <div v-if="loading" class="flex items-center justify-center p-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="tokens.length === 0" class="flex flex-col items-center justify-center p-8">
        <Key class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-sm font-medium mb-1">Nenhum token de API encontrado</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando seu primeiro token de API
        </p>
        <Button v-if="onCreate" @click="onCreate">
          <Plus class="mr-2 h-4 w-4" />
          Adicionar Primeiro Token
        </Button>
      </div>
      <div v-else class="flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeadSortable
                sort-key="title"
                :sort-direction="sortable.getSortDirection('title')"
                @sort="handleSort"
              >
                Título
              </TableHeadSortable>
              <TableHead>Data de Expiração</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="token in paginatedTokens" :key="token.id">
              <TableCell class="font-medium">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <Key class="h-3.5 w-3.5" />
                  </div>
                  <span>{{ token.title }}</span>
                </div>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ token.expiresAt ? formatDate(token.expiresAt) : 'Sem expiração' }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ token.permissionIds.length }} permissão(ões)
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
                    <DropdownMenuItem @click="handleView(token)">
                      <Eye class="mr-2 h-4 w-4" />
                      Ver Token
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleDelete(token)" class="text-destructive">
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
          v-if="tokens.length > pageSize"
          :total="tokens.length"
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
import { Plus, Key, Loader2, MoreVertical, Eye, Trash2 } from 'lucide-vue-next';
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
import type { TokenAPI } from '@/types/tokens-api';

interface Props {
  tokens: TokenAPI[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const currentPage = ref(1);
const pageSize = ref(10);

// Sorting
const sortable = useSortable<TokenAPI>(() => props.tokens);

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

const paginatedTokens = computed(() => {
  return pagination.paginate(sortable.sortedItems.value);
});

function handleSort(key: string) {
  sortable.toggleSort(key);
  currentPage.value = 1;
}

function handlePageChange(page: number) {
  currentPage.value = page;
}

function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize;
  currentPage.value = 1;
}

const emit = defineEmits<{
  view: [token: TokenAPI];
  delete: [token: TokenAPI];
  create: [];
}>();

function handleView(token: TokenAPI) {
  emit('view', token);
}

function handleDelete(token: TokenAPI) {
  emit('delete', token);
}

// Expose onCreate for parent
defineExpose({
  onCreate: () => emit('create'),
});
</script>

