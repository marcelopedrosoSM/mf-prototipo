<template>
  <Card 
    class="hover:shadow-md transition-all duration-200 cursor-pointer hover:border-primary/50"
    @click="$emit('edit', flow)"
  >
    <CardContent class="p-6">
      <div class="flex items-start justify-between">
        <!-- Left Side: Icon and Info -->
        <div class="flex gap-4">
          <!-- Icon - Soft Primary Background -->
          <SoftIcon class="h-12 w-12 rounded-xl">
            <component :is="icon" class="h-6 w-6" />
          </SoftIcon>

          <!-- Info -->
          <div class="space-y-1">
            <div class="flex items-center gap-2">
              <h3 class="font-semibold text-lg">{{ flow.nome }}</h3>
            </div>
            
            <p class="text-muted-foreground text-sm line-clamp-1">
              {{ flow.descricao || 'Sem descrição' }}
            </p>

            <!-- Metrics Row -->
            <div class="flex items-center gap-6 mt-4 pt-2">
              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <Play class="h-4 w-4 text-blue-600" />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-muted-foreground">Ativos</span>
                  <span class="font-semibold text-sm">{{ flow.metrics?.activeCount || 0 }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <CheckCircle2 class="h-4 w-4 text-green-600" />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-muted-foreground">Ganhos</span>
                  <span class="font-semibold text-sm text-green-600">{{ flow.metrics?.wonCount || 0 }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <XCircle class="h-4 w-4 text-red-600" />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-muted-foreground">Perdidos</span>
                  <span class="font-semibold text-sm text-red-600">{{ flow.metrics?.lostCount || 0 }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <div class="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                  <TrendingUp class="h-4 w-4 text-purple-600" />
                </div>
                <div class="flex flex-col">
                  <span class="text-xs text-muted-foreground">Taxa de Conversão</span>
                  <span class="font-semibold text-sm text-purple-600">{{ flow.metrics?.conversionRate || 0 }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Actions -->
        <div class="flex items-center gap-4">

            <div @click.stop>
              <Switch 
                :checked="flow.status === 'ativo'"
                @update:checked="(val) => $emit('toggle', flow, val)"
              />
            </div>
            
            <DropdownMenu>
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
}

const props = defineProps<Props>();

const emit = defineEmits<{
  edit: [flow: Flow];
  delete: [flow: Flow];
  toggle: [flow: Flow, active: boolean];
}>();

const icon = computed(() => {
  return props.flow.tipo === 'atendimento' ? MessageSquare : Zap;
});
</script>
