'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/components/AppProvider'
import { EmptyState } from '@/components/ui'
import { BUSINESS_CATEGORIES, HOME_CATEGORIES, SERVICES } from '@/lib/constants'
import { fmtCLP, fmtDateShort, fmtMonth } from '@/lib/utils'
import { TrendingUp, TrendingDown, Plus, ChevronLeft, ChevronRight } from 'lucide-react'

type Module = 'negocio' | 'hogar'
type Tab = 'resumen' | 'ingresos' | 'egresos' | 'reportes'

export default function FinanzasPage() {
  const [module, setModule] = useState<Module>('negocio')
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date()
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [tab, setTab] = useState<Tab>('resumen')

  const monthMove = (n: number) => {
    const d = new Date(monthCursor)
    d.setMonth(d.getMonth() + n)
    setMonthCursor(d)
  }

  return (
    <div>
      <header className="mb-6">
        <div className="section-label">Contabilidad</div>
        <h1 className="display">Finanzas</h1>
      </header>

      {/* Module toggle */}
      <div className="flex gap-2 mb-5">
        <button
          onClick={() => {
            setModule('negocio')
            setTab('resumen')
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={
            module === 'negocio'
              ? {
                  background: 'var(--pf-gold)',
                  color: 'var(--pf-bg)',
                  border: '1px solid var(--pf-gold)',
                }
              : {
                  background: 'var(--pf-bg2)',
                  color: 'rgba(245,240,232,0.5)',
                  border: '1px solid var(--pf-border)',
                }
          }
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5" />
            <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5" />
            <path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z" />
          </svg>
          Pet Fashion
        </button>
        <button
          onClick={() => {
            setModule('hogar')
            setTab('resumen')
          }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all"
          style={
            module === 'hogar'
              ? {
                  background: 'rgba(99,102,241,0.9)',
                  color: 'white',
                  border: '1px solid rgba(99,102,241,0.9)',
                }
              : {
                  background: 'var(--pf-bg2)',
                  color: 'rgba(245,240,232,0.5)',
                  border: '1px solid var(--pf-border)',
                }
          }
        >
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Hogar
        </button>
      </div>

      {module === 'negocio' ? (
        <NegocioModule monthCursor={monthCursor} monthMove={monthMove} tab={tab} setTab={setTab} />
      ) : (
        <HogarModule monthCursor={monthCursor} monthMove={monthMove} tab={tab} setTab={setTab} />
      )}
    </div>
  )
}

// ── Shared nav ──────────────────────────────────────────────────────────────

function MonthNav({ cursor, onMove }: { cursor: Date; onMove: (n: number) => void }) {
  return (
    <div
      className="flex items-center justify-between mb-4 rounded-xl p-3"
      style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
    >
      <button
        onClick={() => onMove(-1)}
        className="p-1.5 -m-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: 'rgba(245,240,232,0.4)' }}
      >
        <ChevronLeft size={17} />
      </button>
      <p className="text-sm font-bold text-white capitalize">{fmtMonth(cursor)}</p>
      <button
        onClick={() => onMove(1)}
        className="p-1.5 -m-1.5 rounded-lg transition-colors hover:bg-white/5"
        style={{ color: 'rgba(245,240,232,0.4)' }}
      >
        <ChevronRight size={17} />
      </button>
    </div>
  )
}

function TabBar({
  tabs,
  active,
  onSelect,
  accent = 'gold',
}: {
  tabs: string[]
  active: string
  onSelect: (t: string) => void
  accent?: 'gold' | 'indigo'
}) {
  const TAB_LABELS: Record<string, string> = {
    resumen: 'Resumen',
    ingresos: 'Ingresos',
    egresos: 'Egresos',
    reportes: 'Reportes',
  }
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
          {TAB_LABELS[t] || t}
        </button>
      ))}
    </div>
  )
}

