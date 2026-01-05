<template>
  <BaseSidebar
    title="Configurações"
    :items="settingsItems"
    :collapsed="collapsed"
    @toggle="$emit('toggle')"
    @item-click="handleItemClick"
  />
</template>


<script setup lang="ts">
import { shallowRef } from 'vue';
import {
  User,
  UsersRound,
  Inbox,
  Zap,
  CalendarOff,
  Key,
  Workflow,
  Settings,
} from 'lucide-vue-next';
import BaseSidebar, { type SidebarItem } from './BaseSidebar.vue';

interface Props {
  collapsed: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
}>();

const settingsItems = shallowRef<SidebarItem[]>([
  {
    key: 'fluxos',
    to: '/configuracoes/fluxos',
    label: 'Fluxos',
    icon: Workflow,
  },
  {
    key: 'automacoes',
    to: '/configuracoes/automacoes',
    label: 'Automações',
    icon: Zap,
  },
  {
    key: 'agentes',
    to: '/configuracoes/agentes',
    label: 'Agentes',
    icon: User,
  },
  {
    key: 'times',
    to: '/configuracoes/times',
    label: 'Times',
    icon: UsersRound,
  },
  {
    key: 'caixas-entrada',
    to: '/configuracoes/caixas-entrada',
    label: 'Caixas de Entrada',
    icon: Inbox,
  },
  {
    key: 'mensagens-rapidas',
    to: '/configuracoes/mensagens-rapidas',
    label: 'Mensagens Rápidas',
    icon: Zap,
  },
  {
    key: 'ausencias',
    to: '/configuracoes/ausencias',
    label: 'Ausências',
    icon: CalendarOff,
  },
  {
    key: 'tokens-api',
    to: '/configuracoes/tokens-api',
    label: 'Chaves de API',
    icon: Key,
  },
  {
    key: 'preferencias',
    to: '/configuracoes/preferencias',
    label: 'Preferências',
    icon: Settings,
  },
]);

const handleItemClick = (_item: SidebarItem) => {
  // Router-link já cuida da navegação
};
</script>

