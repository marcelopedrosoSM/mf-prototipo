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
import { useRouter, useRoute } from 'vue-router';
import Logo from '@/components/Logo.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import { useToast } from '@/composables/useToast';
import { MOCK_CREDENTIALS, MOCK_USER } from '@/mocks/data/auth';
import { useAuthStore, useUserPreferencesStore } from '@/stores';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const authStore = useAuthStore();
const preferencesStore = useUserPreferencesStore();
const loginFormRef = ref<InstanceType<typeof LoginForm> | null>(null);

async function handleLogin(data: { email: string; password: string }) {
  try {
    // Check against mock credentials
    // Note: In a real app, we would hash the password
    if (data.email === MOCK_CREDENTIALS.email && data.password === MOCK_CREDENTIALS.password) {
      // Create mock session
      const token = 'mock-jwt-token-' + Date.now();
      const user = MOCK_USER;

      // Save to auth store (will automatically persist to localStorage)
      authStore.setAuth(token, {
        id: user.id,
        nome: user.name, // MOCK_USER has 'name', store expects 'nome'
        email: user.email,
        avatar: undefined,
        role: undefined,
      });


      // Show success toast
      toast.success('Login realizado com sucesso!', 'Bem-vindo ao MyFlows');

      // Redirect to the original destination or user's preferred route
      const redirect = route.query.redirect as string;
      if (redirect) {
        router.push(redirect);
      } else {
        // Use user's preferred default route
        const defaultRoute = preferencesStore.defaultRoute;
        router.push({ name: defaultRoute });
      }
    } else {
      // Try API as fallback or throw error
      // For this prototype fix, we treat non-matching mock creds as an error
      // unless we want to attempt the API. 
      // Given the user request to fix the error (likely API unreachable), 
      // we will throw an invalid credentials error immediately.
      throw new Error('E-mail ou senha inválidos');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    const errorMessage = error.message || error.response?.data?.message || 'Erro ao fazer login';
    loginFormRef.value?.setApiError(errorMessage);
    toast.error('Erro ao fazer login', errorMessage);
  }
}

</script>


