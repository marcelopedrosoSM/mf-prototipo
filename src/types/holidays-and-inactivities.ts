export type HolidayAndInactivityType = 'holiday' | 'inactivity'
export type HolidayAndInactivityPeriodicity = 'annual' | 'one-time'

export interface HolidayAndInactivity {
  id: number
  name: string
  date: string // YYYY-MM-DD
  type: HolidayAndInactivityType
  periodicity: HolidayAndInactivityPeriodicity
  createdAt: string
}

export const DEFAULT_HOLIDAY_AND_INACTIVITY: Omit<HolidayAndInactivity, 'id' | 'createdAt'> = {
  name: '',
  date: '',
  type: 'holiday',
  periodicity: 'one-time',
}

