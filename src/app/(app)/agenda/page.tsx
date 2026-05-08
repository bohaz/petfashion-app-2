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

  const dayApts = useMemo(() =>
    appointments
      .filter(a => sameDay(a.start_time, cursor))
      .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()),
    [appointments, cursor])

  const dayMove = (n: number) => {
    const d = new Date(cursor); d.setDate(d.getDate() + n); setCursor(d)
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">Agenda</h1>
        <button
          onClick={() => setModal({ type: 'appointment', data: { start_time: cursor.toISOString() } as never })}
          className="bg-stone-900 text-white p-2.5 rounded-xl hover:bg-stone-800 transition active:scale-95">
          <Plus size={18} />
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-xl p-1 mb-4 w-fit">
        {(['day', 'month'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition ${mode === m ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-50'}`}>
            {m === 'day' ? 'Día' : 'Mes'}
          </button>
        ))}
      </div>

      {mode === 'day' ? (
        <>
          {/* Day header */}
          <div className="flex items-center justify-between mb-4 bg-white border border-stone-200 rounded-2xl p-3">
            <button onClick={() => dayMove(-1)} className="p-2 -m-2 rounded-lg hover:bg-stone-100"><ChevronLeft size={20} /></button>
            <div className="text-center">
              <p className="text-sm font-bold capitalize">{fmtDateLong(cursor.toISOString())}</p>
              {!sameDay(cursor, new Date()) && (
                <button onClick={() => setCursor(startOfDay(new Date()))} className="text-xs text-emerald-700 font-semibold mt-0.5">
                  Ir a hoy
                </button>
              )}
            </div>
            <button onClick={() => dayMove(1)} className="p-2 -m-2 rounded-lg hover:bg-stone-100"><ChevronRight size={20} /></button>
          </div>

          {dayApts.length === 0 ? (
            <EmptyState
              icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
              text="Sin citas este día"
              subtext="Toca + para crear una"
            />
          ) : (
            <div className="space-y-2">
              {dayApts.map(apt => (
                <AppointmentCard key={apt.id} apt={apt} dogs={dogs}
                  onClick={() => setModal({ type: 'aptDetail', data: apt.id })} />
              ))}
            </div>
          )}
        </>
      ) : (
        <MonthCalendar
          cursor={cursor}
          setCursor={setCursor}
          appointments={appointments}
          onSelectDate={(d) => { setCursor(d); setMode('day') }}
        />
      )}
    </div>
  )
}

// ── Month Calendar ────────────────────────────────────────────

function MonthCalendar({
  cursor, setCursor, appointments, onSelectDate
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
    appointments.forEach(a => {
      const d = new Date(a.start_time)
      if (d.getFullYear() === year && d.getMonth() === month) {
        m[d.getDate()] = (m[d.getDate()] || 0) + 1
      }
    })
    return m
  }, [appointments, year, month])

  const monthMove = (n: number) => setCursor(new Date(year, month + n, 1))

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-3">
      <div className="flex items-center justify-between mb-3 px-1">
        <button onClick={() => monthMove(-1)} className="p-2 -m-2 rounded-lg hover:bg-stone-100"><ChevronLeft size={18} /></button>
        <p className="text-sm font-bold capitalize">{fmtMonth(cursor)}</p>
        <button onClick={() => monthMove(1)} className="p-2 -m-2 rounded-lg hover:bg-stone-100"><ChevronRight size={18} /></button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['D','L','M','M','J','V','S'].map((d, i) => (
          <div key={i} className="text-center text-[10px] font-bold text-stone-400 uppercase py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: startWeekday }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(year, month, day)
          const count = aptsByDay[day] || 0
          const isToday = sameDay(date, today)
          const isSelected = sameDay(date, cursor)
          return (
            <button key={day} onClick={() => onSelectDate(date)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition ${
                isSelected ? 'bg-stone-900 text-white' :
                isToday ? 'bg-emerald-50 text-emerald-700 font-bold ring-1 ring-emerald-200' :
                'text-stone-700 hover:bg-stone-50'
              }`}>
              <span className="tabular font-semibold">{day}</span>
              {count > 0 && (
                <span className={`text-[9px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-emerald-600'}`}>
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
