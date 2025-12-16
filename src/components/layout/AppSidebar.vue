<template>
  <BaseSidebar
    title="Conversas"
    :items="sidebarItems"
    :collapsed="collapsed"
    :active-key="selectedStatus"
    @toggle="$emit('toggle')"
    @item-click="handleItemClick"
  />
</template>

<script setup lang="ts">
import { h, ref } from 'vue';
import { Users, UserX, Headphones, AtSign, CheckCircle2 } from 'lucide-vue-next';
import BaseSidebar, { type SidebarItem } from './BaseSidebar.vue';
import { SidebarStatusType } from '@/types/conversations';

interface Props {
  collapsed: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
  'status-select': [status: SidebarStatusType];
}>();

const selectedStatus = ref<SidebarStatusType>(SidebarStatusType.ALL_CHATS);

const sidebarItems: SidebarItem[] = [
  {
    key: SidebarStatusType.ALL_CHATS,
    label: 'Todas',
    icon: h(Users),
    status: SidebarStatusType.ALL_CHATS,
    badge: 12,
  },
  {
    key: SidebarStatusType.WITHOUT_TEAM,
    label: 'Sem time atribuído',
    icon: h(UserX),
    status: SidebarStatusType.WITHOUT_TEAM,
    badge: 5,
  },
  {
    key: SidebarStatusType.IN_SERVICE,
    label: 'Em atendimento',
    icon: h(Headphones),
    status: SidebarStatusType.IN_SERVICE,
    badge: 3,
  },
  {
    key: SidebarStatusType.MENTION,
    label: 'Menções',
    icon: h(AtSign),
    status: SidebarStatusType.MENTION,
    badge: 2,
  },
  {
    key: SidebarStatusType.FINISHED,
    label: 'Finalizadas',
    icon: h(CheckCircle2),
    status: SidebarStatusType.FINISHED,
    badge: 8,
  },
];

const handleItemClick = (item: SidebarItem) => {
  const status = (item as any).status as SidebarStatusType;
  if (status) {
    selectedStatus.value = status;
    emit('status-select', status);
  }
};
</script>