// ── Helper: parse date avoiding UTC timezone shift ──────────────────────────
// new Date('2024-04-01') se interpreta como UTC 00:00, que en Chile
// (UTC-4) resulta en el 31 de marzo. Extraemos año/mes directamente.
function parseDateSafe(iso: string): { year: number; month: number } {
  if (iso.length === 10) {
    return {
      year: parseInt(iso.slice(0, 4), 10),
      month: parseInt(iso.slice(5, 7), 10) - 1,
    }
  }
  const d = new Date(iso)
  return { year: d.getFullYear(), month: d.getMonth() }
}

// ── NEGOCIO ─────────────────────────────────────────────────────────────────

function NegocioModule({
  monthCursor,
  monthMove,
  tab,
  setTab,
}: {
  monthCursor: Date
  monthMove: (n: number) => void
  tab: Tab
  setTab: (t: Tab) => void
}) {
  const { appointments, businessExpenses, dogs, setModal } = useApp()

  const inMonth = (iso: string) => {
    const { year, month } = parseDateSafe(iso)
    return year === monthCursor.getFullYear() && month === monthCursor.getMonth()
  }

  const monthIncomes = useMemo(
    () =>
      appointments
        .filter((a) => a.status === 'completada' && inMonth(a.completed_at || a.start_time))
        .sort(
          (a, b) =>
            new Date(b.completed_at || b.start_time).getTime() -
            new Date(a.completed_at || a.start_time).getTime(),
        ),
    [appointments, monthCursor],
  ) // eslint-disable-line react-hooks/exhaustive-deps

  const monthExpenses = useMemo(
    () =>
      businessExpenses
        .filter((e) => inMonth(e.date))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [businessExpenses, monthCursor],
  ) // eslint-disable-line react-hooks/exhaustive-deps

  const totalIn = monthIncomes.reduce((s, a) => s + (a.price || 0), 0)
  const totalOut = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0)
  const balance = totalIn - totalOut

  return (
    <>
      <MonthNav cursor={monthCursor} onMove={monthMove} />

      {/* Balance card */}
      <div
        className="rounded-xl p-5 mb-5"
        style={{
          background: balance >= 0 ? 'var(--pf-bg2)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${balance >= 0 ? 'var(--pf-gold-border)' : 'rgba(239,68,68,0.25)'}`,
        }}
      >
        <div
          className="section-label"
          style={{ color: balance >= 0 ? 'var(--pf-gold)' : '#f87171', marginBottom: '8px' }}
        >
          Balance del mes
        </div>
        <p className="font-display text-4xl font-bold tabular text-white">{fmtCLP(balance)}</p>
        <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1px solid var(--pf-border)' }}>
          <div className="flex-1">
            <div
              className="flex items-center gap-1.5 text-xs font-bold mb-1"
              style={{ color: '#4ade80' }}
            >
              <TrendingUp size={13} /> INGRESOS
            </div>
            <p className="text-lg font-bold tabular text-white">{fmtCLP(totalIn)}</p>
            <p className="text-xs tabular mt-0.5" style={{ color: 'rgba(245,240,232,0.35)' }}>
              {monthIncomes.length} servicios
            </p>
          </div>
          <div className="flex-1 pl-4" style={{ borderLeft: '1px solid var(--pf-border)' }}>
            <div
              className="flex items-center gap-1.5 text-xs font-bold mb-1"
              style={{ color: '#f87171' }}
            >
              <TrendingDown size={13} /> EGRESOS
            </div>
            <p className="text-lg font-bold tabular text-white">{fmtCLP(totalOut)}</p>
            <p className="text-xs tabular mt-0.5" style={{ color: 'rgba(245,240,232,0.35)' }}>
              {monthExpenses.length} registros
            </p>
          </div>
        </div>
      </div>

      <TabBar
        tabs={['resumen', 'ingresos', 'egresos', 'reportes']}
        active={tab}
        onSelect={(t) => setTab(t as Tab)}
      />

      {tab === 'resumen' && (
        <NegocioResumen
          incomes={monthIncomes}
          expenses={monthExpenses}
          totalIn={totalIn}
          totalOut={totalOut}
        />
      )}
      {tab === 'ingresos' && (
        <NegocioIngresos
          incomes={monthIncomes}
          dogs={dogs}
          onSelect={(id) => setModal({ type: 'aptDetail', data: id })}
        />
      )}
      {tab === 'egresos' && (
        <NegocioEgresos
          expenses={monthExpenses}
          onSelect={(e) => setModal({ type: 'businessExpense', data: e })}
        />
      )}
      {tab === 'reportes' && (
        <NegocioReportes appointments={appointments} expenses={businessExpenses} dogs={dogs} />
      )}

      {tab === 'egresos' && (
        <button
          onClick={() => setModal({ type: 'businessExpense', data: null })}
          className="fixed bottom-6 right-6 btn-gold px-5 py-3 rounded-full shadow-lg flex items-center gap-2 z-20"
        >
          <Plus size={16} /> Nuevo egreso
        </button>
      )}
    </>
  )
}

