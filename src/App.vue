<template>
  <RouterView />
  <Toaster />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/toast';
import { useThemeStore } from '@/stores';

// 🎨 Inicializar tema globalmente usando Pinia store
// O watch na store com immediate:true vai aplicar o tema automaticamente
const themeStore = useThemeStore();

// Inicializar listeners para mudanças no tema do sistema
themeStore.initTheme();
</script>

