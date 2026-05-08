'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEFAULT_SETTINGS } from '@/lib/constants'
import { calcPrice, calcDuration, sizeFromWeight, addMinutes, fromLocalInput } from '@/lib/utils'
import type {
  AppContextValue, AppSettings, Dog, Appointment,
  BusinessExpense, HomeExpense, ModalState,
} from '@/lib/types'

// ── Context ───────────────────────────────────────────────────

const AppContext = createContext<AppContextValue & {
  modal: ModalState
  setModal: (m: ModalState) => void
} | null>(null)

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}

// ── Toast ─────────────────────────────────────────────────────

export interface ToastState { msg: string; type: 'success' | 'error' }

// ── Provider ──────────────────────────────────────────────────

export function AppProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()

  const [dogs, setDogs] = useState<Dog[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [businessExpenses, setBusinessExpenses] = useState<BusinessExpense[]>([])
  const [homeExpenses, setHomeExpenses] = useState<HomeExpense[]>([])
  const [settings, setSettingsState] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastState | null>(null)
  const [modal, setModal] = useState<ModalState>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ msg, type })
    toastTimer.current = setTimeout(() => setToast(null), 2400)
  }, [])

  // ── Initial load ──────────────────────────────────────────

  useEffect(() => {
    async function load() {
      const [
        { data: dogsData },
        { data: aptsData },
        { data: bizData },
        { data: homeData },
        { data: settingsData },
      ] = await Promise.all([
        supabase.from('dogs').select('*').order('name'),
        supabase.from('appointments').select('*, dogs(*)').order('start_time'),
        supabase.from('business_expenses').select('*').order('date', { ascending: false }),
        supabase.from('home_expenses').select('*').order('date', { ascending: false }),
        supabase.from('settings').select('*').eq('id', 1).single(),
      ])

      setDogs(dogsData || [])
      setAppointments((aptsData || []) as Appointment[])
      setBusinessExpenses(bizData || [])
      setHomeExpenses(homeData || [])

      if (settingsData) {
        const s = settingsData as Record<string, unknown>
        setSettingsState({
          ...DEFAULT_SETTINGS,
          prices:    { ...DEFAULT_SETTINGS.prices,    ...(s.prices    as object || {}) },
          durations: { ...DEFAULT_SETTINGS.durations, ...(s.durations as object || {}) },
          templates: { ...DEFAULT_SETTINGS.templates, ...(s.templates as object || {}) },
          business:  { ...DEFAULT_SETTINGS.business,  ...(s.business  as object || {}) },
        })
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Realtime subscriptions ────────────────────────────────

  useEffect(() => {
    const channel = supabase
      .channel('app-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'dogs' }, async () => {
        const { data } = await supabase.from('dogs').select('*').order('name')
        if (data) setDogs(data)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async () => {
        const { data } = await supabase.from('appointments').select('*, dogs(*)').order('start_time')
        if (data) setAppointments(data as Appointment[])
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'business_expenses' }, async () => {
        const { data } = await supabase.from('business_expenses').select('*').order('date', { ascending: false })
        if (data) setBusinessExpenses(data)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'home_expenses' }, async () => {
        const { data } = await supabase.from('home_expenses').select('*').order('date', { ascending: false })
        if (data) setHomeExpenses(data)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, async () => {
        const { data } = await supabase.from('settings').select('*').eq('id', 1).single()
        if (data) {
          const s = data as Record<string, unknown>
          setSettingsState({
            ...DEFAULT_SETTINGS,
            prices:    { ...DEFAULT_SETTINGS.prices,    ...(s.prices    as object || {}) },
            durations: { ...DEFAULT_SETTINGS.durations, ...(s.durations as object || {}) },
            templates: { ...DEFAULT_SETTINGS.templates, ...(s.templates as object || {}) },
            business:  { ...DEFAULT_SETTINGS.business,  ...(s.business  as object || {}) },
          })
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Dogs CRUD ─────────────────────────────────────────────

  const upsertDog = useCallback(async (dog: Partial<Dog> & { name: string }): Promise<Dog | null> => {
    const { id, ...rest } = dog
    if (id) {
      const { data, error } = await supabase.from('dogs').update(rest).eq('id', id).select().single()
      if (error) { showToast('Error al guardar', 'error'); return null }
      showToast('Perro actualizado')
      return data as Dog
    } else {
      const { data, error } = await supabase.from('dogs').insert({ ...rest, visit_count: 0 }).select().single()
      if (error) { showToast('Error al guardar', 'error'); return null }
      showToast('Perro agregado')
      return data as Dog
    }
  }, [supabase, showToast])

  const deleteDog = useCallback(async (id: string) => {
    await supabase.from('appointments').update({ dog_id: null }).eq('dog_id', id)
    const { error } = await supabase.from('dogs').delete().eq('id', id)
    if (error) { showToast('Error al eliminar', 'error'); return }
    showToast('Perro eliminado')
  }, [supabase, showToast])

  // ── Appointments CRUD ─────────────────────────────────────

  const upsertAppointment = useCallback(async (apt: Partial<Appointment>): Promise<Appointment | null> => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, dogs: _dogs, ...rest } = apt as Appointment & { dogs?: unknown }
    if (id) {
      const { data, error } = await supabase.from('appointments').update(rest).eq('id', id).select('*, dogs(*)').single()
      if (error) { showToast('Error al guardar', 'error'); return null }
      showToast('Cita actualizada')
      return data as Appointment
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase.from('appointments').insert({
        ...rest,
        status: rest.status || 'pendiente',
        reminder_sent: false,
        confirmation_sent: false,
        review_requested: false,
        created_by: user?.id,
      }).select('*, dogs(*)').single()
      if (error) { showToast('Error al guardar', 'error'); return null }
      showToast('Cita creada')
      return data as Appointment
    }
  }, [supabase, showToast])

  const deleteAppointment = useCallback(async (id: string) => {
    const { error } = await supabase.from('appointments').delete().eq('id', id)
    if (error) { showToast('Error al eliminar', 'error'); return }
    showToast('Cita eliminada')
  }, [supabase, showToast])

  const completeAppointment = useCallback(async (id: string) => {
    const apt = appointments.find(a => a.id === id)
    if (!apt) return
    await supabase.from('appointments').update({ status: 'completada', completed_at: new Date().toISOString() }).eq('id', id)
    if (apt.dog_id) {
      const dog = dogs.find(d => d.id === apt.dog_id)
      await supabase.from('dogs').update({
        last_visit: apt.start_time,
        visit_count: (dog?.visit_count || 0) + 1,
      }).eq('id', apt.dog_id)
    }
    showToast('Cita completada · Ingreso registrado')
  }, [supabase, appointments, dogs, showToast])

  const markFlag = useCallback(async (id: string, flag: 'reminder_sent' | 'confirmation_sent' | 'review_requested') => {
    await supabase.from('appointments').update({ [flag]: true }).eq('id', id)
  }, [supabase])

  // ── Business Expenses CRUD ────────────────────────────────

  const upsertBusinessExpense = useCallback(async (exp: Partial<BusinessExpense>) => {
    const { id, ...rest } = exp
    if (id) {
      const { error } = await supabase.from('business_expenses').update(rest).eq('id', id)
      if (error) { showToast('Error al guardar', 'error'); return }
      showToast('Egreso actualizado')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('business_expenses').insert({ ...rest, created_by: user?.id })
      if (error) { showToast('Error al guardar', 'error'); return }
      showToast('Egreso registrado')
    }
  }, [supabase, showToast])

  const deleteBusinessExpense = useCallback(async (id: string) => {
    await supabase.from('business_expenses').delete().eq('id', id)
    showToast('Egreso eliminado')
  }, [supabase, showToast])

  // ── Home Expenses CRUD ────────────────────────────────────

  const upsertHomeExpense = useCallback(async (exp: Partial<HomeExpense>) => {
    const { id, ...rest } = exp
    if (id) {
      const { error } = await supabase.from('home_expenses').update(rest).eq('id', id)
      if (error) { showToast('Error al guardar', 'error'); return }
      showToast('Gasto actualizado')
    } else {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('home_expenses').insert({ ...rest, created_by: user?.id })
      if (error) { showToast('Error al guardar', 'error'); return }
      showToast('Gasto registrado')
    }
  }, [supabase, showToast])

  const deleteHomeExpense = useCallback(async (id: string) => {
    await supabase.from('home_expenses').delete().eq('id', id)
    showToast('Gasto eliminado')
  }, [supabase, showToast])

  // ── Settings ──────────────────────────────────────────────

  const saveSettings = useCallback(async (s: AppSettings) => {
    const { error } = await supabase.from('settings').upsert({
      id: 1,
      prices: s.prices,
      durations: s.durations,
      templates: s.templates,
      business: s.business,
      updated_at: new Date().toISOString(),
    })
    if (error) { showToast('Error al guardar', 'error'); return }
    showToast('Configuración guardada')
  }, [supabase, showToast])

  // ── Value ─────────────────────────────────────────────────

  const value = {
    dogs, appointments, businessExpenses, homeExpenses, settings, loading,
    upsertDog, deleteDog,
    upsertAppointment, deleteAppointment, completeAppointment, markFlag,
    upsertBusinessExpense, deleteBusinessExpense,
    upsertHomeExpense, deleteHomeExpense,
    saveSettings,
    showToast,
    modal, setModal,
  }

  return (
    <AppContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div className={`px-4 py-2.5 rounded-full text-sm font-medium shadow-lg whitespace-nowrap ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-stone-900 text-white'
          }`}>
            {toast.msg}
          </div>
        </div>
      )}
    </AppContext.Provider>
  )
}

// Re-export helpers so pages can import from one place
export { calcPrice, calcDuration, sizeFromWeight, addMinutes, fromLocalInput }
