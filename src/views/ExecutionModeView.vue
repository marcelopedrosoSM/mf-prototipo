<template>
  <AppLayout>
    <div class="flex h-full flex-col">
      <ScrollArea class="flex-1">
        <div class="p-6">
          <div class="mx-auto max-w-7xl">
            <!-- Header -->
            <div class="mb-6">
              <div class="flex items-center justify-between">
                <div>
                  <h1 class="text-2xl font-semibold">Modo Execução</h1>
                  <p class="text-sm text-muted-foreground mt-1">
                    Gerencia as suas atividades
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <!-- View Toggle -->
                  <div class="flex rounded-lg border p-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      :class="viewMode === 'list' ? 'bg-muted hover:bg-muted/90' : 'hover:bg-muted/50'"
                      @click="viewMode = 'list'"
                    >
                      <List class="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      :class="viewMode === 'kanban' ? 'bg-muted hover:bg-muted/90' : 'hover:bg-muted/50'"
                      @click="viewMode = 'kanban'"
                    >
                      <Kanban class="h-4 w-4" />
                    </Button>
                  </div>
                  <!-- Add Activity -->
                  <Button variant="outline" class="mr-2" @click="handleAddActivity">
                    <Plus class="mr-2 h-4 w-4" />
                    Nova Atividade
                  </Button>
                  <Button @click="enrollDialogOpen = true">
                    <Play class="mr-2 h-4 w-4" />
                    Iniciar Fluxo
                  </Button>
                </div>
              </div>
            </div>

            <!-- Filters -->
            <div class="flex items-center gap-4 mb-6">
              <div class="flex-1 relative">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  v-model="searchQuery" 
                  placeholder="Buscar por contato, atividade..." 
                  class="pl-10"
                />
              </div>
              <Select v-model="filterFlow">
                <SelectTrigger class="w-[200px]">
                  <SelectValue placeholder="Todos os fluxos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os fluxos</SelectItem>
                  <SelectItem v-for="flow in availableFlows" :key="flow.id" :value="flow.id">
                    {{ flow.nome }}
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select v-model="filterStatus">
                <SelectTrigger class="w-[180px]">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="overdue">Atrasadas</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="skipped">Ignoradas</SelectItem>
                </SelectContent>
              </Select>
              <Select v-model="filterPeriod">
                <SelectTrigger class="w-[160px]">
                  <SelectValue placeholder="Período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="last7days">7 dias</SelectItem>
                  <SelectItem value="next7days">Próximos 7 dias</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" title="Exportar (Futuro)">
                <Download class="h-4 w-4" />
              </Button>
            </div>


            <div class="flex flex-wrap gap-4 mb-6">
              <!-- Progress Card -->
              <Card class="flex-1 min-w-[300px] p-4 flex flex-col justify-center relative group">
                 <div class="flex items-center justify-between mb-2">
             <div class="flex items-center gap-2">
			   <span class="text-sm font-medium text-muted-foreground">Progresso</span>
			   <Button
				 variant="ghost"
				 size="icon"
				 class="h-5 w-5 rounded-full hover:bg-muted"
				 @click="helpDialogOpen = true"
			   >
				 <HelpCircle class="h-3.5 w-3.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors" />
			   </Button>
			 </div>
                    <span class="text-lg font-bold text-primary">{{ dailyProgress }}%</span>
                 </div>
                 <Progress :model-value="dailyProgress" class="h-2" />
                 <p class="text-xs text-muted-foreground mt-2">
                   {{ completedCount }}/{{ dailyWorkloadCount }} atividades realizadas
                   <span v-if="skippedCount > 0" class="text-muted-foreground/60 ml-1">
                     (-{{ skippedCount }} ignoradas)
                   </span>
                 </p>
              </Card>

              <Card class="w-[170px] shrink-0 p-3">
                <div class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Clock class="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-xl font-bold">{{ pendingCount }}</p>
                    <p class="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </Card>
              <Card class="w-[170px] shrink-0 p-3">
                <div class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <AlertTriangle class="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p class="text-xl font-bold">{{ overdueCount }}</p>
                    <p class="text-xs text-muted-foreground">Atrasadas</p>
                  </div>
                </div>
              </Card>
              <Card class="w-[170px] shrink-0 p-3">
                <div class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 class="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p class="text-xl font-bold">{{ completedCount }}</p>
                    <p class="text-xs text-muted-foreground">Concluídas</p>
                  </div>
                </div>
              </Card>
              <Card class="w-[170px] shrink-0 p-3">
                <div class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-muted dark:bg-muted/50 flex items-center justify-center">
                    <TrendingUp class="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p class="text-xl font-bold">{{ totalCount }}</p>
                    <p class="text-xs text-muted-foreground">Total</p>
                  </div>
                </div>
              </Card>
            </div>



            <!-- Bulk Actions Bar -->
            <div 
              v-if="selectedActivities.length > 0"
              class="flex items-center gap-4 mb-4 p-3 rounded-lg bg-muted"
            >
              <span class="text-sm font-medium">
                {{ selectedActivities.length }} selecionada(s)
              </span>
              <Button 
                v-if="selectedActivities.length < selectableActivities.length"
                size="sm" 
                variant="outline" 
                @click="selectAllActivities"
              >
                <CheckSquare class="h-4 w-4 mr-1" />
                Selecionar Todas ({{ selectableActivities.length }})
              </Button>
              <Button size="sm" variant="outline" @click="handleBulkExecute">
                <Play class="h-4 w-4 mr-1" />
                Executar
              </Button>
              <Button size="sm" variant="outline" @click="handleBulkSkip">
                <SkipForward class="h-4 w-4 mr-1" />
                Ignorar
              </Button>
              <Button size="sm" variant="ghost" @click="selectedActivities = []">
                Cancelar
              </Button>
            </div>

            <!-- Activity List (Timeline) -->
            <div v-if="viewMode === 'list'" class="space-y-6">
              <div v-for="group in groupedActivities" :key="group.status" class="space-y-3">
                <!-- Collapsible Header -->
                <div 
                  class="flex items-center gap-3 cursor-pointer group select-none"
                  @click="toggleSection(group.status)"
                >
                  <div class="h-px flex-1 bg-border" />
                  <div class="flex items-center gap-2 px-2 py-1 rounded-full hover:bg-muted/50 transition-colors">
                    <ChevronDown 
                      class="h-4 w-4 text-muted-foreground transition-transform duration-200"
                      :class="collapsedSections[group.status] && '-rotate-90'"
                    />
                    <span class="text-sm font-medium text-muted-foreground">
                      {{ group.label }}
                    </span>
                    <Badge 
                      variant="outline"
                      :class="['h-6 px-2.5 text-xs font-semibold border-transparent', getGroupBadgeClass(group.status)]"
                    >
                      {{ group.activities.length }}
                    </Badge>
                  </div>
                  <div class="h-px flex-1 bg-border" />
                </div>
                
                <!-- Activity Cards -->
                <div 
                  v-show="!collapsedSections[group.status]"
                  class="space-y-2 transition-all duration-300"
                >
                  <ActivityCard
                    v-for="activity in group.activities"
                    :key="activity.id"
                    :activity="activity"
                    :selected="selectedActivities.includes(activity.id)"
                    @click="openDetailPanel(activity)"
                    @toggle-select="toggleActivitySelection(activity.id)"
                    @execute="handleExecuteActivity(activity)"
                  />
                </div>
              </div>

              <!-- Empty State -->
              <div 
                v-if="filteredActivities.length === 0"
                class="flex flex-col items-center justify-center py-16 text-center"
              >
                <div class="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CheckCircle2 class="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 class="text-lg font-medium mb-1">Nenhuma atividade encontrada</h3>
                <p class="text-sm text-muted-foreground max-w-md">
                  Não há atividades pendentes no momento. Novas atividades serão geradas automaticamente pelos fluxos.
                </p>
              </div>
            </div>

            <!-- Kanban View -->
            <div v-else class="flex gap-4 min-h-[600px] pb-6 overflow-x-auto">
              <!-- Atrasadas -->
              <div 
                class="flex-1 min-w-[300px] flex flex-col"
                @dragover.prevent="onDragOverInProgress"
                @dragleave="onDragLeaveInProgress"
                @drop="onDropInProgress"
              >
                <div class="flex items-center justify-between mb-4 px-2">
                  <div class="flex items-center gap-2">
                    <div :class="['h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.2)]', ACTIVITY_STATUS_METADATA.overdue.dotClass]" />
                    <h3 class="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Atrasadas</h3>
                    <span class="ml-1 text-xs font-bold bg-orange-100 text-orange-600 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                      {{ kanbanAtrasadas.length }}
                    </span>
                  </div>
                </div>
                
                <div 
                  class="flex-1 space-y-3 p-2 rounded-xl border-2 border-transparent transition-colors bg-muted/30"
                  :class="isDraggingOverInProgress && 'border-orange-500/20 bg-orange-500/5'"
                >
                  <ActivityCard
                    v-for="activity in kanbanAtrasadas"
                    :key="activity.id"
                    :activity="activity"
                    compact
                    @click="openDetailPanel(activity)"
                    @execute="handleExecuteActivity(activity)"
                  />
                  <div v-if="kanbanAtrasadas.length === 0" class="py-12 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground/40 text-sm">
                    Nenhuma atrasada
                  </div>
                </div>
              </div>

              <!-- Pendentes -->
              <div 
                class="flex-1 min-w-[300px] flex flex-col"
                @dragover.prevent="onDragOverPending"
                @dragleave="onDragLeavePending"
                @drop="onDropPending"
              >
                <div class="flex items-center justify-between mb-4 px-2">
                  <div class="flex items-center gap-2">
                    <div :class="['h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]', ACTIVITY_STATUS_METADATA.pending.dotClass]" />
                    <h3 class="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Pendentes</h3>
                    <span class="ml-1 text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                      {{ kanbanPendentes.length }}
                    </span>
                  </div>
                </div>

                <div 
                  class="flex-1 space-y-3 p-2 rounded-xl border-2 border-transparent transition-colors bg-muted/30"
                  :class="isDraggingOverPending && 'border-blue-500/20 bg-blue-500/5'"
                >
                  <ActivityCard
                    v-for="activity in kanbanPendentes"
                    :key="activity.id"
                    :activity="activity"
                    compact
                    @click="openDetailPanel(activity)"
                    @execute="handleExecuteActivity(activity)"
                  />
                  <div v-if="kanbanPendentes.length === 0" class="py-12 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground/40 text-sm">
                    Lista vazia
                  </div>
                </div>
              </div>

              <!-- Concluídas -->
              <div class="flex-1 min-w-[300px] flex flex-col">
                <div class="flex items-center justify-between mb-4 px-2">
                  <div class="flex items-center gap-2">
                    <div :class="['h-2 w-2 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]', ACTIVITY_STATUS_METADATA.completed.dotClass]" />
                    <h3 class="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Concluídas</h3>
                    <span class="ml-1 text-xs font-bold bg-green-100 text-green-600 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                      {{ kanbanConcluidas.length }}
                    </span>
                  </div>
                </div>

                <div class="flex-1 space-y-3 p-2 rounded-xl bg-muted/30 overflow-y-auto max-h-[calc(100vh-250px)]">
                  <ActivityCard
                    v-for="activity in kanbanConcluidas"
                    :key="activity.id"
                    :activity="activity"
                    compact
                    @click="openDetailPanel(activity)"
                  />
                  <div v-if="kanbanConcluidas.length === 0" class="py-12 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground/40 text-sm">
                    Nada concluído
                  </div>
                </div>
              </div>

              <!-- Ignoradas -->
              <div class="flex-1 min-w-[300px] flex flex-col">
                <div class="flex items-center justify-between mb-4 px-2">
                  <div class="flex items-center gap-2">
                    <div :class="['h-2 w-2 rounded-full', ACTIVITY_STATUS_METADATA.skipped.dotClass]" />
                    <h3 class="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Ignoradas</h3>
                    <span class="ml-1 text-xs font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                      {{ kanbanPuladas.length }}
                    </span>
                  </div>
                </div>

                <div class="flex-1 space-y-3 p-2 rounded-xl bg-muted/30 overflow-y-auto max-h-[calc(100vh-250px)]">
                  <ActivityCard
                    v-for="activity in kanbanPuladas"
                    :key="activity.id"
                    :activity="activity"
                    compact
                    @click="openDetailPanel(activity)"
                  />
                  <div v-if="kanbanPuladas.length === 0" class="py-12 border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground/40 text-sm">
                    Sem ignoradas
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <!-- Bottom Sheet for Activity Details -->
      <BottomSheet
        :open="detailPanelOpen"
        :title="currentActivity?.title || ''"
        :subtitle="`${currentActivity?.flowName} • ${currentActivity?.contactName}`"
        :activity-type="currentActivity?.type"
        :current-index="currentActivityIndex"
        :total-count="filteredActivities.length"
        :has-previous="currentActivityIndex > 0"
        :has-next="currentActivityIndex < filteredActivities.length - 1"
        @close="detailPanelOpen = false"
        @previous="navigateToPreviousActivity"
        @next="navigateToNextActivity"
      >
        <div v-if="currentActivity" class="px-6 py-4 space-y-6">
          <!-- Status Badge -->
          <div class="flex items-center gap-2 mb-4">
            <Badge :variant="getStatusMetadata(currentActivity.status).variant">
              {{ getStatusMetadata(currentActivity.status).label }}
            </Badge>
            <span class="text-sm text-muted-foreground">
              {{ currentActivity.stepNumber }}/{{ currentActivity.totalSteps }}
            </span>
          </div>

          <div class="grid grid-cols-5 gap-6">
            <!-- Left Column (3/5): Activity Form -->
            <div class="col-span-3">
              <ActivityTypeForm
                :type="currentActivity.type"
                :initial-data="editableData"
                :show-call-result="isCallInProgress"
                :disabled="currentActivity.status === 'completed' || currentActivity.status === 'skipped'"
                @update:data="handleFormUpdate"
              />
            </div>

            <!-- Right Column (2/5): Contact Info, Notes & History -->
            <div class="col-span-2 space-y-4">
              <!-- Contact Info Card -->
              <Card class="p-4">
                <h4 class="text-sm font-medium mb-3 flex items-center gap-2">
                  <User class="h-4 w-4" />
                  Contato
                </h4>
                <div class="space-y-2 text-sm">
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">Nome</span>
                    <span class="font-medium">{{ currentActivity.contactName }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">E-mail</span>
                    <a href="#" class="text-primary hover:underline">{{ currentActivity.contactEmail || 'joao@empresa.com' }}</a>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">Telefone</span>
                    <span>{{ currentActivity.contactPhone || '(11) 99999-9999' }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-muted-foreground">Fluxo</span>
                    <span>{{ currentActivity.flowName }}</span>
                  </div>
                </div>
              </Card>

              <!-- Notes Section -->
              <Card class="p-4">
                <div class="flex items-center justify-between mb-3">
                  <h4 class="text-sm font-medium flex items-center gap-2">
                    <FileText class="h-4 w-4" />
                    Notas
                  </h4>
                  <div class="flex gap-1">
                    <Button variant="ghost" size="icon" class="h-7 w-7" title="Nota de texto">
                      <Plus class="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" class="h-7 w-7" title="Nota de áudio">
                      <Mic class="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" class="h-7 w-7" title="Anexar arquivo">
                      <Paperclip class="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div class="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground min-h-[80px]">
                  Nenhuma nota adicionada
                </div>
              </Card>

              <!-- Contact History -->
              <Card class="p-4">
                <h4 class="text-sm font-medium mb-3 flex items-center gap-2">
                  <History class="h-4 w-4" />
                  Histórico
                </h4>
                <div class="space-y-2 max-h-[200px] overflow-y-auto">
                  <div class="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                    <CheckCircle2 class="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span class="flex-1">E-mail de Apresentação</span>
                    <span class="text-muted-foreground text-xs">17/12</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                    <CheckCircle2 class="h-4 w-4 text-green-600 flex-shrink-0" />
                    <span class="flex-1">Ligação Inicial</span>
                    <span class="text-muted-foreground text-xs">16/12</span>
                  </div>
                  <div class="flex items-center gap-2 text-sm p-2 rounded hover:bg-muted/50">
                    <Clock class="h-4 w-4 text-yellow-600 flex-shrink-0" />
                    <span class="flex-1">Cadastro do Contato</span>
                    <span class="text-muted-foreground text-xs">15/12</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <template #actions>
          <div class="h-10 flex items-center justify-between w-full">
            <div 
              v-if="currentActivity?.status === 'pending' || currentActivity?.status === 'in_progress'"
              class="flex items-center justify-between gap-2 w-full"
            >
              <!-- Left: Status Actions -->
              <div class="flex gap-2">
                <Button variant="outline" size="sm" class="text-green-600 hover:text-green-700" @click="handleWin">
                  <Trophy class="h-4 w-4 mr-1" />
                  Ganho
                </Button>
                <Button variant="outline" size="sm" class="text-red-600 hover:text-red-700" @click="handleLoss">
                  <XCircle class="h-4 w-4 mr-1" />
                  Perdido
                </Button>
              </div>
              
              <!-- Center: Secondary Actions -->
              <div class="flex gap-2">
                <Button variant="ghost" size="sm" @click="handleSkip">
                  <SkipForward class="h-4 w-4 mr-1" />
                  Ignorar
                </Button>
                <Button variant="ghost" size="sm" @click="handleReschedule">
                  <Calendar class="h-4 w-4 mr-1" />
                  Reagendar
                </Button>
                <Button variant="ghost" size="sm" @click="handleReassign">
                  <UserPlus class="h-4 w-4 mr-1" />
                  Reatribuir
                </Button>
              </div>
              
              <!-- Right: Primary Actions -->
              <div class="flex gap-2">
                <Button variant="outline" @click="handleExecuteOnly">
                  <Check class="h-4 w-4 mr-1" />
                  Executar
                </Button>
                <Button @click="handleExecuteAndAdvance">
                  <Play class="h-4 w-4 mr-1" />
                  Executar e Avançar
                </Button>
              </div>
            </div>
            
            <!-- Status Info Message (maintains spacing) -->
            <div v-else class="flex items-center justify-center w-full text-muted-foreground text-sm font-medium gap-2">
              <template v-if="currentActivity?.status === 'completed'">
                <CheckCircle2 class="h-5 w-5 text-green-600" />
                <span>Atividade realizada em {{ currentActivity.completedAt ? new Date(currentActivity.completedAt).toLocaleDateString('pt-BR') : '' }}</span>
              </template>
              <template v-else-if="currentActivity?.status === 'skipped'">
                <SkipForward class="h-5 w-5 text-slate-500" />
                <span>Atividade ignorada</span>
              </template>
              <template v-else>
                <span>Atividade finalizada</span>
              </template>
            </div>
          </div>
        </template>
      </BottomSheet>

      <!-- Decision Dialog -->
      <Dialog :open="decisionDialogOpen" @update:open="decisionDialogOpen = $event">
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2 text-lg">
              🎯 Escolha o resultado
            </DialogTitle>
            <DialogDescription class="text-sm">
              Qual foi o resultado de <strong>{{ currentActivity?.title }}</strong>?
            </DialogDescription>
          </DialogHeader>
          
          <div class="grid gap-3 py-4">
            <button
              v-for="condition in getConditions(currentActivity)"
              :key="condition.value"
              class="flex items-center gap-3 w-full p-4 rounded-lg border border-border bg-card hover:bg-accent hover:border-primary/50 transition-all duration-200 text-left group"
              @click="handleDecisionSelect(condition.value, condition.label)"
            >
              <div class="w-4 h-4 rounded-full bg-primary/20 group-hover:bg-primary flex items-center justify-center transition-all">
                <div class="w-2 h-2 rounded-full bg-primary" />
              </div>
              <span class="font-medium text-foreground">{{ condition.label }}</span>
            </button>
          </div>

          <div class="flex justify-end pt-2 border-t">
            <Button variant="ghost" size="sm" @click="decisionDialogOpen = false">
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <!-- Enroll Contact Dialog -->
       <Dialog :open="enrollDialogOpen" @update:open="enrollDialogOpen = $event">
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle class="flex items-center gap-2 text-lg">
              <UserPlus class="h-5 w-5 text-primary" />
              Inscrever Contato em Fluxo
            </DialogTitle>
            <DialogDescription class="text-sm">
              Selecione um contato e um fluxo para iniciar o processo.
            </DialogDescription>
          </DialogHeader>
          
          <div class="grid gap-4 py-4">
            <div class="space-y-2">
              <label class="text-sm font-medium">Contato</label>
              <Select v-model="selectedContactId">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um contato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem 
                    v-for="contact in contactStore.allContacts" 
                    :key="contact.id" 
                    :value="String(contact.id)"
                  >
                    {{ contact.name }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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
            <Button @click="handleEnrollContact" :disabled="!selectedContactId || !selectedFlowId">
              <Play class="h-4 w-4 mr-2" />
              Iniciar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

       <!-- Help Dialog (Metrics Explanation) -->
       <Dialog :open="helpDialogOpen" @update:open="helpDialogOpen = $event">
         <DialogContent class="sm:max-w-[500px]">
           <DialogHeader>
             <DialogTitle class="flex items-center gap-2">
               <HelpCircle class="h-5 w-5 text-primary" />
               Como funcionam as métricas?
             </DialogTitle>
           </DialogHeader>
           <div class="space-y-4 py-2">
             <p class="text-sm text-muted-foreground">
               Para refletir melhor seu desempenho real, utilizamos a lógica de <strong>Escopo Válido</strong>.
             </p>
             
             <div class="rounded-lg border p-3 space-y-2 bg-muted/30">
               <h4 class="text-sm font-semibold flex items-center gap-2">
                 <SkipForward class="h-4 w-4 text-slate-500" />
                 Atividades Ignoradas
               </h4>
               <p class="text-sm text-muted-foreground">
                 Quando você ignora uma atividade, ela é <strong>removida da sua meta diária</strong> (total), em vez de contar como "não feita".
               </p>
             </div>

             <div class="space-y-2">
                <h4 class="text-sm font-medium">Exemplo de Cálculo:</h4>
                <ul class="text-sm space-y-1 list-disc pl-4 text-muted-foreground">
                  <li>Total Inicial: 10 atividades</li>
                  <li>Você ignorou: <strong>3 atividades</strong></li>
                  <li>Sua nova meta (100%): <strong>7 atividades</strong></li>
                </ul>
             </div>
           </div>
           <DialogFooter>
             <Button @click="helpDialogOpen = false">Entendi</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Plus, List, Kanban, Search, Download, Clock, AlertTriangle, 
  CheckCircle2, TrendingUp, Play, SkipForward, Check, Calendar,
  UserPlus, Trophy, XCircle, User, FileText, Mic, Paperclip, History, ChevronDown, HelpCircle
} from 'lucide-vue-next';
import AppLayout from '@/components/layout/AppLayout.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import BottomSheet from '@/components/ui/bottom-sheet/BottomSheet.vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import ActivityCard from '@/components/execution/ActivityCard.vue';
import ActivityTypeForm from '@/components/execution/ActivityTypeForm.vue';
import { ACTIVITY_STATUS_METADATA, getStatusMetadata } from '@/constants/activities';
import { getSeedActivities } from '@/mocks/data/activities';
import { MOCK_FLOWS_ATENDIMENTO, MOCK_FLOWS_ATIVIDADES } from '@/mocks/data/flows';
import { useActivityStore } from '@/stores/activities';
import { useContactsStore } from '@/stores/contacts';
import { useFlowsStore } from '@/stores/flows';
import type { Activity, ActivityGroup } from '@/types/activity';
import { useToast } from '@/composables/useToast';

import { Progress } from '@/components/ui/progress';

const toast = useToast();
const activityStore = useActivityStore();
const contactStore = useContactsStore();
const flowsStore = useFlowsStore();

// State
const viewMode = ref<'list' | 'kanban'>('list'); // Default to list per user preference
const searchQuery = ref('');
const filterFlow = ref('all');
const filterStatus = ref('all');
const filterPeriod = ref<'today' | 'last7days' | 'next7days'>('today'); 
const selectedActivities = ref<string[]>([]);
const detailPanelOpen = ref(false);
const enrollDialogOpen = ref(false);
const helpDialogOpen = ref(false); // New help dialog state
const selectedContactId = ref('');
const selectedFlowId = ref('');
const currentActivity = ref<Activity | null>(null);

// Kanban Drag and Drop state
const isDraggingOverInProgress = ref(false);
const isDraggingOverPending = ref(false);

const editableData = ref<Record<string, any>>({});
const isCallInProgress = ref(false);

// Collapsible Sections State
const collapsedSections = ref<Record<string, boolean>>({
  overdue: false,      // Expanded by default
  pending: false,      // Expanded by default
  completed: true,     // Collapsed by default
  skipped: true        // Collapsed by default
});

const toggleSection = (status: string) => {
  collapsedSections.value[status] = !collapsedSections.value[status];
};

// Decision Dialog State
const decisionDialogOpen = ref(false);
const pendingExecuteCallback = ref<(() => void) | null>(null);

// Initialize store with seed data if empty
onMounted(() => {
  if (activityStore.activities.length === 0) {
    activityStore.initializeWithSeedData(getSeedActivities());
  }
  
  // Initialize flows store with mock data if empty
  if (flowsStore.savedFlows.length === 0) {
    const allMockFlows = [...MOCK_FLOWS_ATENDIMENTO, ...MOCK_FLOWS_ATIVIDADES];
    // Convert Flow to SavedFlow format
    allMockFlows.forEach(flow => {
      flowsStore.saveFlow({
        id: flow.id,
        nome: flow.nome,
        descricao: flow.descricao,
        nodes: [],
        edges: [],
        isActive: flow.status === 'ativo',
        createdAt: flow.createdAt,
        updatedAt: flow.updatedAt,
      });
    });
  }
});

// Use store activities (reactive)
const activities = computed(() => activityStore.activities);

// Available flows for filter - use flows from store
const availableFlows = computed(() => flowsStore.savedFlows);

// Computed stats
// Computed stats based on PERIOD ACTIVITIES (Context)
// This ensures stats don't change just because I filtered the list view
const pendingCount = computed(() => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  return periodActivities.value.filter(a => 
    (a.status === 'pending' || a.status === 'in_progress') && 
    (!a.dueDate || new Date(a.dueDate) >= startOfToday)
  ).length;
});

const overdueCount = computed(() => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  return periodActivities.value.filter(a => 
    (a.status === 'pending' || a.status === 'in_progress') && 
    a.dueDate && new Date(a.dueDate) < startOfToday
  ).length;
});

