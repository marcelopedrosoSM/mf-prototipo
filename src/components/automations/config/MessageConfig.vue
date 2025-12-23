<template>
  <div class="space-y-4">
    <!-- Tipo de Mensagem -->
    <div class="space-y-3">
      <Label>Tipo de Mensagem</Label>
      <div class="grid grid-cols-5 gap-2">
        <Button 
          v-for="type in ['text', 'image', 'video', 'audio', 'file']" 
          :key="type"
          type="button"
          :variant="modelValue.messageType === type || (!modelValue.messageType && type === 'text') ? 'default' : 'outline'"
          class="h-10 px-0 flex items-center justify-center"
          @click="updateType(type)"
          :title="getMessageTypeLabel(type)"
        >
          <component :is="getMessageTypeIcon(type)" class="h-4 w-4" />
        </Button>
      </div>
      <p class="text-xs text-muted-foreground text-right">
        {{ getMessageTypeLabel(modelValue.messageType || 'text') }}
      </p>
    </div>

    <!-- URL da Mídia -->
    <div v-if="modelValue.messageType && modelValue.messageType !== 'text'" class="space-y-2">
      <Label>Arquivo</Label>
      
      <!-- Input de URL ou Upload -->
      <div class="space-y-2">
        <!-- Input URL -->
        <div class="flex gap-2">
          <Input 
            :model-value="modelValue.mediaUrl"
            @update:model-value="updateMediaUrl"
            placeholder="https://exemplo.com/arquivo ou anexe um arquivo" 
            class="flex-1"
          />
          <input 
            ref="fileInputRef"
            type="file" 
            class="hidden" 
            @change="handleFileSelect"
            :accept="getAcceptedFileTypes(modelValue.messageType)"
          />
          <Button 
            type="button"
            variant="outline" 
            @click="triggerFileInput"
            class="shrink-0"
          >
            <FileText class="h-4 w-4 mr-2" />
            Anexar
          </Button>
        </div>
        
        <!-- Preview do arquivo selecionado -->
        <div v-if="selectedFile" class="flex items-center gap-2 p-2 bg-muted rounded-md border">
          <component :is="getMessageTypeIcon(modelValue.messageType || 'file')" class="h-4 w-4 text-muted-foreground shrink-0" />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">{{ selectedFile.name }}</p>
            <p class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            class="h-6 w-6 shrink-0"
            @click="clearSelectedFile"
          >
            <X class="h-3 w-3" />
          </Button>
        </div>
        
        <p class="text-xs text-muted-foreground">
          Cole uma URL ou anexe um arquivo do seu computador
        </p>
      </div>
    </div>

    <!-- Conteúdo -->
    <div class="space-y-2">
      <Label>{{ modelValue.messageType && modelValue.messageType !== 'text' ? 'Legenda (Opcional)' : 'Conteúdo do Texto' }}</Label>
      <VariableTextArea 
        :model-value="modelValue.content"
        @update:model-value="updateContent"
        :placeholder="modelValue.messageType && modelValue.messageType !== 'text' ? 'Digite uma legenda...' : 'Digite sua mensagem...'" 
        :rows="5" 
      />
      <p class="text-xs text-muted-foreground">O conteúdo suporta variáveis dinâmicas.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { 
  MessageSquare, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  FileText, 
  X 
} from 'lucide-vue-next';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import VariableTextArea from '@/components/flow-builder/VariableTextArea.vue';

interface MessageData {
  messageType?: string;
  mediaUrl?: string;
  content?: string;
  [key: string]: any;
}

const props = defineProps<{
  modelValue: MessageData;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: MessageData];
}>();

// State
const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

// Helpers
function getMessageTypeLabel(type: string): string {
  const map: Record<string, string> = {
    text: 'Texto',
    image: 'Imagem',
    video: 'Vídeo',
    audio: 'Áudio',
    file: 'Arquivo'
  };
  return map[type] || type;
}

function getMessageTypeIcon(type: string) {
  const map: Record<string, any> = {
    text: MessageSquare,
    image: ImageIcon,
    video: Video,
    audio: Mic,
    file: FileText
  };
  return map[type] || MessageSquare;
}

function getAcceptedFileTypes(type?: string): string {
  switch (type) {
    case 'image': return 'image/*';
    case 'video': return 'video/*';
    case 'audio': return 'audio/*';
    default: return '*/*';
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Actions
function updateType(type: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    messageType: type
  });
}

function updateMediaUrl(url: string | number) {
  emit('update:modelValue', {
    ...props.modelValue,
    mediaUrl: String(url)
  });
}

function updateContent(content: string) {
  emit('update:modelValue', {
    ...props.modelValue,
    content
  });
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    selectedFile.value = input.files[0];
    // Em um cenário real, aqui faríamos upload e pegaríamos a URL
    // Por enquanto, vamos simular que a URL é o nome do arquivo
    updateMediaUrl(`file://${selectedFile.value.name}`);
  }
}

function clearSelectedFile() {
  selectedFile.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
  updateMediaUrl('');
}
</script>
