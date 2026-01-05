<template>
  <BaseSidebar
    title="Conversas"
    :items="sidebarItems"
    :collapsed="collapsed"
    :active-key="activeStatus"
    @toggle="$emit('toggle')"
    @item-click="handleItemClick"
  />
</template>


<script setup lang="ts">
import { shallowRef } from 'vue';
import { MessagesSquare, MessageSquareDashed, MessageSquareDot, AtSign, CheckCircle2 } from 'lucide-vue-next';
import BaseSidebar, { type SidebarItem } from './BaseSidebar.vue';
import { SidebarStatusType } from '@/types/conversations';

interface Props {
  collapsed: boolean;
  activeStatus: SidebarStatusType;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  toggle: [];
  'status-select': [status: SidebarStatusType];
}>();

const sidebarItems = shallowRef<SidebarItem[]>([
  {
    key: SidebarStatusType.ALL_CHATS,
    label: 'Todas',
    icon: MessagesSquare,
    status: SidebarStatusType.ALL_CHATS,
    badge: 12,
  },
  {
    key: SidebarStatusType.WITHOUT_TEAM,
    label: 'Sem time atribuído',
    icon: MessageSquareDashed,
    status: SidebarStatusType.WITHOUT_TEAM,
    badge: 5,
  },
  {
    key: SidebarStatusType.IN_SERVICE,
    label: 'Em atendimento',
    icon: MessageSquareDot,
    status: SidebarStatusType.IN_SERVICE,
    badge: 3,
  },
  {
    key: SidebarStatusType.MENTION,
    label: 'Menções',
    icon: AtSign,
    status: SidebarStatusType.MENTION,
    badge: 2,
  },
  {
    key: SidebarStatusType.FINISHED,
    label: 'Finalizadas',
    icon: CheckCircle2,
    status: SidebarStatusType.FINISHED,
    badge: 8,
  },
]);

const handleItemClick = (item: SidebarItem) => {
  const status = (item as any).status as SidebarStatusType;
  if (status) {
    emit('status-select', status);
  }
};
</script>

