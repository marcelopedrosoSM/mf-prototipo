<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold">Notificações</h1>
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
                Configure as preferências de notificações
              </p>
            </div>
          </div>

          <!-- Settings Card -->
          <Card>
            <CardContent class="p-6">
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label class="text-base">Ativar o som da notificação</Label>
                  <p class="text-sm text-muted-foreground">
                    Quando desativado, você não ouvirá sons de notificação para mensagens
                  </p>
                </div>
                <Switch
                  :checked="notificationSoundEnabled"
                  @update:checked="handleToggleSound"
                />
              </div>
            </CardContent>
          </Card>

          <!-- Help Dialog -->
          <Dialog :open="openHelpDialog" @update:open="openHelpDialog = $event">
            <DialogContent class="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle class="flex items-center gap-2">
                  <Info class="h-5 w-5 text-primary" />
                  Notificações
                </DialogTitle>
              </DialogHeader>
              <div class="space-y-4">
                <p class="text-sm text-muted-foreground">
                  As <strong>Notificações</strong> permitem que você configure como deseja ser notificado sobre eventos importantes no sistema.
                </p>
                
                <div>
                  <h4 class="text-sm font-semibold mb-2">Som de Notificação</h4>
                  <p class="text-sm text-muted-foreground">
                    Quando ativado, você receberá alertas sonoros ao enviar ou receber mensagens. Isso ajuda a manter você informado sobre novas atividades mesmo quando não está visualizando a tela.
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
import { HelpCircle, Info } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/composables/useToast';

const toast = useToast();
const notificationSoundEnabled = ref(false);
const openHelpDialog = ref(false);

onMounted(() => {
  // Load from localStorage or default
  const saved = localStorage.getItem('notificationSoundEnabled');
  if (saved !== null) {
    notificationSoundEnabled.value = saved === 'true';
  }
});

function handleToggleSound(enabled: boolean) {
  notificationSoundEnabled.value = enabled;
  localStorage.setItem('notificationSoundEnabled', String(enabled));
  toast.success(
    'Configuração atualizada',
    enabled ? 'Som de notificação ativado' : 'Som de notificação desativado'
  );
}
</script>

