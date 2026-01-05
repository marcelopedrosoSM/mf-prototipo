<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon" class="relative">
        <Bell class="h-5 w-5 text-muted-foreground" />
        <span 
          v-if="unreadCount > 0"
          class="absolute top-1.5 right-1.5 flex h-2.5 w-2.5"
        >
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent class="w-80" align="end">
      <DropdownMenuLabel class="flex items-center justify-between">
        <span>Notificações</span>
        <Button 
          v-if="unreadCount > 0" 
          variant="ghost" 
          size="sm" 
          class="h-6 px-2 text-xs font-normal"
          @click="markAllRead"
        >
          Marcar todas como lidas
        </Button>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      
      <ScrollArea class="h-[300px]">
        <div v-if="notifications.length === 0" class="flex flex-col items-center justify-center h-[200px] text-muted-foreground p-4">
          <BellOff class="h-8 w-8 mb-2 opacity-20" />
          <p class="text-sm">Nenhuma notificação</p>
        </div>
        
        <div v-else class="flex flex-col">
          <div 
            v-for="notification in notifications" 
            :key="notification.id"
            class="flex items-start gap-3 p-4 border-b last:border-0 hover:bg-muted/50 transition-colors cursor-default group relative"
            :class="{ 'bg-muted/30': !notification.read }"
            @click="handleNotificationClick(notification)"
          >
            <div :class="getTypeColor(notification.type)" class="mt-1 shrink-0">
               <component :is="getTypeIcon(notification.type)" class="h-4 w-4" />
            </div>
            
            <div class="flex-1 space-y-1">
               <div class="flex items-start justify-between gap-2">
                 <p class="text-sm font-medium leading-none" :class="{ 'font-semibold': !notification.read }">
                   {{ notification.title }}
                 </p>
                 <span class="text-xs text-muted-foreground whitespace-nowrap">
                   {{ formatTime(notification.timestamp) }}
                 </span>
               </div>
               <p class="text-sm text-muted-foreground line-clamp-2">
                 {{ notification.message }}
               </p>
            </div>

            <!-- Delete button (visible on hover) -->
            <Button
              variant="ghost"
              size="icon"
              class="h-6 w-6 absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              @click.stop="remove(notification.id)"
            >
              <X class="h-3 w-3" />
            </Button>
          </div>
        </div>
      </ScrollArea>
      
      <DropdownMenuSeparator />
      <div class="p-2">
         <Button variant="ghost" class="w-full justify-center text-xs h-8" @click="router.push('/configuracoes/notificacoes')">
           Configurações de Notificação
         </Button>
      </div>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { 
  Bell, 
  BellOff, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  AlertCircle,
  X 
} from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotificationsStore } from '@/stores/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const router = useRouter();
const notificationsStore = useNotificationsStore();

const notifications = computed(() => notificationsStore.allNotifications);
const unreadCount = computed(() => notificationsStore.unreadCount);

function getTypeColor(type: string) {
  switch (type) {
    case 'success': return 'text-green-500';
    case 'warning': return 'text-amber-500';
    case 'error': return 'text-red-500';
    default: return 'text-blue-500';
  }
}

function getTypeIcon(type: string) {
  switch (type) {
    case 'success': return CheckCircle2;
    case 'warning': return AlertTriangle;
    case 'error': return AlertCircle;
    default: return Info;
  }
}

function formatTime(timestamp: string) {
  try {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ptBR });
  } catch (e) {
    return '';
  }
}

function markAllRead() {
  notificationsStore.markAllAsRead();
}

function remove(id: string) {
  notificationsStore.removeNotification(id);
}

function handleNotificationClick(notification: any) {
  notificationsStore.markAsRead(notification.id);
  if (notification.link) {
    router.push(notification.link);
  }
}
</script>
