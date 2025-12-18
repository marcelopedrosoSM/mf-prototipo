<template>
  <header class="flex h-16 w-full items-center border-b bg-background px-6 shadow-sm relative z-50">
    <div class="flex w-full items-center justify-between">
      <!-- Left side - Back Button + Breadcrumb -->
      <div class="flex items-center space-x-3">
        <Button 
          variant="ghost" 
          size="icon"
          @click="$emit('back')"
          title="Voltar para Fluxos"
          class="flex-shrink-0"
        >
          <ArrowLeft class="h-4 w-4" />
        </Button>
        <div class="flex items-center gap-2">
          <router-link 
            to="/flows" 
            class="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            Fluxos
          </router-link>
          <ChevronRight class="h-4 w-4 text-muted-foreground" />
          <div class="flex items-center gap-2">
            <div class="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Workflow class="h-3.5 w-3.5 text-primary" />
            </div>
            <span class="text-sm font-semibold">{{ flowName }}</span>
          </div>
        </div>
      </div>

      <!-- Right side - Actions and Toggle -->
      <div class="flex items-center space-x-4">
        <Button 
          variant="outline" 
          size="sm"
          @click="$emit('simulate')"
        >
          <Play class="mr-2 h-4 w-4" />
          Simulação
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          @click="showValidateDialog = true"
        >
          <ShieldCheck class="mr-2 h-4 w-4" />
          Validar
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          @click="$emit('save')"
        >
          <Save class="mr-2 h-4 w-4" />
          Salvar
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          title="Configurações"
          @click="$emit('settings')"
        >
          <Settings class="mr-2 h-4 w-4" />
          Configurações
        </Button>

        <div class="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background h-[42px] w-[138px]">
          <Switch 
            id="flow-active-switch" 
            v-model="isActive"
          />
          <Label 
            for="flow-active-switch" 
            class="text-xs font-medium cursor-pointer select-none"
          >
            {{ isActive ? 'Ativado' : 'Desativado' }}
          </Label>
        </div>
      </div>
    </div>

    <!-- Modal de Validação -->
    <Dialog v-model:open="showValidateDialog">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Validação do fluxo</DialogTitle>
          <DialogDescription class="text-left mt-4">
            <p class="mb-4">
              A funcionalidade de validação do fluxo será implementada para verificar a integridade e a corretude do fluxo criado.
            </p>
            <p class="mb-2 font-medium">Esta funcionalidade irá verificar:</p>
            <ul class="list-disc list-inside space-y-2 text-sm text-muted-foreground ml-2">
              <li>Conectividade entre os blocos</li>
              <li>Presença de blocos obrigatórios (ex: Gatilho)</li>
              <li>Configurações válidas em cada bloco</li>
              <li>Caminhos sem saída ou loops infinitos</li>
              <li>Variáveis não definidas ou referências inválidas</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Workflow, Save, Settings, ArrowLeft, ChevronRight, ShieldCheck, Play } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Props {
  flowName: string;
}

defineProps<Props>();

// 🚀 defineModel simplifica a prop isActive e as emissões update:isActive e toggle-active
const isActive = defineModel<boolean>('isActive', { default: false });

const emit = defineEmits<{
  'toggle-active': [value: boolean];
  simulate: [];
  save: [];
  validate: [];
  back: [];
  layout: [];
  settings: [];
}>();

const showValidateDialog = ref(false);

// Sincronizar mudança do model com o evento legado 'toggle-active' para compatibilidade
watch(isActive, (newVal) => {
  emit('toggle-active', newVal);
});
</script>


