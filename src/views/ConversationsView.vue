<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <div class="flex-1 overflow-y-auto p-6">
        <div class="mx-auto max-w-7xl">
          <div class="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div class="rounded-full bg-muted p-4">
              <Construction class="h-8 w-8 text-muted-foreground" />
            </div>
            <div class="text-center">
              <h1 class="text-2xl font-semibold mb-2">Conversas</h1>
              <p class="text-sm font-medium text-muted-foreground">Em construção</p>
              <p class="text-xs text-muted-foreground mt-2">Esta seção está sendo desenvolvida</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { Construction } from 'lucide-vue-next';
import AppLayout from '@/components/layout/AppLayout.vue';
</script>

