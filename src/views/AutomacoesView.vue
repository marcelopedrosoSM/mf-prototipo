<template>
  <div class="p-6 h-full">
    <div class="mx-auto max-w-5xl">
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
        <Button @click="router.push('/settings/caixas-entrada')">
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
    </div>

    <!-- Delete Confirmation Dialog -->
    <AlertDialog :open="deleteDialogOpen" @update:open="deleteDialogOpen = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
          <AlertDialogDescription>
            Tem certeza que deseja excluir a automação <strong>{{ automationToDelete?.nome }}</strong>?
            Esta ação não pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="deleteDialogOpen = false">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            @click="confirmDelete"
            class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Excluir
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { HelpCircle, Inbox, Plus, Loader2, Info } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
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

const router = useRouter();
const toast = useToast();
const automationsStore = useAutomationsStore();

// State
const loading = ref(false);
const caixas = ref<CaixaEntrada[]>([]);
const showHelpDialog = ref(false);
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
    automationsStore.setAutomations(getAutomations());
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
