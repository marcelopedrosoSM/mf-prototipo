<template>
  <RouterView />
  <Toaster />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router';
import { Toaster } from '@/components/ui/toast';
import { useTheme } from '@/composables/useTheme';

// 🎨 Inicializar tema globalmente
useTheme();
</script>

