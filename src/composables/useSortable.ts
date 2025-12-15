import { ref, computed } from 'vue';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig<T> {
  key: keyof T | string;
  direction: SortDirection;
}

export function useSortable<T>(items: (() => T[]) | T[], defaultSort?: SortConfig<T>) {
  const sortKey = ref<keyof T | string>(defaultSort?.key || '');
  const sortDirection = ref<SortDirection>(defaultSort?.direction || null);

  const sortedItems = computed(() => {
    const itemsArray = typeof items === 'function' ? items() : items;
    
    if (!sortKey.value || !sortDirection.value) {
      return [...itemsArray];
    }

    const sorted = [...itemsArray].sort((a, b) => {
      const aValue = getNestedValue(a, sortKey.value);
      const bValue = getNestedValue(b, sortKey.value);

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue, 'pt-BR', {
          sensitivity: 'base',
          numeric: true,
        });
        return sortDirection.value === 'asc' ? comparison : -comparison;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection.value === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection.value === 'asc'
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Fallback para outros tipos
      const aStr = String(aValue);
      const bStr = String(bValue);
      const comparison = aStr.localeCompare(bStr, 'pt-BR', { sensitivity: 'base' });
      return sortDirection.value === 'asc' ? comparison : -comparison;
    });

    return sorted;
  });

  const toggleSort = (key: keyof T | string) => {
    if (sortKey.value === key) {
      // Cicla: asc -> desc -> null
      if (sortDirection.value === 'asc') {
        sortDirection.value = 'desc';
      } else if (sortDirection.value === 'desc') {
        sortDirection.value = null;
        sortKey.value = '';
      } else {
        sortDirection.value = 'asc';
      }
    } else {
      sortKey.value = key;
      sortDirection.value = 'asc';
    }
  };

  const getSortDirection = (key: keyof T | string): SortDirection => {
    return sortKey.value === key ? sortDirection.value : null;
  };

  return {
    sortedItems,
    sortKey,
    sortDirection,
    toggleSort,
    getSortDirection,
  };
}

function getNestedValue(obj: any, path: string | keyof any): any {
  if (typeof path === 'string' && path.includes('.')) {
    return path.split('.').reduce((current, prop) => current?.[prop], obj);
  }
  return obj[path];
}

