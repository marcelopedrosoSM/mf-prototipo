<template>
  <div class="space-y-6 pl-2">
    <div v-if="loading" class="flex justify-center py-8">
      <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
    </div>

    <div v-else-if="items.length === 0" class="text-center py-8 text-muted-foreground">
      Nenhum histórico encontrado.
    </div>

    <div v-else class="relative border-l border-border ml-2 space-y-6 pb-4">
      <div v-for="item in items" :key="item.id" class="ml-6 relative">
        <!-- Timeline Dot -->
        <div 
          class="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-background flex items-center justify-center shadow-sm"
          :class="getDotColor(item.type)"
        >
          <div class="h-1.5 w-1.5 rounded-full bg-current" />
        </div>

        <!-- Content -->
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <h4 class="text-sm font-medium leading-none">{{ item.title }}</h4>
            <span class="text-xs text-muted-foreground">
              {{ formatDate(item.date) }}
            </span>
          </div>
          
          <p v-if="item.description" class="text-sm text-muted-foreground mt-0.5">
            {{ item.description }}
          </p>
          
          <div v-if="item.authorName" class="flex items-center gap-1 mt-1 text-xs text-muted-foreground/70">
            <User class="h-3 w-3" />
            <span>{{ item.authorName }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, User } from 'lucide-vue-next';
import type { ContactHistoryItem, ContactHistoryType } from '@/types/contacts';
import { generateMockHistory } from '@/mocks/data/contactHistory';

interface Props {
  contactId: number;
}

const props = defineProps<Props>();
const items = ref<ContactHistoryItem[]>([]);
const loading = ref(false);

function loadHistory() {
  loading.value = true;
  // Simulating API delay
  setTimeout(() => {
    items.value = generateMockHistory(props.contactId);
    loading.value = false;
  }, 600);
}

onMounted(() => {
  loadHistory();
});

watch(() => props.contactId, () => {
  loadHistory();
});

function formatDate(date: Date) {
  return format(date, "dd MMM HH:mm", { locale: ptBR });
}

function getDotColor(type: ContactHistoryType): string {
  switch (type) {
    case 'chat':
      return 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400';
    case 'activity':
      return 'bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-400';
    case 'note':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400';
    case 'system':
      return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}
</script>