const completedCount = computed(() => {
  return periodActivities.value.filter(a => a.status === 'completed').length;
});

const skippedCount = computed(() => {
  return periodActivities.value.filter(a => a.status === 'skipped').length;
});

const totalCount = computed(() => periodActivities.value.length - skippedCount.value);

// Progress Logic based on PERIOD
const dailyWorkloadCount = computed(() => {
  // Option 3: Ignored activities are REMOVED from the scope
  return periodActivities.value.length - skippedCount.value;
});

const dailyProgress = computed(() => {
  if (dailyWorkloadCount.value <= 0) {
    // Edge case: if workload is 0. 
    // If I completed something (and the rest was skipped, making workload 0? No, workload = completed + pending)
    // Wait, Workload = (Completed + Pending + Skipped) - Skipped = Completed + Pending
    // So if Completed + Pending = 0, check if I did anything?
    // If total activities is 0, progress is 0.
    return 0; 
  }
  
  // Progress is (Completed / Valid Workload)
  return Math.round((completedCount.value / dailyWorkloadCount.value) * 100);
});

// Filtered activities
// 1. Context: Activities for the selected period (ignores Status filter)
const periodActivities = computed(() => {
  let result = [...activities.value];
  
  // 1.1 Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(a => 
      a.title.toLowerCase().includes(query) ||
      a.contactName.toLowerCase().includes(query) ||
      a.flowName.toLowerCase().includes(query)
    );
  }
  
  // 1.2 Flow Filter
  if (filterFlow.value !== 'all') {
    result = result.filter(a => a.flowId === filterFlow.value);
  }
  
  // 1.3 Date Period Filter
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);
  
  result = result.filter(a => {
    if (!a.dueDate) return true; // Keep activities without due date if any
    const dueDate = new Date(a.dueDate);
    
    if (filterPeriod.value === 'today') {
      // Show everything up to today (includes overdue)
      return dueDate <= endOfToday;
    } else if (filterPeriod.value === 'last7days') {
      // Show last 7 days including today
      const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 86400000);
      return dueDate >= sevenDaysAgo && dueDate <= endOfToday;
    } else if (filterPeriod.value === 'next7days') {
      // Show from tomorrow to 7 days in the future
      const tomorrow = new Date(startOfToday.getTime() + 86400000);
      const sevenDaysFuture = new Date(tomorrow.getTime() + 7 * 86400000);
      return dueDate >= tomorrow && dueDate <= sevenDaysFuture;
    }
    return true;
  });

  return result;
});

