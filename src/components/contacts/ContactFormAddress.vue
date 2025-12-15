<template>
  <div class="space-y-4">
    <div>
      <h3 class="text-sm font-semibold mb-3">Endereço</h3>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="state">Estado</Label>
          <Select v-model="state" @update:model-value="handleStateChange">
            <SelectTrigger>
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="stateOption in states"
                :key="stateOption.value"
                :value="stateOption.value"
              >
                {{ stateOption.label }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="city">Cidade</Label>
          <Select v-model="city" :disabled="!state">
            <SelectTrigger>
              <SelectValue :placeholder="state ? 'Selecione a cidade' : 'Selecione primeiro o estado'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                v-for="cityOption in cities"
                :key="cityOption"
                :value="cityOption"
              >
                {{ cityOption }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BRAZILIAN_STATES, getCitiesByState } from '@/mocks/data/contacts';

interface Props {
  modelValueState: string;
  modelValueCity: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValueState': [value: string];
  'update:modelValueCity': [value: string];
}>();

const state = computed({
  get: () => props.modelValueState,
  set: (value) => emit('update:modelValueState', value),
});

const city = computed({
  get: () => props.modelValueCity,
  set: (value) => emit('update:modelValueCity', value),
});

const states = BRAZILIAN_STATES;

const cities = computed(() => {
  if (!state.value) return [];
  return getCitiesByState(state.value);
});

function handleStateChange(newState: string) {
  state.value = newState;
  city.value = ''; // Limpar cidade ao mudar estado
}

watch(state, () => {
  city.value = ''; // Limpar cidade quando estado mudar
});
</script>

