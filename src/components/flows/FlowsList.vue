<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center p-8">
      <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
    </div>

    <!-- Empty State -->
    <div v-else-if="flows.length === 0" class="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20">
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

    <!-- Flow List (Cards) -->
    <div v-else class="space-y-4">
      <FlowCard
        v-for="flow in paginatedFlows"
        :key="flow.id"
        :flow="flow"
        @edit="handleEdit"
        @delete="handleDelete"
        @toggle="handleToggle"
      />

      <!-- Pagination -->
      <TablePagination
        v-if="flows.length > pageSize"
        :total="flows.length"
        :page-size="pageSize"
        :initial-page="currentPage"
        @update:page="handlePageChange"
        @update:pageSize="handlePageSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Loader2, Workflow, Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import TablePagination from '@/components/ui/table/TablePagination.vue';
import FlowCard from './FlowCard.vue';
import { usePagination } from '@/composables/usePagination';
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

const emit = defineEmits<{
  edit: [flow: Flow];
  delete: [flow: Flow];
  create: [];
  toggle: [flow: Flow, active: boolean];
}>();

const currentPage = ref(1);
const pageSize = ref(10);

const pagination = usePagination({
  initialPage: 1,
  initialPageSize: 10,
  total: computed(() => props.flows.length).value,
});

// Update total when items change
watch(
  () => props.flows.length,
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
  return pagination.paginate(props.flows);
});

function handlePageChange(page: number) {
  currentPage.value = page;
}

function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize;
  currentPage.value = 1;
}

function handleEdit(flow: Flow) {
  emit('edit', flow);
}

function handleDelete(flow: Flow) {
  emit('delete', flow);
}

function handleToggle(flow: Flow, active: boolean) {
  emit('toggle', flow, active);
}

function handleCreate() {
  if (props.onCreate) {
    props.onCreate();
  }
  emit('create');
}
</script>
