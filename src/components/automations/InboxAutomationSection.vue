<template>
  <Collapsible v-model:open="isOpen" class="border rounded-lg overflow-hidden">
    <CollapsibleTrigger class="w-full">
      <div 
        class="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div class="flex items-center gap-3">
          <SoftIcon class="h-8 w-8 rounded-full">
            <Inbox class="h-4 w-4" />
          </SoftIcon>
          <div class="text-left">
            <h3 class="font-semibold">{{ caixa.nome }}</h3>
            <p class="text-xs text-muted-foreground">
              {{ caixa.tipo === 'oficial' ? 'WhatsApp Oficial' : 'WhatsApp Não Oficial' }}
              <span v-if="caixa.phoneNumber"> • {{ caixa.phoneNumber }}</span>
            </p>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <Badge variant="outline" class="text-xs">
            {{ totalAutomations }} automações
          </Badge>
          <ChevronDown 
            class="h-5 w-5 text-muted-foreground transition-transform duration-200"
            :class="{ 'rotate-180': isOpen }"
          />
        </div>
      </div>
    </CollapsibleTrigger>
    
    <CollapsibleContent>
      <div class="px-4 py-3 bg-muted/10 border-t space-y-2">
        <!-- Nested Trigger Accordions -->
        <Collapsible 
          v-for="trigger in DISPLAY_TRIGGERS" 
          :key="trigger"
          class="border rounded-lg overflow-hidden"
        >
          <CollapsibleTrigger class="w-full">
            <div class="flex items-center justify-between px-3 py-2 bg-background hover:bg-muted/30 transition-colors cursor-pointer">
              <div class="flex items-center gap-2">
                <div 
                  class="h-6 w-6 rounded flex items-center justify-center"
                  :style="{ backgroundColor: TRIGGER_CONFIG[trigger].color + '20' }"
                >
                  <component 
                    :is="getTriggerIcon(trigger)" 
                    class="h-3.5 w-3.5"
                    :style="{ color: TRIGGER_CONFIG[trigger].color }"
                  />
                </div>
                <span class="text-sm font-medium">
                  {{ TRIGGER_CONFIG[trigger].label }}
                </span>
                <Badge variant="secondary" class="text-xs h-5 px-1.5">
                  {{ getAutomationsForTrigger(trigger).length }}
                </Badge>
              </div>
              <ChevronDown class="h-4 w-4 text-muted-foreground" />
            </div>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <div class="px-3 py-2 bg-muted/5 space-y-2">
              <!-- Automations in this trigger -->
              <div v-if="getAutomationsForTrigger(trigger).length > 0" class="space-y-2">
                <div 
                  v-for="automation in getAutomationsForTrigger(trigger)" 
                  :key="automation.id"
                  class="flex items-center justify-between p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors cursor-pointer"
                  @click="$emit('edit', automation)"
                >
                  <div class="flex items-center gap-3">
                    <div 
                      class="h-2 w-2 rounded-full"
                      :class="automation.ativo ? 'bg-green-500' : 'bg-muted-foreground'"
                    />
                    <span class="text-sm font-medium">{{ automation.nome }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div @click.stop class="flex items-center">
                      <Switch 
                        :model-value="automation.ativo"
                        @update:model-value="handleToggle(automation.id)"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" @click.stop class="h-8 w-8">
                          <MoreVertical class="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem @click="$emit('edit', automation)">
                          <Edit class="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem @click="$emit('delete', automation)" class="text-destructive">
                          <Trash2 class="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              <!-- Empty state for trigger -->
              <div 
                v-else 
                class="py-4 text-center text-xs text-muted-foreground"
              >
                Nenhuma automação configurada
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>

<script setup lang="ts">
import { ref, computed, type Component } from 'vue';
import { 
  Inbox, 
  ChevronDown, 
  Trash2, 
  MoreVertical, 
  Edit,
  MessageSquarePlus,
  MessageSquare,
  Send,
  CheckCircle2
} from 'lucide-vue-next';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TRIGGER_CONFIG, type AutomationTrigger, type Automation } from '@/types/automation';
import type { CaixaEntrada } from '@/types/caixas-entrada';
import { useAutomationsStore } from '@/stores/automations';
import { useToast } from '@/composables/useToast';
import SoftIcon from '@/components/ui/icon/SoftIcon.vue';

// Icon mapping for triggers
const TRIGGER_ICONS: Record<string, Component> = {
  MessageSquarePlus,
  MessageSquare,
  Send,
  CheckCircle2,
};

function getTriggerIcon(trigger: AutomationTrigger): Component {
  const iconName = TRIGGER_CONFIG[trigger].icon;
  return TRIGGER_ICONS[iconName] || MessageSquare;
}

interface Props {
  caixa: CaixaEntrada;
  automations: Automation[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  create: [caixaId: string, gatilho: AutomationTrigger];
  edit: [automation: Automation];
  toggle: [id: string];
  delete: [automation: Automation];
}>();

const store = useAutomationsStore();
const toast = useToast();
const isOpen = ref(false);

// The 4 real triggers to display as fixed sections
const DISPLAY_TRIGGERS: AutomationTrigger[] = [
  'conversa_criada',
  'mensagem_recebida',
  'mensagem_enviada',
  'conversa_finalizada',
];

const totalAutomations = computed(() => props.automations.length);

// Get automations filtered by trigger type
const getAutomationsForTrigger = (trigger: AutomationTrigger) => {
  return props.automations.filter(a => a.gatilho === trigger);
};

const handleToggle = (id: string) => {
  store.toggleAutomation(id);
  const automation = store.getAutomationById(id);
  if (automation) {
    toast.success(
      automation.ativo ? 'Automação ativada' : 'Automação desativada',
      `${automation.nome} foi ${automation.ativo ? 'ativada' : 'desativada'}`
    );
  }
};
</script>
