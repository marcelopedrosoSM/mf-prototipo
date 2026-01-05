<template>
  <div class="space-y-3">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="space-y-2">
        <Skeleton class="h-4 w-[250px]" />
        <Skeleton class="h-3 w-[200px]" />
      </div>
      <Skeleton class="h-9 w-[100px]" />
    </div>
    
    <!-- Table Header -->
    <div class="flex items-center gap-4 py-3 border-b">
      <Skeleton class="h-4 w-4" />
      <Skeleton class="h-4 w-[150px]" />
      <Skeleton class="h-4 w-[120px]" />
      <Skeleton class="h-4 w-[100px]" />
      <Skeleton class="h-4 w-[80px]" />
    </div>
    
    <!-- Table Rows -->
    <div v-for="i in rows" :key="i" class="flex items-center gap-4 py-3">
      <Skeleton class="h-4 w-4" />
      <Skeleton class="h-4" :class="getRandomWidth()" />
      <Skeleton class="h-4" :class="getRandomWidth()" />
      <Skeleton class="h-4 w-[100px]" />
      <Skeleton class="h-6 w-[70px] rounded-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  rows?: number
}

withDefaults(defineProps<Props>(), {
  rows: 5,
})

const widths = ['w-[120px]', 'w-[150px]', 'w-[180px]', 'w-[100px]']

const getRandomWidth = () => {
  return widths[Math.floor(Math.random() * widths.length)]
}
</script>
