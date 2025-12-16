<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <div class="relative">
        <Button variant="ghost" size="icon" title="Gerenciar etiquetas">
          <Tag class="h-4 w-4" />
        </Button>
        <span
          v-if="chat.labels && chat.labels.length > 0"
          class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
        >
          {{ chat.labels.length }}
        </span>
      </div>
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0" align="end">
      <div class="flex flex-col">
        <!-- Header -->
        <div class="px-4 py-3 border-b border-border">
          <h3 class="text-sm font-semibold">Gerenciar Etiquetas</h3>
          <p class="text-xs text-muted-foreground mt-1">
            Adicione ou remova etiquetas desta conversa
          </p>
        </div>

        <!-- Current Labels -->
        <div v-if="chat.labels && chat.labels.length > 0" class="px-4 py-3 border-b border-border">
          <div class="text-xs font-medium text-muted-foreground mb-2">Etiquetas aplicadas</div>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="label in chat.labels"
              :key="label.id"
              class="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5"
              :style="{
                backgroundColor: `${label.color}20`,
                color: label.color,
                border: `1px solid ${label.color}40`
              }"
            >
              <span>{{ label.name }}</span>
              <X
                class="h-3 w-3 cursor-pointer hover:opacity-70"
                @click.stop="handleRemoveLabel(label)"
              />
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="px-4 py-3">
          <Button
            variant="outline"
            size="sm"
            class="w-full"
            @click="handleAddLabel"
          >
            <Tag class="h-4 w-4 mr-2" />
            Adicionar Etiqueta
          </Button>
          <Button
            v-if="chat.labels && chat.labels.length > 0"
            variant="ghost"
            size="sm"
            class="w-full mt-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            @click="handleCreateLabel"
          >
            <Plus class="h-4 w-4 mr-2" />
            Criar Nova Etiqueta
          </Button>
        </div>
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Tag, X, Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { ChatSession, Label } from '@/types/conversations';

interface Props {
  chat: ChatSession;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'labels-changed': [labels: Label[]];
}>();

const isOpen = ref(false);

// Mock handlers (não implementados ainda)
const handleAddLabel = () => {
  console.log('Adicionar etiqueta - não implementado');
  // TODO: Abrir modal/seletor de etiquetas
};

const handleCreateLabel = () => {
  console.log('Criar nova etiqueta - não implementado');
  // TODO: Abrir modal de criação de etiqueta
};

const handleRemoveLabel = (label: Label) => {
  console.log('Remover etiqueta - não implementado', label);
  // TODO: Remover etiqueta da conversa
};
</script>

