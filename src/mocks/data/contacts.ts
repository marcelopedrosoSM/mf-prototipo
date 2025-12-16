import type { Contact } from '@/types/contacts';

export type { Contact };

// Dados mock de estados brasileiros
export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

// Dados mock de cidades (exemplo - em produção viria de uma API)
export const BRAZILIAN_CITIES: Record<string, string[]> = {
  SP: ['São Paulo', 'Campinas', 'Santos', 'Ribeirão Preto', 'Sorocaba'],
  RJ: ['Rio de Janeiro', 'Niterói', 'Campos dos Goytacazes', 'Petrópolis', 'Volta Redonda'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Pelotas', 'Canoas', 'Santa Maria'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Criciúma'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Juazeiro'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia'],
  PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina'],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral'],
};

export function getCitiesByState(state: string): string[] {
  return BRAZILIAN_CITIES[state] || [];
}

// Dados mock iniciais de contatos
const initialContacts: Contact[] = [
  {
    id: 1,
    accountId: 1,
    name: 'João Silva',
    emails: [
      { id: 1, contactId: 1, email: 'joao.silva@example.com' },
    ],
    phoneNumbers: [
      { id: 1, contactId: 1, phoneNumber: '+55 (11) 98765-4321', label: 'whatsapp' },
      { id: 2, contactId: 1, phoneNumber: '+55 (11) 3456-7890', label: 'comercial' },
    ],
    city: 'São Paulo',
    state: 'SP',
    notes: 'Cliente importante, preferência por WhatsApp',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    accountId: 1,
    name: 'Maria Santos',
    emails: [
      { id: 3, contactId: 2, email: 'maria.santos@example.com' },
      { id: 4, contactId: 2, email: 'maria.pessoal@example.com' },
    ],
    phoneNumbers: [
      { id: 3, contactId: 2, phoneNumber: '+55 (21) 99876-5432', label: 'whatsapp' },
    ],
    city: 'Rio de Janeiro',
    state: 'RJ',
    notes: '',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z',
  },
  {
    id: 3,
    accountId: 1,
    name: 'Pedro Oliveira',
    emails: [],
    phoneNumbers: [
      { id: 4, contactId: 3, phoneNumber: '+55 (11) 91234-5678', label: 'pessoal' },
      { id: 5, contactId: 3, phoneNumber: '+55 (11) 3456-7890', label: 'comercial' },
    ],
    city: 'Campinas',
    state: 'SP',
    notes: 'Prefere contato comercial',
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-02-01T09:00:00Z',
  },
  {
    id: 4,
    accountId: 1,
    name: 'Ana Costa',
    emails: [
      { id: 5, contactId: 4, email: 'ana.costa@example.com' },
    ],
    phoneNumbers: [
      { id: 6, contactId: 4, phoneNumber: '+55 (31) 98765-4321', label: 'whatsapp' },
    ],
    city: 'Belo Horizonte',
    state: 'MG',
    notes: '',
    createdAt: '2024-02-10T11:00:00Z',
    updatedAt: '2024-02-10T11:00:00Z',
  },
  {
    id: 5,
    accountId: 1,
    name: 'Carlos Ferreira',
    emails: [
      { id: 6, contactId: 5, email: 'carlos.ferreira@example.com' },
    ],
    phoneNumbers: [
      { id: 7, contactId: 5, phoneNumber: '+55 (41) 99876-5432', label: 'whatsapp' },
      { id: 8, contactId: 5, phoneNumber: '+55 (41) 3456-7890', label: 'comercial' },
    ],
    city: 'Curitiba',
    state: 'PR',
    notes: 'Cliente VIP',
    createdAt: '2024-02-15T16:00:00Z',
    updatedAt: '2024-02-15T16:00:00Z',
  },
  {
    id: 6,
    accountId: 1,
    name: 'Marcelo Pedroso',
    emails: [
      { id: 7, contactId: 6, email: 'marcelo.pedroso@example.com' },
    ],
    phoneNumbers: [
      { id: 9, contactId: 6, phoneNumber: '+55 (45) 99921-0256', label: 'whatsapp' },
    ],
    city: 'Foz do Iguaçu',
    state: 'PR',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 7,
    accountId: 1,
    name: 'Juliana Alves',
    emails: [
      { id: 8, contactId: 7, email: 'juliana.alves@example.com' },
    ],
    phoneNumbers: [
      { id: 10, contactId: 7, phoneNumber: '+55 (11) 98765-1234', label: 'whatsapp' },
    ],
    city: 'São Paulo',
    state: 'SP',
    notes: '',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 8,
    accountId: 1,
    name: 'Roberto Lima',
    emails: [
      { id: 9, contactId: 8, email: 'roberto.lima@example.com' },
    ],
    phoneNumbers: [
      { id: 11, contactId: 8, phoneNumber: '+55 (21) 99876-5432', label: 'whatsapp' },
    ],
    city: 'Rio de Janeiro',
    state: 'RJ',
    notes: '',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Estado mutável para permitir alterações durante a sessão
export const mockContactsState = {
  contacts: [...initialContacts],
  nextId: 9,
};

// Funções auxiliares para manipular o estado mockado
export function getContacts() {
  return mockContactsState.contacts;
}

export function getContactById(id: number): Contact | undefined {
  return mockContactsState.contacts.find((contact) => contact.id === id);
}

export function addContact(contact: Omit<Contact, 'id' | 'accountId' | 'createdAt' | 'updatedAt'>): Contact {
  const newContact: Contact = {
    ...contact,
    id: mockContactsState.nextId++,
    accountId: 1, // Mock account ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockContactsState.contacts.push(newContact);
  return newContact;
}

export function updateContact(id: number, updates: Partial<Contact>): Contact | null {
  const index = mockContactsState.contacts.findIndex((contact) => contact.id === id);
  if (index > -1) {
    mockContactsState.contacts[index] = {
      ...mockContactsState.contacts[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    return mockContactsState.contacts[index];
  }
  return null;
}

export function deleteContact(id: number): boolean {
  const index = mockContactsState.contacts.findIndex((contact) => contact.id === id);
  if (index > -1) {
    mockContactsState.contacts.splice(index, 1);
    return true;
  }
  return false;
}

