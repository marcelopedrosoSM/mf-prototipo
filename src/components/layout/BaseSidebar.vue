<template>
  <aside
    :class="cn(
      'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300',
      collapsed ? 'w-16' : 'w-64'
    )"
  >
    <nav class="flex h-full flex-col p-4">
      <!-- Toggle Button -->
      <div class="mb-4 flex items-center gap-2">
        <button
          @click="$emit('toggle')"
          class="flex h-8 w-8 items-center justify-center rounded-md p-2 interactive flex-shrink-0"
          :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
        >
          <PanelLeftOpen v-if="collapsed" class="h-4 w-4" />
          <PanelLeftClose v-else class="h-4 w-4" />
        </button>
        <span v-if="!collapsed" class="text-base font-semibold truncate">
          {{ title }}
        </span>
      </div>

      <!-- Sidebar content -->
      <div class="flex-1 space-y-2 mt-2">
        <router-link
          v-for="item in itemsWithRoutes"
          :key="item.key"
          :to="item.to!"
          class="flex items-center text-sm font-medium transition-all duration-200 interactive group relative"
          :class="[
            isItemActive(item)
              ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
              : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            collapsed 
              ? 'justify-center w-10 h-10 mx-auto rounded-xl' 
              : 'w-full space-x-3 px-3 py-2 rounded-lg'
          ]"
          :title="collapsed ? item.label : undefined"
        >
          <div class="relative flex items-center justify-center">
            <component :is="item.icon" :class="collapsed ? 'h-5 w-5' : 'h-4 w-4'" />
            <span
              v-if="collapsed && item.badge && item.badge > 0"
              :class="[
                'absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-0.5 text-[10px] font-bold rounded-full flex items-center justify-center border-2 shadow-sm',
                isItemActive(item)
                  ? 'bg-violet-600 text-primary-foreground border-violet-50 dark:border-background'
                  : 'bg-muted-foreground text-primary-foreground border-background',
              ]"
            >
              {{ item.badge > 9 ? '9+' : item.badge }}
            </span>
          </div>
          <span v-if="!collapsed" class="truncate flex-1 min-w-0 text-left">{{ item.label }}</span>
          <span
            v-if="!collapsed"
            :class="[
              'h-5 min-w-5 px-1.5 text-xs rounded-full flex items-center justify-center ml-auto flex-shrink-0',
              item.badge && item.badge > 0
                ? isItemActive(item)
                  ? 'bg-violet-600 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                : 'opacity-0 pointer-events-none',
            ]"
          >
            {{ item.badge && item.badge > 0 ? (item.badge > 99 ? '+99' : item.badge) : '' }}
          </span>
        </router-link>
        <button
          v-for="item in itemsWithoutRoutes"
          :key="item.key"
          class="flex items-center text-sm font-medium transition-all duration-200 interactive group relative w-full"
          :class="[
            isItemActive(item)
              ? 'bg-violet-100/80 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'
              : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
             collapsed 
              ? 'justify-center w-10 h-10 mx-auto rounded-xl' 
              : 'space-x-3 px-3 py-2 rounded-lg'
          ]"
          :title="collapsed ? item.label : undefined"
          @click="handleItemClick(item)"
        >
          <div class="relative flex items-center justify-center">
            <component :is="item.icon" :class="collapsed ? 'h-5 w-5' : 'h-4 w-4'" />
            <span
              v-if="collapsed && item.badge && item.badge > 0"
              :class="[
                'absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-0.5 text-[10px] font-bold rounded-full flex items-center justify-center border-2 shadow-sm',
                isItemActive(item)
                  ? 'bg-violet-600 text-primary-foreground border-violet-50 dark:border-background'
                  : 'bg-muted-foreground text-primary-foreground border-background',
              ]"
            >
              {{ item.badge > 9 ? '9+' : item.badge }}
            </span>
          </div>
          <span v-if="!collapsed" class="truncate flex-1 min-w-0 text-left">{{ item.label }}</span>
          <span
            v-if="!collapsed"
            :class="[
              'h-5 min-w-5 px-1.5 text-xs rounded-full flex items-center justify-center ml-auto flex-shrink-0',
              item.badge && item.badge > 0
                ? isItemActive(item)
                  ? 'bg-violet-600 text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
                : 'opacity-0 pointer-events-none',
            ]"
          >
            {{ item.badge && item.badge > 0 ? (item.badge > 99 ? '+99' : item.badge) : '' }}
          </span>
        </button>
      </div>
    </nav>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-vue-next';
import { cn } from '@/lib/utils';

export interface SidebarItem {
  key: string;
  label: string;
  icon: any;
  to?: string;
  badge?: number;
  [key: string]: any;
}

interface Props {
  title: string;
  items: SidebarItem[];
  collapsed: boolean;
  activeKey?: string;
}

const props = defineProps<Props>();
const route = useRoute();

const emit = defineEmits<{
  toggle: [];
  'item-click': [item: SidebarItem];
}>();

const itemsWithRoutes = computed(() => {
  return props.items.filter(item => item.to);
});

const itemsWithoutRoutes = computed(() => {
  return props.items.filter(item => !item.to);
});

const isItemActive = (item: SidebarItem): boolean => {
  if (props.activeKey) {
    return item.key === props.activeKey;
  }
  if (item.to) {
    return route.path === item.to || route.path.startsWith(item.to + '/');
  }
  return false;
};

const handleItemClick = (item: SidebarItem) => {
  emit('item-click', item);
};
</script>

