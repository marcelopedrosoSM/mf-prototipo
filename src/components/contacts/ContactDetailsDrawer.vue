<template>
  <!-- Sidebar Mode: Render content directly -->
  <template v-if="isSidebar">
    <div class="flex flex-col h-full overflow-hidden bg-background">
      <!-- Header com Avatar e Nome (Sidebar Mode) -->
      <div class="px-4 py-4 border-b bg-background flex-shrink-0">
        <div class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="relative">
                <div class="h-12 w-12 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-sm">
                  <span class="text-lg font-bold text-primary-foreground">{{ initials }}</span>
                </div>
              </div>
              <div class="space-y-1">
                <h3 class="text-xl font-semibold">{{ contact?.name || 'Sem nome' }}</h3>
                <div class="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span v-if="primaryPhone" class="flex items-center gap-1.5">
                    <Phone class="h-3.5 w-3.5" />
                    {{ primaryPhone }}
                  </span>
                  <span v-if="primaryEmail" class="flex items-center gap-1.5">
                    <Mail class="h-3.5 w-3.5" />
                    {{ primaryEmail }}
                  </span>
                </div>
              </div>
            </div>

            
            <Button
              v-if="isSidebar"
              variant="ghost"
              size="icon"
              class="h-8 w-8 text-muted-foreground -mr-2"
              @click="emit('update:open', false)"
              title="Fechar detalhes"
            >
              <X class="h-4 w-4" />
            </Button>
          </div>
          
          <div class="flex gap-2 pt-2">
            <Button size="sm" variant="outline" class="flex-1" @click="emit('edit', contact)">
              <Pencil class="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <!-- Content -->
      <slot name="content">
        <Tabs default-value="details" class="flex-1 flex flex-col min-h-0">
          <div class="px-6 border-b">
            <TabsList class="w-full justify-start rounded-none h-12 bg-transparent p-0">
              <TabsTrigger 
                value="details" 
                class="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Detalhes
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                class="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                Histórico
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="details" class="flex-1 min-h-0 data-[state=inactive]:hidden mt-0">
            <ScrollArea class="h-full">
              <div class="p-6 space-y-6">
                  <!-- Info Cards -->
                  <div class="grid gap-4">
                    <div class="space-y-3">
                      <h4 class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Info class="h-4 w-4" />
                        Informações Básicas
                      </h4>
                      <div class="grid gap-3 p-4 border rounded-lg bg-card shadow-sm">
                        <div v-if="contact?.city || contact?.state" class="grid grid-cols-[24px_1fr] items-start">
                          <MapPin class="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <span class="text-sm font-medium">Localização</span>
                            <p class="text-sm text-muted-foreground">
                              {{ [contact?.city, contact?.state].filter(Boolean).join(', ') }}
                            </p>
                          </div>
                        </div>
                        
                        <div class="grid grid-cols-[24px_1fr] items-start">
                          <Calendar class="h-4 w-4 mt-1 text-muted-foreground" />
                          <div>
                            <span class="text-sm font-medium">Criado em</span>
                            <p class="text-sm text-muted-foreground">
                              {{ formatDate(contact?.createdAt) }}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Etiquetas -->
                    <div class="space-y-3">
                      <h4 class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <Tags class="h-4 w-4" />
                        Etiquetas
                      </h4>
                      <div class="p-4 border rounded-lg bg-card shadow-sm flex flex-wrap gap-2">
                        <Badge 
                          v-for="label in labels" 
                          :key="label.id"
                          :style="{ backgroundColor: label.color + '20', color: label.color, borderColor: label.color + '40' }"
                          variant="outline"
                          class="font-medium"
                        >
                          {{ label.name }}
                        </Badge>
                        <Badge v-if="labels.length === 0" variant="secondary" class="font-normal text-muted-foreground italic">
                          Sem etiquetas
                        </Badge>
                      </div>
                    </div>

                    <!-- Notes -->
                    <div class="space-y-3">
                      <h4 class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        <StickyNote class="h-4 w-4" />
                        Observações
                      </h4>
                      <div class="p-4 border rounded-lg bg-muted/50 min-h-[100px]">
                         <p class="text-sm whitespace-pre-wrap">{{ contact?.notes || 'Nenhuma observação adicionada.' }}</p>
                      </div>
                    </div>
                  </div>
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="history" class="flex-1 min-h-0 data-[state=inactive]:hidden mt-0">
            <ScrollArea class="h-full">
               <div class="py-6 pr-6">
                  <ContactHistory :contactId="contact?.id || 0" />
               </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </slot>
    </div>
  </template>

  <!-- Drawer Mode (Original) -->
  <Sheet v-else :open="props.open" @update:open="emit('update:open', $event)">
    <SheetContent class="w-[400px] sm:w-[540px] flex flex-col p-0 gap-0">
      <!-- Header com Avatar e Nome -->
      <div class="px-6 py-6 border-b bg-muted/20">
        <SheetHeader class="space-y-4">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-4">
              <div class="relative">
                <div class="h-16 w-16 rounded-full bg-primary flex items-center justify-center border-2 border-background shadow-sm">
                  <span class="text-2xl font-bold text-primary-foreground">{{ initials }}</span>
                </div>
                <!-- Status indicator could go here -->
              </div>
              <div class="space-y-1">
                <SheetTitle class="text-xl">{{ contact?.name || 'Sem nome' }}</SheetTitle>
                <div class="flex flex-col gap-1 text-sm text-muted-foreground">
                  <span v-if="primaryPhone" class="flex items-center gap-1.5">
                    <Phone class="h-3.5 w-3.5" />
                    {{ primaryPhone }}
                  </span>
                  <span v-if="primaryEmail" class="flex items-center gap-1.5">
                    <Mail class="h-3.5 w-3.5" />
                    {{ primaryEmail }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-2 pt-2">
            <Button size="sm" class="flex-1" @click="emit('start-chat', contact)">
              <MessageSquarePlus class="mr-2 h-4 w-4" />
              Conversar
            </Button>
            <Button size="sm" variant="outline" class="flex-1" @click="emit('edit', contact)">
              <Pencil class="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </SheetHeader>
      </div>

      <!-- Content Tabs -->
      <Tabs default-value="details" class="flex-1 flex flex-col min-h-0">
        <div class="px-6 border-b">
          <TabsList class="w-full justify-start rounded-none h-12 bg-transparent p-0">
            <TabsTrigger 
              value="details" 
              class="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Detalhes
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              class="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Histórico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="details" class="flex-1 min-h-0 data-[state=inactive]:hidden mt-0">
          <ScrollArea class="h-full">
            <div class="p-6 space-y-6">
                <!-- Info Cards -->
                <div class="grid gap-4">
                  <div class="space-y-3">
                    <h4 class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Info class="h-4 w-4" />
                      Informações Básicas
                    </h4>
                    <div class="grid gap-3 p-4 border rounded-lg bg-card shadow-sm">
                      <div v-if="contact?.city || contact?.state" class="grid grid-cols-[24px_1fr] items-start">
                        <MapPin class="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <span class="text-sm font-medium">Localização</span>
                          <p class="text-sm text-muted-foreground">
                            {{ [contact?.city, contact?.state].filter(Boolean).join(', ') }}
                          </p>
                        </div>
                      </div>
                      
                      <div class="grid grid-cols-[24px_1fr] items-start">
                        <Calendar class="h-4 w-4 mt-1 text-muted-foreground" />
                        <div>
                          <span class="text-sm font-medium">Criado em</span>
                          <p class="text-sm text-muted-foreground">
                            {{ formatDate(contact?.createdAt) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Etiquetas -->
                  <div class="space-y-3">
                      <h4 class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Tags class="h-4 w-4" />
                      Etiquetas
                    </h4>
                    <div class="p-4 border rounded-lg bg-card shadow-sm flex flex-wrap gap-2">
                        <Badge 
                          v-for="label in labels" 
                          :key="label.id"
                          :style="{ backgroundColor: label.color + '20', color: label.color, borderColor: label.color + '40' }"
                          variant="outline"
                          class="font-medium"
                        >
                          {{ label.name }}
                        </Badge>
                      <Badge v-if="labels.length === 0" variant="secondary" class="font-normal text-muted-foreground italic">
                        Sem etiquetas
                      </Badge>
                    </div>
                  </div>

                  <!-- Notes -->
                  <div class="space-y-3">
                    <h4 class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <StickyNote class="h-4 w-4" />
                      Observações
                    </h4>
                    <div class="p-4 border rounded-lg bg-muted/50 min-h-[100px]">
                        <p class="text-sm whitespace-pre-wrap">{{ contact?.notes || 'Nenhuma observação adicionada.' }}</p>
                    </div>
                  </div>
                </div>
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="history" class="flex-1 min-h-0 data-[state=inactive]:hidden mt-0">
          <ScrollArea class="h-full">
             <div class="py-6 pr-6">
                <ContactHistory :contactId="contact?.id || 0" />
             </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </SheetContent>
  </Sheet>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  StickyNote, 
  Info, 
  Tags,
  MessageSquarePlus,
  Pencil,
  X
} from 'lucide-vue-next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ContactHistory from './ContactHistory.vue';
import type { Contact } from '@/types/contacts';
import type { Label } from '@/types/conversations';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  open: boolean;
  contact: Contact | null;
  labels?: Label[];
  isSidebar?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSidebar: false,
  labels: () => []
});

const emit = defineEmits<{
  'update:open': [value: boolean];
  'edit': [contact: Contact];
  'start-chat': [contact: Contact];
}>();

const initials = computed(() => {
  if (!props.contact?.name) return '??';
  const parts = props.contact.name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return props.contact.name.substring(0, 2).toUpperCase();
});

const primaryPhone = computed(() => {
  if (!props.contact?.phoneNumbers?.length) return null;
  return props.contact.phoneNumbers[0].phoneNumber;
});

const primaryEmail = computed(() => {
  if (!props.contact?.emails?.length) return null;
  return props.contact.emails[0].email;
});

function formatDate(dateString?: string) {
  if (!dateString) return '-';
  try {
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}
</script>
