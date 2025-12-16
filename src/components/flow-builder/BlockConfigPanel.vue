<template>
  <div class="h-full bg-background border-l flex flex-col w-[400px]">
    <!-- Header -->
    <div class="p-4 border-b flex items-center justify-between">
      <div>
        <h3 class="font-semibold text-sm">Configurar Bloco</h3>
        <p class="text-xs text-muted-foreground">{{ blockTypeLabel }}</p>
      </div>
      <Button variant="ghost" size="icon" @click="$emit('close')">
        <X class="h-4 w-4" />
      </Button>
    </div>

    <!-- Form -->
    <ScrollArea class="flex-1">
      <div class="p-4 space-y-6">
        
        <!-- Título do Bloco (Comum a todos) -->
        <div class="space-y-2">
          <Label for="title">Título do Bloco</Label>
          <Input 
            id="title" 
            v-model="formData.title" 
            placeholder="Ex: Boas vindas" 
          />
        </div>

        <!-- CONFIGURAÇÃO ESPECÍFICA: TRIGGER -->
        <div v-if="blockType === 'trigger'" class="space-y-6">
          
          <!-- Tipo de Gatilho -->
          <div class="space-y-3">
            <Label>Tipo de Gatilho</Label>
            <Select v-model="formData.triggerType">
              <SelectTrigger class="h-auto py-3">
                <SelectValue placeholder="Selecione um gatilho">
                  <div v-if="formData.triggerType" class="flex items-start gap-3 text-left">
                    <component :is="getTriggerIcon(formData.triggerType)" class="h-5 w-5 text-primary mt-0.5" />
                    <div class="flex flex-col gap-0.5">
                      <span class="font-medium">{{ getTriggerLabel(formData.triggerType) }}</span>
                      <span class="text-xs text-muted-foreground">{{ getTriggerDescription(formData.triggerType) }}</span>
                    </div>
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  v-for="trigger in TRIGGER_TYPES" 
                  :key="trigger.value" 
                  :value="trigger.value"
                >
                  <div class="flex items-start gap-3 py-1">
                    <component :is="getTriggerIcon(trigger.value)" class="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div class="flex flex-col gap-0.5">
                      <span class="font-medium">{{ trigger.label }}</span>
                      <span class="text-xs text-muted-foreground">{{ trigger.description }}</span>
                    </div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Configurações adicionais para triggers de conversa/mensagem -->
          <div v-if="['conversation_created', 'message_received'].includes(formData.triggerType || '')" class="space-y-4 border-t pt-4">
            <h4 class="text-sm font-medium text-muted-foreground">Filtros e Atribuição</h4>
            
            <!-- Caixa de Entrada -->
            <div class="space-y-2">
              <Label>Caixa de Entrada (Opcional)</Label>
              <Select v-model="formData.caixaEntradaId">
                <SelectTrigger>
                  <SelectValue placeholder="Todas as caixas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as caixas</SelectItem>
                  <SelectItem v-for="inbox in MOCK_INBOXES" :key="inbox.id" :value="inbox.id">
                    {{ inbox.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p class="text-xs text-muted-foreground">O fluxo só iniciará para conversas nesta caixa.</p>
            </div>

            <!-- Agente Virtual -->
            <div class="space-y-2">
              <Label>Agente Virtual (Opcional)</Label>
              <Select v-model="formData.agenteVirtualId">
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum agente específico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem v-for="agent in MOCK_AGENTS" :key="agent.id" :value="agent.id">
                    {{ agent.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Time -->
            <div class="space-y-2">
              <Label>Time (Opcional)</Label>
              <Select v-model="formData.teamId">
                <SelectTrigger>
                  <SelectValue placeholder="Nenhum time específico" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  <SelectItem v-for="team in MOCK_TEAMS" :key="team.id" :value="team.id">
                    {{ team.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Atribuição Automática -->
            <div class="flex items-center space-x-2 pt-2">
              <Switch id="auto-assign" v-model="formData.atribuirAutomaticamente" />
              <Label for="auto-assign">Atribuir automaticamente</Label>
            </div>
          </div>

           <!-- Configuração Cron para Agendamento -->
           <div v-if="formData.triggerType === 'schedule'" class="space-y-2 border-t pt-4">
            <Label>Expressão Cron</Label>
            <Input v-model="formData.scheduleCron" placeholder="* * * * *" />
            <p class="text-xs text-muted-foreground">Ex: "0 9 * * 1-5" (Seg-Sex às 09:00)</p>
          </div>

        </div>

        <!-- MENSAGEM -->
        <div v-if="blockType === 'message'" class="space-y-4">
          
          <!-- Tipo de Mensagem -->
          <div class="space-y-3">
            <Label>Tipo de Mensagem</Label>
            <div class="grid grid-cols-5 gap-2">
              <Button 
                v-for="type in ['text', 'image', 'video', 'audio', 'file']" 
                :key="type"
                type="button"
                :variant="formData.messageType === type || (!formData.messageType && type === 'text') ? 'default' : 'outline'"
                class="h-10 px-0 flex items-center justify-center"
                @click="formData.messageType = type"
                :title="getMessageTypeLabel(type)"
              >
                <component :is="getMessageTypeIcon(type)" class="h-4 w-4" />
              </Button>
            </div>
            <p class="text-xs text-muted-foreground text-right">
              {{ getMessageTypeLabel(formData.messageType || 'text') }}
            </p>
          </div>

          <!-- URL da Mídia -->
          <div v-if="formData.messageType && formData.messageType !== 'text'" class="space-y-2">
            <Label>URL do Arquivo</Label>
            <Input 
              v-model="formData.mediaUrl" 
              placeholder="https://exemplo.com/arquivo" 
            />
          </div>

          <!-- Conteúdo -->
          <div class="space-y-2">
            <Label>{{ formData.messageType && formData.messageType !== 'text' ? 'Legenda (Opcional)' : 'Conteúdo da Texto' }}</Label>
            <VariableTextArea 
              v-model="formData.content" 
              :placeholder="formData.messageType && formData.messageType !== 'text' ? 'Digite uma legenda...' : 'Digite sua mensagem...'" 
              :rows="5" 
            />
            <p class="text-xs text-muted-foreground">O conteúdo suporta variáveis dinâmicas.</p>
          </div>
        </div>

        <!-- PERGUNTA -->
        <div v-if="blockType === 'question'" class="space-y-6">
          <!-- Conteúdo da Pergunta -->
          <div class="space-y-2">
            <Label>Conteúdo da Pergunta</Label>
            <VariableTextArea 
              v-model="formData.content" 
              placeholder="Digite sua pergunta..." 
              :rows="4" 
            />
          </div>

          <!-- Nome da Variável -->
          <div class="space-y-2">
            <Label>Nome da Variável de Resposta <span class="text-destructive">*</span></Label>
            <Input 
              v-model="formData.variable" 
              placeholder="Ex: nome_cliente" 
              @input="(e) => formData.variable = toSnakeCase((e.target as HTMLInputElement).value)"
            />
            <p class="text-xs text-muted-foreground">Nome sem {{}}. Ex: nome_usuario</p>
          </div>

          <Separator />

          <!-- Seleção Tipo de Pergunta (Cards Visuais) -->
          <div class="space-y-3">
            <Label>Tipo de Resposta</Label>
            
            <div class="grid grid-cols-2 gap-3">
              <!-- Card Texto Livre -->
              <div 
                class="relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all text-center"
                :class="[!hasOptions ? 'border-primary bg-primary/5' : 'border-muted bg-card']"
                @click="setQuestionType('text')"
              >
                 <AlignLeft class="h-6 w-6" :class="[!hasOptions ? 'text-primary' : 'text-muted-foreground']" />
                 <div class="space-y-0.5">
                   <span class="text-sm font-medium leading-none" :class="[!hasOptions ? 'text-foreground' : 'text-muted-foreground']">Texto Livre</span>
                   <p class="text-[10px] text-muted-foreground">O contato digita a resposta</p>
                 </div>
                 <div v-if="!hasOptions" class="absolute top-2 right-2 text-primary">
                    <CheckCircle2 class="h-4 w-4" />
                 </div>
              </div>

              <!-- Card Múltipla Escolha -->
              <div 
                class="relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 cursor-pointer hover:bg-muted/50 transition-all text-center"
                :class="[hasOptions ? 'border-primary bg-primary/5' : 'border-muted bg-card']"
                @click="setQuestionType('options')"
              >
                 <List class="h-6 w-6" :class="[hasOptions ? 'text-primary' : 'text-muted-foreground']" />
                 <div class="space-y-0.5">
                   <span class="text-sm font-medium leading-none" :class="[hasOptions ? 'text-foreground' : 'text-muted-foreground']">Múltipla Escolha</span>
                   <p class="text-[10px] text-muted-foreground">O contato escolhe opções</p>
                 </div>
                 <div v-if="hasOptions" class="absolute top-2 right-2 text-primary">
                    <CheckCircle2 class="h-4 w-4" />
                 </div>
              </div>
            </div>
          </div>

          <!-- Configuração de Opções (Visível apenas se tiver opções) -->
          <div v-if="formData.options && formData.options.length > 0" class="space-y-6">
            
            <div class="space-y-2">
              <Label>Prefixo das Opções</Label>
              <Select
                :model-value="formData.optionPrefix || 'number'"
                @update:model-value="(val) => formData.optionPrefix = val"
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="number">Números (1, 2, 3...)</SelectItem>
                  <SelectItem value="letter">Letras (A, B, C...)</SelectItem>
                  <SelectItem value="none">Hífen (-)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <Label>Opções</Label>
                <Button variant="outline" size="sm" @click="addOption" class="h-7 text-xs">
                  <Plus class="mr-1 h-3 w-3" /> Adicionar
                </Button>
              </div>

              <!-- Headers -->
              <div class="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-2 items-end mb-1 px-1">
                <Label class="text-xs text-muted-foreground w-16 text-center">Prefixo</Label>
                <Label class="text-xs text-muted-foreground">Texto da Opção</Label>
                <Label class="text-xs text-muted-foreground">Valor (Interno)</Label>
                <div class="w-6"></div>
                <div class="w-8"></div>
              </div>

              <div class="space-y-2">
                <div 
                  v-for="(option, index) in formData.options" 
                  :key="index" 
                  class="grid grid-cols-[auto_1fr_1fr_auto_auto] gap-2 items-center"
                >
                  <!-- Prefixo Preview -->
                  <div class="flex items-center justify-center w-16 h-10 bg-muted rounded-md text-sm font-mono text-muted-foreground border">
                    {{ getOptionPrefix(index, formData.optionPrefix) }}
                  </div>

                  <!-- Label -->
                  <Input 
                    v-model="option.label" 
                    placeholder="Texto" 
                    class="h-10"
                    @input="(e) => {
                      const val = (e.target as HTMLInputElement).value;
                      if (!option.value || option.value === toSnakeCase(val)) {
                         option.value = toSnakeCase(val);
                      }
                    }"
                  />

                  <!-- Value -->
                  <Input 
                    v-model="option.value" 
                    placeholder="Valor" 
                    class="h-10 font-mono text-xs"
                  />

                  <!-- Mover -->
                  <div class="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-4 w-6 rounded-[2px]"
                      :disabled="index === 0"
                      @click="moveOption(index, 'up')"
                    >
                      <ChevronUp class="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-4 w-6 rounded-[2px]"
                      :disabled="index === formData.options.length - 1"
                      @click="moveOption(index, 'down')"
                    >
                      <ChevronDown class="h-3 w-3" />
                    </Button>
                  </div>

                  <!-- Remover -->
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    class="h-9 w-9 text-muted-foreground hover:text-destructive"
                    @click="removeOption(index)"
                  >
                    <X class="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            <!-- Mensagem de Erro -->
            <div class="space-y-2">
              <Label>Mensagem de Erro (quando opção não reconhecida)</Label>
              <div class="flex gap-2">
                <Textarea 
                  v-model="formData.invalidOptionMessage" 
                  placeholder="Opção não reconhecida. Tente novamente."
                  rows="2"
                  class="flex-1 resize-none"
                />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon" class="h-auto">
                       <Variable class="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[400px] p-0" align="end">
                    <VariableSelector
                       :flowVariables="[]" 
                       @select="(val) => {
                          formData.invalidOptionMessage = (formData.invalidOptionMessage || '') + '{{' + val + '}}';
                       }"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <p class="text-xs text-muted-foreground">Exibida quando o contato escolhe uma opção inválida.</p>
            </div>
          </div>
        </div>

        <!-- WAIT -->
        <div v-if="blockType === 'wait'" class="space-y-4">
          <div class="space-y-2">
            <Label>Tempo de Espera (segundos)</Label>
            <div class="flex items-center gap-2">
              <Input 
                type="number" 
                :model-value="(formData.waitDuration || 0) / 1000"
                @update:model-value="(v) => formData.waitDuration = Number(v) * 1000"
                min="0"
                step="1"
                placeholder="0"
              />
              <Clock class="text-muted-foreground w-4 h-4" />
            </div>
            <p class="text-xs text-muted-foreground">O fluxo irá aguardar este tempo antes de prosseguir.</p>
          </div>
        </div>

        <!-- ACTION -->
        <div v-if="blockType === 'action'" class="space-y-4">
          <div class="space-y-2">
            <Label>Tipo de Ação</Label>
            <Select 
              :model-value="formData.actionType" 
              @update:model-value="(v) => formData.actionType = v"
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add_tag">Adicionar Etiqueta</SelectItem>
                <SelectItem value="assign_agent">Atribuir a Agente</SelectItem>
                <SelectItem value="assign_team">Atribuir a Time</SelectItem>
                <SelectItem value="finish_conversation">Finalizar Conversa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Add Tag -->
          <div v-if="formData.actionType === 'add_tag'" class="space-y-2 border-l-2 border-primary/20 pl-4">
            <Label>Nome da Etiqueta</Label>
            <Input 
              v-model="formData.tag_name" 
              placeholder="Ex: interessado, lead-quente" 
            />
            <p class="text-xs text-muted-foreground">Etiqueta que será adicionada ao contato.</p>
          </div>

          <!-- Assign Agent -->
          <div v-if="formData.actionType === 'assign_agent'" class="space-y-2 border-l-2 border-primary/20 pl-4">
            <Label>Selecione o Agente</Label>
            <Select v-model="formData.agent_id">
              <SelectTrigger>
                <SelectValue placeholder="Escolha um agente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="agent in MOCK_AGENTS" :key="agent.id" :value="agent.id">
                  {{ agent.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Assign Team -->
          <div v-if="formData.actionType === 'assign_team'" class="space-y-2 border-l-2 border-primary/20 pl-4">
            <Label>Selecione o Time</Label>
            <Select v-model="formData.team_id">
              <SelectTrigger>
                <SelectValue placeholder="Escolha um time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="team in MOCK_TEAMS" :key="team.id" :value="team.id">
                  {{ team.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <!-- Finish Conversation -->
          <div v-if="formData.actionType === 'finish_conversation'" class="p-3 bg-muted/50 rounded-md text-sm text-muted-foreground border-l-2 border-primary/20">
            A conversa será finalizada e arquivada imediatamente.
          </div>
        </div>

        <!-- SWITCH -->
        <div v-if="blockType === 'switch'" class="space-y-4">
          <div class="flex items-center justify-between">
            <Label>Condições de Decisão</Label>
            <Button variant="outline" size="sm" @click="addCondition" class="h-8">
              <Plus class="mr-1 h-3 w-3" /> Adicionar
            </Button>
          </div>
          
          <div class="space-y-3">
             <div 
               v-for="(condition, index) in formData.conditions" 
               :key="index"
               class="border p-3 rounded-md space-y-3 relative bg-card"
             >
                <div class="flex items-start justify-between gap-2">
                   <div class="w-full space-y-2">
                      <div class="space-y-1">
                        <Label class="text-xs">Nome da Condição</Label>
                        <Input v-model="condition.label" placeholder="Ex: Cliente VIP" class="h-8" />
                      </div>
                      
                      <div class="grid grid-cols-2 gap-2">
                         <div class="space-y-1">
                           <Label class="text-xs">Variável</Label>
                           <Input v-model="condition.variable" placeholder="variavel" class="h-8" />
                         </div>
                         <div class="space-y-1">
                           <Label class="text-xs">Operador</Label>
                           <Select v-model="condition.operator">
                             <SelectTrigger class="h-8">
                               <SelectValue />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem v-for="op in CONDITION_OPERATORS" :key="op.value" :value="op.value">
                                 {{ op.label }}
                               </SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                      </div>

                      <div v-if="!['empty', 'not_empty'].includes(condition.operator)" class="space-y-1">
                         <Label class="text-xs">Valor</Label>
                         <Input v-model="condition.value" placeholder="Valor para comparar" class="h-8" />
                      </div>
                   </div>

                   <Button 
                      variant="ghost" 
                      size="icon" 
                      class="h-6 w-6 -mr-1 -mt-1 text-muted-foreground hover:text-destructive"
                      @click="removeCondition(index)"
                   >
                      <X class="h-3.5 w-3.5" />
                   </Button>
                </div>
             </div>
             
             <div v-if="!formData.conditions || formData.conditions.length === 0" class="text-xs text-center py-4 text-muted-foreground border border-dashed rounded">
               Adicione condições para criar ramificações no fluxo.
             </div>
          </div>
        </div>

      </div>
    </ScrollArea>

    <!-- Footer -->
    <div class="p-4 border-t bg-muted/20 flex justify-end gap-2">
      <Button variant="outline" @click="$emit('close')">Cancelar</Button>
      <Button @click="handleSave" class="min-w-[100px]">Salvar</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck - Arquivo em construção
import { ref, computed, watch } from 'vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { X, MessageSquare, MessageSquarePlus, CheckCircle2, Clock, Webhook, Play, Image, Video, Mic, FileText, Type, Plus, Trash, ChevronUp, ChevronDown, AlertCircle, Variable, List, AlignLeft } from 'lucide-vue-next';
import { TRIGGER_TYPES, type CustomNodeData, type BlockType, type TriggerType } from '@/types/flow-builder';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import VariableTextArea from './VariableTextArea.vue';
import VariableSelector from './VariableSelector.vue';

// Mocks
const MOCK_INBOXES = [
  { id: '1', name: 'WhatsApp Principal' },
  { id: '2', name: 'Instagram Comercial' },
  { id: '3', name: 'Webchat Suporte' },
];

const CONDITION_OPERATORS = [
  { value: '===', label: 'Igual a' },
  { value: '!==', label: 'Diferente de' },
  { value: '>', label: 'Maior que' },
  { value: '<', label: 'Menor que' },
  { value: '>=', label: 'Maior ou igual a' },
  { value: '<=', label: 'Menor ou igual a' },
  { value: 'contains', label: 'Contém' },
  { value: 'starts_with', label: 'Começa com' },
  { value: 'ends_with', label: 'Termina com' },
  { value: 'empty', label: 'Está vazio' },
  { value: 'not_empty', label: 'Não está vazio' },
];

const MOCK_AGENTS = [
  { id: '1', name: 'Agente IA Vendas' },
  { id: '2', name: 'Agente IA Suporte' },
];

const MOCK_TEAMS = [
  { id: '1', name: 'Equipe Comercial' },
  { id: '2', name: 'Suporte Técnico' },
  { id: '3', name: 'Financeiro' },
];

const props = defineProps<{
  blockId: string;
  blockType: BlockType;
  modelValue: CustomNodeData; // Usando modelValue para v-model
}>();

const emit = defineEmits(['update:modelValue', 'close', 'save']);

// Estado local do form
const formData = ref<CustomNodeData>({ ...props.modelValue });

// Sincronizar quando o prop mudar
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue };
}, { deep: true });

// Helpers para ícones e labels
const getTriggerIcon = (type: string) => {
  switch (type) {
    case 'message_received': return MessageSquare;
    case 'conversation_created': return MessageSquarePlus;
    case 'conversation_finished': return CheckCircle2;
    case 'schedule': return Clock;
    case 'webhook': return Webhook;
    case 'manual': return Play;
    default: return MessageSquare;
  }
};

const getTriggerLabel = (type: string) => {
  return TRIGGER_TYPES.find(t => t.value === type)?.label || type;
};

const getTriggerDescription = (type: string) => {
  return TRIGGER_TYPES.find(t => t.value === type)?.description || '';
};

// Helpers para Mensagem
const getMessageTypeIcon = (type: string) => {
  switch (type) {
    case 'text': return Type;
    case 'image': return Image;
    case 'video': return Video;
    case 'audio': return Mic;
    case 'file': return FileText;
    default: return Type;
  }
};

const getMessageTypeLabel = (type: string) => {
  switch (type) {
    case 'text': return 'Texto';
    case 'image': return 'Imagem';
    case 'video': return 'Vídeo';
    case 'audio': return 'Áudio';
    case 'file': return 'Arquivo';
    default: return 'Texto';
  }
};

const blockTypeLabel = computed(() => {
  switch (props.blockType) {
    case 'trigger': return 'Configuração do Gatilho';
    case 'message': return 'Configuração de Mensagem';
    case 'question': return 'Configuração de Pergunta';
    case 'switch': return 'Condições de Decisão';
    // ... outros tipos
    default: return 'Configuração';
  }
});

const handleSave = () => {
  // Garantir consistência nas opções
  if (props.blockType === 'question' && formData.value.options) {
    formData.value.options.forEach(opt => {
      if (!opt.value) opt.value = opt.label; // Fallback se value estiver vazio
    });
  }

  // Aqui poderia ter validações
  emit('save', { id: props.blockId, data: formData.value });
  emit('update:modelValue', formData.value);
  emit('close');
};

const hasOptions = computed(() => {
  return formData.value.options && formData.value.options.length > 0;
});

const setQuestionType = (type: 'text' | 'options') => {
  if (type === 'text') {
    formData.value.options = [];
    formData.value.optionPrefix = undefined;
    formData.value.invalidOptionMessage = undefined;
  } else {
    // Preservar opções existentes se apenas ocultas (opcional, aqui estamos resetando se estava vazio ou garantindo array)
    if (!formData.value.options || formData.value.options.length === 0) {
      if (!formData.value.options) formData.value.options = [];
      addOption();
      formData.value.optionPrefix = 'number';
    }
  }
};

const addOption = () => {
  if (!formData.value.options) {
    formData.value.options = [];
  }
  formData.value.options.push({ label: '', value: '' });
};

const removeOption = (index: number) => {
  if (formData.value.options) {
    formData.value.options.splice(index, 1);
  }
};

const addCondition = () => {
  if (!formData.value.conditions) {
    formData.value.conditions = [];
  }
  formData.value.conditions.push({ 
    label: `Condição ${formData.value.conditions.length + 1}`, 
    value: '', 
    operator: '===',
    variable: ''
  });
};

const removeCondition = (index: number) => {
  if (formData.value.conditions) {
    formData.value.conditions.splice(index, 1);
  }
};

const moveOption = (index: number, direction: 'up' | 'down') => {
  const options = formData.value.options;
  if (!options) return;
  
  if (direction === 'up' && index > 0) {
    [options[index - 1], options[index]] = [options[index], options[index - 1]];
  } else if (direction === 'down' && index < options.length - 1) {
    [options[index], options[index + 1]] = [options[index + 1], options[index]];
  }
};

const toSnakeCase = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s-]+/g, '_');
};

const getOptionPrefix = (index: number, type?: string) => {
  if (type === 'letter') return String.fromCharCode(65 + index); // A, B, C...
  if (type === 'none') return '•';
  return index + 1; // 1, 2, 3...
};
</script>
