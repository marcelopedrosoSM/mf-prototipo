import { ref, computed } from 'vue';

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  total?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const page = ref(options.initialPage ?? 1);
  const pageSize = ref(options.initialPageSize ?? 10);
  const total = ref(options.total ?? 0);

  const totalPages = computed(() => {
    return Math.ceil(total.value / pageSize.value) || 1;
  });

  const startIndex = computed(() => {
    return (page.value - 1) * pageSize.value;
  });

  const endIndex = computed(() => {
    return Math.min(startIndex.value + pageSize.value, total.value);
  });

  const hasNextPage = computed(() => {
    return page.value < totalPages.value;
  });

  const hasPreviousPage = computed(() => {
    return page.value > 1;
  });

  const canGoToPage = (targetPage: number): boolean => {
    return targetPage >= 1 && targetPage <= totalPages.value;
  };

  const goToPage = (targetPage: number) => {
    if (canGoToPage(targetPage)) {
      page.value = targetPage;
    }
  };

  const nextPage = () => {
    if (hasNextPage.value) {
      page.value++;
    }
  };

  const previousPage = () => {
    if (hasPreviousPage.value) {
      page.value--;
    }
  };

  const firstPage = () => {
    page.value = 1;
  };

  const lastPage = () => {
    page.value = totalPages.value;
  };

  const setPageSize = (newPageSize: number) => {
    pageSize.value = newPageSize;
    // Reset to first page when page size changes
    page.value = 1;
  };

  const setTotal = (newTotal: number) => {
    total.value = newTotal;
    // Adjust page if current page is beyond total pages
    if (page.value > totalPages.value) {
      page.value = totalPages.value || 1;
    }
  };

  const paginate = <T>(items: T[]): T[] => {
    const start = startIndex.value;
    const end = endIndex.value;
    return items.slice(start, end);
  };

  return {
    page,
    pageSize,
    total,
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
    paginate,
  };
}

