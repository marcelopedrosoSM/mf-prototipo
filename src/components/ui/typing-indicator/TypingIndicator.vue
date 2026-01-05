<template>
  <div class="inline-flex items-center gap-1.5 text-muted-foreground">
    <div class="flex gap-0.5">
      <span 
        v-for="i in 3" 
        :key="i"
        class="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
        :style="{ animationDelay: `${(i - 1) * 150}ms` }"
      />
    </div>
    <span v-if="showText" class="text-xs">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  showText?: boolean;
  text?: string;
}

withDefaults(defineProps<Props>(), {
  showText: true,
  text: 'digitando...',
});
</script>

<style scoped>
.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
}
</style>
