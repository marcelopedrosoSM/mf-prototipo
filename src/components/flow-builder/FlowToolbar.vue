<template>
  <div class="absolute top-4 right-4 z-50 flex items-center bg-background border border-input rounded-md px-2 py-1.5 gap-1">
    <!-- Zoom Controls -->
    <div class="flex items-center gap-0.5">
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 rounded-full hover:bg-muted"
        @click="$emit('zoom-out')"
        title="Zoom Out"
      >
        <Minus class="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 rounded-full hover:bg-muted"
        @click="$emit('zoom-in')"
        title="Zoom In"
      >
        <Plus class="h-4 w-4" />
      </Button>
    </div>

    <!-- Divider -->
    <Separator orientation="vertical" class="h-5 mx-1" />

    <!-- History Controls -->
    <div class="flex items-center gap-0.5">
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 rounded-full hover:bg-muted disabled:opacity-30"
        :disabled="!canUndo"
        @click="$emit('undo')"
        title="Desfazer"
      >
        <Undo2 class="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 rounded-full hover:bg-muted disabled:opacity-30"
        :disabled="!canRedo"
        @click="$emit('redo')"
        title="Refazer"
      >
        <Redo2 class="h-4 w-4" />
      </Button>
    </div>

    <!-- Divider -->
    <Separator orientation="vertical" class="h-5 mx-1" />

    <!-- View Controls -->
    <div class="flex items-center gap-0.5">
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 rounded-full hover:bg-muted"
        @click="$emit('fit-view')"
        title="Ajustar Visualização"
      >
        <Maximize class="h-4 w-4" />
      </Button>
      
      <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 rounded-full hover:bg-muted"
        @click="$emit('layout')"
        title="Auto-alinhamento"
      >
        <AlignCenterHorizontal v-if="layoutMode === 'horizontal'" class="h-4 w-4" />
        <AlignCenterVertical v-else class="h-4 w-4" />
      </Button>
    </div>

    <!-- Helper (Optional) -->
     <Separator orientation="vertical" class="h-5 mx-1" />

     <!-- Layout Toggle -->
     <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 rounded-full hover:bg-muted"
        @click="$emit('toggle-layout')"
        :title="layoutMode === 'horizontal' ? 'Layout Horizontal (Ativo) - Clique para Vertical' : 'Layout Vertical (Ativo) - Clique para Horizontal'"
      >
        <LayoutPanelLeft v-if="layoutMode === 'horizontal'" class="h-4 w-4" />
        <LayoutPanelTop v-else class="h-4 w-4" />
      </Button>

     <Button 
        variant="ghost" 
        size="icon" 
        class="h-8 w-8 rounded-full hover:bg-muted"
        title="Ajuda"
      >
        <HelpCircle class="h-4 w-4" />
      </Button>

  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, Undo2, Redo2, Maximize, AlignCenterHorizontal, AlignCenterVertical, HelpCircle, LayoutPanelTop, LayoutPanelLeft } from 'lucide-vue-next';

defineProps<{
  canUndo?: boolean;
  canRedo?: boolean;
  layoutMode?: 'horizontal' | 'vertical';
}>();

defineEmits<{
  'zoom-in': [];
  'zoom-out': [];
  'undo': [];
  'redo': [];
  'fit-view': [];
  'layout': [];
  'toggle-layout': [];
}>();
</script>
