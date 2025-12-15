<template>
  <Popover v-model:open="isOpen">
    <PopoverTrigger as-child>
      <button
        class="flex items-center justify-center rounded-md p-2 interactive"
        title="Buscar"
      >
        <Search class="h-5 w-5" />
      </button>
    </PopoverTrigger>
    <PopoverContent align="end" class="w-80 p-4">
      <div class="relative">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref="searchInputRef"
          v-model="searchQuery"
          type="search"
          placeholder="Buscar..."
          class="w-full pl-10"
          @keydown.enter="handleSearch"
          @keydown.escape="isOpen = false"
        />
      </div>
      <div v-if="searchQuery" class="mt-2 text-sm text-muted-foreground">
        Resultados para "{{ searchQuery }}"...
      </div>
    </PopoverContent>
  </Popover>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { Search } from 'lucide-vue-next';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

const isOpen = ref(false);
const searchQuery = ref('');
const searchInputRef = ref<InstanceType<typeof Input> | null>(null);

function handleSearch() {
  // Aqui você pode implementar a lógica de busca
  console.log('Buscando:', searchQuery.value);
  // Por exemplo: router.push(`/search?q=${searchQuery.value}`);
}

// Focar no input quando abrir
watch(isOpen, async (isOpenValue) => {
  if (isOpenValue) {
    await nextTick();
    // O Input do shadcn renderiza um input nativo, então precisamos acessar o elemento
    const inputElement = searchInputRef.value?.$el?.querySelector('input') as HTMLInputElement | undefined;
    if (inputElement) {
      inputElement.focus();
    }
  } else {
    searchQuery.value = '';
  }
});
</script>