// 2. View: Filtered activities displayed in the list/kanban (Applies Status filter)
const filteredActivities = computed(() => {
  let result = [...periodActivities.value];

  // Apply Status Filter
  if (filterStatus.value !== 'all') {
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    if (filterStatus.value === 'overdue') {
      result = result.filter(a => 
        (a.status === 'pending' || a.status === 'in_progress') && 
        a.dueDate && new Date(a.dueDate) < startOfToday
      );
    } else if (filterStatus.value === 'pending') {
      result = result.filter(a => 
        (a.status === 'pending' || a.status === 'in_progress') && 
        (!a.dueDate || new Date(a.dueDate) >= startOfToday)
      );
    } else {
      result = result.filter(a => a.status === filterStatus.value);
    }
  }

  // Sorting: By step number to follow the flow sequence
  result.sort((a, b) => a.stepNumber - b.stepNumber);
  
  return result;
});

// UPDATED: Fixed groups (Atrasadas, Pendentes, Executadas, Ignoradas)
const groupedActivities = computed((): ActivityGroup[] => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const overdue: Activity[] = [];
  const pending: Activity[] = [];
  const completed: Activity[] = [];
  const skipped: Activity[] = [];

  filteredActivities.value.forEach(a => {
    if (a.status === 'completed') {
      completed.push(a);
    } else if (a.status === 'skipped') {
      skipped.push(a);
    } else {
      const dueDate = a.dueDate ? new Date(a.dueDate) : null;
      if (dueDate && dueDate < startOfToday) {
        overdue.push(a);
      } else {
        pending.push(a);
      }
    }
  });

  // Sort by most recent
  const sortByRecent = (a: Activity, b: Activity) => {
    const aDate = a.completedAt ? new Date(a.completedAt) : new Date(a.updatedAt);
    const bDate = b.completedAt ? new Date(b.completedAt) : new Date(b.updatedAt);
    return bDate.getTime() - aDate.getTime();
  };

  completed.sort(sortByRecent);
  skipped.sort(sortByRecent);

  const finalGroups: ActivityGroup[] = [];
  
  if (overdue.length > 0) {
    finalGroups.push({ status: 'overdue', label: 'Atrasadas', activities: overdue });
  }
  
  if (pending.length > 0) {
    finalGroups.push({ status: 'pending', label: 'Pendentes', activities: pending });
  }
  
  if (completed.length > 0) {
    finalGroups.push({ status: 'completed', label: 'Executadas', activities: completed });
  }

  if (skipped.length > 0) {
    finalGroups.push({ status: 'skipped', label: 'Ignoradas', activities: skipped });
  }

  return finalGroups;
});

