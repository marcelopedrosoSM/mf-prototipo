<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
        @click="close"
        @keydown.esc="close"
        tabindex="0"
        ref="containerRef"
      >
        <!-- Close Button -->
        <button
          class="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/50 rounded-full transition-colors"
          @click.stop="close"
        >
          <X class="h-6 w-6" />
        </button>

        <!-- Content -->
        <div class="relative max-w-[90vw] max-h-[90vh]" @click.stop>
          <img
            v-if="type === 'image'"
            :src="src"
            class="max-w-full max-h-[90vh] object-contain rounded-md shadow-2xl"
            alt="Media Preview"
          />
          <video
            v-else-if="type === 'video'"
            :src="src"
            class="max-w-full max-h-[90vh] rounded-md shadow-2xl"
            controls
            autoplay
          />
          
          <!-- Download Action (Optional) -->
          <div class="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-4">
             <a 
               :href="src" 
               download 
               class="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-sm font-medium transition-colors backdrop-blur-md"
               @click.stop
             >
               <Download class="h-4 w-4" />
               Baixar
             </a>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { X, Download } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
  src: string;
  type: 'image' | 'video';
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'close': [];
}>();

const containerRef = ref<HTMLElement | null>(null);

function close() {
  emit('close');
}

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
    nextTick(() => {
      containerRef.value?.focus();
    });
  } else {
    document.body.style.overflow = '';
  }
});
</script>
