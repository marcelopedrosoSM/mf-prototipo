<template>
  <ToastProviderPrimitive>
    <slot />
  </ToastProviderPrimitive>
</template>

<script setup lang="ts">
import { ToastProvider as ToastProviderPrimitive } from 'radix-vue'
</script>
