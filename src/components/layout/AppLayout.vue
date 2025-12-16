<template>
  <div class="flex h-screen w-full flex-col overflow-hidden">
    <!-- Header - Full Width -->
    <AppHeader />

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Sidebar - Apenas em /conversations -->
      <AppSidebar
        v-if="isConversationsRoute"
        :collapsed="isSidebarCollapsed"
        @toggle="toggleSidebar"
        @status-select="handleStatusSelect"
      />

      <!-- Content Area -->
      <ScrollArea
        :class="cn(
          'flex-1 transition-all duration-300',
          isConversationsRoute && (isSidebarCollapsed ? 'ml-[64px]' : 'ml-[256px]')
        )"
      >
        <slot />
      </ScrollArea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide } from 'vue';
import { useRoute } from 'vue-router';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';
import { SidebarStatusType } from '@/types/conversations';

const route = useRoute();
const isSidebarCollapsed = ref(false);
const selectedStatus = ref<SidebarStatusType>(SidebarStatusType.ALL_CHATS);

// Verifica se a rota atual é /conversations
const isConversationsRoute = computed(() => {
  return route.path === '/conversations' || route.path.startsWith('/conversations');
});

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function handleStatusSelect(status: SidebarStatusType) {
  selectedStatus.value = status;
}

// Provide status para componentes filhos
provide('sidebarStatus', selectedStatus);
</script>

