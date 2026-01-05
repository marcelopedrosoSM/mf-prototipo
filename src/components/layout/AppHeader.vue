<template>
  <header class="flex h-16 w-full items-center border-b bg-background px-4 shadow-sm relative z-50">
    <div class="flex w-full items-center justify-between">
      <!-- Left side - Logo/Brand -->
      <div class="flex items-center space-x-4">
        <Logo class="h-8 w-auto" />
      </div>

      <!-- Center - Navigation -->
      <nav class="flex items-center space-x-1">
        <router-link
          v-for="item in navigationItems"
          :key="item.path"
          :to="item.path"
          class="relative flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium interactive"
          :class="[
            isActiveRoute(item.path)
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          ]"
        >
          <component :is="item.icon" class="h-4 w-4" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Right side - Actions -->
      <div class="flex items-center space-x-4">
        <!-- Notifications -->
        <NotificationsMenu />
        
        <!-- User Menu -->
        <UserMenu />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { useRoute } from 'vue-router';
import { LayoutDashboard, MessagesSquare, Contact, Play, Workflow } from 'lucide-vue-next';
import Logo from '@/components/Logo.vue';
import UserMenu from './UserMenu.vue';
import NotificationsMenu from './NotificationsMenu.vue';

const route = useRoute();

const navigationItems = [
  {
    path: '/painel',
    label: 'Painel',
    icon: h(LayoutDashboard),
  },
  {
    path: '/conversas',
    label: 'Conversas',
    icon: h(MessagesSquare),
  },
  {
    path: '/execucao',
    label: 'Modo Execução',
    icon: h(Play),
  },
  {
    path: '/fluxos',
    label: 'Fluxos',
    icon: h(Workflow),
  },

  {
    path: '/contatos',
    label: 'Contatos',
    icon: h(Contact),
  },
];

function isActiveRoute(path: string): boolean {
  if (path === '/fluxos') {
    // Highlight /fluxos when on any /fluxos sub-route
    return route.path === '/fluxos' 
      || route.path.startsWith('/fluxos/')
      || route.path.startsWith('/flows/'); // Manter compatibilidade se necessário
  }
  return route.path === path;
}
</script>

