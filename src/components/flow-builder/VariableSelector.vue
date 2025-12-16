<template>
  <Command class="rounded-lg border shadow-md w-full max-w-full overflow-hidden">
    <CommandInput 
      placeholder="Buscar variáveis..." 
    />
    
    <div v-if="!tokensOnly" class="px-3 py-2 border-b flex items-center justify-between">
      <Label for="show-system-vars" class="text-sm font-medium cursor-pointer">
        Mostrar variáveis do sistema
      </Label>
      <Switch
        id="show-system-vars"
        :checked="showSystemVariables"
        @update:checked="showSystemVariables = $event"
      />
    </div>

    <CommandList>
      <CommandEmpty>Nenhuma variável encontrada.</CommandEmpty>

      <!-- 🔐 Tokens da Conta -->
      <CommandGroup v-if="filteredTokens.length > 0" heading="Tokens da Conta">
        <CommandItem
          v-for="token in filteredTokens"
          :key="token.name"
          :value="token.name"
          @select="handleSelect(token.name)"
          class="flex flex-col items-start gap-1.5 cursor-pointer py-2.5 w-full max-w-full"
        >
          <div class="flex items-center gap-2 w-full min-w-0">
            <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
              <code class="text-sm font-mono text-primary font-medium truncate min-w-0 max-w-0 flex-1">
                {{ token.name }}
              </code>
              <code class="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0 whitespace-nowrap">
                {{ formatVariable(token.name) }}
              </code>
            </div>
            <Badge variant="outline" class="text-xs border-amber-500/30 text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 flex-shrink-0 whitespace-nowrap ml-2">
              Token
            </Badge>
          </div>
          <div class="flex flex-col gap-0.5 w-full min-w-0 max-w-full">
            <span class="text-xs text-muted-foreground leading-relaxed break-words w-full">
              {{ token.description }}
            </span>
            <div class="flex items-center gap-1.5 text-xs text-muted-foreground/80 w-full min-w-0">
              <div class="h-1 w-1 rounded-full bg-amber-500/60 flex-shrink-0" />
              <span class="break-words flex-1 min-w-0">Disponível apenas em tempo de execução</span>
            </div>
          </div>
        </CommandItem>
      </CommandGroup>

      <!-- 🆕 📇 Dados do Contato -->
      <CommandSeparator v-if="hasPreviousSections(1) && filteredContactVariables.length > 0" />
      <CommandGroup v-if="filteredContactVariables.length > 0" heading="Dados do Contato">
        <CommandItem
          v-for="variable in filteredContactVariables"
          :key="variable.name"
          :value="variable.name"
          @select="handleSelect(variable.name)"
          class="flex flex-col items-start gap-1 cursor-pointer w-full max-w-full"
        >
          <div class="flex items-center gap-2 w-full min-w-0">
            <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
              <code class="text-sm font-mono text-primary truncate min-w-0 max-w-0 flex-1">
                {{ variable.name }}
              </code>
              <code class="text-sm font-mono text-muted-foreground truncate min-w-0 flex-shrink-0 whitespace-nowrap">
                {{ formatVariable(variable.name) }}
              </code>
            </div>
            <Badge variant="secondary" class="text-xs ml-2 bg-purple-500/10 text-purple-700 dark:text-purple-300 flex-shrink-0 whitespace-nowrap">
              Contato
            </Badge>
          </div>
          <span class="text-xs text-muted-foreground break-words w-full">
            {{ variable.description }}
          </span>
          <span v-if="variable.example" class="text-xs text-muted-foreground italic break-words w-full">
            Exemplo: {{ variable.example }}
          </span>
        </CommandItem>
      </CommandGroup>

      <!-- Variáveis do Fluxo -->
      <CommandSeparator v-if="hasPreviousSections(2) && filteredFlowVariables.length > 0" />
      <CommandGroup v-if="filteredFlowVariables.length > 0" heading="Variáveis do Fluxo">
        <CommandItem
          v-for="variable in filteredFlowVariables"
          :key="variable"
          :value="variable"
          @select="handleSelect(variable)"
          class="flex items-center gap-2 cursor-pointer w-full max-w-full"
        >
          <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
            <code class="text-sm font-mono text-primary truncate min-w-0 max-w-0 flex-1">
              {{ variable }}
            </code>
            <code class="text-sm font-mono text-muted-foreground truncate min-w-0 flex-shrink-0 whitespace-nowrap">
              {{ formatVariable(variable) }}
            </code>
          </div>
          <Badge variant="outline" class="text-xs ml-2 flex-shrink-0 whitespace-nowrap">
            Fluxo
          </Badge>
        </CommandItem>
      </CommandGroup>

      <!-- Variáveis de Execução -->
      <CommandSeparator v-if="hasPreviousSections(5) && filteredExecutionVariables.length > 0" />
      <CommandGroup v-if="filteredExecutionVariables.length > 0" heading="Variáveis de Execução">
        <CommandItem
          v-for="variable in filteredExecutionVariables"
          :key="variable.name"
          :value="variable.name"
          @select="handleSelect(variable.name)"
          class="flex flex-col items-start gap-1 cursor-pointer w-full max-w-full"
        >
          <div class="flex items-center gap-2 w-full min-w-0">
            <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
              <code class="text-sm font-mono text-primary truncate min-w-0 max-w-0 flex-1">
                {{ variable.name }}
              </code>
              <code class="text-sm font-mono text-muted-foreground truncate min-w-0 flex-shrink-0 whitespace-nowrap">
                {{ formatVariable(variable.name) }}
              </code>
            </div>
            <Badge variant="outline" class="text-xs ml-2 flex-shrink-0 whitespace-nowrap">
              Execução
            </Badge>
          </div>
          <span class="text-xs text-muted-foreground break-words w-full">
            {{ variable.description }}
          </span>
          <span v-if="variable.example" class="text-xs text-muted-foreground italic break-words w-full">
            Exemplo: {{ variable.example }}
          </span>
        </CommandItem>
      </CommandGroup>

      <!-- Variáveis do Sistema -->
      <CommandSeparator v-if="hasPreviousSections(6) && showSystemVariables && Object.keys(systemVariablesByCategory).length > 0" />
      <CommandGroup v-if="showSystemVariables && Object.keys(systemVariablesByCategory).length > 0" heading="Variáveis do Sistema">
        <template v-for="category in ['data_hora']" :key="category">
          <div v-if="systemVariablesByCategory[category]?.length" class="space-y-1 mt-2 mb-2">
            <div class="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              {{ CATEGORY_LABELS[category] }}
            </div>
            <CommandItem
              v-for="variable in systemVariablesByCategory[category]"
              :key="variable.name"
              :value="variable.name"
              @select="handleSelect(variable.name)"
              class="flex flex-col items-start gap-1 cursor-pointer w-full max-w-full"
            >
              <div class="flex items-center gap-2 w-full min-w-0">
                <div class="flex items-center gap-2 flex-1 min-w-0 overflow-hidden">
                  <code class="text-sm font-mono text-primary truncate min-w-0 max-w-0 flex-1">
                    {{ variable.name }}
                  </code>
                  <code class="text-sm font-mono text-muted-foreground truncate min-w-0 flex-shrink-0 whitespace-nowrap">
                    {{ formatVariable(variable.name) }}
                  </code>
                </div>
                <Badge variant="secondary" class="text-xs ml-2 flex-shrink-0 whitespace-nowrap">
                  Sistema
                </Badge>
              </div>
              <span class="text-xs text-muted-foreground break-words w-full">
                {{ variable.description }}
              </span>
              <span v-if="variable.example" class="text-xs text-muted-foreground italic break-words w-full">
                Exemplo: {{ variable.example }}
              </span>
            </CommandItem>
          </div>
        </template>
      </CommandGroup>

    </CommandList>
  </Command>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  Command, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem, 
  CommandSeparator 
} from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { SYSTEM_VARIABLES, CATEGORY_LABELS, type SystemVariable } from '@/constants/system-variables';

