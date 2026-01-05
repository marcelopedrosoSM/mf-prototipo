<template>
  <Teleport to="body">
    <div 
      v-if="active"
      class="fixed inset-0 pointer-events-none z-[9999] overflow-hidden"
    >
      <div
        v-for="(particle, index) in particles"
        :key="index"
        class="absolute w-3 h-3 animate-confetti"
        :style="{
          left: `${particle.x}%`,
          top: '-20px',
          backgroundColor: particle.color,
          animationDelay: `${particle.delay}ms`,
          animationDuration: `${particle.duration}ms`,
          transform: `rotate(${particle.rotation}deg)`,
          borderRadius: particle.shape === 'circle' ? '50%' : '0',
        }"
      />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

interface Props {
  active?: boolean;
  particleCount?: number;
  duration?: number;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  particleCount: 50,
  duration: 3000,
});

const emit = defineEmits<{
  complete: [];
}>();

interface Particle {
  x: number;
  color: string;
  delay: number;
  duration: number;
  rotation: number;
  shape: 'square' | 'circle';
}

const particles = ref<Particle[]>([]);

const colors = [
  '#FF6B6B', // Red
  '#4ECDC4', // Teal
  '#FFE66D', // Yellow
  '#95E1D3', // Mint
  '#F38181', // Coral
  '#AA96DA', // Purple
  '#A8E6CF', // Light Green
  '#FFD93D', // Gold
];

function generateParticles() {
  particles.value = Array.from({ length: props.particleCount }, () => ({
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 500,
    duration: 2000 + Math.random() * 2000,
    rotation: Math.random() * 360,
    shape: Math.random() > 0.5 ? 'square' : 'circle',
  }));
}

let timeout: ReturnType<typeof setTimeout> | null = null;

watch(() => props.active, (isActive) => {
  if (isActive) {
    generateParticles();
    timeout = setTimeout(() => {
      particles.value = [];
      emit('complete');
    }, props.duration);
  } else {
    particles.value = [];
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  }
}, { immediate: true });

onUnmounted(() => {
  if (timeout) {
    clearTimeout(timeout);
  }
});
</script>

<style>
@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

.animate-confetti {
  animation: confetti-fall linear forwards;
}
</style>