const getGroupBadgeClass = (status: string) => {
  const metadata = ACTIVITY_STATUS_METADATA[status as keyof typeof ACTIVITY_STATUS_METADATA] || ACTIVITY_STATUS_METADATA.pending;
  // Get hover color based on status
  let hoverClass = '';
  if (status === 'overdue') {
    hoverClass = 'hover:bg-orange-200 dark:hover:bg-orange-900/40';
  } else if (status === 'pending') {
    hoverClass = 'hover:bg-blue-200 dark:hover:bg-blue-900/40';
  } else if (status === 'completed') {
    hoverClass = 'hover:bg-green-200 dark:hover:bg-green-900/40';
  } else if (status === 'skipped') {
    hoverClass = 'hover:bg-slate-200 dark:hover:bg-slate-800/50';
  }
  return `${metadata.bgColorClass} ${metadata.colorClass} ${hoverClass}`;
};


// Kanban views
const kanbanAtrasadas = computed(() => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return filteredActivities.value
    .filter(a => (a.status === 'pending' || a.status === 'in_progress') && a.dueDate && new Date(a.dueDate) < startOfToday)
    .sort((a, b) => a.stepNumber - b.stepNumber);
});

const kanbanPendentes = computed(() => {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  return filteredActivities.value
    .filter(a => (a.status === 'pending' || a.status === 'in_progress') && (!a.dueDate || new Date(a.dueDate) >= startOfToday))
    .sort((a, b) => a.stepNumber - b.stepNumber);
});

