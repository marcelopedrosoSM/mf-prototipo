<template>
  <div class="flex items-center justify-center min-h-screen bg-background">
    <div class="text-center space-y-4">
      <div class="text-6xl mb-4">🧹</div>
      <h1 class="text-2xl font-bold">{{ message }}</h1>
      <p class="text-muted-foreground">Você pode fechar esta página agora.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const message = ref('Limpando localStorage...');

onMounted(() => {
  try {
    // Limpar apenas a chave específica myflows-executions
    localStorage.removeItem('myflows-executions');
    message.value = '✅ myflows-executions removido com sucesso!';
    
    console.log('✅ myflows-executions removido do localStorage!');
    
    // Redirecionar para o dashboard após 2 segundos
    setTimeout(() => {
      router.push('/dashboard');
    }, 2000);
  } catch (error) {
    message.value = '❌ Erro ao limpar localStorage';
    console.error('Erro ao limpar localStorage:', error);
  }
});
</script>

