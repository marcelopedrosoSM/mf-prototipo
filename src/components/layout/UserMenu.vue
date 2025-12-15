<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button class="flex items-center space-x-2 rounded-md px-3 py-2 interactive">
        <div class="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
          <span class="text-sm font-medium">{{ userInitials }}</span>
        </div>
        <div class="hidden text-left text-sm md:block">
          <p class="font-medium">{{ user.name }}</p>
          <p class="text-xs text-muted-foreground">{{ user.email }}</p>
        </div>
        <ChevronDown class="h-4 w-4 text-muted-foreground" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel>
        <div class="flex flex-col space-y-1">
          <p class="text-sm font-medium">{{ user.name }}</p>
          <p class="text-xs text-muted-foreground">{{ user.email }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="toggleTheme">
        <Sun v-if="resolvedTheme === 'light'" class="mr-2 h-4 w-4" />
        <Moon v-else class="mr-2 h-4 w-4" />
        <span>{{ resolvedTheme === 'light' ? 'Modo Escuro' : 'Modo Claro' }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        v-for="item in helpItems"
        :key="item.id"
      >
        <component :is="item.icon" class="mr-2 h-4 w-4" />
        <span>{{ item.label }}</span>
      </DropdownMenuItem>
      <DropdownMenuItem as-child>
        <router-link to="/settings" class="flex w-full items-center">
          <Settings class="mr-2 h-4 w-4" />
          <span>Configurações</span>
        </router-link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleLogout">
        <LogOut class="mr-2 h-4 w-4" />
        <span>Sair</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { ChevronDown, LogOut, Settings, Sun, Moon, MessageCircle } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/composables/useTheme';

const helpItems = [
  {
    id: 'support',
    label: 'Suporte',
    icon: h(MessageCircle),
  },
];

const router = useRouter();
const { resolvedTheme, toggleTheme } = useTheme();

// Get user from localStorage
const user = computed(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return { name: 'Usuário', email: 'user@myflows.com.br' };
    }
  }
  return { name: 'Usuário', email: 'user@myflows.com.br' };
});

const userInitials = computed(() => {
  const name = user.value.name || 'Usuário';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
});

function handleLogout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/');
}
</script>