// Selectable activities (only pending and in_progress)
const selectableActivities = computed(() => 
  filteredActivities.value.filter(a => a.status === 'pending' || a.status === 'in_progress')
);

// Select all selectable activities
const selectAllActivities = () => {
  selectedActivities.value = selectableActivities.value.map(a => a.id);
};
const kanbanConcluidas = computed(() => 
  filteredActivities.value.filter(a => a.status === 'completed')
);
const kanbanPuladas = computed(() => 
  filteredActivities.value.filter(a => a.status === 'skipped')
);

// Handle form data updates
// Handle form data updates
const handleFormUpdate = (data: Record<string, any>) => {
  editableData.value = { ...editableData.value, ...data };
};



// Handle Manual Enrollment
const handleEnrollContact = () => {
  if (!selectedContactId.value || !selectedFlowId.value) return;

  const flow = flowsStore.savedFlows.find(f => f.id === selectedFlowId.value);
  if (!flow) return;

  const contactIdNum = parseInt(selectedContactId.value);
  const contact = contactStore.getContactById(contactIdNum);

  if (!contact) {
    toast.error('Erro', 'Contato não encontrado');
    return;
  }

  // 1. Find Start Node
  // We look for any node that is a trigger (starts with 'trigger_') or explicitly 'start' 
  // OR we look for the node that has no incoming edges (simplified check).
  // Better: look for trigger_manual or just first node in nodes array if simple.
  // The correct way logic-wise for simulator was:
  /*
    const manualTrigger = nodes.value.find(n => n.data.type === 'trigger_manual');
    if (manualTrigger) return manualTrigger;
    // Fallback
    return nodes.value.find(n => n.data.type && n.data.type.startsWith('trigger_'))
  */

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
        String(contact.id), // Contact ID as string for activity
        { 
          name: contact.name, 
          email: contact.emails?.[0]?.email || '', 
          phone: contact.phoneNumbers?.[0]?.phoneNumber || '' 
        }
      );
      
      if (activity) {
        toast.success('Sucesso', `Fluxo iniciado! Atividade "${activity.title}" criada.`);
        enrollDialogOpen.value = false;
        // Reset selection
        selectedContactId.value = '';
        selectedFlowId.value = '';
      }
    } catch (e) {
      console.error(e);
      toast.error('Erro', 'Falha ao criar atividade.');
    }
  } else {
    // For MVP, warn user
    toast.warning('Atenção', 'O fluxo deve começar com uma Atividade (Email, Ligação, Chat) para inscrição manual.');
  }
};



