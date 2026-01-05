<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold">Automações</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="showHelpDialog = true"
                >
                  <HelpCircle class="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <p class="text-sm text-muted-foreground mt-1">
                Configure regras automáticas para cada caixa de entrada
              </p>
            </div>
            <Button @click="showCreateDialog = true" v-if="caixas.length > 0">
              <Plus class="h-4 w-4 mr-2" />
              Nova Automação
            </Button>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="flex items-center justify-center py-12">
            <Loader2 class="h-8 w-8 animate-spin text-muted-foreground" />
          </div>

          <!-- Empty State -->
          <div 
            v-else-if="caixas.length === 0" 
            class="text-center py-16 border rounded-lg bg-muted/20"
          >
            <Inbox class="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 class="text-lg font-medium mb-2">Nenhuma caixa de entrada</h3>
            <p class="text-sm text-muted-foreground mb-4">
              Cadastre uma caixa de entrada para configurar automações
            </p>
            <Button @click="router.push('/configuracoes/caixas-entrada')">
              <Plus class="h-4 w-4 mr-2" />
              Cadastrar Caixa
            </Button>
          </div>

          <!-- Inbox Sections -->
          <div v-else class="space-y-4">
            <InboxAutomationSection
              v-for="caixa in caixas"
              :key="caixa.id"
              :caixa="caixa"
              :automations="getAutomationsForInbox(caixa.id)"
              @create="handleCreate"
              @edit="handleEdit"
              @toggle="handleToggle"
              @delete="handleDelete"
            />
          </div>

          <!-- Delete Confirmation Dialog -->
          <ConfirmDialog 
            :open="deleteDialogOpen"
            title="Excluir automação"
            :description="`Tem certeza que deseja excluir a automação ${automationToDelete?.nome}? Esta ação não pode ser desfeita.`"
            confirm-text="Excluir"
            cancel-text="Cancelar"
            action-type="delete"
            @update:open="deleteDialogOpen = $event"
            @confirm="confirmDelete"
          />

          <!-- Help Dialog -->
          <Dialog :open="showHelpDialog" @update:open="showHelpDialog = $event">
            <DialogContent class="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                  <Info class="h-5 w-5 text-primary" />
                  Automações
                </DialogTitle>
              </DialogHeader>
              <div class="space-y-4">
                <p class="text-sm text-muted-foreground">
                  As <strong>Automações</strong> permitem configurar regras automáticas para cada caixa de entrada, 
                  diferente dos Fluxos que são chatbots interativos.
                </p>
                
                <div>
                  <h4 class="text-sm font-semibold mb-2">Gatilhos Disponíveis</h4>
                  <ul class="text-sm text-muted-foreground space-y-1">
                    <li>• <strong>Horário de Atendimento</strong>: Responder dentro ou fora do horário comercial</li>
                    <li>• <strong>Conversa Criada</strong>: Quando uma nova conversa é iniciada</li>
                    <li>• <strong>Mensagem Recebida</strong>: Ao receber uma mensagem do contato</li>
                    <li>• <strong>Mensagem Enviada</strong>: Ao enviar uma mensagem para o contato</li>
                    <li>• <strong>Conversa Finalizada</strong>: Quando uma conversa é encerrada</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button @click="showHelpDialog = false">Entendi</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <!-- Create Automation Dialog -->
          <Dialog :open="showCreateDialog" @update:open="(val) => { showCreateDialog = val; if (!val) resetCreateDialog(); }">
            <DialogContent class="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Nova Automação</DialogTitle>
                <DialogDescription>
                  Informe o nome da automação e selecione a caixa de entrada e o gatilho.
                </DialogDescription>
              </DialogHeader>
              <div class="space-y-4 py-4">
                <div class="space-y-2">
                  <Label>Nome da Automação</Label>
                  <Input 
                    v-model="automationName" 
                    placeholder="Ex: Resposta Automática"
                    @keyup.enter="handleCreateFromDialog"
                  />
                </div>
                <div class="space-y-2">
                  <Label>Caixa de Entrada</Label>
                  <Select v-model="selectedCaixaId">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma caixa" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="caixa in caixas" 
                        :key="caixa.id" 
                        :value="caixa.id"
                      >
                        {{ caixa.nome }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div class="space-y-2">
                  <Label>Gatilho</Label>
                  <Select v-model="selectedTrigger">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um gatilho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem 
                        v-for="trigger in AVAILABLE_TRIGGERS" 
                        :key="trigger.key" 
                        :value="trigger.key"
                      >
                        {{ trigger.label }}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" @click="showCreateDialog = false">Cancelar</Button>
                <Button 
                  @click="handleCreateFromDialog" 
                  :disabled="!automationName.trim() || !selectedCaixaId || !selectedTrigger"
                >
                  Criar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </ScrollArea>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { HelpCircle, Inbox, Plus, Loader2, Info } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import InboxAutomationSection from '@/components/automations/InboxAutomationSection.vue';
import { getCaixasEntrada } from '@/mocks/data/caixas-entrada';
import { getAutomations } from '@/mocks/data/automations';
import { useAutomationsStore } from '@/stores/automations';
import { useToast } from '@/composables/useToast';
import type { CaixaEntrada } from '@/types/caixas-entrada';
import type { Automation, AutomationTrigger } from '@/types/automation';
import { TRIGGER_CONFIG } from '@/types/automation';

const router = useRouter();
const toast = useToast();
const automationsStore = useAutomationsStore();

// Available triggers for selection
const AVAILABLE_TRIGGERS = [
  { key: 'conversa_criada', label: TRIGGER_CONFIG.conversa_criada.label },
  { key: 'mensagem_recebida', label: TRIGGER_CONFIG.mensagem_recebida.label },
  { key: 'mensagem_enviada', label: TRIGGER_CONFIG.mensagem_enviada.label },
  { key: 'conversa_finalizada', label: TRIGGER_CONFIG.conversa_finalizada.label },
  { key: 'contato_criado', label: TRIGGER_CONFIG.contato_criado.label },
];

// State
const loading = ref(false);
const caixas = ref<CaixaEntrada[]>([]);
const showHelpDialog = ref(false);
const showCreateDialog = ref(false);
const selectedCaixaId = ref<string>('');
const selectedTrigger = ref<string>('');
const automationName = ref<string>('');
const deleteDialogOpen = ref(false);
const automationToDelete = ref<Automation | null>(null);

// Load data on mount
onMounted(() => {
  loadData();
});

function loadData() {
  loading.value = true;
  setTimeout(() => {
    caixas.value = getCaixasEntrada();
    // Only load mock automations if store is empty (no persisted data)
    if (automationsStore.automations.length === 0) {
      automationsStore.setAutomations(getAutomations());
    }
    loading.value = false;
  }, 300);
}

// Get automations for a specific inbox
function getAutomationsForInbox(caixaId: string): Automation[] {
  return automationsStore.getAutomationsByInbox(caixaId);
}

// Handlers
function handleCreate(caixaId: string, gatilho: AutomationTrigger) {
  router.push(`/automacoes/${caixaId}/${gatilho}/novo`);
}

function resetCreateDialog() {
  automationName.value = '';
  selectedCaixaId.value = '';
  selectedTrigger.value = '';
}

function handleCreateFromDialog() {
  if (automationName.value.trim() && selectedCaixaId.value && selectedTrigger.value) {
    const nome = encodeURIComponent(automationName.value.trim());
    router.push(`/automacoes/${selectedCaixaId.value}/${selectedTrigger.value}/novo?nome=${nome}`);
    showCreateDialog.value = false;
    resetCreateDialog();
  }
}

function handleEdit(automation: Automation) {
  router.push(`/automacoes/${automation.caixaId}/${automation.gatilho}/${automation.id}`);
}

function handleToggle(id: string) {
  automationsStore.toggleAutomation(id);
  const automation = automationsStore.getAutomationById(id);
  if (automation) {
    toast.success(
      automation.ativo ? 'Automação ativada' : 'Automação desativada',
      `${automation.nome} foi ${automation.ativo ? 'ativada' : 'desativada'}`
    );
  }
}

function handleDelete(automation: Automation) {
  automationToDelete.value = automation;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (automationToDelete.value) {
    automationsStore.deleteAutomation(automationToDelete.value.id);
    toast.success('Automação excluída', `${automationToDelete.value.nome} foi removida`);
  }
  deleteDialogOpen.value = false;
  automationToDelete.value = null;
}
</script>
