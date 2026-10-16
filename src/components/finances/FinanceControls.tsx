'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fmtMonth } from '@/lib/utils'

export type FinanceTab = 'resumen' | 'ingresos' | 'egresos' | 'reportes'

const TAB_LABELS: Record<FinanceTab, string> = {
  resumen: 'Resumen',
  ingresos: 'Ingresos',
  egresos: 'Egresos',
  reportes: 'Reportes',
}

export function MonthNav({ cursor, onMove }: { cursor: Date; onMove: (n: number) => void }) {
  return (
    <div
      className="flex items-center justify-between mb-4 rounded-xl p-3"
      style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
    >
      <button
        onClick={() => onMove(-1)}
        aria-label="Mes anterior"
        className="p-1.5 -m-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: 'rgba(245,240,232,0.4)' }}
      >
        <ChevronLeft size={17} />
      </button>
      <p className="text-sm font-bold text-white capitalize">{fmtMonth(cursor)}</p>
      <button
        onClick={() => onMove(1)}
        aria-label="Mes siguiente"
        className="p-1.5 -m-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: 'rgba(245,240,232,0.4)' }}
      >
        <ChevronRight size={17} />
      </button>
    </div>
  )
}

export function TabBar({
  tabs,
  active,
  onSelect,
  accent = 'gold',
}: {
  tabs: FinanceTab[]
  active: FinanceTab
  onSelect: (t: FinanceTab) => void
  accent?: 'gold' | 'indigo'
}) {
  return (
    <div className="flex gap-1 p-1 rounded-xl mb-4" style={{ background: 'var(--pf-bg3)' }}>
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onSelect(t)}
          className="flex-1 py-2 text-xs font-semibold rounded-lg transition-all"
          style={
            active === t
              ? {
                  background: 'var(--pf-bg2)',
                  color: accent === 'indigo' ? '#a5b4fc' : 'var(--pf-gold-l)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }
              : { color: 'rgba(245,240,232,0.4)' }
          }
        >
          {TAB_LABELS[t]}
        </button>
      ))}
    </div>
  )
}

/** Horizontal bar showing `value` as a share of `max`. */
export function BarChart({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div
      className="h-1.5 rounded-full overflow-hidden mt-1.5"
      style={{ background: 'rgba(245,240,232,0.06)' }}
    >
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}
