<template>
  <th
    :class="cn(
      'h-10 px-5 text-left align-middle font-semibold text-foreground cursor-pointer select-none hover:bg-muted/80 transition-colors [&:has([role=checkbox])]:pr-0',
      props.class
    )"
    @click="handleClick"
  >
    <div class="flex items-center gap-2 group">
      <slot />
      <ArrowUpDown
        :class="cn(
          'h-4 w-4 transition-all duration-200',
          sortDirection === 'asc' || sortDirection === 'desc'
            ? 'text-primary' 
            : 'text-muted-foreground/40 group-hover:text-muted-foreground/70'
        )"
      />
    </div>
  </th>
</template>

<script setup lang="ts">
import { ArrowUpDown } from 'lucide-vue-next';
import { cn } from '@/utils';
import type { HTMLAttributes } from 'vue';
import type { SortDirection } from '@/composables/useSortable';

interface Props {
  sortKey: string;
  sortDirection?: SortDirection;
  class?: HTMLAttributes['class'];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  sort: [key: string];
}>();

const handleClick = () => {
  emit('sort', props.sortKey);
};
</script>

