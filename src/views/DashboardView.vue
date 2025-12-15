<template>
  <AppLayout>
    <div class="flex flex-col items-center justify-center h-full p-6">
      <div class="rounded-full bg-muted p-6 mb-4">
        <Construction class="h-12 w-12 text-muted-foreground" />
      </div>
      <h2 class="text-xl font-semibold text-foreground mb-2">Em construção</h2>
      <p class="text-sm text-muted-foreground text-center max-w-md">
        Esta seção está sendo desenvolvida
      </p>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { Construction } from 'lucide-vue-next';
import AppLayout from '@/components/layout/AppLayout.vue';
</script>

