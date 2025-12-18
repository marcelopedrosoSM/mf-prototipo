<template>
  <div class="relative space-y-2">
    <TipTapEditor
      ref="editorRef"
      v-model="localValue"
      :placeholder="placeholder"
      :variables="systemVariables"
      :flowVariables="availableVariables"
    />

    <div class="flex justify-end">
      <Popover v-model:open="isOpen">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="flex items-center gap-2 h-7 px-3"
            title="Inserir variável"
          >
            <Braces class="h-3.5 w-3.5" />
            <span class="text-xs font-medium">Variáveis</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-[400px] p-0" align="end" side="bottom">
          <VariableSelector
            :flowVariables="availableVariables"
            @select="handleInsertVariable"
            @close="isOpen = false"
          />
        </PopoverContent>
      </Popover>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Braces } from 'lucide-vue-next';
import { TipTapEditor, type VariableItem } from '@/components/ui/tiptap';
import VariableSelector from './VariableSelector.vue';
import { SYSTEM_VARIABLES } from '@/constants/system-variables';

const props = withDefaults(defineProps<{
  modelValue: string;
  placeholder?: string;
  rows?: number;
  availableVariables?: string[];
}>(), {
  modelValue: '',
  placeholder: 'Digite o texto...',
  rows: 3,
  availableVariables: () => [],
});

const emit = defineEmits(['update:modelValue']);

const editorRef = ref<InstanceType<typeof TipTapEditor> | null>(null);
const isOpen = ref(false);
const localValue = ref(props.modelValue);

// Convert system variables to VariableItem format
const systemVariables = computed<VariableItem[]>(() => {
  return SYSTEM_VARIABLES.map(v => ({
    name: v.name,
    description: v.description,
    category: v.category,
    example: v.example,
  }));
});

// Sync localValue with modelValue (bidirectional)
watch(() => props.modelValue, (newValue) => {
  if (newValue !== localValue.value) {
    localValue.value = newValue;
  }
});

watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
});

// Insert variable at cursor position
const handleInsertVariable = (variableName: string) => {
  if (editorRef.value) {
    editorRef.value.insertVariable(variableName);
    editorRef.value.focus();
  }
  isOpen.value = false;
};
</script>
