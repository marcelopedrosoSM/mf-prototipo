<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <!-- Email Field -->
    <div class="space-y-2">
      <Label for="email">E-mail</Label>
      <div class="relative">
        <Input
          id="email"
          v-model="email"
          type="email"
          placeholder="Informe o e-mail"
          :class="errors.email ? 'border-destructive pl-10' : 'pl-10'"
        />
        <Mail class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
    </div>

    <!-- Password Field -->
    <div class="space-y-2">
      <Label for="password">Senha</Label>
      <InputPassword id="password" v-model="password" :error="errors.password" />
      <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
    </div>

    <!-- Forgot Password Link -->
    <div class="flex justify-end">
      <router-link to="/auth/forgot-password" class="text-sm text-primary hover:underline">
        Esqueci minha senha
      </router-link>
    </div>

    <!-- API Error Message -->
    <Alert v-if="apiError" variant="destructive">
      <AlertCircle class="h-4 w-4" />
      <AlertTitle>Erro</AlertTitle>
      <AlertDescription>{{ apiError }}</AlertDescription>
    </Alert>

    <!-- Submit Button -->
    <div class="flex justify-center pt-2">
      <Button type="submit" :disabled="isLoading" class="w-full">
        <LogIn class="mr-2 h-4 w-4" />
        {{ isLoading ? 'Entrando...' : 'Entrar' }}
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Mail, LogIn, AlertCircle } from 'lucide-vue-next';
import { Input } from '@/components/ui/input';
import InputPassword from '@/components/ui/InputPassword.vue';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MOCK_CREDENTIALS } from '@/mocks/data/auth';

interface Errors {
  email?: string;
  password?: string;
}

// Pre-fill with mock credentials
const email = ref(MOCK_CREDENTIALS.email);
const password = ref(MOCK_CREDENTIALS.password);
const errors = ref<Errors>({});
const isLoading = ref(false);
const apiError = ref<string>('');

function validateEmail(value: string): string | undefined {
  if (!value) {
    return 'E-mail é obrigatório';
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Precisa ser um e-mail válido';
  }
  return undefined;
}

function validatePassword(value: string): string | undefined {
  if (!value) {
    return 'Senha é obrigatória';
  }
  return undefined;
}

async function handleSubmit() {
  errors.value = {};
  apiError.value = '';

  const emailError = validateEmail(email.value);
  const passwordError = validatePassword(password.value);

  if (emailError || passwordError) {
    errors.value = {
      email: emailError,
      password: passwordError,
    };
    return;
  }

  isLoading.value = true;

  try {
    // Emit event for parent to handle
    emit('submit', {
      email: email.value,
      password: password.value,
    });
  } catch (error: any) {
    apiError.value = error.response?.data?.message || 'Erro ao fazer login';
  } finally {
    isLoading.value = false;
  }
}

const emit = defineEmits<{
  submit: [{ email: string; password: string }];
  error: [message: string];
}>();

// Expose method to set API error from parent
defineExpose({
  setApiError: (message: string) => {
    apiError.value = message;
  },
  clearApiError: () => {
    apiError.value = '';
  },
});
</script>