// Current activity index for navigation
const currentActivityIndex = computed(() => {
  if (!currentActivity.value) return -1;
  return filteredActivities.value.findIndex(a => a.id === currentActivity.value!.id);
});

// Navigation functions
const navigateToPreviousActivity = () => {
  if (currentActivityIndex.value > 0) {
    const prevActivity = filteredActivities.value[currentActivityIndex.value - 1];
    openDetailPanel(prevActivity);
  }
};

const navigateToNextActivity = () => {
  if (currentActivityIndex.value < filteredActivities.value.length - 1) {
    const nextActivity = filteredActivities.value[currentActivityIndex.value + 1];
    openDetailPanel(nextActivity);
  }
};

// Handlers
const openDetailPanel = (activity: Activity) => {
  currentActivity.value = activity;
  editableData.value = { ...(activity.data as any) };
  detailPanelOpen.value = true;
};

const toggleActivitySelection = (id: string) => {
  const index = selectedActivities.value.indexOf(id);
  if (index > -1) {
    selectedActivities.value.splice(index, 1);
  } else {
    selectedActivities.value.push(id);
  }
};

const handleAddActivity = () => {
  toast.info('Funcionalidade', 'Criação de atividade ad-hoc em desenvolvimento');
};

const handleExecuteActivity = async (activity: Activity, selectedDecision?: string) => {
  // Simulate execution animation
  activityStore.updateActivity(activity.id, { status: 'in_progress' });
  
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  activityStore.executeActivity(activity.id);
  
  const decisionText = selectedDecision ? ` (${selectedDecision})` : '';
  toast.success('Atividade executada', `${activity.title} foi concluída${decisionText}`);
};

