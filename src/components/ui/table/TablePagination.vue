<template>
  <div v-if="totalPages > 1" class="flex items-center justify-between px-2 py-4 border-t border-muted-foreground/20 dark:border-muted-foreground/30">
    <div class="flex items-center gap-2">
      <p class="text-sm text-muted-foreground">
        <span class="font-medium text-foreground">{{ startIndex + 1 }}</span>
        <span class="mx-1">–</span>
        <span class="font-medium text-foreground">{{ endIndex }}</span>
        <span class="mx-1.5">de</span>
        <span class="font-semibold text-foreground">{{ total }}</span>
      </p>
    </div>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2">
        <p class="text-sm text-muted-foreground">Itens por página:</p>
        <Select :model-value="String(pageSize)" @update:model-value="handlePageSizeChange">
          <SelectTrigger class="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!hasPreviousPage"
          @click="handleFirst"
        >
          <ChevronsLeft class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!hasPreviousPage"
          @click="handlePrevious"
        >
          <ChevronLeft class="h-4 w-4" />
        </Button>
        <div class="flex items-center gap-1">
          <Button
            v-for="pageNum in visiblePages"
            :key="pageNum"
            variant="outline"
            size="icon"
            class="h-8 w-8"
            :class="{ 'bg-primary text-primary-foreground': pageNum === currentPage }"
            @click="handlePageChange(pageNum)"
          >
            {{ pageNum }}
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!hasNextPage"
          @click="handleNext"
        >
          <ChevronRight class="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          class="h-8 w-8"
          :disabled="!hasNextPage"
          @click="handleLast"
        >
          <ChevronsRight class="h-4 w-4" />
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePagination } from '@/composables/usePagination';

interface Props {
  total: number;
  pageSize?: number;
  initialPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  initialPage: 1,
});

const emit = defineEmits<{
  'update:page': [page: number];
  'update:pageSize': [pageSize: number];
}>();

const {
  page,
  pageSize,
  totalPages,
  startIndex,
  endIndex,
  hasNextPage,
  hasPreviousPage,
  goToPage,
  nextPage,
  previousPage,
  firstPage,
  lastPage,
  setPageSize,
  setTotal,
} = usePagination({
  initialPage: props.initialPage,
  initialPageSize: props.pageSize,
  total: props.total,
});

// Watch for external total changes
watch(
  () => props.total,
  (newTotal) => {
    setTotal(newTotal);
  },
  { immediate: true }
);

// Watch for external page changes
watch(
  () => props.initialPage,
  (newPage) => {
    if (newPage !== page.value) {
      goToPage(newPage);
    }
  },
  { immediate: true }
);

// Watch for external pageSize changes
watch(
  () => props.pageSize,
  (newPageSize) => {
    if (newPageSize !== pageSize.value) {
      setPageSize(newPageSize);
    }
  },
  { immediate: true }
);

const currentPage = computed(() => page.value);

const visiblePages = computed(() => {
  const pages: number[] = [];
  const current = currentPage.value;
  const total = totalPages.value;
  const siblingCount = 1;

  // Calculate start and end page numbers
  let startPage = Math.max(1, current - siblingCount);
  let endPage = Math.min(total, current + siblingCount);

  // Adjust if we're near the start
  if (current <= siblingCount + 1) {
    endPage = Math.min(3 + siblingCount * 2, total);
  }

  // Adjust if we're near the end
  if (current >= total - siblingCount) {
    startPage = Math.max(1, total - siblingCount * 2 - 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
});

function handlePageSizeChange(value: string) {
  const newPageSize = parseInt(value, 10);
  setPageSize(newPageSize);
  emit('update:pageSize', newPageSize);
}

function handlePageChange(newPage: number) {
  goToPage(newPage);
  emit('update:page', page.value);
}

function handleFirst() {
  firstPage();
  emit('update:page', page.value);
}

function handlePrevious() {
  previousPage();
  emit('update:page', page.value);
}

function handleNext() {
  nextPage();
  emit('update:page', page.value);
}

function handleLast() {
  lastPage();
  emit('update:page', page.value);
}

// Emit page changes
watch(page, (newPage) => {
  emit('update:page', newPage);
});
</script>
