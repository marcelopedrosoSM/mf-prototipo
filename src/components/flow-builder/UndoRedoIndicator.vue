<template>
  <div class="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 border border-border">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7"
          :disabled="!canUndo"
          @click="$emit('undo')"
        >
          <Undo2 class="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Desfazer (Ctrl+Z)</p>
      </TooltipContent>
    </Tooltip>

    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon"
          class="h-7 w-7"
          :disabled="!canRedo"
          @click="$emit('redo')"
        >
          <Redo2 class="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Refazer (Ctrl+Y)</p>
      </TooltipContent>
    </Tooltip>

    <div 
      v-if="showCount && (undoCount > 0 || redoCount > 0)" 
      class="flex items-center gap-1 ml-1 px-2 py-0.5 rounded bg-background border text-xs text-muted-foreground"
    >
      <span v-if="undoCount > 0" class="flex items-center gap-0.5">
        <Undo2 class="h-3 w-3" />
        {{ undoCount }}
      </span>
      <span v-if="undoCount > 0 && redoCount > 0" class="text-border">|</span>
      <span v-if="redoCount > 0" class="flex items-center gap-0.5">
        <Redo2 class="h-3 w-3" />
        {{ redoCount }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Undo2, Redo2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Props {
  canUndo?: boolean;
  canRedo?: boolean;
  undoCount?: number;
  redoCount?: number;
  showCount?: boolean;
}

withDefaults(defineProps<Props>(), {
  canUndo: false,
  canRedo: false,
  undoCount: 0,
  redoCount: 0,
  showCount: true,
});

defineEmits<{
  undo: [];
  redo: [];
}>();
</script>
