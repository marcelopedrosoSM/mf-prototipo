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
                    <UserPlus class="mr-2 h-4 w-4" />
                    Adicionar Contato
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
                    {{ flow.name }}
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

            <!-- Stats -->
            <div class="grid grid-cols-5 gap-4 mb-6">
              <!-- Progress Card -->
              <Card class="p-4 flex flex-col justify-center">
                 <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-muted-foreground">Progresso Hoje</span>
                    <span class="text-lg font-bold text-primary">{{ dailyProgress }}%</span>
                 </div>
                 <Progress :model-value="dailyProgress" class="h-2" />
                 <p class="text-xs text-muted-foreground mt-2">
                   {{ completedTodayCount }}/{{ dailyWorkloadCount }} atividades
                 </p>
              </Card>

              <Card class="p-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Clock class="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold">{{ pendingCount }}</p>
                    <p class="text-xs text-muted-foreground">Pendentes</p>
                  </div>
                </div>
              </Card>
              <Card class="p-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <AlertTriangle class="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold">{{ overdueCount }}</p>
                    <p class="text-xs text-muted-foreground">Atrasadas</p>
                  </div>
                </div>
              </Card>
              <Card class="p-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 class="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold">{{ completedTodayCount }}</p>
                    <p class="text-xs text-muted-foreground">Concluídas hoje</p>
                  </div>
                </div>
              </Card>
              <Card class="p-4">
                <div class="flex items-center gap-3">
                  <div class="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <TrendingUp class="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p class="text-2xl font-bold">{{ totalCount }}</p>
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
                <!-- Date Header -->
                <div class="flex items-center gap-3">
                  <div class="h-px flex-1 bg-border" />
                  <span class="text-sm font-medium text-muted-foreground px-2">
                    {{ group.label }}
                  </span>
                  <div class="h-px flex-1 bg-border" />
                </div>
                
                <!-- Activity Cards -->
                <div class="space-y-2">
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
                    <span class="ml-1 text-xs font-bold bg-red-100 text-red-600 dark:bg-red-900/30 px-2 py-0.5 rounded-full">
                      {{ kanbanAtrasadas.length }}
                    </span>
                  </div>
                </div>
                
                <div 
                  class="flex-1 space-y-3 p-2 rounded-xl border-2 border-transparent transition-colors bg-muted/30"
                  :class="isDraggingOverInProgress && 'border-red-500/20 bg-red-500/5'"
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
                    <span class="ml-1 text-xs font-bold bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                      {{ kanbanPendentes.length }}
                    </span>
                  </div>
                </div>

                <div 
                  class="flex-1 space-y-3 p-2 rounded-xl border-2 border-transparent transition-colors bg-muted/30"
                  :class="isDraggingOverPending && 'border-yellow-500/20 bg-yellow-500/5'"
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
          <div class="flex items-center justify-between gap-2">
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
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  Plus, List, Kanban, Search, Download, Clock, AlertTriangle, 
  CheckCircle2, TrendingUp, Play, SkipForward, Check, Calendar,
  UserPlus, Trophy, XCircle, User, FileText, Mic, Paperclip, History
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
} from '@/components/ui/dialog';
import ActivityCard from '@/components/execution/ActivityCard.vue';
import ActivityTypeForm from '@/components/execution/ActivityTypeForm.vue';
import { ACTIVITY_STATUS_METADATA, getStatusMetadata } from '@/constants/activities';
import { MOCK_FLOWS_FROM_ACTIVITIES, getSeedActivities } from '@/mocks/data/activities';
import { useActivityStore } from '@/stores/activities';
import { useContactsStore } from '@/stores/contacts';
import { useFlowsStore } from '@/stores/flows';
import type { Activity, ActivityGroup, ActivityStatus } from '@/types/activity';
import { useToast } from '@/composables/useToast';
import type { SavedFlow } from '@/stores/flows';

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
const selectedContactId = ref('');
const selectedFlowId = ref('');
const currentActivity = ref<Activity | null>(null);

// Kanban Drag and Drop state
const isDraggingOverInProgress = ref(false);
const isDraggingOverPending = ref(false);

const editableData = ref<Record<string, any>>({});
const isCallInProgress = ref(false);

