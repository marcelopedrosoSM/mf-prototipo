<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl">
      <DialogHeader>
        <DialogTitle>Token de API Gerado</DialogTitle>
        <DialogDescription>
          Copie o token agora. Você não poderá vê-lo novamente.
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Título</Label>
          <div class="text-sm font-medium">{{ token?.title }}</div>
        </div>

        <div class="space-y-2">
          <Label>Token</Label>
          <div class="flex gap-2">
            <Input
              :value="token?.token || ''"
              readonly
              class="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              @click="copyToken"
            >
              <CopyIcon class="h-4 w-4" />
            </Button>
          </div>
          <p class="text-xs text-muted-foreground">
            Este token será exibido apenas uma vez. Guarde-o em local seguro.
          </p>
        </div>

        <div v-if="token?.expiresAt" class="space-y-2">
          <Label>Data de Expiração</Label>
          <div class="text-sm text-muted-foreground">
            {{ formatDate(token.expiresAt) }}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button @click="handleOpenChange(false)">
          Fechar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { Copy as CopyIcon } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { TokenAPI } from '@/types/tokens-api';
import { useToast } from '@/composables/useToast';
import { formatDate } from '@/utils/date';

interface Props {
  open: boolean;
  token?: TokenAPI | null;
}

const props = withDefaults(defineProps<Props>(), {
  token: null,
});

const emit = defineEmits<{
  'open-change': [open: boolean];
}>();

const toast = useToast();


function copyToken() {
  if (props.token?.token) {
    navigator.clipboard.writeText(props.token.token);
    toast.success('Token copiado', 'O token foi copiado para a área de transferência');
  }
}

function handleOpenChange(open: boolean) {
  emit('open-change', open);
}
</script>


