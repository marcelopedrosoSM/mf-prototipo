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
              class="px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors"
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

        <!-- Label Selector -->
        <div class="p-2">
           <Command>
            <CommandInput placeholder="Buscar etiqueta..." />
            <CommandList>
              <CommandEmpty>Nenhuma etiqueta encontrada.</CommandEmpty>
              <CommandGroup heading="Disponíveis">
                <CommandItem
                  v-for="label in availableLabels"
                  :key="label.id"
                  :value="label.name"
                  @select="handleSelectLabel(label)"
                  class="cursor-pointer"
                >
                  <div class="flex items-center gap-2">
                    <div 
                      class="h-3 w-3 rounded-full" 
                      :style="{ backgroundColor: label.color }"
                    />
                    <span>{{ label.name }}</span>
                  </div>
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </div>

        <!-- Actions -->
        <div class="px-2 pb-2 border-t border-border mt-2 pt-2">
          <div v-if="isCreating" class="p-2 space-y-3 bg-muted/30 rounded-md">
             <div class="space-y-2">
               <label class="text-xs font-medium">Nome</label>
               <input 
                 v-model="newLabelName"
                 class="w-full text-sm border rounded px-2 py-1 bg-background"
                 placeholder="Nova etiqueta"
                 @keydown.enter="handleCreateLabel"
                 auto-focus
               />
             </div>
             <div class="space-y-2">
               <label class="text-xs font-medium">Cor</label>
               <div class="flex flex-wrap gap-2">
                 <button
                   v-for="color in colors"
                   :key="color"
                   class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                   :class="newLabelColor === color ? 'border-primary' : 'border-transparent'"
                   :style="{ backgroundColor: color }"
                   @click="newLabelColor = color"
                 />
               </div>
             </div>
             <div class="flex gap-2 pt-1">
               <Button size="sm" class="flex-1" @click="handleCreateLabel">Criar</Button>
               <Button size="sm" variant="ghost" @click="isCreating = false">Cancelar</Button>
             </div>
          </div>

          <Button
            v-else
            variant="ghost"
            size="sm"
            class="w-full text-muted-foreground hover:text-foreground justify-start h-8"
            @click="isCreating = true"
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
import { ref, computed } from 'vue';
import { Tag, X, Plus } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem 
} from '@/components/ui/command';
import type { ChatSession, Label } from '@/types/conversations';
import { useLabelsStore } from '@/stores/labels';
import { useConversationsStore } from '@/stores/conversations';
import { useToast } from '@/components/ui/toast/use-toast';

interface Props {
  chat: ChatSession;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'labels-changed': [labels: Label[]];
}>();

const isOpen = ref(false);
const labelsStore = useLabelsStore();
const conversationsStore = useConversationsStore();
const { toast } = useToast();

const isCreating = ref(false);
const newLabelName = ref('');
const newLabelColor = ref('#3b82f6'); // Default blue

const colors = [
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
];

const availableLabels = computed(() => {
  const currentIds = props.chat.labels?.map(l => l.id) || [];
  return labelsStore.allLabels.filter(l => !currentIds.includes(l.id));
});

const handleSelectLabel = (label: Label) => {
  conversationsStore.addLabel(props.chat.id, label);
  toast({
    title: 'Etiqueta adicionada',
    description: `A etiqueta "${label.name}" foi adicionada à conversa.`
  });
};

const handleRemoveLabel = (label: Label) => {
  conversationsStore.removeLabel(props.chat.id, label.id);
  toast({
    title: 'Etiqueta removida',
    description: `A etiqueta "${label.name}" foi removida da conversa.`
  });
};

const handleCreateLabel = () => {
  if (!newLabelName.value.trim()) return;

  const label = labelsStore.createLabel(newLabelName.value, newLabelColor.value);
  // Auto-select the newly created label
  handleSelectLabel(label);
  
  // Reset
  newLabelName.value = '';
  isCreating.value = false;
};
</script>