// ── HOGAR ───────────────────────────────────────────────────────────────────

function HogarModule({
  monthCursor,
  monthMove,
  tab,
  setTab,
}: {
  monthCursor: Date
  monthMove: (n: number) => void
  tab: Tab
  setTab: (t: Tab) => void
}) {
  const { homeExpenses, setModal } = useApp()

  const inMonth = (iso: string) => {
    const { year, month } = parseDateSafe(iso)
    return year === monthCursor.getFullYear() && month === monthCursor.getMonth()
  }

  const monthExpenses = useMemo(
    () =>
      homeExpenses
        .filter((e) => inMonth(e.date))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [homeExpenses, monthCursor],
  ) // eslint-disable-line react-hooks/exhaustive-deps

  const totalOut = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <>
      <div
        className="rounded-xl p-3 flex items-center gap-2 mb-4"
        style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.18)' }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a5b4fc"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p className="text-xs font-medium" style={{ color: '#a5b4fc' }}>
          Gastos del hogar — separados del negocio
        </p>
      </div>

      <MonthNav cursor={monthCursor} onMove={monthMove} />

      <div
        className="rounded-xl p-5 mb-5"
        style={{ background: 'var(--pf-bg2)', border: '1px solid rgba(99,102,241,0.25)' }}
      >
        <div className="section-label mb-2" style={{ color: '#a5b4fc' }}>
          Gastos del hogar
        </div>
        <p className="font-display text-4xl font-bold tabular text-white">{fmtCLP(totalOut)}</p>
        <p className="text-xs mt-2 tabular" style={{ color: 'rgba(245,240,232,0.35)' }}>
          {monthExpenses.length} registros este mes
        </p>
      </div>

      <TabBar
        tabs={['resumen', 'egresos']}
        active={tab}
        onSelect={(t) => setTab(t as Tab)}
        accent="indigo"
      />

      {tab === 'resumen' && <HogarResumen expenses={monthExpenses} total={totalOut} />}
      {tab === 'egresos' && (
        <HogarEgresos
          expenses={monthExpenses}
          onSelect={(e) => setModal({ type: 'homeExpense', data: e })}
        />
      )}

      <button
        onClick={() => setModal({ type: 'homeExpense', data: null })}
        className="fixed bottom-6 right-6 px-5 py-3 rounded-full shadow-lg flex items-center gap-2 z-20 font-bold text-sm"
        style={{ background: 'rgba(99,102,241,0.9)', color: 'white' }}
      >
        <Plus size={16} /> Nuevo gasto
      </button>
    </>
  )
}

// ── Negocio sub-tabs ────────────────────────────────────────────────────────

