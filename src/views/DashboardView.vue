<template>
  <AppLayout>
    <div class="flex h-full items-center justify-center">
      <div class="text-center space-y-4">
        <div class="h-20 w-20 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Tool class="h-10 w-10 text-violet-600 animate-bounce" />
        </div>
        <h1 class="text-3xl font-bold text-foreground">Em construção</h1>
        <p class="text-muted-foreground max-w-sm mx-auto">
          Estamos preparando algo incrível para você. Esta seção estará disponível em breve com todas as funcionalidades.
        </p>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { Construction as Tool } from 'lucide-vue-next';
import AppLayout from '@/components/layout/AppLayout.vue';
</script>
