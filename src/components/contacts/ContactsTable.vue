<template>
  <Card>
    <CardContent class="p-0">
      <div v-if="loading" class="flex items-center justify-center p-8">
        <Loader2 class="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
      <div v-else-if="contacts.length === 0" class="flex flex-col items-center justify-center p-8">
        <User class="h-12 w-12 text-muted-foreground mb-4" />
        <p class="text-sm font-medium mb-1">Nenhum contato encontrado</p>
        <p class="text-sm text-muted-foreground mb-4">
          Comece criando seu primeiro contato
        </p>
        <Button v-if="onCreate" @click="onCreate">
          <Plus class="mr-2 h-4 w-4" />
          Adicionar Primeiro Contato
        </Button>
      </div>
      <div v-else class="flex flex-col">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeadSortable
                sort-key="name"
                :sort-direction="sortable.getSortDirection('name')"
                @sort="handleSort"
              >
                Contato
              </TableHeadSortable>
              <TableHead>Telefone</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Fluxos</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="contact in paginatedContacts" :key="contact.id">
              <TableCell class="font-medium">
                <div class="flex items-center gap-2.5">
                  <SoftAvatar :name="contact.name" class="h-7 w-7 text-[10px]" />
                  <button
                    @click="handleEdit(contact)"
                    class="text-left hover:text-primary transition-colors cursor-pointer"
                  >
                    {{ contact.name }}
                  </button>
                </div>
              </TableCell>
              <TableCell>
                <span class="text-muted-foreground">
                  {{ contact.phoneNumbers.length > 0 ? contact.phoneNumbers[0].phoneNumber : '-' }}
                </span>
              </TableCell>
              <TableCell>
                <span class="text-sm text-muted-foreground">
                  {{ contact.emails[0]?.email || '-' }}
                </span>
              </TableCell>
              <TableCell>
                <div class="flex flex-wrap gap-1">
                  <Badge
                    v-for="flow in getContactFlows(contact.id)"
                    :key="flow.id"
                    class="text-[10px] px-2 py-0.5 bg-violet-50 text-violet-600 border-violet-100 hover:bg-violet-100 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-800/30 dark:hover:bg-violet-900/40"
                  >
                    {{ flow.name }}
                  </Badge>
                  <span v-if="getContactFlows(contact.id).length === 0" class="text-muted-foreground text-xs">-</span>
                </div>
              </TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon">
                      <MoreVertical class="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="handleEdit(contact)">
                      <Edit class="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="openEnrollDialog(contact)">
                      <Play class="mr-2 h-4 w-4" />
                      Inscrever em Fluxo
                    </DropdownMenuItem>
                    <DropdownMenuItem @click="handleDelete(contact)" class="text-destructive">
                      <Trash2 class="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <TablePagination
          v-if="contacts.length > pageSize"
          :total="contacts.length"
          :page-size="pageSize"
          :initial-page="currentPage"
          @update:page="handlePageChange"
          @update:pageSize="handlePageSizeChange"
        />
      </div>
    </CardContent>
  </Card>


  <!-- Enroll Contact Dialog -->
  <Dialog :open="enrollDialogOpen" @update:open="enrollDialogOpen = $event">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-lg">
          <Play class="h-5 w-5 text-primary" />
          Inscrever Contato em Fluxo
        </DialogTitle>
        <DialogDescription class="text-sm">
          Selecione o fluxo para inscrever <strong>{{ selectedContactForEnrollment?.name }}</strong>.
        </DialogDescription>
      </DialogHeader>
      
      <div class="grid gap-4 py-4">
        <div class="space-y-2">
          <label class="text-sm font-medium">Fluxo</label>
          <Select v-model="selectedFlowId">
            <SelectTrigger>
              <SelectValue placeholder="Selecione um fluxo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem 
                v-for="flow in flowsStore.activeFlows" 
                :key="flow.id" 
                :value="flow.id"
              >
                {{ flow.nome }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2 border-t">
        <Button variant="ghost" @click="enrollDialogOpen = false">
          Cancelar
        </Button>
        <Button @click="handleEnrollContact" :disabled="!selectedFlowId">
          <Play class="h-4 w-4 mr-2" />
          Iniciar
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Plus, User, Loader2, MoreVertical, Edit, Trash2, Play } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import TableHeadSortable from '@/components/ui/table/TableHeadSortable.vue';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import TablePagination from '@/components/ui/table/TablePagination.vue';
import { usePagination } from '@/composables/usePagination';
import { useSortable } from '@/composables/useSortable';
import { useActivityStore } from '@/stores/activities';
import type { Contact } from '@/types/contacts';
import SoftAvatar from '@/components/ui/avatar/SoftAvatar.vue';
import { Badge } from '@/components/ui/badge';
import { useFlowsStore } from '@/stores/flows';
import { useToast } from '@/composables/useToast';

