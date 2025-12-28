<template>
  <div class="flex h-full flex-col">
    <ScrollArea class="flex-1">
      <div class="p-6">
        <div class="mx-auto max-w-7xl">
          <!-- Header -->
          <div class="mb-6 flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-2xl font-semibold">Preferências Gerais</h1>
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
                Configure suas preferências
              </p>
            </div>
          </div>

          <!-- Settings Card -->
          <Card>
            <CardHeader>
              <CardTitle>Página Inicial</CardTitle>
              <p class="text-sm text-muted-foreground mt-1">
                Escolha para onde você deseja ser redirecionado após fazer login
              </p>
            </CardHeader>
            <CardContent class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  v-for="option in routeOptions"
                  :key="option.value"
                  class="flex flex-col items-start space-y-3 rounded-lg border p-4 cursor-pointer transition-colors hover:bg-muted/50"
                  :class="{
                    'border-primary bg-primary/5': defaultRoute === option.value,
                    'border-border': defaultRoute !== option.value,
                  }"
                  @click="handleRouteChange(option.value)"
                >
                  <div class="flex items-center gap-2 w-full">
                    <div class="flex h-5 w-5 items-center justify-center">
                      <div
                        class="h-4 w-4 rounded-full border-2 transition-colors"
                        :class="
                          defaultRoute === option.value
                            ? 'border-primary bg-primary'
                            : 'border-muted-foreground'
                        "
                      >
                        <div
                          v-if="defaultRoute === option.value"
                          class="h-full w-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                    <component :is="option.icon" class="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div class="flex-1">
                    <Label class="text-base font-medium cursor-pointer">
                      {{ option.label }}
                    </Label>
                    <p class="text-sm text-muted-foreground mt-1">
                      {{ option.description }}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <!-- Notifications Card -->
          <Card class="mt-6">
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <p class="text-sm text-muted-foreground mt-1">
                Configure como deseja ser notificado sobre eventos importantes
              </p>
            </CardHeader>
            <CardContent>
              <div class="flex items-center justify-between">
                <div class="space-y-0.5">
                  <Label class="text-base">Ativar o som da notificação</Label>
                  <p class="text-sm text-muted-foreground">
                    Quando desativado, você não ouvirá sons de notificação para mensagens
                  </p>
                </div>
                <Switch
                  v-model="notificationSoundEnabled"
                  @update:model-value="handleToggleSound"
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
                  Preferências Gerais
                </DialogTitle>
              </DialogHeader>
              <div class="space-y-4">
                <p class="text-sm text-muted-foreground">
                  As <strong>Preferências Gerais</strong> permitem que você personalize sua experiência no sistema.
                </p>
                
                <div>
                  <h4 class="text-sm font-semibold mb-2">Página Inicial</h4>
                  <p class="text-sm text-muted-foreground">
                    Escolha qual página será exibida automaticamente após você fazer login. Isso ajuda a otimizar seu fluxo de trabalho, direcionando você diretamente para a área que você mais utiliza.
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
import { ref, computed, h, onMounted } from 'vue';
import { LayoutDashboard, MessagesSquare, Play, HelpCircle, Info } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useUserPreferencesStore, type DefaultRoute } from '@/stores';

const toast = useToast();
const preferencesStore = useUserPreferencesStore();
const openHelpDialog = ref(false);

const defaultRoute = computed({
  get: () => preferencesStore.defaultRoute,
  set: (value: DefaultRoute) => preferencesStore.setDefaultRoute(value),
});

// Notifications state
const notificationSoundEnabled = ref(false);

onMounted(() => {
  // Load notification preference from localStorage
  const saved = localStorage.getItem('notificationSoundEnabled');
  if (saved !== null) {
    notificationSoundEnabled.value = saved === 'true';
  }
});

const routeOptions = [
  {
    value: 'painel' as DefaultRoute,
    label: 'Painel',
    description: 'Visualize um resumo geral das suas atividades e estatísticas',
    icon: h(LayoutDashboard),
  },
  {
    value: 'conversations' as DefaultRoute,
    label: 'Conversas',
    description: 'Acesse diretamente suas conversas e mensagens',
    icon: h(MessagesSquare),
  },
  {
    value: 'execucao' as DefaultRoute,
    label: 'Modo Execução',
    description: 'Inicie no modo de execução de atividades e fluxos',
    icon: h(Play),
  },
];

function handleRouteChange(route: DefaultRoute) {
  defaultRoute.value = route;
  toast.success(
    'Preferência atualizada',
    `Você será redirecionado para ${routeOptions.find(o => o.value === route)?.label} após o login`
  );
}

function handleToggleSound(enabled: boolean) {
  notificationSoundEnabled.value = enabled;
  localStorage.setItem('notificationSoundEnabled', String(enabled));
  toast.success(
    'Configuração atualizada',
    enabled ? 'Som de notificação ativado' : 'Som de notificação desativado'
  );
}
</script>


