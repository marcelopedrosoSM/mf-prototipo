<template>
  <aside
    :class="cn(
      'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )"
  >
    <nav class="flex h-full flex-col p-4">
      <!-- Toggle Button -->
      <div class="mb-4 flex items-center gap-2">
        <button
          @click="$emit('toggle')"
          class="flex h-10 w-10 items-center justify-center rounded-md p-2 interactive flex-shrink-0"
          :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <PanelLeftOpen v-if="collapsed" class="h-5 w-5" />
          <PanelLeftClose v-else class="h-5 w-5" />
        </button>
        <span v-if="!collapsed" class="text-base font-semibold truncate">
          Configurações
        </span>
      </div>

      <!-- Sidebar content -->
      <div class="flex-1 space-y-1">
        <router-link
          v-for="item in settingsItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center rounded-md text-sm font-medium transition-colors interactive"
          :class="{
            'bg-accent text-accent-foreground': $route.path === item.path,
            'justify-center px-2 py-2': collapsed,
            'space-x-3 px-3 py-2': !collapsed,
          }"
        >
          <component :is="item.icon" class="h-4 w-4 flex-shrink-0" />
          <span v-if="!collapsed" class="truncate">{{ item.label }}</span>
        </router-link>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { h } from 'vue';
import {
  PanelLeftClose,
  PanelLeftOpen,
  User,
  UsersRound,
  Inbox,
  Bell,
  Zap,
  CalendarOff,
  Key,
} from 'lucide-vue-next';
import { cn } from '@/lib/utils';

interface Props {
  collapsed: boolean;
}

defineProps<Props>();

defineEmits<{
  toggle: [];
}>();

const settingsItems = [
  {
    path: '/settings/agentes',
    label: 'Agentes',
    icon: h(User),
  },
  {
    path: '/settings/times',
    label: 'Times',
    icon: h(UsersRound),
  },
  {
    path: '/settings/caixas-entrada',
    label: 'Caixas de entrada',
    icon: h(Inbox),
  },
  {
    path: '/settings/notificacoes',
    label: 'Notificações',
    icon: h(Bell),
  },
  {
    path: '/settings/mensagens-rapidas',
    label: 'Mensagens rápidas',
    icon: h(Zap),
  },
  {
    path: '/settings/feriados-inatividades',
    label: 'Feriados e Inatividades',
    icon: h(CalendarOff),
  },
  {
    path: '/settings/tokens-api',
    label: 'Tokens de API',
    icon: h(Key),
  },
];
</script>

