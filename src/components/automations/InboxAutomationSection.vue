<template>
  <Collapsible v-model:open="isOpen" class="border rounded-lg overflow-hidden">
    <CollapsibleTrigger class="w-full">
      <div 
        class="flex items-center justify-between px-4 py-3 bg-card hover:bg-muted/30 transition-colors cursor-pointer"
      >
        <div class="flex items-center gap-3">
          <SoftIcon class="h-10 w-10 rounded-full">
            <Inbox class="h-5 w-5" />
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
        <!-- List of Automations -->
        <div 
          v-for="automation in props.automations" 
          :key="automation.id"
          class="flex items-center justify-between p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors cursor-pointer"
          @click="$emit('edit', automation)"
        >
          <div class="flex items-center gap-3">
            <div 
              class="h-2 w-2 rounded-full"
              :class="automation.ativo ? 'bg-green-500' : 'bg-muted-foreground'"
            />
            <div class="flex flex-col">
              <span class="text-sm font-medium">{{ automation.nome }}</span>
              <span class="text-xs text-muted-foreground">{{ getTriggerDescription(automation.gatilho) }}</span>
            </div>
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

        <!-- Empty State -->
        <div 
          v-if="automations.length === 0"
          class="text-center py-6 text-sm text-muted-foreground"
        >
          Nenhuma automação configurada
        </div>

        <!-- Create Button -->
        <Button 
          variant="outline" 
          size="sm" 
          class="w-full mt-2 border-dashed"
          @click="$emit('create', caixa.id, 'fluxo_unificado')"
        >
          <Plus class="h-4 w-4 mr-2" />
          Nova Automação
        </Button>
      </div>
    </CollapsibleContent>
  </Collapsible>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Inbox, ChevronDown, Trash2, Plus, MoreVertical, Edit } from 'lucide-vue-next';
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

const totalAutomations = computed(() => props.automations.length);

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

const getTriggerDescription = (gatilho: AutomationTrigger) => {
  return TRIGGER_CONFIG[gatilho]?.description || '';
};
</script>
