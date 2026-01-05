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
            to="/configuracoes/automacoes" 
            class="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <Zap class="h-4 w-4" />
            Automações
          </router-link>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
          <div class="flex items-center gap-2">
            <Inbox class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">{{ inboxName }}</span>
          </div>
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

      <!-- Right side - Actions and Toggle -->
      <div class="flex items-center space-x-4">
        <Button 
          :variant="hasUnsavedChanges ? 'default' : 'outline'" 
          size="sm"
          :disabled="!hasUnsavedChanges"
          :class="cn(!hasUnsavedChanges && 'opacity-60')"
          @click="$emit('save')"
        >
          <Check v-if="!hasUnsavedChanges" class="mr-2 h-4 w-4" />
          <Save v-else class="mr-2 h-4 w-4" />
          {{ hasUnsavedChanges ? 'Salvar' : 'Salvo' }}
        </Button>
        
        <!-- Export/Import Dropdown -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="outline" size="sm">
              <MoreHorizontal class="mr-2 h-4 w-4" />
              Mais
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="$emit('export')">
              <Download class="mr-2 h-4 w-4" />
              Exportar JSON
            </DropdownMenuItem>
            <DropdownMenuItem @click="triggerImport">
              <Upload class="mr-2 h-4 w-4" />
              Importar JSON
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <!-- Hidden file input for import -->
        <input 
          ref="fileInput"
          type="file" 
          accept=".json"
          class="hidden"
          @change="handleFileSelect"
        />

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
import { computed, ref } from 'vue';
import { Save, ArrowLeft, ChevronRight, Clock, MessageSquarePlus, MessageSquare, Send, CheckCircle2, MoreHorizontal, Download, Upload, Check, Inbox, Zap } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { TRIGGER_CONFIG, type AutomationTrigger } from '@/types/automation';

export type ViewMode = 'edit' | 'execution';

interface Props {
  automationName: string;
  triggerType: AutomationTrigger;
  inboxName?: string;
  isActive: boolean;
  viewMode?: ViewMode;
  hasUnsavedChanges?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  viewMode: 'edit',
  hasUnsavedChanges: true,
});

const emit = defineEmits<{
  'update:isActive': [value: boolean];
  'update:viewMode': [value: ViewMode];
  save: [];
  back: [];
  export: [];
  import: [file: File];
}>();

// File input ref for import
const fileInput = ref<HTMLInputElement | null>(null);

function triggerImport() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    emit('import', file);
    target.value = '';
  }
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
