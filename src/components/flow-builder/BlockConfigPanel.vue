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
        
        <!-- Título do Bloco (Comum a todos exceto início/fim) -->
        <div v-if="!['start', 'end'].includes(blockType || '')" class="space-y-2">
          <Label for="title">Título do Bloco</Label>
          <Input 
            id="title" 
            v-model="formData.title" 
            placeholder="Ex: Boas vindas" 
          />
        </div>

        <!-- INFO: START/END (No configuration needed) -->
        <div v-if="['start', 'end'].includes(blockType || '')" class="space-y-6">
           <div class="p-4 bg-muted/30 rounded-lg border border-dashed flex flex-col items-center justify-center text-center gap-3 py-12">
             <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
               <component :is="blockType === 'start' ? Play : Octagon" class="h-6 w-6 text-primary" />
             </div>
             <div class="space-y-1">
               <p class="text-sm font-medium">Sem configurações extras</p>
               <p class="text-xs text-muted-foreground max-w-[200px]">
                 {{ blockType === 'start' ? 'Este bloco é o ponto de partida automático do seu fluxo.' : 'Este bloco encerra a execução do fluxo.' }}
               </p>
             </div>
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
            <Label>Arquivo</Label>
            
            <!-- Input de URL ou Upload -->
            <div class="space-y-2">
              <!-- Input URL -->
              <div class="flex gap-2">
                <Input 
                  v-model="formData.mediaUrl" 
                  placeholder="https://exemplo.com/arquivo ou anexe um arquivo" 
                  class="flex-1"
                />
                <input 
                  ref="fileInputRef"
                  type="file" 
                  class="hidden" 
                  @change="handleFileSelect"
                  :accept="getAcceptedFileTypes(formData.messageType)"
                />
                <Button 
                  type="button"
                  variant="outline" 
                  @click="triggerFileInput"
                  class="shrink-0"
                >
                  <FileText class="h-4 w-4 mr-2" />
                  Anexar
                </Button>
              </div>
              
              <!-- Preview do arquivo selecionado -->
              <div v-if="selectedFile" class="flex items-center gap-2 p-2 bg-muted rounded-md border">
                <component :is="getMessageTypeIcon(formData.messageType || 'file')" class="h-4 w-4 text-muted-foreground shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ selectedFile.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</p>
                </div>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  class="h-6 w-6 shrink-0"
                  @click="clearSelectedFile"
                >
                  <X class="h-3 w-3" />
                </Button>
              </div>
              
              <p class="text-xs text-muted-foreground">
                Cole uma URL ou anexe um arquivo do seu computador
              </p>
            </div>
          </div>

          <!-- Conteúdo -->
          <div class="space-y-2">
            <Label>{{ formData.messageType && formData.messageType !== 'text' ? 'Legenda (Opcional)' : 'Conteúdo do Texto' }}</Label>
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

        <!-- INTEGRAÇÃO (API) -->
        <div v-if="blockType === 'api'" class="space-y-6">
          
          <!-- Tipo de API -->
          <div class="space-y-3 border border-dashed rounded-lg p-4 bg-muted/40">
            <Label class="text-sm font-medium">Tipo de API</Label>
            <RadioGroup 
              :model-value="formData.api_type || 'rest'"
              @update:model-value="(v) => { formData.api_type = v; if (v === 'graphql') formData.api_method = 'POST'; }"
              class="flex gap-4"
            >
              <div class="flex items-center space-x-2">
                <RadioGroupItem value="rest" id="api-type-rest" />
                <Label for="api-type-rest" class="cursor-pointer font-normal flex items-center gap-2">
                  <Globe class="h-4 w-4" />
                  REST
                </Label>
              </div>
              <div class="flex items-center space-x-2">
                <RadioGroupItem value="graphql" id="api-type-graphql" />
                <Label for="api-type-graphql" class="cursor-pointer font-normal flex items-center gap-2">
                  <Code2 class="h-4 w-4" />
                  GraphQL
                </Label>
              </div>
            </RadioGroup>
          </div>

          <!-- Configuração Básica -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium flex items-center gap-2">
              <Send class="h-4 w-4 text-muted-foreground" />
              Configuração Básica
            </h4>
            
            <!-- Endpoint -->
            <div class="space-y-2">
              <Label>Endpoint <span class="text-destructive">*</span></Label>
              <Input 
                v-model="formData.api_endpoint" 
                :placeholder="formData.api_type === 'graphql' ? 'https://api.exemplo.com/graphql' : 'https://api.exemplo.com/v1/endpoint'"
              />
              <p class="text-xs text-muted-foreground">URL completa da API (suporta variáveis como {{variável}})</p>
            </div>

            <!-- Método HTTP (apenas REST) -->
            <div v-if="formData.api_type !== 'graphql'" class="space-y-2">
              <Label>Método HTTP</Label>
              <Select v-model="formData.api_method">
                <SelectTrigger>
                  <SelectValue placeholder="GET" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Tipo de Autenticação -->
            <div class="space-y-2">
              <Label>Autenticação</Label>
              <Select v-model="formData.api_auth_type">
                <SelectTrigger>
                  <SelectValue placeholder="Nenhuma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  <SelectItem value="bearer">Bearer Token</SelectItem>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="basic">Basic Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <!-- Valor de Autenticação -->
            <div v-if="formData.api_auth_type && formData.api_auth_type !== 'none'" class="space-y-2 border-l-2 border-primary/20 pl-4">
              <Label>
                {{ formData.api_auth_type === 'bearer' ? 'Token' : ''}}
                {{ formData.api_auth_type === 'api_key' ? 'Chave da API' : ''}}
                {{ formData.api_auth_type === 'basic' ? 'Credenciais (usuário:senha)' : ''}}
              </Label>
              <div class="flex gap-2">
                <Input 
                  v-model="formData.api_auth_value" 
                  :type="formData.api_auth_value?.includes('{{') ? 'text' : 'password'"
                  :placeholder="formData.api_auth_type === 'basic' ? 'usuario:senha' : '{{myflows_api_token}}'"
                  class="font-mono"
                />
                <Popover v-if="formData.api_auth_type !== 'basic'">
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" size="icon" title="Selecionar variável">
                      <Variable class="h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent class="w-[400px] p-0" align="end">
                    <VariableSelector
                      :flowVariables="[]"
                      :allowSensitive="true"
                      :tokensOnly="true"
                      @select="(v) => formData.api_auth_value = `{{${v}}}`"
                      @close=""
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <p class="text-xs text-muted-foreground">
                {{ formData.api_auth_type === 'basic' ? 'Formato: usuário:senha (será codificado em Base64)' : 'Selecione um token da conta ou digite diretamente' }}
              </p>
            </div>

            <!-- Header customizado para API Key -->
            <div v-if="formData.api_auth_type === 'api_key'" class="space-y-2 border-l-2 border-primary/20 pl-4">
              <Label>Nome do Header (Opcional)</Label>
              <Input 
                v-model="formData.api_auth_header_name" 
                placeholder="X-API-Key"
              />
              <p class="text-xs text-muted-foreground">
                Padrão: <code class="bg-muted px-1 rounded">X-API-Key</code>
              </p>
            </div>
          </div>

          <Separator />

          <!-- Headers (opcional) -->
          <div class="space-y-3">
            <Label class="flex items-center gap-2">
              <FileJson class="h-4 w-4 text-muted-foreground" />
              Headers (Opcional)
            </Label>
            <KeyValueEditor
              v-model="formData.api_headers"
              placeholder-key="Header-Name"
              placeholder-value="Header-Value"
              add-button-text="Adicionar Header"
              :allow-sensitive="true"
            />
            <p class="text-xs text-muted-foreground">Headers HTTP adicionais para a requisição.</p>
          </div>

          <!-- Body (para POST/PUT/PATCH) -->
          <div v-if="['POST', 'PUT', 'PATCH'].includes(formData.api_method || '') && formData.api_type !== 'graphql'" class="space-y-3">
            <Label class="flex items-center gap-2">
              <FileText class="h-4 w-4 text-muted-foreground" />
              Body (Campos)
            </Label>
            <KeyValueEditor
              v-model="formData.api_body"
              placeholder-key="campo"
              placeholder-value="valor"
              add-button-text="Adicionar Campo"
            />
            <p class="text-xs text-muted-foreground">Campos do body da requisição. Suporta variáveis dinâmicas.</p>
          </div>

          <!-- GraphQL Query -->
          <div v-if="formData.api_type === 'graphql'" class="space-y-3">
            <Label class="flex items-center gap-2">
              <FileText class="h-4 w-4 text-muted-foreground" />
              Query GraphQL
            </Label>
            <Textarea 
              v-model="formData.api_graphql_query"
              placeholder="query { user(id: 1) { name email } }"
              rows="5"
              class="font-mono text-xs"
            />
            <p class="text-xs text-muted-foreground">Query ou mutation GraphQL. Suporta variáveis dinâmicas.</p>
          </div>

          <Separator />

          <!-- Resposta -->
          <div class="space-y-4">
            <h4 class="text-sm font-medium flex items-center gap-2">
              <FileOutput class="h-4 w-4 text-muted-foreground" />
              Resposta
            </h4>
            
            <div class="space-y-2">
              <Label>Variável de Resposta</Label>
              <Input 
                v-model="formData.api_response_variable"
                placeholder="api_response"
                @input="(e) => formData.api_response_variable = toSnakeCase((e.target as HTMLInputElement).value)"
              />
              <p class="text-xs text-muted-foreground">Nome da variável onde a resposta será armazenada.</p>
            </div>

            <div class="space-y-2">
              <Label>Caminho de Extração (Opcional)</Label>
              <Input 
                v-model="formData.api_response_path"
                placeholder="data.items ou items[0].title"
              />
              <p class="text-xs text-muted-foreground">Extrai uma parte específica da resposta (dot notation).</p>
            </div>
          </div>

          <Separator />

          <!-- Timeout -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <div class="space-y-1">
                <Label class="text-sm font-medium">Timeout Customizado</Label>
                <p class="text-xs text-muted-foreground">Tempo máximo de espera pela resposta</p>
              </div>
              <Switch 
                :checked="formData.api_timeout_enabled || false"
                @update:checked="(v) => formData.api_timeout_enabled = v"
              />
            </div>
            
            <div v-if="formData.api_timeout_enabled" class="space-y-2">
              <Label>Timeout (milissegundos)</Label>
              <Input 
                v-model="formData.api_timeout"
                type="number"
                placeholder="5000"
                min="1000"
                max="60000"
