<template>
  <div class="space-y-6">
    <!-- E-mails -->
    <div>
      <h3 class="text-sm font-semibold mb-3">E-mail</h3>
      <div class="space-y-3">
        <div
          v-for="(email, index) in emails"
          :key="index"
          class="flex items-start gap-2"
        >
          <div class="flex-1">
            <Input
              :id="`email-${index}`"
              :model-value="email"
              type="email"
              placeholder="Informe o e-mail"
              :class="getEmailError(index) ? 'border-destructive' : ''"
              @update:model-value="(value) => updateEmail(index, value)"
            />
            <p v-if="getEmailError(index)" class="text-sm text-destructive mt-1">
              {{ getEmailError(index) }}
            </p>
          </div>
          <Button
            v-if="index > 0"
            variant="ghost"
            size="icon"
            class="mt-0"
            @click="removeEmail(index)"
          >
            <Trash2 class="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="addEmail"
          class="w-full sm:w-auto"
        >
          <Plus class="mr-2 h-4 w-4" />
          Adicionar e-mail
        </Button>
      </div>
    </div>

    <!-- Telefones -->
    <div>
      <h3 class="text-sm font-semibold mb-3">Telefone</h3>
      <div class="space-y-3">
        <div
          v-for="(phone, index) in phoneNumbers"
          :key="index"
          class="flex items-start gap-2"
        >
          <div class="flex-1 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2">
            <Select
              :model-value="phone.label"
              :disabled="isPhoneDisabled(index)"
              @update:model-value="(value) => updatePhoneLabel(index, value)"
            >
              <SelectTrigger :class="getPhoneError(index, 'label') ? 'border-destructive' : ''">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="comercial">Comercial</SelectItem>
                <SelectItem value="pessoal">Pessoal</SelectItem>
              </SelectContent>
            </Select>
            <div>
              <Input
                :id="`phone-${index}`"
                :model-value="phone.phoneNumber"
                placeholder="+55 (00) 0 0000 0000"
                :disabled="isPhoneDisabled(index)"
                :class="getPhoneError(index, 'phoneNumber') ? 'border-destructive' : ''"
                @update:model-value="(value) => updatePhoneNumber(index, value)"
              />
              <p v-if="getPhoneError(index, 'phoneNumber')" class="text-sm text-destructive mt-1">
                {{ getPhoneError(index, 'phoneNumber') }}
              </p>
            </div>
          </div>
          <Button
            v-if="index > 0 || !isEditing"
            variant="ghost"
            size="icon"
            class="mt-0"
            :disabled="isPhoneDisabled(index)"
            @click="removePhone(index)"
          >
            <Trash2 class="h-4 w-4 text-destructive" />
          </Button>
        </div>
        <Button
          variant="outline"
          size="sm"
          @click="addPhone"
          class="w-full sm:w-auto"
        >
          <Plus class="mr-2 h-4 w-4" />
          Adicionar telefone
        </Button>
        <p v-if="errors.phoneNumbers" class="text-sm text-destructive">
          {{ errors.phoneNumbers }}
        </p>
      </div>
    </div>

    <!-- Observações -->
    <div>
      <h3 class="text-sm font-semibold mb-3">Observações do contato</h3>
      <div class="space-y-2">
        <Textarea
          id="notes"
          v-model="notes"
          placeholder="Digite a observação do contato"
          rows="4"
          :class="errors.notes ? 'border-destructive' : ''"
        />
        <p v-if="errors.notes" class="text-sm text-destructive">{{ errors.notes }}</p>
        <p v-if="notes" class="text-xs text-muted-foreground text-right">
          {{ notes.length }}/300 caracteres
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Plus, Trash2 } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PhoneNumberContact } from '@/types/contacts';

interface Props {
  emails: string[];
  phoneNumbers: PhoneNumberContact[];
  notes: string;
  isEditing?: boolean;
  errors?: Record<string, string | Record<number, Record<string, string>>>;
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false,
  errors: () => ({}),
});

const emit = defineEmits<{
  'update:emails': [emails: string[]];
  'update:phoneNumbers': [phoneNumbers: PhoneNumberContact[]];
  'update:notes': [notes: string];
}>();

const emails = computed({
  get: () => props.emails,
  set: (value) => emit('update:emails', value),
});

const phoneNumbers = computed({
  get: () => props.phoneNumbers,
  set: (value) => emit('update:phoneNumbers', value),
});

const notes = computed({
  get: () => props.notes,
  set: (value) => emit('update:notes', value),
});

function addEmail() {
  emails.value = [...emails.value, ''];
}

function updateEmail(index: number, value: string) {
  const newEmails = [...emails.value];
  newEmails[index] = value;
  emails.value = newEmails;
}

function removeEmail(index: number) {
  emails.value = emails.value.filter((_, i) => i !== index);
}

function addPhone() {
  phoneNumbers.value = [
    ...phoneNumbers.value,
    { phoneNumber: '', label: 'whatsapp' },
  ];
}

function updatePhoneLabel(index: number, value: 'whatsapp' | 'comercial' | 'pessoal') {
  const newPhones = [...phoneNumbers.value];
  newPhones[index] = { ...newPhones[index], label: value };
  phoneNumbers.value = newPhones;
}

function updatePhoneNumber(index: number, value: string) {
  const newPhones = [...phoneNumbers.value];
  newPhones[index] = { ...newPhones[index], phoneNumber: value };
  phoneNumbers.value = newPhones;
}

function removePhone(index: number) {
  if (isPhoneDisabled(index)) return;
  phoneNumbers.value = phoneNumbers.value.filter((_, i) => i !== index);
}

function isPhoneDisabled(index: number): boolean {
  return props.isEditing && index === 0;
}

function getEmailError(index: number): string | undefined {
  const emailErrors = props.errors?.emails as Record<number, string> | undefined;
  return emailErrors?.[index];
}

function getPhoneError(index: number, field: 'label' | 'phoneNumber'): string | undefined {
  const phoneErrors = props.errors?.phoneNumbers as Record<number, Record<string, string>> | undefined;
  return phoneErrors?.[index]?.[field];
}
</script>