// Check if activity has conditions/decisions
const hasDecision = (activity: Activity | null): boolean => {
  if (!activity) return false;
  const data = activity.data as any;
  return data?.hasDecision === true && Array.isArray(data?.conditions) && data.conditions.length > 0;
};

// Get conditions from activity
const getConditions = (activity: Activity | null): { label: string; value: string }[] => {
  if (!activity) return [];
  const data = activity.data as any;
  return data?.conditions || [];
};

// Handle decision selection
const handleDecisionSelect = async (conditionLabel: string, _conditionValue: string) => {
  if (!currentActivity.value) return;
  
  decisionDialogOpen.value = false;
  
  // Execute with the selected decision
  await handleExecuteActivity(currentActivity.value, conditionLabel);
  if (pendingExecuteCallback.value) {
    pendingExecuteCallback.value();
    pendingExecuteCallback.value = null;
  }
};

const handleExecuteAndAdvance = async () => {
  if (!currentActivity.value) return;
  
  // Check if activity has decision
  if (hasDecision(currentActivity.value)) {
    pendingExecuteCallback.value = () => {
      const pending = activityStore.pendingActivities;
      if (pending.length > 0) {
        openDetailPanel(pending[0]);
      } else {
        detailPanelOpen.value = false;
        toast.info('Fim da fila', 'Não há mais atividades pendentes');
      }
    };
    decisionDialogOpen.value = true;
    return;
  }
  
  await handleExecuteActivity(currentActivity.value);
  
  // Find next pending activity
  const pending = activityStore.pendingActivities;
  if (pending.length > 0) {
    openDetailPanel(pending[0]);
  } else {
    detailPanelOpen.value = false;
    toast.info('Fim da fila', 'Não há mais atividades pendentes');
  }
};

