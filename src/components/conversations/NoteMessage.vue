<template>
  <div class="flex gap-3 py-3 px-4 my-2 bg-amber-50/50 dark:bg-amber-950/20 border-l-4 border-amber-400 rounded-r-lg">
    <!-- Avatar do Autor -->
    <div class="flex-shrink-0">
      <div class="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
        <span class="text-xs font-bold text-amber-700 dark:text-amber-300">
          {{ getInitials(note.senderName || 'Sistema') }}
        </span>
      </div>
    </div>

    <!-- Conteúdo da Nota -->
    <div class="flex-1 min-w-0">
      <!-- Header -->
      <div class="flex items-center justify-between mb-1">
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold text-amber-900 dark:text-amber-100">
            {{ note.senderName || 'Sistema' }}
          </span>
          <span class="text-xs text-amber-600 dark:text-amber-400">
            {{ formatTimestamp(note.timestamp) }}
          </span>
          <span v-if="note.editedAt" class="text-xs text-amber-500 dark:text-amber-500 italic">
            (editado)
          </span>
        </div>
        
        <!-- Actions Menu -->
        <DropdownMenu v-if="canEdit">
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-100">
              <MoreVertical class="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="$emit('edit', note)">
              <Edit class="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('delete', note)" class="text-destructive">
              <Trash2 class="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <!-- Note Content with Markdown -->
      <div class="prose prose-sm max-w-none text-amber-900 dark:text-amber-100">
        <div v-html="renderedContent" class="text-sm leading-relaxed"></div>
      </div>

      <!-- Note Icon Badge -->
      <div class="flex items-center gap-1 mt-2">
        <StickyNote class="h-3 w-3 text-amber-600 dark:text-amber-400" />
        <span class="text-xs text-amber-600 dark:text-amber-400 font-medium">Nota Interna</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';
import { StickyNote, MoreVertical, Edit, Trash2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Note {
  id: string;
  content: string;
  senderName?: string;
  senderId?: string;
  timestamp: string;
  editedAt?: string;
}

interface Props {
  note: Note;
  canEdit?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  canEdit: true
});

defineEmits<{
  edit: [note: Note];
  delete: [note: Note];
}>();

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `${diffMins}m atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays}d atrás`;
  
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Configure marked for safe HTML
marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderedContent = computed(() => {
  try {
    return marked.parse(props.note.content);
  } catch {
    return props.note.content;
  }
});
</script>
