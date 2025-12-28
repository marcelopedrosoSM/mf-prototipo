<template>
  <Card 
    class="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
    @click="handleCardClick"
  >
    <CardContent class="p-6">
      <div class="flex items-center justify-between gap-4">
        <!-- Left Side: Icon, Title and Description -->
        <div class="flex items-center gap-4 flex-1 min-w-0">
          <!-- Icon - Soft Primary Background -->
          <SoftIcon class="h-8 w-8 rounded-xl flex-shrink-0">
            <component :is="icon" class="h-4 w-4" />
          </SoftIcon>

          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3">
              <h3 class="font-semibold text-lg">{{ flow.nome }}</h3>
              <span class="text-muted-foreground text-sm">•</span>
              <p class="text-muted-foreground text-sm truncate">
                {{ flow.descricao || 'Sem descrição' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Center: Compact Metrics -->
        <div v-if="readOnly" class="flex items-center gap-4 flex-shrink-0">
          <div class="flex items-center gap-1.5">
            <Play class="h-3.5 w-3.5 text-blue-600" />
            <span class="text-xs text-muted-foreground">Ativos:</span>
            <span class="text-sm font-semibold">{{ flow.metrics?.activeCount || 0 }}</span>
          </div>

          <div class="flex items-center gap-1.5">
            <CheckCircle2 class="h-3.5 w-3.5 text-green-600" />
            <span class="text-xs text-muted-foreground">Ganhos:</span>
            <span class="text-sm font-semibold text-green-600">{{ flow.metrics?.wonCount || 0 }}</span>
          </div>

          <div class="flex items-center gap-1.5">
            <XCircle class="h-3.5 w-3.5 text-red-600" />
            <span class="text-xs text-muted-foreground">Perdidos:</span>
            <span class="text-sm font-semibold text-red-600">{{ flow.metrics?.lostCount || 0 }}</span>
          </div>

          <div class="flex items-center gap-1.5">
            <TrendingUp class="h-3.5 w-3.5 text-purple-600" />
            <span class="text-xs text-muted-foreground">Taxa:</span>
            <span class="text-sm font-semibold text-purple-600">{{ flow.metrics?.conversionRate || 0 }}%</span>
          </div>
        </div>

        <!-- Right Side: Actions -->
        <div class="flex items-center gap-4 flex-shrink-0">
          <div v-if="!readOnly" @click.stop>
            <Switch 
              :checked="flow.status === 'ativo'"
              @update:checked="(val: boolean) => $emit('toggle', flow, val)"
            />
          </div>
          <div v-else>
            <Badge 
              :variant="flow.status === 'ativo' ? 'default' : 'secondary'"
              :class="flow.status === 'ativo' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-none'"
            >
              {{ flow.status === 'ativo' ? 'Ativo' : 'Inativo' }}
            </Badge>
          </div>
          
          <DropdownMenu v-if="!readOnly">
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" @click.stop>
                <MoreVertical class="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click="$emit('edit', flow)">
                <Edit class="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem @click="$emit('delete', flow)" class="text-destructive">
                <Trash2 class="mr-2 h-4 w-4" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  MoreVertical, 
  Edit, 
  Trash2,
  MessageSquare,
  Zap,
  Play
} from 'lucide-vue-next';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Flow } from '@/mocks/data/flows';
import SoftIcon from '@/components/ui/icon/SoftIcon.vue';

interface Props {
  flow: Flow;
  readOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  readOnly: false,
});

const emit = defineEmits<{
  edit: [flow: Flow];
  delete: [flow: Flow];
  toggle: [flow: Flow, active: boolean];
  view: [flow: Flow];
}>();

// Computed para ícone
const icon = computed(() => {
  return props.flow.tipo === 'atendimento' ? MessageSquare : Zap;
});

const handleCardClick = () => {
  if (props.readOnly) {
    emit('view', props.flow);
  } else {
    emit('edit', props.flow);
  }
};
</script>
