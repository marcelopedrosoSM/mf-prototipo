<template>
  <header class="flex h-16 w-full items-center border-b bg-background px-6 shadow-sm relative z-50">
    <div class="flex w-full items-center justify-between">
      <!-- Left side - Back Button + Breadcrumb -->
      <div class="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon"
          @click="$emit('back')"
          title="Voltar para Automações"
          class="flex-shrink-0"
        >
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div class="flex items-center gap-2">
          <router-link 
            to="/settings/automacoes" 
            class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Automações
          </router-link>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
          <div class="flex items-center gap-2">
            <div 
              class="h-6 w-6 rounded-md flex items-center justify-center flex-shrink-0"
              :style="{ backgroundColor: triggerConfig.color + '20' }"
            >
              <component 
                :is="iconComponent" 
                class="h-3.5 w-3.5"
                :style="{ color: triggerConfig.color }"
              />
            </div>
            <div class="flex flex-col">
              <span class="text-sm font-semibold leading-none">{{ automationName }}</span>
              <span class="text-xs text-muted-foreground">{{ triggerConfig.label }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Center - Mode Toggle (pill-style) -->
      <div class="absolute left-1/2 -translate-x-1/2">
        <div class="flex items-center p-1 rounded-full border bg-muted/30">
          <button
            @click="handleModeChange('edit')"
            :class="cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              viewMode === 'edit' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )"
          >
            <Pencil class="h-4 w-4" />
            Edição
          </button>
          <button
            @click="handleModeChange('execution')"
            :class="cn(
              'flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all',
              viewMode === 'execution' 
                ? 'bg-primary text-primary-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            )"
          >
            <Radio class="h-4 w-4" />
            Execução
          </button>
        </div>
      </div>

      <!-- Right side - Actions and Toggle -->
      <div class="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          @click="$emit('save')"
        >
          <Save class="mr-2 h-4 w-4" />
          Salvar
        </Button>

        <div class="flex items-center gap-2 px-3 h-9 rounded-md border border-input bg-background ml-4 w-[138px]">
          <Switch 
            id="automation-active-switch" 
            :model-value="isActive"
            @update:model-value="$emit('update:isActive', $event)"
          />
          <Label 
            for="automation-active-switch" 
            class="text-xs font-medium cursor-pointer select-none whitespace-nowrap"
          >
            {{ isActive ? 'Ativada' : 'Desativada' }}
          </Label>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Save, ArrowLeft, ChevronRight, Clock, MessageSquarePlus, MessageSquare, Send, CheckCircle2, Pencil, Radio } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { TRIGGER_CONFIG, type AutomationTrigger } from '@/types/automation';

export type ViewMode = 'edit' | 'execution';

interface Props {
  automationName: string;
  triggerType: AutomationTrigger;
  isActive: boolean;
  viewMode?: ViewMode;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'edit'
});

const emit = defineEmits<{
  'update:isActive': [value: boolean];
  'update:viewMode': [value: ViewMode];
  save: [];
  back: [];
}>();

function handleModeChange(mode: ViewMode) {
  emit('update:viewMode', mode);
}

const triggerConfig = computed(() => TRIGGER_CONFIG[props.triggerType] || TRIGGER_CONFIG.mensagem_recebida);

const ICON_MAP = {
  'Clock': Clock,
  'MessageSquarePlus': MessageSquarePlus,
  'MessageSquare': MessageSquare,
  'Send': Send,
  'CheckCircle2': CheckCircle2,
};

const iconComponent = computed(() => {
  const iconName = triggerConfig.value.icon as keyof typeof ICON_MAP;
  return ICON_MAP[iconName] || Clock;
});
</script>
