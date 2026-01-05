<template>
  <div class="space-y-3">
    <div v-for="i in items" :key="i" class="flex items-center gap-3 p-3 rounded-lg border">
      <!-- Avatar -->
      <Skeleton class="h-10 w-10 rounded-full flex-shrink-0" />
      
      <!-- Content -->
      <div class="flex-1 space-y-2">
        <Skeleton class="h-4 w-[60%]" />
        <Skeleton class="h-3 w-[40%]" />
      </div>
      
      <!-- Action/Status -->
      <Skeleton class="h-6 w-16 rounded-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  items?: number
}

withDefaults(defineProps<Props>(), {
  items: 5,
})
</script>
