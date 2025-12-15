<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button
        class="flex items-center justify-center rounded-md p-2 interactive"
        title="Ajuda"
      >
        <HelpCircle class="h-5 w-5" />
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56">
      <DropdownMenuLabel>
        <p class="text-sm font-semibold">Central de Ajuda</p>
        <p class="text-xs text-muted-foreground font-normal">Encontre respostas e suporte</p>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="item in helpItems"
        :key="item.id"
        as-child
      >
        <a
          :href="item.href"
          :target="item.external ? '_blank' : undefined"
          :rel="item.external ? 'noopener noreferrer' : undefined"
          class="flex w-full items-center"
        >
          <component :is="item.icon" class="mr-2 h-4 w-4" />
          <span>{{ item.label }}</span>
          <ExternalLink v-if="item.external" class="ml-auto h-3 w-3 text-muted-foreground" />
        </a>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { h } from 'vue';
import { HelpCircle, BookOpen, MessageCircle, Video, FileText, ExternalLink } from 'lucide-vue-next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const helpItems = [
  {
    id: 'docs',
    label: 'Documentação',
    icon: h(BookOpen),
    href: 'https://docs.myflows.com.br', // Placeholder
    external: true,
  },
  {
    id: 'support',
    label: 'Suporte',
    icon: h(MessageCircle),
    href: 'https://suporte.myflows.com.br', // Placeholder
    external: true,
  },
  {
    id: 'tutorials',
    label: 'Tutoriais',
    icon: h(Video),
    href: '#', // Placeholder
    external: false,
  },
  {
    id: 'guides',
    label: 'Guias',
    icon: h(FileText),
    href: '#', // Placeholder
    external: false,
  },
];
</script>
