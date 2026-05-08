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
    return appointments.filter(a => sameDay(a.start_time, t) && !a.reminder_sent && a.status !== 'cancelada')
  }, [appointments]) // eslint-disable-line react-hooks/exhaustive-deps

  const reviewsPending = useMemo(() =>
    appointments.filter(a =>
      a.status === 'completada' && !a.review_requested && a.completed_at &&
      (Date.now() - new Date(a.completed_at).getTime()) < 1000 * 60 * 60 * 24 * 2
    ), [appointments])

  const expectedToday  = todayApts.filter(a => a.status !== 'cancelada').reduce((s, a) => s + (a.price || 0), 0)
  const completedToday = todayApts.filter(a => a.status === 'completada').reduce((s, a) => s + (a.price || 0), 0)

  return (
    <div>
      {/* Header */}
      <header className="mb-7">
        <div className="section-label">
          <span className="capitalize">{fmtDateLong(now.toISOString())}</span>
        </div>
        <h1 className="display">Panel de <em>control</em></h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          label="Citas hoy"
          value={todayApts.length}
          sub={`${todayApts.filter(a => a.status === 'completada').length} completadas`}
        />
        <StatCard
          label="Esperado"
          value={fmtCLP(expectedToday)}
          sub={`${fmtCLP(completedToday)} cobrado`}
          small
        />
      </div>

      {/* Pending actions */}
      {(tomorrowApts.length > 0 || reviewsPending.length > 0) && (
        <div className="mb-6 rounded-xl p-4 space-y-3"
             style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.18)' }}>
          <div className="section-label" style={{ color: '#fbbf24', marginBottom: '8px' }}>
            Pendientes
          </div>
          {tomorrowApts.length > 0 && (
            <div className="flex items-start gap-3">
              <Bell size={15} className="mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
              <div>
                <p className="text-sm font-medium text-white">
                  {tomorrowApts.length} recordatorio{tomorrowApts.length > 1 ? 's' : ''} para mañana
                </p>
                <button onClick={() => router.push('/agenda')}
                        className="text-xs underline mt-0.5" style={{ color: 'rgba(251,191,36,0.7)' }}>
                  Ver en agenda
                </button>
              </div>
            </div>
          )}
          {reviewsPending.length > 0 && (
            <div className="flex items-start gap-3">
              <Star size={15} className="mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
              <div>
                <p className="text-sm font-medium text-white">
                  {reviewsPending.length} reseña{reviewsPending.length > 1 ? 's' : ''} por pedir
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(251,191,36,0.6)' }}>
                  Citas completadas hace menos de 2 días
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Today's appointments */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="section-label" style={{ marginBottom: 0 }}>Citas de hoy</div>
          <button
            onClick={() => setModal({ type: 'appointment', data: null })}
            className="flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-70"
            style={{ color: 'var(--pf-gold)' }}>
            <Plus size={13} /> Nueva
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
        <button
          onClick={() => setModal({ type: 'appointment', data: null })}
          className="rounded-xl p-4 flex flex-col items-start transition-all active:scale-95 hover:brightness-110"
          style={{ background: 'var(--pf-gold)', color: 'var(--pf-bg)' }}>
          <Plus size={20} className="mb-2.5" />
          <span className="font-bold text-sm">Nueva cita</span>
        </button>
        <button
          onClick={() => setModal({ type: 'businessExpense', data: null })}
          className="rounded-xl p-4 flex flex-col items-start transition-all active:scale-95"
          style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}>
          <TrendingDown size={20} className="mb-2.5" style={{ color: 'var(--pf-gold)' }} />
          <span className="font-semibold text-sm" style={{ color: 'rgba(245,240,232,0.8)' }}>
            Registrar egreso
          </span>
        </button>
      </div>
    </div>
  )
}