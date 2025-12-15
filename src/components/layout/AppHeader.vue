<template>
  <header class="flex h-16 w-full items-center border-b bg-background px-4 shadow-sm">
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
          class="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium interactive"
          :class="{
            'bg-accent text-accent-foreground': isActiveRoute(item.path),
          }"
        >
          <component :is="item.icon" class="h-4 w-4" />
          <span>{{ item.label }}</span>
        </router-link>
      </nav>

      <!-- Right side - Actions -->
      <div class="flex items-center space-x-4">
        <!-- User Menu -->
        <UserMenu />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { h, computed } from 'vue';
import { useRoute } from 'vue-router';
import { LayoutDashboard, MessagesSquare, Contact, Workflow } from 'lucide-vue-next';
import Logo from '@/components/Logo.vue';
import UserMenu from './UserMenu.vue';

const route = useRoute();

const navigationItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: h(LayoutDashboard),
  },
  {
    path: '/conversations',
    label: 'Conversas',
    icon: h(MessagesSquare),
  },
  {
    path: '/flows',
    label: 'Fluxos',
    icon: h(Workflow),
  },
  {
    path: '/contacts',
    label: 'Contatos',
    icon: h(Contact),
  },
];

function isActiveRoute(path: string): boolean {
  if (path === '/flows') {
    // Highlight /flows when on /flows or any /flows/* route
    return route.path === '/flows' || route.path.startsWith('/flows/');
  }
  return route.path === path;
}
</script>

