<template>
  <div class="flex h-screen w-full flex-col overflow-hidden">
    <!-- Header - Full Width -->
    <AppHeader />

    <!-- Main Content Area -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Settings Sidebar -->
      <SettingsSidebar :collapsed="isSidebarCollapsed" @toggle="toggleSidebar" />

      <!-- Content Area -->
      <ScrollArea
        :class="cn(
          'flex-1 bg-muted/40 transition-all duration-300',
          isSidebarCollapsed ? 'ml-[64px]' : 'ml-[256px]'
        )"
      >
        <RouterView />
      </ScrollArea>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterView } from 'vue-router';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import AppHeader from '@/components/layout/AppHeader.vue';
import SettingsSidebar from '@/components/layout/SettingsSidebar.vue';

const isSidebarCollapsed = ref(false);

function toggleSidebar() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value;
}
</script>