// Decision Dialog State
const decisionDialogOpen = ref(false);
const pendingExecuteCallback = ref<(() => void) | null>(null);

// Initialize store with seed data if empty
onMounted(() => {
  if (activityStore.activities.length === 0) {
    activityStore.initializeWithSeedData(getSeedActivities());
  }
});

// Use store activities (reactive)
const activities = computed(() => activityStore.activities);

// Available flows for filter
const availableFlows = MOCK_FLOWS_FROM_ACTIVITIES;

// Computed stats
const pendingCount = computed(() => 
  activities.value.filter(a => a.status === 'pending').length
);
const overdueCount = computed(() => {
  const now = new Date();
  return activities.value.filter(a => 
    a.status === 'pending' && a.dueDate && new Date(a.dueDate) < now
  ).length;
});
const completedTodayCount = computed(() => {
  const today = new Date().toDateString();
  return activities.value.filter(a => 
    a.status === 'completed' && a.completedAt && new Date(a.completedAt).toDateString() === today
  ).length;
});
const totalCount = computed(() => activities.value.length);

// Daily Progress Logic
const dailyWorkloadCount = computed(() => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  // Completed Today
  const completed = activities.value.filter(a => 
    a.status === 'completed' && a.completedAt && 
    new Date(a.completedAt) >= startOfToday && new Date(a.completedAt) <= endOfToday
  ).length;

  // Pending/Overdue (excluding future tasks)
  const pending = activities.value.filter(a => 
    (a.status === 'pending' || a.status === 'in_progress') && 
    (!a.dueDate || new Date(a.dueDate) <= endOfToday)
  ).length;

  return completed + pending;
});

const dailyProgress = computed(() => {
  if (dailyWorkloadCount.value === 0) return 0;
  return Math.round((completedTodayCount.value / dailyWorkloadCount.value) * 100);
});

// Filtered activities
const filteredActivities = computed(() => {
  let result = [...activities.value];
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(a => 
      a.title.toLowerCase().includes(query) ||
      a.contactName.toLowerCase().includes(query) ||
      a.flowName.toLowerCase().includes(query)
    );
  }
  
  if (filterFlow.value !== 'all') {
    result = result.filter(a => a.flowId === filterFlow.value);
  }
  
  if (filterStatus.value !== 'all') {
    if (filterStatus.value === 'overdue') {
      const now = new Date();
      result = result.filter(a => a.status === 'pending' && a.dueDate && new Date(a.dueDate) < now);
    } else {
      result = result.filter(a => a.status === filterStatus.value);
    }
  }
  
  // UPDATED: Date period filter logic
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
  
  // Sorting: By step number to follow the flow sequence
  result.sort((a, b) => a.stepNumber - b.stepNumber);
  
  return result;
});

// UPDATED: Fixed groups (Atrasadas, Pendentes, Executadas)
const groupedActivities = computed((): ActivityGroup[] => {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const overdue: Activity[] = [];
  const pending: Activity[] = [];
  const completed: Activity[] = [];

  filteredActivities.value.forEach(a => {
    if (a.status === 'completed' || a.status === 'skipped') {
      completed.push(a);
    } else {
      const dueDate = a.dueDate ? new Date(a.dueDate) : null;
      if (dueDate && dueDate < startOfToday) {
        overdue.push(a);
      } else {
        pending.push(a);
      }
    }
  });

  // No need for extra sort here as filteredActivities is already sorted by stepNumber
  completed.sort((a, b) => {
    const aDate = a.completedAt ? new Date(a.completedAt) : new Date(a.updatedAt);
    const bDate = b.completedAt ? new Date(b.completedAt) : new Date(b.updatedAt);
    return bDate.getTime() - aDate.getTime(); // Most recent first
  });

  const finalGroups: ActivityGroup[] = [];
  
  if (overdue.length > 0) {
    finalGroups.push({ status: 'failed', label: 'Atrasadas', activities: overdue });
  }
  
  if (pending.length > 0) {
    finalGroups.push({ status: 'pending', label: 'Pendentes', activities: pending });
  }
  
  if (completed.length > 0) {
    finalGroups.push({ status: 'completed', label: 'Executadas', activities: completed });
  }

  return finalGroups;
});

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
        { name: contact.name, email: contact.email, phone: contact.phone }
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
