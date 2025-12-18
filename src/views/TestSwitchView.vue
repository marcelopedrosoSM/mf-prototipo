<template>
  <div class="p-8 space-y-8">
    <h1 class="text-2xl font-bold">Teste do Switch - Captura de Estados</h1>
    
    <!-- Teste 1: v-model -->
    <div class="space-y-4 border p-4 rounded-lg">
      <h2 class="text-xl font-semibold">Teste 1: v-model</h2>
      <div class="flex items-center gap-4">
        <Switch v-model="switchValue1" />
        <span class="text-sm">Estado: <strong>{{ switchValue1 ? 'Ativado' : 'Desativado' }}</strong></span>
      </div>
      <div class="text-xs text-muted-foreground">
        Valor capturado: {{ switchValue1 }}
      </div>
    </div>

    <!-- Teste 2: :checked e @update:checked -->
    <div class="space-y-4 border p-4 rounded-lg">
      <h2 class="text-xl font-semibold">Teste 2: :checked e @update:checked</h2>
      <div class="flex items-center gap-4">
        <Switch :checked="switchValue2" @update:checked="switchValue2 = $event" />
        <span class="text-sm">Estado: <strong>{{ switchValue2 ? 'Ativado' : 'Desativado' }}</strong></span>
      </div>
      <div class="text-xs text-muted-foreground">
        Valor capturado: {{ switchValue2 }}
      </div>
    </div>

    <!-- Teste 3: v-model com handler customizado -->
    <div class="space-y-4 border p-4 rounded-lg">
      <h2 class="text-xl font-semibold">Teste 3: v-model com handler customizado</h2>
      <div class="flex items-center gap-4">
        <Switch v-model="switchValue3" @update:modelValue="handleSwitch3Change" />
        <span class="text-sm">Estado: <strong>{{ switchValue3 ? 'Ativado' : 'Desativado' }}</strong></span>
      </div>
      <div class="text-xs text-muted-foreground">
        Valor capturado: {{ switchValue3 }}
      </div>
      <div class="text-xs text-muted-foreground">
        Mudanças detectadas: {{ changeCount3 }}
      </div>
    </div>

    <!-- Teste 4: Múltiplos switches com array -->
    <div class="space-y-4 border p-4 rounded-lg">
      <h2 class="text-xl font-semibold">Teste 4: Múltiplos switches</h2>
      <div class="space-y-2">
        <div v-for="(item, index) in switchArray" :key="index" class="flex items-center gap-4">
          <Switch v-model="item.enabled" />
          <span class="text-sm">{{ item.label }}: <strong>{{ item.enabled ? 'Ativado' : 'Desativado' }}</strong></span>
        </div>
      </div>
      <div class="text-xs text-muted-foreground">
        Estados: {{ switchArray.map(s => s.enabled) }}
      </div>
    </div>

    <!-- Teste 5: Switch com Pinia Store -->
    <div class="space-y-4 border p-4 rounded-lg">
      <h2 class="text-xl font-semibold">Teste 5: Switch com Pinia Store (Notificações)</h2>
      <div class="flex items-center gap-4">
        <Switch 
          :checked="notificationsStore.isSoundEnabled" 
          @update:checked="notificationsStore.setSoundEnabled"
        />
        <span class="text-sm">Som de notificações: <strong>{{ notificationsStore.isSoundEnabled ? 'Ativado' : 'Desativado' }}</strong></span>
      </div>
      <div class="text-xs text-muted-foreground">
        Valor na store: {{ notificationsStore.settings.soundEnabled }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Switch } from '@/components/ui/switch';
import { useNotificationsStore } from '@/stores';

// Teste 1: v-model simples
const switchValue1 = ref(false);

// Teste 2: :checked e @update:checked
const switchValue2 = ref(true);

// Teste 3: v-model com handler
const switchValue3 = ref(false);
const changeCount3 = ref(0);

const handleSwitch3Change = (value: boolean) => {
  changeCount3.value++;
  console.log('Switch 3 mudou para:', value);
};

// Teste 4: Array de switches
const switchArray = ref([
  { label: 'Opção 1', enabled: false },
  { label: 'Opção 2', enabled: true },
  { label: 'Opção 3', enabled: false },
]);

// Teste 5: Pinia Store
const notificationsStore = useNotificationsStore();
</script>
