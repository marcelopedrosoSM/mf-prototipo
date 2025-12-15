<template>
  <Teleport to="body">
    <ToastProvider>
      <ToastViewport />
      <Toast
        v-for="toastItem in toasts"
        :key="toastItem.id"
        :variant="toastItem.variant || 'default'"
        :duration="toastItem.duration"
        :open="toastItem.open"
        @update:open="toastItem.onOpenChange"
      >
        <div class="grid gap-1">
          <ToastTitle v-if="toastItem.title">{{ toastItem.title }}</ToastTitle>
          <ToastDescription v-if="toastItem.description">
            {{ toastItem.description }}
          </ToastDescription>
        </div>
        <ToastClose />
      </Toast>
    </ToastProvider>
  </Teleport>
</template>

<script setup lang="ts">
import { Teleport } from 'vue'
import { useToast } from '@/composables/useToast'
import Toast from './Toast.vue'
import ToastViewport from './ToastViewport.vue'
import ToastTitle from './ToastTitle.vue'
import ToastDescription from './ToastDescription.vue'
import ToastClose from './ToastClose.vue'
import ToastProvider from './ToastProvider.vue'

const { toasts } = useToast()
</script>
