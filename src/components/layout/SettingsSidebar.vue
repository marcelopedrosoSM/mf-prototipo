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
import { h } from 'vue';
import {
  User,
  UsersRound,
  Inbox,
  Bell,
  Zap,
  CalendarOff,
  Key,
} from 'lucide-vue-next';
import BaseSidebar, { type SidebarItem } from './BaseSidebar.vue';

interface Props {
  collapsed: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
}>();

const settingsItems: SidebarItem[] = [
  {
    key: 'agentes',
    to: '/settings/agentes',
    label: 'Agentes',
    icon: h(User),
  },
  {
    key: 'times',
    to: '/settings/times',
    label: 'Times',
    icon: h(UsersRound),
  },
  {
    key: 'caixas-entrada',
    to: '/settings/caixas-entrada',
    label: 'Caixas de entrada',
    icon: h(Inbox),
  },
  {
    key: 'notificacoes',
    to: '/settings/notificacoes',
    label: 'Notificações',
    icon: h(Bell),
  },
  {
    key: 'mensagens-rapidas',
    to: '/settings/mensagens-rapidas',
    label: 'Mensagens rápidas',
    icon: h(Zap),
  },
  {
    key: 'feriados-inatividades',
    to: '/settings/feriados-inatividades',
    label: 'Feriados e Inatividades',
    icon: h(CalendarOff),
  },
  {
    key: 'tokens-api',
    to: '/settings/tokens-api',
    label: 'Tokens de API',
    icon: h(Key),
  },
];

const handleItemClick = (_item: SidebarItem) => {
  // Router-link já cuida da navegação
};
</script>

