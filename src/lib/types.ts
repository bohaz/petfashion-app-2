// ── Core domain types ────────────────────────────────────────

export type ServiceKey = 'corte_bano' | 'solo_bano' | 'unas' | 'afilado'
export type DogSize = 'XS' | 'S' | 'M' | 'L'
export type DogCoat = 'corto' | 'doble'
export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_show'

export interface Dog {
  id: string
  created_at: string
  name: string
  breed?: string
  weight?: number
  size: DogSize
  coat: DogCoat
  owner_name?: string
  phone?: string
  notes?: string
  visit_count: number
  last_visit?: string
}

export interface Appointment {
  id: string
  created_at: string
  dog_id?: string
  client_name?: string
  owner_name?: string
  phone?: string
  service: ServiceKey
  qty: number
  start_time: string
  end_time: string
  duration_minutes: number
  price: number
  price_override: boolean
  status: AppointmentStatus
  notes?: string
  reminder_sent: boolean
  confirmation_sent: boolean
  review_requested: boolean
  completed_at?: string
  created_by?: string
  dogs?: Dog
}

export interface BusinessExpense {
  id: string
  created_at: string
  date: string
  category: string
  amount: number
  description?: string
  created_by?: string
}

export interface HomeExpense {
  id: string
  created_at: string
  date: string
  category: string
  amount: number
  description?: string
  created_by?: string
}

export interface AppSettings {
  prices: {
    corte_bano: Record<DogSize, number>
    solo_bano: { XS: number; S: number; M: number; L_corto: number; L_doble: number }
    unas: Record<DogSize, number>
    afilado_unidad: number
  }
  durations: {
    corte_bano: Record<DogSize, number>
    solo_bano: Record<DogSize, number>
    unas: Record<DogSize, number>
    afilado: number
  }
  templates: {
    confirmation: string
    reminder: string
    review: string
  }
  business: {
    name: string
    address: string
    googleReviewLink: string
  }
}

// ── Context shape ─────────────────────────────────────────────

export interface AppContextValue {
  dogs: Dog[]
  appointments: Appointment[]
  businessExpenses: BusinessExpense[]
  homeExpenses: HomeExpense[]
  settings: AppSettings
  loading: boolean
  // Dogs
  saveDog: (dog: Partial<Dog> & { name: string }) => Promise<Dog | null>
  deleteDog: (id: string) => Promise<void>
  // Appointments
  saveAppointment: (apt: Partial<Appointment>) => Promise<Appointment | null>
  deleteAppointment: (id: string) => Promise<void>
  completeAppointment: (id: string) => Promise<void>
  markFlag: (
    id: string,
    flag: 'reminder_sent' | 'confirmation_sent' | 'review_requested',
  ) => Promise<void>
  // Business expenses
  saveBusinessExpense: (exp: Partial<BusinessExpense>) => Promise<void>
  deleteBusinessExpense: (id: string) => Promise<void>
  // Home expenses
  saveHomeExpense: (exp: Partial<HomeExpense>) => Promise<void>
  deleteHomeExpense: (id: string) => Promise<void>
  // Settings
  saveSettings: (s: AppSettings) => Promise<void>
  // Toast
  showToast: (msg: string, type?: 'success' | 'error') => void
}

// ── Modal state ───────────────────────────────────────────────

export type ModalState =
  | { type: 'appointment'; data: Partial<Appointment> | null }
  | { type: 'aptDetail'; data: string }
  | { type: 'dog'; data: Partial<Dog> | null }
  | { type: 'dogDetail'; data: string }
  | { type: 'businessExpense'; data: Partial<BusinessExpense> | null }
  | { type: 'homeExpense'; data: Partial<HomeExpense> | null }
  | { type: 'confirm'; data: ConfirmData }
  | null

export interface ConfirmData {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
}
