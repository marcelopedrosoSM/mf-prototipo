export type PhoneNumberContact = {
  id?: number;
  contactId?: number;
  phoneNumber: string;
  label: 'whatsapp' | 'comercial' | 'pessoal';
};

export type EmailContact = {
  id?: number;
  contactId?: number;
  email: string;
};

export interface Contact {
  id: number;
  accountId: number;
  name: string;
  emails: EmailContact[];
  phoneNumbers: PhoneNumberContact[];
  city?: string;
  state?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const DEFAULT_CONTACT: Omit<Contact, 'id' | 'accountId'> = {
  name: '',
  emails: [],
  phoneNumbers: [],
  city: '',
  state: '',
  notes: '',
};