const props = withDefaults(defineProps<{
  flowVariables?: string[];
  allowSensitive?: boolean;
  tokensOnly?: boolean;
}>(), {
  flowVariables: () => [],
  allowSensitive: false,
  tokensOnly: false,
});

const emit = defineEmits(['select', 'close']);

const showSystemVariables = ref(true);

const availableTokens = [
  { name: 'myflows_api_token', description: 'Token de API da MyFlows configurado na conta' },
  { name: 'sm_api_token', description: 'Token de API da SolarMarket configurado na conta' },
];

const filteredTokens = computed(() => {
  return (props.tokensOnly || props.allowSensitive) ? availableTokens : [];
});

const filteredContactVariables = computed(() => {
  return props.tokensOnly ? [] : SYSTEM_VARIABLES.filter(v => v.category === 'contato');
});

const filteredExecutionVariables = computed(() => {
  return props.tokensOnly ? [] : SYSTEM_VARIABLES.filter(v => v.category === 'execucao');
});

const filteredFlowVariables = computed(() => {
  return props.tokensOnly ? [] : props.flowVariables;
});

const filteredSystemVariables = computed(() => {
  if (props.tokensOnly) return [];
  return SYSTEM_VARIABLES.filter(v => 
    v.category !== 'execucao' && 
    v.category !== 'contato'
  );
});

const systemVariablesByCategory = computed(() => {
  const vars = filteredSystemVariables.value;
  return vars.reduce((acc, variable) => {
    if (!acc[variable.category]) {
      acc[variable.category] = [];
    }
    acc[variable.category].push(variable);
    return acc;
  }, {} as Record<string, SystemVariable[]>);
});

const hasPreviousSections = (currentIndex: number) => {
  const sections = [
    filteredTokens.value.length > 0,
    filteredContactVariables.value.length > 0, // 1
    filteredFlowVariables.value.length > 0, // 2
    false, // times
    false, // agentes
    filteredExecutionVariables.value.length > 0, // 5
    showSystemVariables.value && filteredSystemVariables.value.length > 0, // 6
  ];
  return sections.slice(0, currentIndex).some(Boolean);
};

const handleSelect = (variableName: string) => {
  emit('select', variableName);
  emit('close');
};

const formatVariable = (name: string) => `{{${name}}}`;
</script>
