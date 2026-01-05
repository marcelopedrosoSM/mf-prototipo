<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>{{ isEditMode ? 'Editar Nota Interna' : 'Adicionar Nota Interna' }}</DialogTitle>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <!-- Toolbar -->
        <div class="flex items-center gap-1 pb-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            type="button"
            @click="insertMarkdown('**', '**')"
            title="Negrito (Ctrl+B)"
          >
            <Bold class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            @click="insertMarkdown('*', '*')"
            title="Itálico (Ctrl+I)"
          >
            <Italic class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            @click="insertMarkdown('- ', '')"
            title="Lista"
          >
            <List class="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            @click="insertMarkdown('`', '`')"
            title="Código"
          >
            <Code class="h-4 w-4" />
          </Button>
          
          <div class="flex-1"></div>
          
          <Button
            variant="ghost"
            size="sm"
            type="button"
            @click="showPreview = !showPreview"
            :class="{ 'bg-accent': showPreview }"
          >
            <Eye class="h-4 w-4 mr-1" />
            Preview
          </Button>
        </div>

        <!-- Editor / Preview -->
        <div class="grid gap-4" :class="showPreview ? 'grid-cols-2' : 'grid-cols-1'">
          <!-- Editor -->
          <div>
            <Textarea
              ref="textareaRef"
              v-model="noteContent"
              placeholder="Digite sua nota aqui... (suporta Markdown)"
              class="min-h-[200px] font-mono text-sm"
              @keydown="handleKeydown"
            />
            <div class="flex items-center justify-between mt-2">
              <p class="text-xs text-muted-foreground">
                💡 Notas internas não são visíveis para o cliente
              </p>
              <span class="text-xs text-muted-foreground">
                {{ noteContent.length }} caracteres
              </span>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="showPreview" class="border rounded-md p-3 bg-muted/30 min-h-[200px]">
            <div class="text-xs font-semibold text-muted-foreground mb-2">Preview:</div>
            <div 
              v-if="noteContent.trim()"
              v-html="renderedPreview" 
              class="prose prose-sm max-w-none dark:prose-invert"
            ></div>
            <div v-else class="text-sm text-muted-foreground italic">
              Digite algo para ver o preview...
            </div>
          </div>
        </div>

        <!-- Markdown Help -->
        <details class="text-xs text-muted-foreground">
          <summary class="cursor-pointer hover:text-foreground">Dicas de Markdown</summary>
          <div class="mt-2 space-y-1 pl-4">
            <div><code>**negrito**</code> → <strong>negrito</strong></div>
            <div><code>*itálico*</code> → <em>itálico</em></div>
            <div><code>- item</code> → lista</div>
            <div><code>`código`</code> → <code>código</code></div>
          </div>
        </details>
      </div>

      <div class="flex justify-end gap-2">
        <Button variant="outline" @click="handleCancel">Cancelar</Button>
        <Button @click="handleSave" :disabled="!noteContent.trim()">
          {{ isEditMode ? 'Salvar Alterações' : 'Salvar Nota' }}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, nextTick } from 'vue';
import { marked } from 'marked';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Bold, Italic, List, Code, Eye } from 'lucide-vue-next';

interface Props {
  open: boolean;
  conversationId: string;
  editingNote?: {
    id: string;
    content: string;
  } | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'save': [content: string, noteId?: string];
}>();

const isOpen = ref(props.open);
const noteContent = ref('');
const showPreview = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

const isEditMode = computed(() => !!props.editingNote);

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
});

const renderedPreview = computed(() => {
  try {
    return marked.parse(noteContent.value);
  } catch {
    return noteContent.value;
  }
});

watch(() => props.open, (newVal) => {
  isOpen.value = newVal;
  if (newVal) {
    if (props.editingNote) {
      noteContent.value = props.editingNote.content;
    } else {
      noteContent.value = '';
    }
    showPreview.value = false;
    
    // Focus textarea
    nextTick(() => {
      textareaRef.value?.focus();
    });
  }
});

watch(isOpen, (newVal) => {
  emit('update:open', newVal);
});

function insertMarkdown(before: string, after: string) {
  const textarea = textareaRef.value;
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = noteContent.value.substring(start, end);
  
  const newText = 
    noteContent.value.substring(0, start) +
    before + selectedText + after +
    noteContent.value.substring(end);
  
  noteContent.value = newText;
  
  // Restore selection
  nextTick(() => {
    textarea.focus();
    textarea.setSelectionRange(
      start + before.length,
      end + before.length
    );
  });
}

function handleKeydown(event: KeyboardEvent) {
  // Ctrl+Enter to save
  if (event.ctrlKey && event.key === 'Enter') {
    event.preventDefault();
    handleSave();
  }
  
  // Ctrl+B for bold
  if (event.ctrlKey && event.key === 'b') {
    event.preventDefault();
    insertMarkdown('**', '**');
  }
  
  // Ctrl+I for italic
  if (event.ctrlKey && event.key === 'i') {
    event.preventDefault();
    insertMarkdown('*', '*');
  }
}

function handleCancel() {
  isOpen.value = false;
  noteContent.value = '';
  showPreview.value = false;
}

function handleSave() {
  if (noteContent.value.trim()) {
    emit('save', noteContent.value.trim(), props.editingNote?.id);
    isOpen.value = false;
    noteContent.value = '';
    showPreview.value = false;
  }
}
</script>
