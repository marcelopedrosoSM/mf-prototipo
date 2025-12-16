<template>
  <div class="relative space-y-2">
    <Textarea
      ref="textareaRef"
      :value="modelValue"
      @input="handleInput"
      @blur="updateCursorPosition"
      @click="updateCursorPosition"
      @keyup="updateCursorPosition"
      :placeholder="placeholder"
      :rows="rows"
      class="w-full text-sm"
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
import { ref } from 'vue';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Braces } from 'lucide-vue-next';
import VariableSelector from './VariableSelector.vue';

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

const textareaRef = ref<InstanceType<typeof Textarea> | null>(null);
const isOpen = ref(false);
const cursorPosition = ref(0);

// Atualizar a posição do cursor sempre que houver interação
const updateCursorPosition = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  if (target) {
    cursorPosition.value = target.selectionStart;
  }
};

const handleInput = (e: Event) => {
  const target = e.target as HTMLTextAreaElement;
  emit('update:modelValue', target.value);
  cursorPosition.value = target.selectionStart;
};

// Inserir variável na posição do cursor
const handleInsertVariable = (variableName: string) => {
  const variableText = `{{${variableName}}}`;
  const currentValue = props.modelValue || '';
  
  // Usar a posição salva ou o final do texto se for 0/inválido
  // (mas queremos 0 se o usuário clicou no inicio, então ok)
  const pos = cursorPosition.value;
  
  const before = currentValue.slice(0, pos);
  const after = currentValue.slice(pos);
  
  const newValue = before + variableText + after;
  
  emit('update:modelValue', newValue);
  
  // Fechar popover
  isOpen.value = false;
  
  // Tentar focar de volta e mover cursor (nextTick)
  // Como estamos emitindo o valor, o Vue vai atualizar o DOM.
  // Precisamos garantir que o cursor vá para depois da variável.
  setTimeout(() => {
    // Acessar o elemento DOM real do componente Textarea (pode precisar de .el ou $el dependendo da impl)
    // Se Textarea for um componente Vue wrapper
    // Vamos tentar acessar via ref
    const textareaEl = textareaRef.value?.$el as HTMLTextAreaElement;
    if (textareaEl && textareaEl.focus) {
      textareaEl.focus();
      const newPos = pos + variableText.length;
      textareaEl.setSelectionRange(newPos, newPos);
      cursorPosition.value = newPos;
    } 
    // Fallback: se textareaRef.value for o elemento direto
    else if (textareaRef.value && (textareaRef.value as any).focus) {
       (textareaRef.value as any).focus();
       // ... lógica de cursor
    }
  }, 50);
};
</script>
