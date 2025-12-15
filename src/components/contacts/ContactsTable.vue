<template>
  <Card>
    <CardContent class="p-0">
      <div v-if="loading" class="flex items-center justify-center p-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="contacts.length === 0" class="flex flex-col items-center justify-center p-8">
        <User class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-sm font-medium mb-1">Nenhum contato encontrado</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando seu primeiro contato
        </p>
        <Button v-if="onCreate" @click="onCreate">
          <Plus class="mr-2 h-4 w-4" />
          Adicionar Primeiro Contato
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
                Contato
              </TableHeadSortable>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="contact in paginatedContacts" :key="contact.id">
              <TableCell class="font-medium">
                <div class="flex items-center gap-2.5">
                  <div class="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary flex-shrink-0">
                    <span class="text-[10px] font-medium">{{ getContactInitials(contact.name) }}</span>
                  </div>
                  <button
                    @click="handleEdit(contact)"
                    class="text-left hover:text-primary transition-colors cursor-pointer"
                  >
                    {{ contact.name }}
                  </button>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="phone in contact.phoneNumbers.slice(0, 2)"
                    :key="phone.id || phone.phoneNumber"
                    variant="outline"
                    class="text-xs border-primary/30 text-primary bg-transparent"
                  >
                    {{ phone.phoneNumber }}
                  </Badge>
                  <span v-if="contact.phoneNumbers.length > 2" class="text-xs text-muted-foreground">
                    +{{ contact.phoneNumbers.length - 2 }}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ contact.emails[0]?.email || '-' }}
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
                    <DropdownMenuItem @click="handleEdit(contact)">
                      <Edit class="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleDelete(contact)" class="text-destructive">
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
          v-if="contacts.length > pageSize"
          :total="contacts.length"
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
import { Plus, User, Loader2, MoreVertical, Edit, Trash2 } from 'lucide-vue-next';
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
import type { Contact } from '@/types/contacts';

interface Props {
  contacts: Contact[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  edit: [contact: Contact];
  delete: [contact: Contact];
  create: [];
}>();

const currentPage = ref(1);
const pageSize = ref(10);

// Sorting
const sortable = useSortable<Contact>(() => props.contacts);

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

const paginatedContacts = computed(() => {
  return pagination.paginate(sortable.sortedItems.value);
});

function handleSort(key: string) {
  sortable.toggleSort(key);
  currentPage.value = 1;
}

function getContactInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function handleEdit(contact: Contact) {
  emit('edit', contact);
}

function handleDelete(contact: Contact) {
  emit('delete', contact);
}

function handlePageChange(page: number) {
  currentPage.value = page;
}

function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize;
  currentPage.value = 1;
}

// Expose onCreate for parent
defineExpose({
  onCreate: () => emit('create'),
});
</script>

