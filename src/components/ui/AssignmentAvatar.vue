<template>
  <div :class="['flex items-center gap-1 flex-shrink-0', sizeClasses.wrapper]">
    <!-- Avatar do Time ou Placeholder -->
    <div
      v-if="team"
      :class="[
        'rounded-full border border-border bg-secondary flex items-center justify-center flex-shrink-0',
        sizeClasses.container
      ]"
      :title="team.name"
    >
      <span :class="['font-bold text-secondary-foreground', sizeClasses.text]">
        {{ getInitials(team.name) }}
      </span>
    </div>
    <div
      v-else
      :class="[
        'rounded-full border border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center flex-shrink-0',
        sizeClasses.container
      ]"
      title="Time não atribuído"
    >
      <Users :class="['text-muted-foreground/40', sizeClasses.icon]" />
    </div>
    
    <!-- Avatar do Usuário ou Placeholder -->
    <div
      v-if="user"
      :class="[
        'rounded-full border border-muted bg-primary/10 flex items-center justify-center flex-shrink-0',
        sizeClasses.container
      ]"
      :title="user.name"
    >
      <span :class="['font-bold text-primary', sizeClasses.text]">
        {{ getInitials(user.name) }}
      </span>
    </div>
    <div
      v-else
      :class="[
        'rounded-full border border-dashed border-muted-foreground/20 bg-muted/30 flex items-center justify-center flex-shrink-0',
        sizeClasses.container
      ]"
      title="Agente não atribuído"
    >
      <User :class="['text-muted-foreground/40', sizeClasses.icon]" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { User, Users } from 'lucide-vue-next';

interface AssignedUser {
  id: string;
  name: string;
  email?: string;
}

interface AssignedTeam {
  id: string;
  name: string;
}

interface Props {
  user?: AssignedUser;
  team?: AssignedTeam;
  size?: 'sm' | 'md' | 'lg';
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md'
});

const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        wrapper: 'min-w-[44px]', // 2 avatars (20px each) + gap (4px)
        container: 'h-5 w-5',
        text: 'text-[9px]',
        icon: 'h-3 w-3'
      };
    case 'md':
      return {
        wrapper: 'min-w-[52px]', // 2 avatars (24px each) + gap (4px)
        container: 'h-6 w-6',
        text: 'text-[10px]',
        icon: 'h-3.5 w-3.5'
      };
    case 'lg':
      return {
        wrapper: 'min-w-[84px]', // 2 avatars (40px each) + gap (4px)
        container: 'h-10 w-10',
        text: 'text-xs',
        icon: 'h-5 w-5'
      };
    default:
      return {
        wrapper: 'min-w-[52px]',
        container: 'h-6 w-6',
        text: 'text-[10px]',
        icon: 'h-3.5 w-3.5'
      };
  }
});
</script>
