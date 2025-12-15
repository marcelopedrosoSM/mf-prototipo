<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold">Tokens de API</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8"
                  @click="openHelpDialog = true"
                >
                  <HelpCircle class="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
              <p class="text-sm text-muted-foreground mt-1">
                Gerencie os tokens de API para integração
              </p>
            </div>
            <Button @click="handleCreate">
              <Plus class="mr-2 h-4 w-4" />
              Cadastrar token de API
            </Button>
          </div>

          <!-- Table -->
          <TokensApiTable
            :tokens="tokens"
            :loading="loading"
            @view="handleView"
            @delete="handleDelete"
            @create="handleCreate"
          />

          <!-- Create Dialog -->
          <TokenApiDialog
            :open="dialogOpen"
            @open-change="handleDialogOpenChange"
            @save="handleSave"
          />

          <!-- Token Viewer Dialog -->
          <TokenApiViewerDialog
            :open="viewerDialogOpen"
            :token="viewedToken"
            @open-change="handleViewerDialogOpenChange"
          />

          <!-- Delete Confirmation Dialog -->
          <AlertDialog :open="deleteDialogOpen" @update:open="setDeleteDialogOpen">
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o token <strong>{{ itemToDelete?.title }}</strong>?
                  Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel @click="setDeleteDialogOpen(false)">Cancelar</AlertDialogCancel>
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
          <Dialog :open="openHelpDialog" @update:open="openHelpDialog = $event">
            <DialogContent class="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                  <Info class="h-5 w-5 text-primary" />
                  Tokens de API
                </DialogTitle>
              </DialogHeader>
              <div class="space-y-4">
                <p class="text-sm text-muted-foreground">
                  Os <strong>Tokens de API</strong> permitem que aplicações externas se integrem com o sistema de forma segura.
                </p>
                
                <div>
                  <h4 class="text-sm font-semibold mb-2">Permissões</h4>
                  <p class="text-sm text-muted-foreground">
                    Cada token pode ter permissões específicas de leitura ou escrita para diferentes recursos do sistema. Você pode escolher perfis pré-definidos ou configurar permissões individuais.
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button @click="openHelpDialog = false">Entendi</Button>
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
import { Plus, HelpCircle, Info } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import TokensApiTable from '@/components/settings/TokensApiTable.vue';
import TokenApiDialog from '@/components/settings/TokenApiDialog.vue';
import TokenApiViewerDialog from '@/components/settings/TokenApiViewerDialog.vue';
import {
  getTokensApi,
  addTokenApi,
  deleteTokenApi,
} from '@/mocks/data/tokens-api';
import { useToast } from '@/composables/useToast';
import type { TokenAPI } from '@/types/tokens-api';
import type { TokenApiFormData } from '@/schemas/tokens-api';

const toast = useToast();
const tokens = ref<TokenAPI[]>([]);
const loading = ref(false);
const dialogOpen = ref(false);
const deleteDialogOpen = ref(false);
const itemToDelete = ref<TokenAPI | null>(null);
const viewerDialogOpen = ref(false);
const viewedToken = ref<TokenAPI | null>(null);
const openHelpDialog = ref(false);

onMounted(() => {
  loadTokens();
});

function loadTokens() {
  loading.value = true;
  setTimeout(() => {
    tokens.value = [...getTokensApi()];
    loading.value = false;
  }, 500);
}

function handleCreate() {
  dialogOpen.value = true;
}

function handleView(token: TokenAPI) {
  viewedToken.value = token;
  viewerDialogOpen.value = true;
}

function handleDelete(token: TokenAPI) {
  itemToDelete.value = token;
  deleteDialogOpen.value = true;
}

function confirmDelete() {
  if (itemToDelete.value) {
    deleteTokenApi(itemToDelete.value.id);
    tokens.value = tokens.value.filter(
      (token) => token.id !== itemToDelete.value!.id
    );
    toast.success('Token excluído', `${itemToDelete.value.title} foi removido com sucesso.`);
    itemToDelete.value = null;
  }
  deleteDialogOpen.value = false;
}

function setDeleteDialogOpen(open: boolean) {
  deleteDialogOpen.value = open;
  if (!open) {
    itemToDelete.value = null;
  }
}

function handleSave(data: TokenApiFormData) {
  const newToken = addTokenApi({
    title: data.title,
    expiresAt: data.expiresAt,
    permissionIds: data.permissionIds,
  });
  tokens.value.push(newToken);
  toast.success('Token criado', `${data.title} foi criado com sucesso.`);
  dialogOpen.value = false;
  
  // Show token viewer
  viewedToken.value = newToken;
  viewerDialogOpen.value = true;
}

function handleDialogOpenChange(open: boolean) {
  dialogOpen.value = open;
}

function handleViewerDialogOpenChange(open: boolean) {
  viewerDialogOpen.value = open;
  if (!open) {
    viewedToken.value = null;
  }
}
</script>

