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
      <div
        :class="cn(
          'flex-1 transition-all duration-300 overflow-hidden',
          isConversationsRoute && (isSidebarCollapsed ? 'ml-[64px]' : 'ml-[256px]')
        )"
      >
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { cn } from '@/lib/utils';
import AppHeader from './AppHeader.vue';
import AppSidebar from './AppSidebar.vue';
import { SidebarStatusType } from '@/types/conversations';

const route = useRoute();
const isSidebarCollapsed = ref(false);

// Verifica se a rota atual é /conversations
const isConversationsRoute = computed(() => {
  return route.path === '/conversations' || route.path.startsWith('/conversations');
});

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}

function handleStatusSelect(status: SidebarStatusType) {
  console.log('Status selecionado no layout:', status);
  // Aqui você pode emitir um evento ou usar um store para comunicar com a view
}
</script>

