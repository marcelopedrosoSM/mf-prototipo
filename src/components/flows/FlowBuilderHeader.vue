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
          @click="$emit('validate')"
        >
          <ShieldCheck class="mr-2 h-4 w-4" />
          Validar
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          @click="$emit('layout')"
        >
          <Sparkles class="mr-2 h-4 w-4" />
          Organizar
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          @click="$emit('save')"
        >
          <Save class="mr-2 h-4 w-4" />
          Salvar
        </Button>
        <Button variant="outline" size="sm" title="Configurações">
          <Settings class="mr-2 h-4 w-4" />
          Configurações
        </Button>
        <div class="flex items-center gap-2 px-3 py-2 rounded-md border border-input bg-background h-[42px] w-[138px]">
          <Switch 
            id="flow-active-switch"
            :checked="localIsActive" 
            @update:checked="(val) => localIsActive = val"
            :model-value="localIsActive"
            @update:model-value="(val) => localIsActive = val"
          />
          <Label 
            for="flow-active-switch" 
            class="text-xs font-medium cursor-pointer select-none"
          >
            {{ localIsActive ? 'Ativado' : 'Desativado' }}
          </Label>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Workflow, Save, Settings, ArrowLeft, ChevronRight, ShieldCheck, Play, Sparkles } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface Props {
  flowName: string;
  isActive?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
});

const emit = defineEmits<{
  'toggle-active': [value: boolean];
  'update:isActive': [value: boolean];
  simulate: [];
  save: [];
  validate: [];
  back: [];
  layout: [];
}>();

// Criar referência local reativa inicializada com o valor da prop
const localIsActive = ref(props.isActive);

// Sincronizar mudanças da prop para a ref local
watch(() => props.isActive, (newVal) => {
  localIsActive.value = newVal;
}, { immediate: true });

// Sincronizar mudanças da ref local de volta para o componente pai
watch(localIsActive, (newVal) => {
  emit('update:isActive', newVal);
  emit('toggle-active', newVal);
});
</script>

