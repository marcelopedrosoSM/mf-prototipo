import type { HolidayAndInactivity } from '@/types/holidays-and-inactivities'

// Dados iniciais - Feriados nacionais de 2026
const initialHolidaysAndInactivities: HolidayAndInactivity[] = [
  {
    id: 1,
    name: 'Confraternização mundial',
    date: '2026-01-01',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Carnaval',
    date: '2026-02-17',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 3,
    name: 'Sexta-feira Santa',
    date: '2026-04-03',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 4,
    name: 'Páscoa',
    date: '2026-04-05',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 5,
    name: 'Tiradentes',
    date: '2026-04-21',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 6,
    name: 'Dia do trabalho',
    date: '2026-05-01',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 7,
    name: 'Corpus Christi',
    date: '2026-06-04',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 8,
    name: 'Independência do Brasil',
    date: '2026-09-07',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 9,
    name: 'Nossa Senhora Aparecida',
    date: '2026-10-12',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 10,
    name: 'Finados',
    date: '2026-11-02',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 11,
    name: 'Proclamação da República',
    date: '2026-11-15',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 12,
    name: 'Dia da consciência negra',
    date: '2026-11-20',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 13,
    name: 'Natal',
    date: '2026-12-25',
    type: 'holiday',
    periodicity: 'annual',
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 14,
    name: 'Feriado local',
    date: '2026-10-28',
    type: 'holiday',
    periodicity: 'one-time',
    createdAt: '2024-01-15T10:00:00Z',
  },
]

// Estado mutável para permitir alterações durante a sessão
export const mockHolidaysAndInactivitiesState = {
  holidaysAndInactivities: [...initialHolidaysAndInactivities],
  nextId: 15,
}

// Funções auxiliares para manipular o estado mockado
export function getHolidaysAndInactivities() {
  return mockHolidaysAndInactivitiesState.holidaysAndInactivities
}

export function addHolidayAndInactivity(
  holidayAndInactivity: Omit<HolidayAndInactivity, 'id' | 'createdAt'>
) {
  const newItem: HolidayAndInactivity = {
    ...holidayAndInactivity,
    id: mockHolidaysAndInactivitiesState.nextId++,
    createdAt: new Date().toISOString(),
  }
  mockHolidaysAndInactivitiesState.holidaysAndInactivities.push(newItem)
  return newItem
}

export function updateHolidayAndInactivity(
  id: number,
  updates: Partial<HolidayAndInactivity>
) {
  const index = mockHolidaysAndInactivitiesState.holidaysAndInactivities.findIndex(
    (item) => item.id === id
  )
  if (index > -1) {
    mockHolidaysAndInactivitiesState.holidaysAndInactivities[index] = {
      ...mockHolidaysAndInactivitiesState.holidaysAndInactivities[index],
      ...updates,
    }
    return mockHolidaysAndInactivitiesState.holidaysAndInactivities[index]
  }
  return null
}

export function deleteHolidayAndInactivity(id: number) {
  const index = mockHolidaysAndInactivitiesState.holidaysAndInactivities.findIndex(
    (item) => item.id === id
  )
  if (index > -1) {
    mockHolidaysAndInactivitiesState.holidaysAndInactivities.splice(index, 1)
    return true
  }
  return false
}

