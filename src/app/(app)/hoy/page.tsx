'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/components/AppProvider'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import { EmptyState, StatCard } from '@/components/ui'
import { sameDay, fmtDateLong, fmtCLP } from '@/lib/utils'
import { Plus, TrendingDown, Bell, Star } from 'lucide-react'

export default function HoyPage() {
  const { dogs, appointments, setModal } = useApp()
  const router = useRouter()
  const now = new Date()

  const todayApts = useMemo(() =>
    appointments
      .filter(a => sameDay(a.start_time, now))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [appointments]) // eslint-disable-line react-hooks/exhaustive-deps

  const tomorrowApts = useMemo(() => {
    const t = new Date(now); t.setDate(t.getDate() + 1)
    return appointments
      .filter(a => sameDay(a.start_time, t) && !a.reminder_sent && a.status !== 'cancelada')
  }, [appointments]) // eslint-disable-line react-hooks/exhaustive-deps

  const reviewsPending = useMemo(() =>
    appointments.filter(a =>
      a.status === 'completada' && !a.review_requested && a.completed_at &&
      (Date.now() - new Date(a.completed_at).getTime()) < 1000 * 60 * 60 * 24 * 2
    ), [appointments])

  const expectedToday  = todayApts.filter(a => a.status !== 'cancelada').reduce((s, a) => s + (a.price || 0), 0)
  const completedToday = todayApts.filter(a => a.status === 'completada').reduce((s, a) => s + (a.price || 0), 0)

  return (
    <div className="px-4 pt-6 pb-4">
      <header className="mb-5">
        <p className="text-xs uppercase tracking-widest text-stone-500 font-semibold capitalize">{fmtDateLong(now.toISOString())}</p>
        <h1 className="text-3xl font-extrabold mt-1">Hola</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard label="Citas hoy" value={todayApts.length}
          sub={`${todayApts.filter(a => a.status === 'completada').length} completadas`} />
        <StatCard label="Esperado hoy" value={fmtCLP(expectedToday)}
          sub={`${fmtCLP(completedToday)} cobrado`} small />
      </div>

      {/* Pending actions */}
      {(tomorrowApts.length > 0 || reviewsPending.length > 0) && (
        <section className="mb-5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Acciones pendientes</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-3">
            {tomorrowApts.length > 0 && (
              <div className="flex items-start gap-3">
                <Bell size={18} className="text-amber-700 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    {tomorrowApts.length} recordatorio{tomorrowApts.length > 1 ? 's' : ''} para mañana
                  </p>
                  <button onClick={() => router.push('/agenda')} className="text-xs text-amber-700 underline mt-0.5">
                    Ver en agenda
                  </button>
                </div>
              </div>
            )}
            {reviewsPending.length > 0 && (
              <div className="flex items-start gap-3">
                <Star size={18} className="text-amber-700 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-900">
                    {reviewsPending.length} reseña{reviewsPending.length > 1 ? 's' : ''} por pedir
                  </p>
                  <p className="text-xs text-amber-700 mt-0.5">Citas completadas en los últimos 2 días</p>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Today's appointments */}
      <section className="mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500">Citas de hoy</h2>
          <button onClick={() => setModal({ type: 'appointment', data: null })}
            className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <Plus size={14} /> Nueva
          </button>
        </div>
        {todayApts.length === 0 ? (
          <EmptyState
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            text="Sin citas hoy"
            subtext="Día libre"
          />
        ) : (
          <div className="space-y-2">
            {todayApts.map(apt => (
              <AppointmentCard key={apt.id} apt={apt} dogs={dogs}
                onClick={() => setModal({ type: 'aptDetail', data: apt.id })} />
            ))}
          </div>
        )}
      </section>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setModal({ type: 'appointment', data: null })}
          className="bg-stone-900 text-white rounded-2xl p-4 flex flex-col items-start hover:bg-stone-800 transition active:scale-95">
          <Plus size={20} className="mb-2" />
          <span className="font-semibold text-sm">Nueva cita</span>
        </button>
        <button onClick={() => setModal({ type: 'businessExpense', data: null })}
          className="bg-white border border-stone-200 rounded-2xl p-4 flex flex-col items-start hover:bg-stone-50 transition active:scale-95">
          <TrendingDown size={20} className="text-stone-700 mb-2" />
          <span className="font-semibold text-sm">Registrar egreso</span>
        </button>
      </div>
    </div>
  )
}