function BarChart({ value, max, color }: { value: number; max: number; color: string }) {
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

function NegocioResumen({
  incomes,
  expenses,
  totalIn,
  totalOut,
}: {
  incomes: ReturnType<typeof useApp>['appointments']
  expenses: ReturnType<typeof useApp>['businessExpenses']
  totalIn: number
  totalOut: number
}) {
  const byService: Record<string, { count: number; total: number }> = {}
  incomes.forEach((a) => {
    const k = a.service
    if (!byService[k]) byService[k] = { count: 0, total: 0 }
    byService[k].count++
    byService[k].total += a.price || 0
  })
  const byCategory: Record<string, number> = {}
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0)
  })

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="section-label">Ingresos por servicio</div>
        {Object.keys(byService).length === 0 ? (
          <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
            Sin servicios este mes
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(byService)
              .sort((a, b) => b[1].total - a[1].total)
              .map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="font-medium text-white">
                      {SERVICES[k as keyof typeof SERVICES]?.label || k}
                    </span>
                    <span className="tabular" style={{ color: 'var(--pf-gold-l)' }}>
                      {fmtCLP(v.total)}{' '}
                      <span style={{ color: 'rgba(245,240,232,0.3)' }}>· {v.count}</span>
                    </span>
                  </div>
                  <BarChart value={v.total} max={totalIn} color="var(--pf-gold)" />
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-label">Egresos por categoría</div>
        {Object.keys(byCategory).length === 0 ? (
          <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
            Sin egresos este mes
          </p>
        ) : (
          <div className="space-y-3">
            {Object.entries(byCategory)
              .sort((a, b) => b[1] - a[1])
              .map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-0.5">
                    <span className="font-medium text-white">
                      {BUSINESS_CATEGORIES[k as keyof typeof BUSINESS_CATEGORIES]?.label || k}
                    </span>
                    <span className="tabular" style={{ color: '#f87171' }}>
                      {fmtCLP(v)}
                    </span>
                  </div>
                  <BarChart value={v} max={totalOut} color="#f87171" />
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}

function NegocioIngresos({
  incomes,
  dogs,
  onSelect,
}: {
  incomes: ReturnType<typeof useApp>['appointments']
  dogs: ReturnType<typeof useApp>['dogs']
  onSelect: (id: string) => void
}) {
  if (incomes.length === 0)
    return (
      <EmptyState
        icon={<TrendingUp size={32} strokeWidth={1.5} />}
        text="Sin ingresos este mes"
        subtext="Los ingresos se registran al completar una cita"
      />
    )
  return (
    <div className="space-y-2">
      {incomes.map((a) => {
        const dog = dogs.find((d) => d.id === a.dog_id)
        const name = a.client_name || dog?.name || 'Cliente'
        return (
          <button
            key={a.id}
            onClick={() => onSelect(a.id)}
            className="w-full rounded-xl p-3 text-left transition-all flex items-center gap-3"
            style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--pf-gold-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pf-border)')}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
              style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
            >
              <TrendingUp size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-white">{name}</p>
              <p className="text-xs" style={{ color: 'rgba(245,240,232,0.4)' }}>
                {SERVICES[a.service]?.label} · {fmtDateShort(a.completed_at || a.start_time)}
              </p>
            </div>
            <p className="font-bold tabular text-sm shrink-0" style={{ color: '#4ade80' }}>
              +{fmtCLP(a.price)}
            </p>
          </button>
        )
      })}
    </div>
  )
}

function NegocioEgresos({
  expenses,
  onSelect,
}: {
  expenses: ReturnType<typeof useApp>['businessExpenses']
  onSelect: (e: ReturnType<typeof useApp>['businessExpenses'][0]) => void
}) {
  if (expenses.length === 0)
    return (
      <EmptyState
        icon={<TrendingDown size={32} strokeWidth={1.5} />}
        text="Sin egresos este mes"
        subtext="Toca + para registrar uno"
      />
    )
  return (
    <div className="space-y-2 pb-20">
      {expenses.map((e) => (
        <button
          key={e.id}
          onClick={() => onSelect(e)}
          className="w-full rounded-xl p-3 text-left transition-all flex items-center gap-3"
          style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
          onMouseEnter={(ev) => (ev.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)')}
          onMouseLeave={(ev) => (ev.currentTarget.style.borderColor = 'var(--pf-border)')}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171' }}
          >
            <TrendingDown size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-white">
              {BUSINESS_CATEGORIES[e.category as keyof typeof BUSINESS_CATEGORIES]?.label ||
                e.category}
            </p>
            <p className="text-xs truncate" style={{ color: 'rgba(245,240,232,0.4)' }}>
              {e.description || fmtDateShort(e.date)}
            </p>
          </div>
          <p className="font-bold tabular text-sm shrink-0" style={{ color: '#f87171' }}>
            −{fmtCLP(e.amount)}
          </p>
        </button>
      ))}
    </div>
  )
}

function NegocioReportes({
  appointments,
  expenses,
  dogs,
}: {
  appointments: ReturnType<typeof useApp>['appointments']
  expenses: ReturnType<typeof useApp>['businessExpenses']
  dogs: ReturnType<typeof useApp>['dogs']
}) {
  const completed = appointments.filter((a) => a.status === 'completada')

  const svcCount: Record<string, number> = {}
  completed.forEach((a) => {
    svcCount[a.service] = (svcCount[a.service] || 0) + 1
  })
  const topSvc = Object.entries(svcCount).sort((a, b) => b[1] - a[1])[0]

  const clientCount: Record<string, number> = {}
  completed.forEach((a) => {
    const k = a.dog_id || a.client_name
    if (!k) return
    clientCount[k] = (clientCount[k] || 0) + 1
  })
  const topClients = Object.entries(clientCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const monthly: Record<string, { in: number; out: number }> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    monthly[key] = { in: 0, out: 0 }
  }
  completed.forEach((a) => {
    const d = new Date(a.completed_at || a.start_time)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`
    if (monthly[key] !== undefined) monthly[key].in += a.price || 0
  })
  expenses.forEach((e) => {
    // Use parseDateSafe to avoid timezone issues in the reports chart
    const { year, month } = parseDateSafe(e.date)
    const key = `${year}-${String(month).padStart(2, '0')}`
    if (monthly[key] !== undefined) monthly[key].out += e.amount || 0
  })

  const months = [
    'Ene',
    'Feb',
    'Mar',
    'Abr',
    'May',
    'Jun',
    'Jul',
    'Ago',
    'Sep',
    'Oct',
    'Nov',
    'Dic',
  ]
  const last6 = Object.entries(monthly).map(([key, v]) => {
    const month = parseInt(key.split('-')[1])
    return { label: months[month], ...v }
  })
  const maxVal = Math.max(...last6.map((m) => Math.max(m.in, m.out)), 1)
  const avgNet = last6.slice(0, 5).reduce((s, m) => s + (m.in - m.out), 0) / 5

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="section-label">Servicio más vendido</div>
        {topSvc ? (
          <div className="flex items-center justify-between">
            <p className="font-bold text-lg text-white">
              {SERVICES[topSvc[0] as keyof typeof SERVICES]?.label}
            </p>
            <span className="badge badge-gold">{topSvc[1]} servicios</span>
          </div>
        ) : (
          <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
            Aún sin datos
          </p>
        )}
      </div>

      <div className="card">
        <div className="section-label">Top clientes</div>
        {topClients.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
            Aún sin datos
          </p>
        ) : (
          <div className="space-y-2.5">
            {topClients.map(([k, count], i) => {
              const dog = dogs.find((d) => d.id === k)
              const name = dog?.name || k
              return (
                <div key={k} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold tabular"
                    style={{ background: 'rgba(201,146,42,0.1)', color: 'var(--pf-gold)' }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 font-medium text-sm text-white truncate">{name}</span>
                  <span
                    className="text-xs tabular shrink-0"
                    style={{ color: 'rgba(245,240,232,0.4)' }}
                  >
                    {count} visitas
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="card">
        <div className="section-label">Últimos 6 meses</div>
        <div className="flex items-end gap-1.5 h-24 mb-2">
          {last6.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-px">
              <div
                className="rounded-sm transition-all"
                style={{
                  height: `${(m.in / maxVal) * 100}%`,
                  minHeight: m.in > 0 ? '2px' : '0',
                  background: 'var(--pf-gold)',
                }}
              />
              <div
                className="rounded-sm transition-all"
                style={{
                  height: `${(m.out / maxVal) * 100}%`,
                  minHeight: m.out > 0 ? '2px' : '0',
                  background: '#f87171',
                }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5 mb-3">
          {last6.map((m, i) => (
            <div
              key={i}
              className="flex-1 text-center text-[10px]"
              style={{ color: 'rgba(245,240,232,0.3)' }}
            >
              {m.label}
            </div>
          ))}
        </div>
        <div className="flex gap-4 text-xs" style={{ color: 'rgba(245,240,232,0.45)' }}>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: 'var(--pf-gold)' }}
            />{' '}
            Ingresos
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-sm inline-block"
              style={{ background: '#f87171' }}
            />{' '}
            Egresos
          </span>
        </div>
      </div>

      <div className="card">
        <div className="section-label">Proyección este mes</div>
        <p className="text-xs mb-1" style={{ color: 'rgba(245,240,232,0.35)' }}>
          Promedio neto de los últimos 5 meses
        </p>
        <p
          className={`font-display text-2xl font-bold tabular ${avgNet >= 0 ? 'text-white' : 'text-red-400'}`}
        >
          {fmtCLP(avgNet)}
        </p>
      </div>
    </div>
  )
}

// ── Hogar sub-tabs ──────────────────────────────────────────────────────────

function HogarResumen({
  expenses,
  total,
}: {
  expenses: ReturnType<typeof useApp>['homeExpenses']
  total: number
}) {
  const byCategory: Record<string, number> = {}
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0)
  })

  return (
    <div className="card">
      <div className="section-label">Gastos por categoría</div>
      {Object.keys(byCategory).length === 0 ? (
        <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
          Sin gastos registrados este mes
        </p>
      ) : (
        <div className="space-y-3">
          {Object.entries(byCategory)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => (
              <div key={k}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="font-medium text-white">
                    {HOME_CATEGORIES[k as keyof typeof HOME_CATEGORIES]?.label || k}
                  </span>
                  <span className="tabular" style={{ color: '#a5b4fc' }}>
                    {fmtCLP(v)}
                  </span>
                </div>
                <BarChart value={v} max={total} color="#6366f1" />
              </div>
            ))}
        </div>
      )}
    </div>
  )
}

function HogarEgresos({
  expenses,
  onSelect,
}: {
  expenses: ReturnType<typeof useApp>['homeExpenses']
  onSelect: (e: ReturnType<typeof useApp>['homeExpenses'][0]) => void
}) {
  if (expenses.length === 0)
    return (
      <EmptyState
        icon={<TrendingDown size={32} strokeWidth={1.5} />}
        text="Sin gastos este mes"
        subtext="Toca + para registrar uno"
      />
    )
  return (
    <div className="space-y-2 pb-20">
      {expenses.map((e) => (
        <button
          key={e.id}
          onClick={() => onSelect(e)}
          className="w-full rounded-xl p-3 text-left transition-all flex items-center gap-3"
          style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
          onMouseEnter={(ev) => (ev.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)')}
          onMouseLeave={(ev) => (ev.currentTarget.style.borderColor = 'var(--pf-border)')}
        >
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(99,102,241,0.08)', color: '#a5b4fc' }}
          >
            <TrendingDown size={15} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate text-white">
              {HOME_CATEGORIES[e.category as keyof typeof HOME_CATEGORIES]?.label || e.category}
            </p>
            <p className="text-xs truncate" style={{ color: 'rgba(245,240,232,0.4)' }}>
              {e.description || fmtDateShort(e.date)}
            </p>
          </div>
          <p className="font-bold tabular text-sm shrink-0" style={{ color: '#a5b4fc' }}>
            −{fmtCLP(e.amount)}
          </p>
        </button>
      ))}
    </div>
  )
}
