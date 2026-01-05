<template>
  <div class="flex items-center gap-3 p-3 bg-muted/50 rounded-md min-w-[240px]">
    <div
      class="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 text-primary shrink-0 cursor-pointer transition-colors"
      @click="togglePlay"
    >
      <Pause v-if="isPlaying" class="h-5 w-5 fill-current" />
      <Play v-else class="h-5 w-5 fill-current ml-0.5" />
    </div>

    <div class="flex-1 min-w-0 flex flex-col gap-1.5 cursor-pointer">
      <div 
        class="relative h-1.5 bg-muted-foreground/20 rounded-full overflow-hidden"
        @click="seek"
      >
        <div 
          class="absolute top-0 left-0 h-full bg-primary transition-all duration-100 ease-linear rounded-full"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="flex justify-between text-[11px] text-muted-foreground font-mono leading-none">
        <span>{{ formatTime(currentTime) }}</span>
        <span>{{ formatTime(duration) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';
import { Play, Pause } from 'lucide-vue-next';

const props = withDefaults(defineProps<{
  src?: string;
  duration?: number;
}>(), {
  duration: 30
});

const isPlaying = ref(false);
const currentTime = ref(0);
let interval: number | null = null;

const progressPercentage = computed(() => {
  return (currentTime.value / props.duration) * 100;
});

function togglePlay() {
  if (isPlaying.value) {
    pause();
  } else {
    play();
  }
}

function play() {
  isPlaying.value = true;
  if (currentTime.value >= props.duration) {
    currentTime.value = 0;
  }
  
  interval = window.setInterval(() => {
    currentTime.value += 0.1;
    if (currentTime.value >= props.duration) {
      pause();
      currentTime.value = props.duration;
    }
  }, 100);
}

function pause() {
  isPlaying.value = false;
  if (interval) {
    clearInterval(interval);
    interval = null;
  }
}

function seek(event: MouseEvent) {
  const element = event.currentTarget as HTMLElement;
  const rect = element.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const percentage = Math.max(0, Math.min(1, x / rect.width));
  currentTime.value = percentage * props.duration;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

onUnmounted(() => {
  pause();
});
</script>
