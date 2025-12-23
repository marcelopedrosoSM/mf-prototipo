<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button class="flex items-center space-x-2 rounded-md px-3 py-2 interactive">
        <SoftAvatar :name="user.name" class="h-8 w-8 text-sm" />
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
        as-child
      >
        <a
          :href="item.href"
          target="_blank"
          rel="noopener noreferrer"
          class="flex w-full items-center"
        >
          <component :is="item.icon" class="mr-2 h-4 w-4" />
          <span>{{ item.label }}</span>
          <ExternalLink class="ml-auto h-3 w-3 text-muted-foreground" />
        </a>
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
import { ChevronDown, LogOut, Settings, Sun, Moon, HelpCircle, ExternalLink } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore, useThemeStore } from '@/stores';
import SoftAvatar from '@/components/ui/avatar/SoftAvatar.vue';

const helpItems = [
  {
    id: 'support',
    label: 'Central de Ajuda',
    icon: h(HelpCircle),
    href: 'https://ajuda.myflows.com.br/en',
  },
];

const router = useRouter();
const authStore = useAuthStore();
const themeStore = useThemeStore();

// Get user from auth store
const user = computed(() => {
  if (authStore.user) {
    return {
      name: authStore.user.nome,
      email: authStore.user.email,
    };
  }
  return { name: 'Usuário', email: 'user@myflows.com.br' };
});



const resolvedTheme = computed(() => themeStore.effectiveTheme);

function toggleTheme() {
  themeStore.toggleTheme();
}

function handleLogout() {
  authStore.clearAuth();
  router.push('/');
}
</script>

