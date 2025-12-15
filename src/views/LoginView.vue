<template>
  <div class="flex h-screen w-full">
    <!-- Left side - Primary background (hidden on mobile/tablet) -->
    <div class="hidden md:flex md:w-full md:bg-primary"></div>

    <!-- Right side - Login form -->
    <div class="w-full md:max-w-[800px] flex items-center justify-center p-4">
      <div class="w-full max-w-[380px] flex flex-col">
        <!-- Logo -->
        <Logo class="self-center mb-12" />

        <!-- Login Form -->
        <LoginForm ref="loginFormRef" @submit="handleLogin" />

        <!-- Prototype Mode Notice -->
        <p class="mt-6 text-center text-xs text-muted-foreground">
          Modo Protótipo • Dados simulados
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Logo from '@/components/Logo.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';

const router = useRouter();
const toast = useToast();
const loginFormRef = ref<InstanceType<typeof LoginForm> | null>(null);

async function handleLogin(data: { email: string; password: string }) {
  try {
    const response = await api.post('/auth/login', data);
    const { token, user } = response.data;

    // Save token
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    // Show success toast
    toast.success('Login realizado com sucesso!', 'Bem-vindo ao MyFlows');

    // Redirect to conversations
    router.push('/conversations');
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
    loginFormRef.value?.setApiError(errorMessage);
    toast.error('Erro ao fazer login', errorMessage);
  }
}

</script>