interface Props {
  contacts: Contact[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  edit: [contact: Contact];
  delete: [contact: Contact];
  create: [];
}>();

const currentPage = ref(1);
const pageSize = ref(10);

// Sorting
const sortable = useSortable<Contact>(() => props.contacts);

// Activity store for flows
const activityStore = useActivityStore();
const flowsStore = useFlowsStore();
const toast = useToast();

const enrollDialogOpen = ref(false);
const selectedContactForEnrollment = ref<Contact | null>(null);
const selectedFlowId = ref('');

function openEnrollDialog(contact: Contact) {
  selectedContactForEnrollment.value = contact;
  selectedFlowId.value = '';
  enrollDialogOpen.value = true;
}

function handleEnrollContact() {
  if (!selectedContactForEnrollment.value || !selectedFlowId.value) return;

  const flow = flowsStore.savedFlows.find(f => f.id === selectedFlowId.value);
  if (!flow) return;

  const contact = selectedContactForEnrollment.value;

  // 1. Find Start Node
  const startNode = flow.nodes.find(n => n.data.type === 'trigger_manual') || 
                   flow.nodes.find(n => n.type === 'trigger' || (n.data.type && String(n.data.type).startsWith('trigger_'))) ||
                   flow.nodes.find(n => n.type === 'start' || n.data.type === 'start');

  if (!startNode) {
    toast.error('Erro no Fluxo', 'Este fluxo não tem um ponto de início válido.');
    return;
  }

  // 2. Find Next Node (The actual first step)
  const edge = flow.edges.find(e => e.source === startNode.id);
  if (!edge) {
    toast.error('Erro no Fluxo', 'O ponto de início não está conectado a nada.');
    return;
  }

  const firstStepNode = flow.nodes.find(n => n.id === edge.target);
  if (!firstStepNode) {
    toast.error('Erro', 'Próximo passo não encontrado.');
    return;
  }

  // 3. Check if it is an Activity
  const type = firstStepNode.data.type;
  if (['email', 'call', 'task', 'chat_flow'].includes(String(type))) {
    try {
      // Create Activity
      const activity = activityStore.createActivityFromNode(
        flow.id,
        flow.nome,
        firstStepNode,
        String(contact.id), 
        { 
          name: contact.name, 
          email: contact.emails[0]?.email, 
          phone: contact.phoneNumbers[0]?.phoneNumber 
        }
      );
      
      if (activity) {
        toast.success('Sucesso', `Fluxo iniciado! Atividade "${activity.title}" criada para ${contact.name}.`);
        enrollDialogOpen.value = false;
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro', 'Falha ao criar atividade.');
    }
  } else {
    toast.warning('Atenção', 'O fluxo deve começar com uma Atividade (Email, Ligação, Chat) para inscrição manual.');
  }
}


// Get unique flows for a contact from activities
function getContactFlows(contactId: number): { id: string; name: string }[] {
  const contactActivities = activityStore.activitiesByContact[String(contactId)] || [];
  const flowMap = new Map<string, string>();
  contactActivities.forEach(activity => {
    if (!flowMap.has(activity.flowId)) {
      flowMap.set(activity.flowId, activity.flowName);
    }
  });
  return Array.from(flowMap.entries()).map(([id, name]) => ({ id, name }));
}

const pagination = usePagination({
  initialPage: 1,
  initialPageSize: 10,
  total: computed(() => sortable.sortedItems.value.length).value,
});

// Update total when sorted items change
watch(
  () => sortable.sortedItems.value.length,
  (newTotal) => {
    pagination.setTotal(newTotal);
  },
  { immediate: true }
);

// Update page size when it changes
watch(pageSize, (newSize) => {
  pagination.setPageSize(newSize);
});

// Update page when it changes
watch(currentPage, (newPage) => {
  pagination.goToPage(newPage);
});

const paginatedContacts = computed(() => {
  return pagination.paginate(sortable.sortedItems.value);
});

function handleSort(key: string) {
  sortable.toggleSort(key);
  currentPage.value = 1;
}



function handleEdit(contact: Contact) {
  emit('edit', contact);
}

function handleDelete(contact: Contact) {
  emit('delete', contact);
}

function handlePageChange(page: number) {
  currentPage.value = page;
}

function handlePageSizeChange(newPageSize: number) {
  pageSize.value = newPageSize;
  currentPage.value = 1;
}

// Expose onCreate for parent
defineExpose({
  onCreate: () => emit('create'),
});
</script>

