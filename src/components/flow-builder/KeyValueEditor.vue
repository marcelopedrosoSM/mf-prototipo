<template>
  <div class="space-y-2">
    <!-- Empty state -->
    <div v-if="pairs.length === 0" class="text-sm text-muted-foreground text-center py-4 border border-dashed rounded-md">
      Nenhum item configurado
    </div>

    <!-- Key-Value Rows -->
    <div v-else class="space-y-2">
      <div 
        v-for="(pair, index) in pairs" 
        :key="index"
        class="group flex items-center gap-2 p-2 rounded-lg transition-all bg-muted/30 hover:bg-muted/50"
        :class="{ 'opacity-50': pair.enabled === false }"
      >
        <!-- Toggle checkbox -->
        <button
          type="button"
          @click="togglePair(index)"
          class="w-4 h-4 rounded border-2 flex-shrink-0 transition-colors flex items-center justify-center"
          :class="pair.enabled !== false ? 'bg-primary border-primary' : 'bg-transparent border-muted-foreground/30'"
        >
          <Check v-if="pair.enabled !== false" class="h-3 w-3 text-primary-foreground" />
        </button>

        <!-- Key input -->
        <div class="flex-1 min-w-0">
          <Input
            :model-value="pair.key"
            @update:model-value="(v) => updatePair(index, 'key', String(v))"
            :placeholder="placeholderKey"
            :disabled="pair.enabled === false"
            class="h-8 text-sm font-mono"
            :class="{ 'text-primary': hasVariable(pair.key) }"
          />
        </div>

        <!-- Separator -->
        <span class="text-muted-foreground font-mono">=</span>

        <!-- Value input -->
        <div class="flex-1 min-w-0">
          <Input
            :model-value="pair.value"
            @update:model-value="(v) => updatePair(index, 'value', String(v))"
            :placeholder="placeholderValue"
            :disabled="pair.enabled === false"
            class="h-8 text-sm font-mono"
            :class="{ 'text-primary': hasVariable(pair.value) }"
          />
        </div>

        <!-- Variable selector button -->
        <Popover>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              class="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-primary"
              :disabled="pair.enabled === false"
              title="Inserir variável no valor"
            >
              <Variable class="h-3.5 w-3.5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-[400px] p-0" align="end">
            <VariableSelector
              :flowVariables="[]"
              :allowSensitive="allowSensitive"
              :tokensOnly="tokensOnly"
              @select="(v) => insertVariable(index, v)"
              @close=""
            />
          </PopoverContent>
        </Popover>

        <!-- Remove button -->
        <Button
          type="button"
          variant="ghost"
          size="icon"
          class="h-6 w-6 flex-shrink-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
          @click="removePair(index)"
        >
          <Trash2 class="h-3 w-3" />
        </Button>
      </div>
    </div>

    <!-- Add button -->
    <Button
      type="button"
      variant="outline"
      size="sm"
      @click="addPair"
      class="w-full mt-2"
    >
      <Plus class="h-3 w-3 mr-1" />
      {{ addButtonText }}
    </Button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Variable, Trash2, Plus } from 'lucide-vue-next';
import VariableSelector from './VariableSelector.vue';

interface KeyValuePair {
  key: string;
  value: string;
  enabled?: boolean;
}

const props = withDefaults(defineProps<{
  modelValue: string; // JSON string
  placeholderKey?: string;
  placeholderValue?: string;
  addButtonText?: string;
  allowSensitive?: boolean;
  tokensOnly?: boolean;
}>(), {
  modelValue: '',
  placeholderKey: 'Chave',
  placeholderValue: 'Valor',
  addButtonText: 'Adicionar Item',
  allowSensitive: false,
  tokensOnly: false,
});

const emit = defineEmits(['update:modelValue']);

// Local state
const pairs = ref<KeyValuePair[]>([]);

// Utility functions
function jsonToKeyValuePairs(jsonString: string): KeyValuePair[] {
  if (!jsonString?.trim()) return [];
  try {
    const parsed = JSON.parse(jsonString);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return [];
    return Object.entries(parsed).map(([key, value]) => ({
      key,
      value: String(value || ''),
      enabled: true
    }));
  } catch {
    return [];
  }
}

function keyValuePairsToJson(pairs: KeyValuePair[]): string {
  const obj: Record<string, string> = {};
  pairs.filter(p => p.enabled !== false && p.key.trim()).forEach(p => {
    obj[p.key.trim()] = p.value || '';
  });
  return Object.keys(obj).length > 0 ? JSON.stringify(obj, null, 2) : '';
}

function hasVariable(str: string): boolean {
  return /\{\{[^}]+\}\}/.test(str);
}

// Initialize from modelValue
watch(() => props.modelValue, (newValue) => {
  const parsed = jsonToKeyValuePairs(newValue);
  // Only update if different to avoid infinite loops
  if (JSON.stringify(parsed) !== JSON.stringify(pairs.value)) {
    pairs.value = parsed;
  }
}, { immediate: true });

// Handlers
function updatePair(index: number, field: 'key' | 'value', value: string) {
  pairs.value[index][field] = value;
  emit('update:modelValue', keyValuePairsToJson(pairs.value));
}

function togglePair(index: number) {
  pairs.value[index].enabled = pairs.value[index].enabled === false;
  emit('update:modelValue', keyValuePairsToJson(pairs.value));
}

function removePair(index: number) {
  pairs.value = pairs.value.filter((_, i) => i !== index);
  emit('update:modelValue', keyValuePairsToJson(pairs.value));
}

function addPair() {
  pairs.value.push({ key: '', value: '', enabled: true });
}

function insertVariable(index: number, varName: string) {
  const normalizedVar = varName.startsWith('{{') && varName.endsWith('}}') 
    ? varName 
    : `{{${varName}}}`;
  pairs.value[index].value = normalizedVar;
  emit('update:modelValue', keyValuePairsToJson(pairs.value));
}
</script>
