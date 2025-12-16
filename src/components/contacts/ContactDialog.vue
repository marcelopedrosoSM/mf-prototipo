<template>
  <Dialog :open="open" @update:open="handleOpenChange">
    <DialogContent class="max-w-2xl max-h-[90vh] flex flex-col p-0">
      <DialogHeader class="px-6 pt-6 pb-4">
        <DialogTitle>
          {{ contact ? 'Editar Contato' : 'Novo Contato' }}
        </DialogTitle>
        <DialogDescription>
          {{ contact ? 'Atualize as informações do contato' : 'Preencha os dados para criar um novo contato' }}
        </DialogDescription>
      </DialogHeader>

      <div class="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        <form @submit.prevent="handleSubmit" class="px-6 py-4 space-y-6">
          <!-- Seção Geral -->
          <ContactFormGeneral
            v-model="formData.name"
            :errors="errors"
          />

          <!-- Seção Comunicação -->
          <ContactFormCommunication
            v-model:emails="formData.emails"
            v-model:phoneNumbers="formData.phoneNumbers"
            v-model:notes="formData.notes"
            :is-editing="!!contact"
            :errors="errors"
          />

          <!-- Seção Endereço -->
          <ContactFormAddress
            v-model:model-value-state="formData.state"
            v-model:model-value-city="formData.city"
          />
        </form>
      </div>

      <DialogFooter class="flex-shrink-0 px-6 pb-6 pt-4 border-t">
        <Button variant="outline" @click="handleOpenChange(false)">
          Cancelar
        </Button>
        <Button @click="handleSubmit" :disabled="!isFormValid">
          {{ contact ? 'Salvar' : 'Criar' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import ContactFormGeneral from './ContactFormGeneral.vue';
import ContactFormCommunication from './ContactFormCommunication.vue';
import ContactFormAddress from './ContactFormAddress.vue';
import type { Contact, PhoneNumberContact } from '@/types/contacts';
import { z } from 'zod';

interface Props {
  open: boolean;
  contact?: Contact | null;
}

const props = withDefaults(defineProps<Props>(), {
  contact: null,
});

const emit = defineEmits<{
  'update:open': [open: boolean];
  'save': [data: Omit<Contact, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>];
}>();

// Schema de validação
const emailSchema = z
  .string()
  .trim()
  .optional()
  .refine((val) => !val || val === '' || z.string().email().safeParse(val).success, {
    message: 'Email inválido',
  });

const phoneNumberSchema = z.object({
  label: z
    .string()
    .trim()
    .min(1, 'Tipo do telefone é obrigatório'),
  phoneNumber: z
    .string()
    .trim()
    .min(1, 'Telefone é obrigatório')
    .refine((doc) => {
      const replacedDoc = doc.replace(/\D/g, '');
      return replacedDoc.length >= 12;
    }, 'Telefone inválido (mínimo 12 dígitos)'),
});

const contactSchema = z.object({
  name: z.string().trim().min(1, 'Nome é obrigatório'),
  emails: z.array(emailSchema).optional(),
  phoneNumbers: z
    .array(phoneNumberSchema)
    .min(1, 'Pelo menos um número de telefone é necessário'),
  city: z.string().trim().optional().nullable(),
  state: z.string().trim().optional().nullable(),
  notes: z
    .string()
    .trim()
    .optional()
    .nullable()
    .refine((val) => !val || val === '' || (val.length >= 2 && val.length <= 300), {
      message: 'As observações devem ter entre 2 e 300 caracteres',
    }),
});

const initialFormData = {
  name: '',
  emails: [] as string[],
  phoneNumbers: [{ phoneNumber: '', label: 'whatsapp' as const }] as PhoneNumberContact[],
  city: '',
  state: '',
  notes: '',
};

const formData = ref({ ...initialFormData });
const errors = ref<Record<string, any>>({});

watch(
  () => props.open,
  (newVal) => {
    if (newVal) {
      if (props.contact) {
        formData.value = {
          name: props.contact.name,
          emails: props.contact.emails.map((e) => e.email),
          phoneNumbers: props.contact.phoneNumbers.map((p) => ({
            phoneNumber: p.phoneNumber,
            label: p.label,
          })),
          city: props.contact.city || '',
          state: props.contact.state || '',
          notes: props.contact.notes || '',
        };
      } else {
        formData.value = { ...initialFormData };
      }
      errors.value = {};
    }
  },
  { immediate: true }
);

const isFormValid = computed(() => {
  try {
    contactSchema.parse({
      name: formData.value.name,
      emails: formData.value.emails.filter((e) => e.trim()),
      phoneNumbers: formData.value.phoneNumbers.filter((p) => p.phoneNumber.trim()),
      city: formData.value.city || null,
      state: formData.value.state || null,
      notes: formData.value.notes || null,
    });
    return true;
  } catch {
    return false;
  }
});

function validateForm() {
  errors.value = {};

  // Filtrar emails e telefones vazios antes da validação
  const cleanEmails = formData.value.emails.filter((e) => e && e.trim());
  const cleanPhones = formData.value.phoneNumbers.filter((p) => p.phoneNumber.trim());

  try {
    const validated = contactSchema.parse({
      name: formData.value.name,
      emails: cleanEmails.length > 0 ? cleanEmails : undefined,
      phoneNumbers: cleanPhones,
      city: formData.value.city || null,
      state: formData.value.state || null,
      notes: formData.value.notes || null,
    });

    return {
      name: validated.name,
      emails: validated.emails?.map((email) => ({ email: email! })) || [],
      phoneNumbers: validated.phoneNumbers.map((phone) => ({
        phoneNumber: phone.phoneNumber,
        label: phone.label as 'whatsapp' | 'comercial' | 'pessoal',
      })),
      city: validated.city || undefined,
      state: validated.state || undefined,
      notes: validated.notes || undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (path.includes('[')) {
          // Array errors
          const match = path.match(/(\w+)\[(\d+)\]\.?(\w+)?/);
          if (match) {
            const [, arrayName, index, field] = match;
            if (!errors.value[arrayName]) {
              errors.value[arrayName] = {};
            }
            if (!errors.value[arrayName][parseInt(index)]) {
              errors.value[arrayName][parseInt(index)] = {};
            }
            if (field) {
              errors.value[arrayName][parseInt(index)][field] = err.message;
            } else {
              errors.value[arrayName][parseInt(index)] = err.message;
            }
          }
        } else {
          errors.value[path] = err.message;
        }
      });
    }
    return null;
  }
}

function handleSubmit() {
  const validated = validateForm();
  if (!validated) {
    return;
  }

  emit('save', validated);
  handleOpenChange(false);
}

function handleOpenChange(open: boolean) {
  emit('update:open', open);
}
</script>


