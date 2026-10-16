'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/components/AppProvider'
import { AppointmentCard } from '@/components/appointments/AppointmentCard'
import { EmptyState } from '@/components/ui'
import { sameDay, fmtDateLong, fmtMonth, startOfDay } from '@/lib/utils'
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AgendaPage() {
  const { dogs, appointments, setModal } = useApp()
  const [cursor, setCursor] = useState(() => startOfDay(new Date()))
  const [mode, setMode] = useState<'day' | 'month'>('day')

  const dayApts = useMemo(
    () =>
      appointments
        .filter((a) => sameDay(a.start_time, cursor))
        .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [appointments, cursor],
  )

  const dayMove = (n: number) => {
    const d = new Date(cursor)
    d.setDate(d.getDate() + n)
    setCursor(d)
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <div className="section-label">Calendario</div>
        <div className="flex items-center justify-between">
          <h1 className="display">Agenda</h1>
          <button
            onClick={() =>
              setModal({ type: 'appointment', data: { start_time: cursor.toISOString() } as never })
            }
            className="btn-gold px-3 py-2 text-xs flex items-center gap-1.5"
          >
            <Plus size={14} /> Nueva cita
          </button>
        </div>
      </header>

      {/* Mode toggle */}
      <div
        className="flex items-center gap-1 p-1 rounded-xl mb-4 w-fit"
        style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
      >
        {(['day', 'month'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-4 py-1.5 text-xs font-semibold rounded-lg transition-all"
            style={
              mode === m
                ? { background: 'var(--pf-gold)', color: 'var(--pf-bg)' }
                : { color: 'rgba(245,240,232,0.45)' }
            }
          >
            {m === 'day' ? 'Día' : 'Mes'}
          </button>
        ))}
      </div>

      {mode === 'day' ? (
        <>
          {/* Day nav */}
          <div
            className="flex items-center justify-between mb-4 rounded-xl p-3"
            style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
          >
            <button
              onClick={() => dayMove(-1)}
              className="p-2 -m-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'rgba(245,240,232,0.5)' }}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="text-center">
              <p className="text-sm font-semibold text-white capitalize">
                {fmtDateLong(cursor.toISOString())}
              </p>
              {!sameDay(cursor, new Date()) && (
                <button
                  onClick={() => setCursor(startOfDay(new Date()))}
                  className="text-xs mt-0.5 font-semibold"
                  style={{ color: 'var(--pf-gold)' }}
                >
                  Ir a hoy
                </button>
              )}
            </div>
            <button
              onClick={() => dayMove(1)}
              className="p-2 -m-2 rounded-lg transition-colors hover:bg-white/5"
              style={{ color: 'rgba(245,240,232,0.5)' }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {dayApts.length === 0 ? (
            <EmptyState
              icon={
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              }
              text="Sin citas este día"
              subtext="Toca + para crear una"
            />
          ) : (
            <div className="space-y-2">
              {dayApts.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  apt={apt}
                  dogs={dogs}
                  onClick={() => setModal({ type: 'aptDetail', data: apt.id })}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <MonthCalendar
          cursor={cursor}
          setCursor={setCursor}
          appointments={appointments}
          onSelectDate={(d) => {
            setCursor(d)
            setMode('day')
          }}
        />
      )}
    </div>
  )
}

// ── Month Calendar ──────────────────────────────────────────────────────────

function MonthCalendar({
  cursor,
  setCursor,
  appointments,
  onSelectDate,
}: {
  cursor: Date
  setCursor: (d: Date) => void
  appointments: ReturnType<typeof useApp>['appointments']
  onSelectDate: (d: Date) => void
}) {
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startWeekday = new Date(year, month, 1).getDay()
  const today = new Date()

  const aptsByDay = useMemo(() => {
    const m: Record<number, number> = {}
    appointments.forEach((a) => {
      const d = new Date(a.start_time)
      if (d.getFullYear() === year && d.getMonth() === month) {
        m[d.getDate()] = (m[d.getDate()] || 0) + 1
      }
    })
    return m
  }, [appointments, year, month])

  const monthMove = (n: number) => setCursor(new Date(year, month + n, 1))

  return (
    <div
      className="rounded-xl p-4"
      style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => monthMove(-1)}
          className="p-2 -m-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'rgba(245,240,232,0.5)' }}
        >
          <ChevronLeft size={17} />
        </button>
        <p className="text-sm font-bold text-white capitalize">{fmtMonth(cursor)}</p>
        <button
          onClick={() => monthMove(1)}
          className="p-2 -m-2 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: 'rgba(245,240,232,0.5)' }}
        >
          <ChevronRight size={17} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1">
        {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((d, i) => (
          <div
            key={i}
            className="text-center text-[10px] font-bold uppercase py-1"
            style={{ color: 'rgba(245,240,232,0.25)' }}
          >
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startWeekday }).map((_, i) => (
          <div key={`b${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, month, day)
          const count = aptsByDay[day] || 0
          const isToday = sameDay(date, today)
          const isSelected = sameDay(date, cursor)

          return (
            <button
              key={day}
              onClick={() => onSelectDate(date)}
              className="aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-all"
              style={{
                background: isSelected
                  ? 'var(--pf-gold)'
                  : isToday
                    ? 'rgba(201,146,42,0.1)'
                    : 'transparent',
                color: isSelected
                  ? 'var(--pf-bg)'
                  : isToday
                    ? 'var(--pf-gold-l)'
                    : 'rgba(245,240,232,0.7)',
                border:
                  isToday && !isSelected
                    ? '1px solid var(--pf-gold-border)'
                    : '1px solid transparent',
                fontWeight: isSelected || isToday ? 700 : 400,
              }}
            >
              <span className="tabular text-xs">{day}</span>
              {count > 0 && (
                <span
                  className="text-[8px] mt-0.5"
                  style={{ color: isSelected ? 'rgba(15,14,12,0.6)' : 'var(--pf-gold)' }}
                >
                  {'•'.repeat(Math.min(count, 3))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
