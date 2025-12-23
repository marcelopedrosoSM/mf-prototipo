<template>
  <div class="space-y-4">
    <!-- Common Header: Agent, Team, Inbox -->
    <div class="grid grid-cols-3 gap-4 p-4 rounded-lg bg-muted/30 border">
      <div class="space-y-2">
        <Label class="text-xs text-muted-foreground">Agente Responsável</Label>
        <Select v-model="formData.agentId">
          <SelectTrigger>
            <SelectValue placeholder="Selecionar agente" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="agent in agents" :key="agent.id" :value="agent.id">
              {{ agent.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div class="space-y-2">
        <Label class="text-xs text-muted-foreground">Time</Label>
        <Select v-model="formData.teamId">
          <SelectTrigger>
            <SelectValue placeholder="Selecionar time" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="team in teams" :key="team.id" :value="team.id">
              {{ team.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div v-if="showInbox" class="space-y-2">
        <Label class="text-xs text-muted-foreground">Caixa de {{ type === 'email' ? 'Saída' : 'Entrada' }}</Label>
        <Select v-model="formData.inboxId">
          <SelectTrigger>
            <SelectValue placeholder="Selecionar caixa" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="inbox in inboxes" :key="inbox.id" :value="inbox.id">
              {{ inbox.name }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>

    <!-- Email Form -->
    <template v-if="type === 'email'">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Para</Label>
            <Input v-model="formData.to" placeholder="email@exemplo.com" />
          </div>
          <div class="space-y-2">
            <Label>CC</Label>
            <Input v-model="formData.cc" placeholder="Opcional" />
          </div>
        </div>
        <div class="space-y-2">
          <Label>Assunto</Label>
          <Input v-model="formData.subject" />
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Conteúdo</Label>
            <Button variant="ghost" size="sm" @click="$emit('insert-variable')">
              <Code class="h-4 w-4 mr-1" />
              Variáveis
            </Button>
          </div>
          <Textarea v-model="formData.body" rows="10" />
        </div>
        <div class="space-y-2">
          <Label>Anexos</Label>
          <div class="flex items-center gap-2 p-3 rounded-lg border border-dashed">
            <Paperclip class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">Arraste arquivos ou clique para anexar</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Call Form -->
    <template v-else-if="type === 'call'">
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Telefone</Label>
          <div class="flex gap-2">
            <Input v-model="formData.phone" class="flex-1" />
            <Button variant="outline" size="icon" title="Ligar">
              <Phone class="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div class="space-y-2">
          <Label>Script / Roteiro</Label>
          <Textarea v-model="formData.script" rows="8" placeholder="Roteiro para a ligação..." />
        </div>
        
        <!-- Call Result Section (shown after execution starts) -->
        <div v-if="showCallResult" class="space-y-4 p-4 rounded-lg border bg-muted/20">
          <h4 class="font-medium">Resultado da Ligação</h4>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label>Resultado</Label>
              <Select v-model="formData.callResult">
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar resultado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="connected">✅ Conectou</SelectItem>
                  <SelectItem value="no_answer">📵 Não atendeu</SelectItem>
                  <SelectItem value="busy">🔄 Ocupado</SelectItem>
                  <SelectItem value="voicemail">📬 Caixa postal</SelectItem>
                  <SelectItem value="invalid">❌ Número inválido</SelectItem>
                  <SelectItem value="do_not_call">🚫 Não ligar novamente</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-2">
              <Label>Duração</Label>
              <Input v-model="formData.duration" placeholder="00:00" />
            </div>
          </div>
          <div class="space-y-2">
            <Label>Notas da Ligação</Label>
            <Textarea v-model="formData.callNotes" rows="3" />
          </div>
        </div>
      </div>
    </template>

    <!-- Message Form -->
    <template v-else-if="type === 'message'">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Canal</Label>
            <Select v-model="formData.channel">
              <SelectTrigger>
                <SelectValue placeholder="Selecionar canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">
                  <div class="flex items-center gap-2">
                    <MessageCircle class="h-4 w-4 text-green-600" />
                    WhatsApp
                  </div>
                </SelectItem>
                <SelectItem value="sms">
                  <div class="flex items-center gap-2">
                    <MessageSquare class="h-4 w-4 text-blue-600" />
                    SMS
                  </div>
                </SelectItem>
                <SelectItem value="telegram">
                  <div class="flex items-center gap-2">
                    <Send class="h-4 w-4 text-sky-600" />
                    Telegram
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Telefone</Label>
            <Input v-model="formData.phone" />
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label>Mensagem</Label>
            <div class="flex gap-1">
              <Button variant="ghost" size="sm">
                <Smile class="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" @click="$emit('insert-variable')">
                <Code class="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Textarea v-model="formData.message" rows="6" />
        </div>
        <div class="space-y-2">
          <Label>Mídia (opcional)</Label>
          <div class="flex items-center gap-2 p-3 rounded-lg border border-dashed">
            <ImageIcon class="h-4 w-4 text-muted-foreground" />
            <span class="text-sm text-muted-foreground">Imagem, vídeo ou documento</span>
          </div>
        </div>
      </div>
    </template>

    <!-- Task Form -->
    <template v-else-if="type === 'task'">
      <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Tipo de Atividade</Label>
            <Select v-model="formData.taskType">
              <SelectTrigger>
                <SelectValue placeholder="Selecionar tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visit">🚗 Visita ao cliente</SelectItem>
                <SelectItem value="meeting">🤝 Reunião externa</SelectItem>
                <SelectItem value="delivery">📦 Entrega</SelectItem>
                <SelectItem value="training">🎓 Treinamento</SelectItem>
                <SelectItem value="other">📋 Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="space-y-2">
            <Label>Prioridade</Label>
            <Select v-model="formData.priority">
              <SelectTrigger class="w-full">
                <SelectValue>
                  <template v-if="formData.priority">
                    <div class="flex items-center gap-2">
                      <Flag 
                        :class="[
                          'h-3.5 w-3.5',
                          formData.priority === 'high' ? 'text-red-500 fill-red-500/20' :
                          formData.priority === 'medium' ? 'text-amber-500 fill-amber-500/20' :
                          'text-emerald-500 fill-emerald-500/20'
                        ]"
                      />
                      <span>{{ 
                        formData.priority === 'high' ? 'Alta' : 
                        formData.priority === 'medium' ? 'Média' : 'Baixa' 
                      }}</span>
                    </div>
                  </template>
                  <template v-else>Selecionar</template>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">
                  <div class="flex items-center gap-2">
                    <Flag class="h-3.5 w-3.5 text-red-500 fill-red-500/20" />
                    <span>Alta</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div class="flex items-center gap-2">
                    <Flag class="h-3.5 w-3.5 text-amber-500 fill-amber-500/20" />
                    <span>Média</span>
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div class="flex items-center gap-2">
                    <Flag class="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/20" />
                    <span>Baixa</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="space-y-2">
          <Label>Título</Label>
          <Input v-model="formData.taskTitle" />
        </div>
        <div class="space-y-2">
          <Label>Descrição</Label>
          <Textarea v-model="formData.description" rows="4" />
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <Label>Data/Hora</Label>
            <Input type="datetime-local" v-model="formData.scheduledAt" />
          </div>
          <div class="space-y-2">
            <Label>Duração Prevista</Label>
            <Select v-model="formData.estimatedDuration">
              <SelectTrigger>
                <SelectValue placeholder="Selecionar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutos</SelectItem>
                <SelectItem value="60">1 hora</SelectItem>
                <SelectItem value="120">2 horas</SelectItem>
                <SelectItem value="180">3 horas</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div class="space-y-2">
          <Label>Local / Endereço</Label>
          <Input v-model="formData.location" placeholder="Endereço ou link da reunião" />
        </div>
      </div>
    </template>

    <!-- Registry Form (Decision) -->
    <template v-else-if="type === 'registry'">
      <div class="space-y-4">
        <div class="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <h4 class="font-medium mb-3 text-foreground">{{ formData.registryTitle || 'Selecione uma opção' }}</h4>
          <RadioGroup v-model="formData.selectedOption" class="space-y-2">
            <div 
              v-for="option in registryOptions" 
              :key="option.value"
              class="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
              :class="formData.selectedOption === option.value && 'border-primary bg-primary/5'"
            >
              <RadioGroupItem :value="option.value" :id="option.value" />
              <Label :for="option.value" class="flex-1 cursor-pointer text-foreground">
                {{ option.icon }} {{ option.label }}
              </Label>
            </div>
          </RadioGroup>
        </div>
        <div class="space-y-2">
          <Label>Observação (opcional)</Label>
          <Textarea v-model="formData.observation" rows="3" placeholder="Adicione uma observação..." />
        </div>
      </div>
    </template>

    <!-- Chat Flow Form -->
    <template v-else-if="type === 'chat_flow'">
      <div class="space-y-4">
        <div class="p-4 rounded-lg bg-primary/5 dark:bg-primary/10 border border-primary/20 dark:border-primary/30">
          <div class="flex items-center gap-3 mb-3">
            <div class="h-10 w-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <Workflow class="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 class="font-medium text-foreground">{{ formData.flowName || 'Fluxo de Atendimento' }}</h4>
              <p class="text-sm text-muted-foreground">Será iniciado com o contato</p>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
          <Checkbox v-model="formData.autoExecute" id="auto-execute" />
          <Label for="auto-execute" class="text-sm">
            Executar automaticamente quando chegar a vez
          </Label>
        </div>
      </div>
    </template>

    <!-- Action Form -->
    <template v-else-if="type === 'action'">
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>Título da Ação</Label>
          <Input v-model="formData.actionName" placeholder="Ex: Atualizar CRM, Enviar Contrato..." />
        </div>
        <div class="space-y-2">
          <Label>Instruções</Label>
          <Textarea v-model="formData.description" rows="4" placeholder="Descreva o que deve ser feito..." />
        </div>
      </div>
    </template>

    <!-- Wait Form (System default, but shown for completeness) -->
    <template v-else-if="type === 'wait'">
      <div class="space-y-4 p-4 rounded-lg bg-secondary/10 border border-secondary/20 dark:bg-secondary/10 dark:border-secondary/30">
        <div class="flex items-center gap-3">
          <Clock class="h-5 w-5 text-muted-foreground" />
          <div>
            <h4 class="font-medium text-foreground">Etapa de Espera</h4>
            <p class="text-sm text-muted-foreground">Esta etapa é processada automaticamente pelo sistema.</p>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-4 mt-2">
          <div class="space-y-1">
            <Label class="text-xs">Duração</Label>
            <Input v-model="formData.duration" readonly />
          </div>
          <div class="space-y-1">
            <Label class="text-xs">Unidade</Label>
            <Input v-model="formData.unit" readonly />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { 
  Phone, Paperclip, Code, MessageCircle, MessageSquare, Send, 
  Smile, ImageIcon, Workflow, Clock, Flag
} from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';

interface Props {
  type: 'email' | 'call' | 'message' | 'task' | 'registry' | 'chat_flow' | 'action' | 'wait';
  initialData?: Record<string, any>;
  showCallResult?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialData: () => ({}),
  showCallResult: false,
});

const emit = defineEmits<{
  'update:data': [data: Record<string, any>];
  'insert-variable': [];
}>();

// Mock data for selects
const agents = ref([
  { id: 'agent-1', name: 'João Silva' },
  { id: 'agent-2', name: 'Maria Santos' },
  { id: 'agent-3', name: 'Pedro Costa' },
]);

const teams = ref([
  { id: 'team-1', name: 'Vendas' },
  { id: 'team-2', name: 'Suporte' },
  { id: 'team-3', name: 'CS' },
]);

const inboxes = ref([
  { id: 'inbox-1', name: 'WhatsApp Vendas' },
  { id: 'inbox-2', name: 'E-mail Principal' },
  { id: 'inbox-3', name: 'SMS Marketing' },
]);

// Registry options (would come from flow definition)
const registryOptions = ref([
  { value: 'positive', label: 'Positivo', icon: '😊' },
  { value: 'neutral', label: 'Neutro', icon: '😐' },
  { value: 'negative', label: 'Negativo', icon: '😞' },
]);

// Form data
const formData = ref<Record<string, any>>({
  agentId: 'agent-1',
  teamId: 'team-1',
  inboxId: 'inbox-1',
  ...props.initialData,
});

// Show inbox for email, message, chat_flow
const showInbox = computed(() => 
  ['email', 'message', 'chat_flow'].includes(props.type)
);

// Watch and emit changes
watch(formData, (newData) => {
  emit('update:data', newData);
}, { deep: true });
</script>