```
              />
              <p class="text-xs text-muted-foreground">Padrão: 5000ms (5 segundos)</p>
            </div>
            
            <div v-else class="p-3 border rounded-md bg-muted/50 text-sm text-muted-foreground">
              Usando valor padrão: <span class="font-medium text-foreground">5000ms</span> (5 segundos)
            </div>
          </div>
        </div>

        <!-- CONDITIONAL: HOLIDAY -->
        <div v-if="blockType === 'condition_holiday'" class="space-y-4">
          <div class="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
             <div class="flex items-start gap-3">
               <Calendar class="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
               <div class="space-y-1">
                 <h4 class="text-sm font-medium text-amber-800 dark:text-amber-200">Verificação de Feriados</h4>
                 <p class="text-xs text-amber-700 dark:text-amber-300">
                   Este bloco verifica automaticamente se hoje é um feriado ou dia inativo configurado no sistema.
                 </p>
               </div>
             </div>
          </div>
          
          <div class="space-y-2">
            <Label>Calendário de Feriados</Label>
             <Select disabled model-value="default">
                <SelectTrigger>
                  <SelectValue placeholder="Padrão do Sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Padrão do Sistema</SelectItem>
                </SelectContent>
             </Select>
             <p class="text-xs text-muted-foreground">Configurações de feriados são gerenciadas nas Configurações Gerais.</p>
          </div>

          <Separator />
          
          <div class="space-y-2">
             <Label>Saídas</Label>
             <div class="space-y-2">
               <div class="flex items-center justify-between p-2 border rounded bg-muted/50">
                 <span class="text-sm font-medium">Sim (É Feriado)</span>
                 <Badge variant="outline" class="bg-amber-100 text-amber-800 border-amber-200">Saída 1</Badge>
               </div>
               <div class="flex items-center justify-between p-2 border rounded bg-muted/50">
                 <span class="text-sm font-medium">Não (Dia Normal)</span>
                 <Badge variant="outline">Saída 2</Badge>
               </div>
             </div>
          </div>
        </div>

        <!-- CONDITIONAL: WEEKDAY -->
        <div v-if="blockType === 'condition_weekday'" class="space-y-6">
           <div class="flex items-center justify-between">
             <Label>Grupos de Dias</Label>
             <Button variant="outline" size="sm" @click="addCondition" class="h-8">
               <Plus class="mr-1 h-3 w-3" /> Adicionar Grupo
             </Button>
           </div>
           
           <div class="space-y-4">
              <div 
                v-for="(condition, index) in formData.conditions" 
                :key="index"
                class="border p-3 rounded-md space-y-3 relative bg-card"
              >
                 <div class="flex items-start justify-between gap-2">
                    <div class="w-full space-y-3">
                       <div class="space-y-1">
                         <Label class="text-xs">Nome do Grupo</Label>
                         <Input v-model="condition.label" placeholder="Ex: Dias Úteis" class="h-8" />
                       </div>
                       
                       <div class="space-y-1">
                         <Label class="text-xs">Dias Selecionados</Label>
                         <div class="flex flex-wrap gap-1">
                           <div 
                             v-for="day in WEEKDAYS" 
                             :key="day.value"
                             @click="toggleDayInCondition(condition, day.value)"
                             class="cursor-pointer px-2 py-1 rounded text-[10px] font-medium transition-colors border select-none"
                             :class="condition.value?.includes(day.value) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted text-muted-foreground hover:bg-muted/80'"
                           >
                             {{ day.label }}
                           </div>
                         </div>
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
                Adicione grupos de dias para rotear o fluxo.
              </div>
           </div>
        </div>

        <!-- CONDITIONAL: TIME RANGE -->
        <div v-if="blockType === 'condition_time_range'" class="space-y-6">
           <div class="flex items-center justify-between">
             <Label>Intervalos de Horário</Label>
             <Button variant="outline" size="sm" @click="addCondition" class="h-8">
               <Plus class="mr-1 h-3 w-3" /> Adicionar Intervalo
             </Button>
           </div>
           
           <div class="space-y-4">
              <div 
                v-for="(condition, index) in formData.conditions" 
                :key="index"
                class="border p-3 rounded-md space-y-3 relative bg-card"
              >
                 <div class="flex items-start justify-between gap-2">
                    <div class="w-full space-y-3">
                       <div class="space-y-1">
                         <Label class="text-xs">Nome do Intervalo</Label>
                         <Input v-model="condition.label" placeholder="Ex: Manhã" class="h-8" />
                       </div>
                       
                       <div class="space-y-1">
                         <Label class="text-xs">Horário (Início - Fim)</Label>
                         <div class="flex items-center gap-2">
                           <!-- Simples input de texto para intervalo por enquanto, idealmente time pickers -->
                           <Input 
                              v-model="condition.value" 
                              placeholder="08:00-12:00" 
                              class="h-8 font-mono text-xs" 
                           />
                           <Clock class="h-4 w-4 text-muted-foreground" />
                         </div>
                         <p class="text-[10px] text-muted-foreground">Formato: HH:MM-HH:MM (24h)</p>
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
                Adicione intervalos de horário.
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { X, MessageSquare, MessageSquarePlus, CheckCircle2, Clock, Webhook, Play, Image, Video, Mic, FileText, Type, Plus, Trash, ChevronUp, ChevronDown, AlertCircle, Variable, List, AlignLeft, Globe, Code2, Send, FileJson, FileOutput, Calendar, CalendarDays } from 'lucide-vue-next';
import { TRIGGER_TYPES, type CustomNodeData, type BlockType, type TriggerType } from '@/types/flow-builder';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import VariableTextArea from './VariableTextArea.vue';
import VariableSelector from './VariableSelector.vue';
import KeyValueEditor from './KeyValueEditor.vue';
import { Badge } from '@/components/ui/badge'; // Added Badge import

// Mocks
const MOCK_INBOXES = [
  { id: '1', name: 'WhatsApp Principal' },
  { id: '2', name: 'Instagram Comercial' },
  { id: '3', name: 'Webchat Suporte' },
];

const CONDITION_OPERATORS = [
  { value: 'equals', label: 'Igual a' },
  { value: 'not_equals', label: 'Diferente de' },
  { value: 'contains', label: 'Contém' },
  { value: 'greater_than', label: 'Maior que' },
  { value: 'less_than', label: 'Menor que' },
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

const WEEKDAYS = [
  { label: 'Seg', value: '1', full: 'Segunda-feira' },
  { label: 'Ter', value: '2', full: 'Terça-feira' },
  { label: 'Qua', value: '3', full: 'Quarta-feira' },
  { label: 'Qui', value: '4', full: 'Quinta-feira' },
  { label: 'Sex', value: '5', full: 'Sexta-feira' },
  { label: 'Sáb', value: '6', full: 'Sábado' },
  { label: 'Dom', value: '0', full: 'Domingo' },
];

const props = defineProps<{
  blockId: string;
  blockType: BlockType;
  modelValue: CustomNodeData; // Usando modelValue para v-model
}>();

const emit = defineEmits(['update:modelValue', 'close', 'save']);

// Estado local do form
const formData = ref<CustomNodeData>({ ...props.modelValue });

// Estado para arquivo selecionado
const selectedFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Sincronizar quando o prop mudar
watch(() => props.modelValue, (newValue) => {
  formData.value = { ...newValue };
  // Inicializações específicas
  if (props.blockType === 'condition_holiday') {
    ensureHolidayConditions();
  } else if (props.blockType === 'condition_weekday') {
    ensureWeekdayConditions();
  }
}, { deep: true, immediate: true });

// Garantir condições padrão para Holiday
function ensureHolidayConditions() {
  if (!formData.value.conditions || formData.value.conditions.length === 0) {
    formData.value.conditions = [
      { label: 'Sim', value: 'true' },
      { label: 'Não', value: 'false' }
    ];
  }
}

// Garantir condições padrão para Weekday
function ensureWeekdayConditions() {
  if (!formData.value.conditions || formData.value.conditions.length === 0) {
    formData.value.conditions = WEEKDAYS.map(day => ({
      label: day.full,
      value: [day.value],
      operator: 'contains',
      variable: 'current_weekday'
    }));
  }
}

const toggleDayInCondition = (condition: any, dayValue: string) => {
  if (!Array.isArray(condition.value)) {
     condition.value = [];
  }
  const index = condition.value.indexOf(dayValue);
  if (index === -1) {
     condition.value.push(dayValue);
  } else {
     condition.value.splice(index, 1);
  }
};

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
    case 'start': return 'Configuração de Início';
    case 'end': return 'Configuração de Fim';
    case 'message': return 'Configuração de Mensagem';
    case 'question': return 'Configuração de Pergunta';
    case 'switch': return 'Condições de Decisão';
    case 'api': return 'Configuração de Integração';
    case 'action': return 'Configuração de Ação';
    case 'wait': return 'Configuração de Espera';
    case 'note': return 'Configuração de Nota';
    case 'condition_holiday': return 'Condição: Feriado';
    case 'condition_weekday': return 'Condição: Dias da Semana';
    case 'condition_time_range': return 'Condição: Horário';
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

// Funções para manipulação de arquivos
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  
  if (file) {
    selectedFile.value = file;
    
    // Criar URL temporária do arquivo (blob URL)
    const blobUrl = URL.createObjectURL(file);
    formData.value.mediaUrl = blobUrl;
    
    // Armazenar o arquivo para upload posterior
    formData.value.localFile = file;
    
    // Nota: Em produção, você pode querer fazer upload imediato para um servidor
    // e obter uma URL permanente, ou armazenar o arquivo para upload ao salvar
  }
};

const clearSelectedFile = () => {
  selectedFile.value = null;
  formData.value.mediaUrl = '';
  formData.value.localFile = undefined;
  
  // Limpar o input file
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const getAcceptedFileTypes = (messageType?: string) => {
  switch (messageType) {
    case 'image':
      return 'image/*';
    case 'video':
      return 'video/*';
    case 'audio':
      return 'audio/*';
    case 'file':
      return '*/*';
    default:
      return '*/*';
  }
};

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
</script>
