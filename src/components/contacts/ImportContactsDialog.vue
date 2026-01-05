<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Importar Contatos</DialogTitle>
        <DialogDescription>
          Faça upload de um arquivo CSV com seus contatos
        </DialogDescription>
      </DialogHeader>

      <div class="space-y-4 py-4">
        <!-- Drop Zone -->
        <div
          class="border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer"
          :class="isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInput"
            type="file"
            accept=".csv"
            class="hidden"
            @change="handleFileSelect"
          />
          
          <div v-if="!selectedFile">
            <Upload class="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p class="text-sm font-medium">Arraste um arquivo CSV aqui</p>
            <p class="text-xs text-muted-foreground mt-1">ou clique para selecionar</p>
          </div>
          
          <div v-else class="flex items-center justify-center gap-3">
            <FileSpreadsheet class="h-8 w-8 text-green-500" />
            <div class="text-left">
              <p class="text-sm font-medium">{{ selectedFile.name }}</p>
              <p class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</p>
            </div>
            <Button variant="ghost" size="icon" class="h-8 w-8" @click.stop="clearFile">
              <X class="h-4 w-4" />
            </Button>
          </div>
        </div>

        <!-- Preview -->
        <div v-if="previewData.length > 0" class="space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Prévia ({{ previewData.length }} de {{ totalRows }} contatos)</p>
            <Badge variant="outline">{{ detectedColumns.length }} colunas</Badge>
          </div>
          
          <div class="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead v-for="col in detectedColumns.slice(0, 4)" :key="col">
                    {{ col }}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(row, idx) in previewData.slice(0, 3)" :key="idx">
                  <TableCell v-for="col in detectedColumns.slice(0, 4)" :key="col" class="text-sm">
                    {{ row[col] || '-' }}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <!-- Column Mapping -->
        <div v-if="detectedColumns.length > 0" class="space-y-3">
          <p class="text-sm font-medium">Mapeamento de Colunas</p>
          <div class="grid grid-cols-2 gap-3">
            <div class="space-y-1">
              <Label class="text-xs">Nome *</Label>
              <Select v-model="columnMapping.name">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem v-for="col in detectedColumns" :key="col" :value="col">
                    {{ col }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-1">
              <Label class="text-xs">E-mail</Label>
              <Select v-model="columnMapping.email">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Não importar</SelectItem>
                  <SelectItem v-for="col in detectedColumns" :key="col" :value="col">
                    {{ col }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-1">
              <Label class="text-xs">Telefone</Label>
              <Select v-model="columnMapping.phone">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Não importar</SelectItem>
                  <SelectItem v-for="col in detectedColumns" :key="col" :value="col">
                    {{ col }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div class="space-y-1">
              <Label class="text-xs">Empresa</Label>
              <Select v-model="columnMapping.company">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Não importar</SelectItem>
                  <SelectItem v-for="col in detectedColumns" :key="col" :value="col">
                    {{ col }}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="$emit('update:open', false)">
          Cancelar
        </Button>
        <Button 
          :disabled="!canImport || importing" 
          @click="handleImport"
        >
          <Loader2 v-if="importing" class="mr-2 h-4 w-4 animate-spin" />
          {{ importing ? 'Importando...' : `Importar ${totalRows} contatos` }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Upload, FileSpreadsheet, X, Loader2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Props {
  open: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:open': [value: boolean];
  'import': [contacts: Record<string, string>[]];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const isDragging = ref(false);
const importing = ref(false);
const previewData = ref<Record<string, string>[]>([]);
const detectedColumns = ref<string[]>([]);
const totalRows = ref(0);

const columnMapping = ref({
  name: '',
  email: '_none_',
  phone: '_none_',
  company: '_none_',
});

const canImport = computed(() => {
  return selectedFile.value && columnMapping.value.name && totalRows.value > 0;
});

function triggerFileInput() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    processFile(input.files[0]);
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false;
  if (event.dataTransfer?.files && event.dataTransfer.files[0]) {
    processFile(event.dataTransfer.files[0]);
  }
}

function processFile(file: File) {
  if (!file.name.endsWith('.csv')) {
    return;
  }
  
  selectedFile.value = file;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    parseCSV(text);
  };
  reader.readAsText(file);
}

function parseCSV(text: string) {
  const lines = text.split('\n').filter(line => line.trim());
  if (lines.length < 2) return;
  
  // Detect delimiter (comma or semicolon)
  const delimiter = lines[0].includes(';') ? ';' : ',';
  
  // Parse header
  const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
  detectedColumns.value = headers;
  
  // Parse data
  const data: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(delimiter).map(v => v.trim().replace(/^"|"$/g, ''));
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] || '';
    });
    data.push(row);
  }
  
  previewData.value = data;
  totalRows.value = data.length;
  
  // Auto-map columns
  autoMapColumns(headers);
}

function autoMapColumns(headers: string[]) {
  const lowerHeaders = headers.map(h => h.toLowerCase());
  
  // Name
  const nameIdx = lowerHeaders.findIndex(h => 
    h.includes('nome') || h.includes('name') || h === 'contato'
  );
  if (nameIdx >= 0) columnMapping.value.name = headers[nameIdx];
  
  // Email
  const emailIdx = lowerHeaders.findIndex(h => 
    h.includes('email') || h.includes('e-mail')
  );
  if (emailIdx >= 0) columnMapping.value.email = headers[emailIdx];
  
  // Phone
  const phoneIdx = lowerHeaders.findIndex(h => 
    h.includes('telefone') || h.includes('phone') || h.includes('celular') || h.includes('whatsapp')
  );
  if (phoneIdx >= 0) columnMapping.value.phone = headers[phoneIdx];
  
  // Company
  const companyIdx = lowerHeaders.findIndex(h => 
    h.includes('empresa') || h.includes('company') || h.includes('organização')
  );
  if (companyIdx >= 0) columnMapping.value.company = headers[companyIdx];
}

function clearFile() {
  selectedFile.value = null;
  previewData.value = [];
  detectedColumns.value = [];
  totalRows.value = 0;
  columnMapping.value = { name: '', email: '_none_', phone: '_none_', company: '_none_' };
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function handleImport() {
  if (!canImport.value) return;
  
  importing.value = true;
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Map data to contacts
  const contacts = previewData.value.map(row => ({
    name: row[columnMapping.value.name] || '',
    email: columnMapping.value.email !== '_none_' ? row[columnMapping.value.email] : '',
    phone: columnMapping.value.phone !== '_none_' ? row[columnMapping.value.phone] : '',
    company: columnMapping.value.company !== '_none_' ? row[columnMapping.value.company] : '',
  }));
  
  emit('import', contacts);
  importing.value = false;
  emit('update:open', false);
}

// Reset on close
watch(() => props.open, (isOpen) => {
  if (!isOpen) {
    clearFile();
  }
});
</script>