const handleExecuteOnly = async () => {
  if (!currentActivity.value) return;
  
  // Check if activity has decision
  if (hasDecision(currentActivity.value)) {
    pendingExecuteCallback.value = null;
    decisionDialogOpen.value = true;
    return;
  }
  
  await handleExecuteActivity(currentActivity.value);
};

const handleSkip = () => {
  if (!currentActivity.value) return;
  
  activityStore.skipActivity(currentActivity.value.id);
  toast.info('Atividade pulada', `${currentActivity.value.title} foi pulada`);
  detailPanelOpen.value = false;
};

const handleReschedule = () => {
  toast.info('Reagendar', 'Funcionalidade de reagendamento em desenvolvimento');
};

const handleReassign = () => {
  toast.info('Reatribuir', 'Funcionalidade de reatribuição em desenvolvimento');
};

const handleWin = () => {
  toast.success('Ganho!', 'Contato marcado como ganho. Cadência encerrada.');
  detailPanelOpen.value = false;
};

const handleLoss = () => {
  toast.error('Perdido', 'Contato marcado como perdido. Cadência encerrada.');
  detailPanelOpen.value = false;
};

const handleBulkExecute = async () => {
  for (const id of selectedActivities.value) {
    const activity = activityStore.getActivityById(id);
    if (activity) await handleExecuteActivity(activity);
  }
  selectedActivities.value = [];
};

const handleBulkSkip = () => {
  const count = selectedActivities.value.length;
  activityStore.bulkSkip(selectedActivities.value);
  selectedActivities.value = [];
  toast.info('Atividades puladas', `${count} atividades foram puladas`);
};
// Kanban Drag and Drop handlers
const onDragOverPending = (_event: DragEvent) => {
  isDraggingOverPending.value = true;
};

const onDragLeavePending = () => {
  isDraggingOverPending.value = false;
};

const onDropPending = (event: DragEvent) => {
  isDraggingOverPending.value = false;
  const activityId = event.dataTransfer?.getData('activityId');
  
  if (activityId) {
    const activity = activityStore.activities.find(a => a.id === activityId);
    if (activity && activity.status === 'in_progress') {
      activityStore.updateActivity(activityId, { status: 'pending' });
      
      // If the detail panel is open for this activity, close it or refresh it
      if (currentActivity.value?.id === activityId) {
        detailPanelOpen.value = false;
      }
      
      toast.info('Atividade devolvida à fila', `${activity.title} está agora na lista de pendentes`);
    }
  }
};

const onDragOverInProgress = (_event: DragEvent) => {
  isDraggingOverInProgress.value = true;
};

const onDragLeaveInProgress = () => {
  isDraggingOverInProgress.value = false;
};

const onDropInProgress = (event: DragEvent) => {
  isDraggingOverInProgress.value = false;
  const activityId = event.dataTransfer?.getData('activityId');
  
  if (activityId) {
    const activity = activityStore.activities.find(a => a.id === activityId);
    if (activity && activity.status !== 'in_progress' && activity.status !== 'completed') {
      // If it has a decision, we move to in_progress but open the detail panel to fill fields
      if (hasDecision(activity)) {
        activityStore.updateActivity(activityId, { status: 'in_progress' });
        openDetailPanel(activity);
        toast.info('Atividade em andamento', `Por favor, selecione o resultado da atividade "${activity.title}"`);
      } else {
        // If it's a simple activity, we just execute it
        handleExecuteActivity(activity);
      }
    }
  }
};

</script>
