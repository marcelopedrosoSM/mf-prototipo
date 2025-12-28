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
    // Limpar todas as chaves do MyFlows
    localStorage.removeItem('myflows-executions');
    localStorage.removeItem('myflows-saved-flows');
    localStorage.removeItem('myflows-user-preferences');
    localStorage.removeItem('myflows-auth');
    
    message.value = '✅ Dados do MyFlows limpos com sucesso!';
    
    console.log('✅ Todas as chaves myflows-* removidas do localStorage!');
    
    // Redirecionar para o login após 2 segundos
    setTimeout(() => {
      router.push('/');
    }, 2000);
  } catch (error) {
    message.value = '❌ Erro ao limpar localStorage';
    console.error('Erro ao limpar localStorage:', error);
  }
});
</script>

