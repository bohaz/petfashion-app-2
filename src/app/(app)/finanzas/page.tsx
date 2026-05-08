'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/components/AppProvider'
import { Section, EmptyState } from '@/components/ui'
import { BUSINESS_CATEGORIES, HOME_CATEGORIES, SERVICES } from '@/lib/constants'
import { fmtCLP, fmtDateShort, fmtMonth } from '@/lib/utils'
import { TrendingUp, TrendingDown, Plus, ChevronLeft, ChevronRight, DollarSign } from 'lucide-react'

type Module = 'negocio' | 'hogar'
type Tab = 'resumen' | 'ingresos' | 'egresos' | 'reportes'

export default function FinanzasPage() {
  const [module, setModule] = useState<Module>('negocio')
  const [monthCursor, setMonthCursor] = useState(() => {
    const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d
  })
  const [tab, setTab] = useState<Tab>('resumen')

  const monthMove = (n: number) => {
    const d = new Date(monthCursor); d.setMonth(d.getMonth() + n); setMonthCursor(d)
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-extrabold mb-4">Finanzas</h1>

      {/* Module toggle — Negocio / Hogar */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => { setModule('negocio'); setTab('resumen') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition border ${
            module === 'negocio'
              ? 'bg-stone-900 text-white border-stone-900'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
          }`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/>
            <path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/>
            <path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z"/>
          </svg>
          Pet Fashion
        </button>
        <button onClick={() => { setModule('hogar'); setTab('resumen') }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition border ${
            module === 'hogar'
              ? 'bg-indigo-700 text-white border-indigo-700'
              : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
          }`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          Hogar
        </button>
      </div>

      {module === 'negocio'
        ? <NegocioModule monthCursor={monthCursor} monthMove={monthMove} tab={tab} setTab={setTab} />
        : <HogarModule monthCursor={monthCursor} monthMove={monthMove} tab={tab} setTab={setTab} />
      }
    </div>
  )
}

// ── NEGOCIO MODULE ────────────────────────────────────────────

function NegocioModule({ monthCursor, monthMove, tab, setTab }: {
  monthCursor: Date; monthMove: (n: number) => void; tab: Tab; setTab: (t: Tab) => void
}) {
  const { appointments, businessExpenses, dogs, setModal } = useApp()

  const inMonth = (iso: string) => {
    const d = new Date(iso)
    return d.getFullYear() === monthCursor.getFullYear() && d.getMonth() === monthCursor.getMonth()
  }

  const monthIncomes = useMemo(() =>
    appointments
      .filter(a => a.status === 'completada' && inMonth(a.completed_at || a.start_time))
      .sort((a, b) => new Date(b.completed_at || b.start_time).getTime() - new Date(a.completed_at || a.start_time).getTime()),
    [appointments, monthCursor]) // eslint-disable-line react-hooks/exhaustive-deps

  const monthExpenses = useMemo(() =>
    businessExpenses
      .filter(e => inMonth(e.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [businessExpenses, monthCursor]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalIn  = monthIncomes.reduce((s, a) => s + (a.price || 0), 0)
  const totalOut = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0)
  const balance  = totalIn - totalOut

  return (
    <>
      <MonthNav cursor={monthCursor} onMove={monthMove} />
      <BalanceCard balance={balance} totalIn={totalIn} totalOut={totalOut}
        inCount={monthIncomes.length} outCount={monthExpenses.length} color="stone" />

      <TabBar tabs={['resumen','ingresos','egresos','reportes']} active={tab} onSelect={t => setTab(t as Tab)} />

      {tab === 'resumen' && <NegocioResumen incomes={monthIncomes} expenses={monthExpenses} />}
      {tab === 'ingresos' && <NegocioIngresos incomes={monthIncomes} dogs={dogs} onSelect={id => setModal({ type: 'aptDetail', data: id })} />}
      {tab === 'egresos' && <NegocioEgresos expenses={monthExpenses} onSelect={e => setModal({ type: 'businessExpense', data: e })} />}
      {tab === 'reportes' && <NegocioReportes appointments={appointments} expenses={businessExpenses} dogs={dogs} />}

      {tab === 'egresos' && (
        <button onClick={() => setModal({ type: 'businessExpense', data: null })}
          className="fixed bottom-24 right-4 bg-stone-900 text-white px-5 py-3.5 rounded-full shadow-lg flex items-center gap-2 font-semibold text-sm z-20">
          <Plus size={18} /> Nuevo egreso
        </button>
      )}
    </>
  )
}

// ── HOGAR MODULE ──────────────────────────────────────────────

function HogarModule({ monthCursor, monthMove, tab, setTab }: {
  monthCursor: Date; monthMove: (n: number) => void; tab: Tab; setTab: (t: Tab) => void
}) {
  const { homeExpenses, setModal } = useApp()

  const inMonth = (iso: string) => {
    const d = new Date(iso)
    return d.getFullYear() === monthCursor.getFullYear() && d.getMonth() === monthCursor.getMonth()
  }

  const monthExpenses = useMemo(() =>
    homeExpenses
      .filter(e => inMonth(e.date))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [homeExpenses, monthCursor]) // eslint-disable-line react-hooks/exhaustive-deps

  const totalOut = monthExpenses.reduce((s, e) => s + (e.amount || 0), 0)

  return (
    <>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 flex items-center gap-2 mb-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <p className="text-xs text-indigo-800 font-medium">Gastos del hogar — completamente separados del negocio</p>
      </div>

      <MonthNav cursor={monthCursor} onMove={monthMove} />

      {/* Home balance card */}
      <div className="bg-indigo-700 text-white rounded-2xl p-5 mb-5">
        <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">Gastos del hogar</p>
        <p className="text-4xl font-extrabold tabular mt-1">{fmtCLP(totalOut)}</p>
        <p className="text-white/70 text-xs mt-2 tabular">{monthExpenses.length} registros este mes</p>
      </div>

      <TabBar tabs={['resumen','egresos']} active={tab} onSelect={t => setTab(t as Tab)} color="indigo" />

      {tab === 'resumen' && <HogarResumen expenses={monthExpenses} />}
      {tab === 'egresos' && <HogarEgresos expenses={monthExpenses} onSelect={e => setModal({ type: 'homeExpense', data: e })} />}

      <button onClick={() => setModal({ type: 'homeExpense', data: null })}
        className="fixed bottom-24 right-4 bg-indigo-700 text-white px-5 py-3.5 rounded-full shadow-lg flex items-center gap-2 font-semibold text-sm z-20">
        <Plus size={18} /> Nuevo gasto
      </button>
    </>
  )
}

// ── Shared sub-components ─────────────────────────────────────

function MonthNav({ cursor, onMove }: { cursor: Date; onMove: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl p-3 mb-4">
      <button onClick={() => onMove(-1)} className="p-1.5 -m-1.5 rounded-lg hover:bg-stone-100"><ChevronLeft size={18} /></button>
      <p className="text-sm font-bold capitalize">{fmtMonth(cursor)}</p>
      <button onClick={() => onMove(1)} className="p-1.5 -m-1.5 rounded-lg hover:bg-stone-100"><ChevronRight size={18} /></button>
    </div>
  )
}

function BalanceCard({ balance, totalIn, totalOut, inCount, outCount, color }: {
  balance: number; totalIn: number; totalOut: number; inCount: number; outCount: number; color: 'stone' | 'indigo'
}) {
  return (
    <div className={`rounded-2xl p-5 mb-5 ${balance >= 0 ? (color === 'stone' ? 'bg-stone-900' : 'bg-indigo-700') : 'bg-red-700'} text-white`}>
      <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">Balance del mes</p>
      <p className="text-4xl font-extrabold tabular mt-1">{fmtCLP(balance)}</p>
      <div className="flex gap-4 mt-4 pt-4 border-t border-white/15">
        <div className="flex-1">
          <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-semibold mb-1">
            <TrendingUp size={14} /> INGRESOS
          </div>
          <p className="text-lg font-extrabold tabular">{fmtCLP(totalIn)}</p>
          <p className="text-[10px] text-white/60 tabular mt-0.5">{inCount} servicios</p>
        </div>
        <div className="flex-1 border-l border-white/15 pl-4">
          <div className="flex items-center gap-1.5 text-red-300 text-xs font-semibold mb-1">
            <TrendingDown size={14} /> EGRESOS
          </div>
          <p className="text-lg font-extrabold tabular">{fmtCLP(totalOut)}</p>
          <p className="text-[10px] text-white/60 tabular mt-0.5">{outCount} registros</p>
        </div>
      </div>
    </div>
  )
}

function TabBar({ tabs, active, onSelect, color = 'stone' }: {
  tabs: string[]; active: string; onSelect: (t: string) => void; color?: 'stone' | 'indigo'
}) {
  const TAB_LABELS: Record<string, string> = {
    resumen: 'Resumen', ingresos: 'Ingresos', egresos: 'Egresos', reportes: 'Reportes'
  }
  return (
    <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-4">
      {tabs.map(t => (
        <button key={t} onClick={() => onSelect(t)}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
            active === t
              ? `bg-white shadow-sm ${color === 'indigo' ? 'text-indigo-700' : 'text-stone-900'}`
              : 'text-stone-600'
          }`}>
          {TAB_LABELS[t] || t}
        </button>
      ))}
    </div>
  )
}

// ── Negocio sub-tabs ──────────────────────────────────────────

function NegocioResumen({ incomes, expenses }: { incomes: ReturnType<typeof useApp>['appointments']; expenses: ReturnType<typeof useApp>['businessExpenses'] }) {
  const totalIn = incomes.reduce((s, a) => s + (a.price || 0), 0)
  const totalOut = expenses.reduce((s, e) => s + (e.amount || 0), 0)

  const byService: Record<string, { count: number; total: number }> = {}
  incomes.forEach(a => {
    const k = a.service; if (!byService[k]) byService[k] = { count: 0, total: 0 }
    byService[k].count++; byService[k].total += a.price || 0
  })
  const byCategory: Record<string, number> = {}
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0) })

  return (
    <div className="space-y-4">
      <Section title="Ingresos por servicio">
        {Object.keys(byService).length === 0 ? <p className="text-sm text-stone-500 italic">Sin servicios este mes</p> : (
          <div className="space-y-2">
            {Object.entries(byService).sort((a,b) => b[1].total - a[1].total).map(([k, v]) => {
              const pct = totalIn > 0 ? (v.total / totalIn) * 100 : 0
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{SERVICES[k as keyof typeof SERVICES]?.label || k}</span>
                    <span className="tabular text-stone-600">{fmtCLP(v.total)} <span className="text-stone-400 text-xs">· {v.count}</span></span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>
      <Section title="Egresos por categoría">
        {Object.keys(byCategory).length === 0 ? <p className="text-sm text-stone-500 italic">Sin egresos este mes</p> : (
          <div className="space-y-2">
            {Object.entries(byCategory).sort((a,b) => b[1] - a[1]).map(([k, v]) => {
              const pct = totalOut > 0 ? (v / totalOut) * 100 : 0
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{BUSINESS_CATEGORIES[k as keyof typeof BUSINESS_CATEGORIES]?.label || k}</span>
                    <span className="tabular text-stone-600">{fmtCLP(v)}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-stone-700 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Section>
    </div>
  )
}

function NegocioIngresos({ incomes, dogs, onSelect }: {
  incomes: ReturnType<typeof useApp>['appointments']
  dogs: ReturnType<typeof useApp>['dogs']
  onSelect: (id: string) => void
}) {
  if (incomes.length === 0) return (
    <EmptyState icon={<DollarSign size={32} strokeWidth={1.5} />} text="Sin ingresos este mes"
      subtext="Los ingresos se registran al completar una cita" />
  )
  return (
    <div className="space-y-2">
      {incomes.map(a => {
        const dog = dogs.find(d => d.id === a.dog_id)
        const name = a.client_name || dog?.name || 'Cliente'
        return (
          <button key={a.id} onClick={() => onSelect(a.id)}
            className="w-full bg-white border border-stone-200 rounded-xl p-3 text-left hover:border-stone-300 transition flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{name}</p>
              <p className="text-xs text-stone-500">{SERVICES[a.service]?.label} · {fmtDateShort(a.completed_at || a.start_time)}</p>
            </div>
            <p className="font-bold text-emerald-700 tabular text-sm shrink-0">+{fmtCLP(a.price)}</p>
          </button>
        )
      })}
    </div>
  )
}

function NegocioEgresos({ expenses, onSelect }: {
  expenses: ReturnType<typeof useApp>['businessExpenses']
  onSelect: (e: ReturnType<typeof useApp>['businessExpenses'][0]) => void
}) {
  if (expenses.length === 0) return (
    <EmptyState icon={<DollarSign size={32} strokeWidth={1.5} />} text="Sin egresos este mes" subtext="Toca + para registrar uno" />
  )
  return (
    <div className="space-y-2 pb-20">
      {expenses.map(e => (
        <button key={e.id} onClick={() => onSelect(e)}
          className="w-full bg-white border border-stone-200 rounded-xl p-3 text-left hover:border-stone-300 transition flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 text-red-700 rounded-full flex items-center justify-center shrink-0">
            <TrendingDown size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{BUSINESS_CATEGORIES[e.category as keyof typeof BUSINESS_CATEGORIES]?.label || e.category}</p>
            <p className="text-xs text-stone-500 truncate">{e.description || fmtDateShort(e.date)}</p>
          </div>
          <p className="font-bold text-red-700 tabular text-sm shrink-0">−{fmtCLP(e.amount)}</p>
        </button>
      ))}
    </div>
  )
}

function NegocioReportes({ appointments, expenses, dogs }: {
  appointments: ReturnType<typeof useApp>['appointments']
  expenses: ReturnType<typeof useApp>['businessExpenses']
  dogs: ReturnType<typeof useApp>['dogs']
}) {
  const completed = appointments.filter(a => a.status === 'completada')

  // Top service
  const svcCount: Record<string, number> = {}
  completed.forEach(a => { svcCount[a.service] = (svcCount[a.service] || 0) + 1 })
  const topSvc = Object.entries(svcCount).sort((a,b) => b[1] - a[1])[0]

  // Top clients
  const clientCount: Record<string, number> = {}
  completed.forEach(a => {
    const k = a.dog_id || a.client_name; if (!k) return
    clientCount[k] = (clientCount[k] || 0) + 1
  })
  const topClients = Object.entries(clientCount).sort((a,b) => b[1] - a[1]).slice(0, 5)

  // Last 6 months
  const monthly: Record<string, { in: number; out: number }> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`
    monthly[key] = { in: 0, out: 0 }
  }
  completed.forEach(a => {
    const d = new Date(a.completed_at || a.start_time)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`
    if (monthly[key] !== undefined) monthly[key].in += a.price || 0
  })
  expenses.forEach(e => {
    const d = new Date(e.date)
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2,'0')}`
    if (monthly[key] !== undefined) monthly[key].out += e.amount || 0
  })

  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
  const last6 = Object.entries(monthly).map(([key, v]) => {
    const month = parseInt(key.split('-')[1])
    return { label: months[month], ...v }
  })
  const maxVal = Math.max(...last6.map(m => Math.max(m.in, m.out)), 1)
  const avgNet = last6.slice(0, 5).reduce((s, m) => s + (m.in - m.out), 0) / 5

  return (
    <div className="space-y-4">
      <Section title="Servicio más vendido">
        {topSvc ? (
          <div className="flex items-center justify-between">
            <p className="font-bold text-lg">{SERVICES[topSvc[0] as keyof typeof SERVICES]?.label}</p>
            <p className="tabular text-stone-600">{topSvc[1]} servicios</p>
          </div>
        ) : <p className="text-sm text-stone-500 italic">Aún sin datos</p>}
      </Section>

      <Section title="Top clientes">
        {topClients.length === 0 ? <p className="text-sm text-stone-500 italic">Aún sin datos</p> : (
          <div className="space-y-2">
            {topClients.map(([k, count], i) => {
              const dog = dogs.find(d => d.id === k)
              const name = dog?.name || k
              return (
                <div key={k} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-stone-100 rounded-full flex items-center justify-center text-xs font-bold tabular">{i+1}</span>
                  <span className="flex-1 font-semibold text-sm truncate">{name}</span>
                  <span className="text-xs text-stone-600 tabular shrink-0">{count} visitas</span>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      <Section title="Últimos 6 meses">
        <div className="flex items-end gap-1.5 h-28 mb-2">
          {last6.map((m, i) => (
            <div key={i} className="flex-1 flex flex-col justify-end gap-0.5">
              <div className="bg-emerald-500 rounded-t transition-all" style={{ height: `${(m.in / maxVal) * 100}%`, minHeight: m.in > 0 ? '2px' : '0' }} />
              <div className="bg-red-400 rounded-b transition-all" style={{ height: `${(m.out / maxVal) * 100}%`, minHeight: m.out > 0 ? '2px' : '0' }} />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          {last6.map((m, i) => (
            <div key={i} className="flex-1 text-center text-[10px] text-stone-500 font-semibold">{m.label}</div>
          ))}
        </div>
        <div className="flex gap-4 mt-3 text-xs">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded inline-block" /> Ingresos</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-400 rounded inline-block" /> Egresos</span>
        </div>
      </Section>

      <Section title="Proyección este mes">
        <p className="text-xs text-stone-500 mb-1">Promedio neto de los últimos 5 meses</p>
        <p className={`font-bold text-xl tabular ${avgNet >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{fmtCLP(avgNet)}</p>
      </Section>
    </div>
  )
}

// ── Hogar sub-tabs ────────────────────────────────────────────

function HogarResumen({ expenses }: { expenses: ReturnType<typeof useApp>['homeExpenses'] }) {
  const total = expenses.reduce((s, e) => s + (e.amount || 0), 0)
  const byCategory: Record<string, number> = {}
  expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + (e.amount || 0) })

  return (
    <Section title="Gastos por categoría">
      {Object.keys(byCategory).length === 0 ? <p className="text-sm text-stone-500 italic">Sin gastos registrados este mes</p> : (
        <div className="space-y-2">
          {Object.entries(byCategory).sort((a,b) => b[1] - a[1]).map(([k, v]) => {
            const pct = total > 0 ? (v / total) * 100 : 0
            return (
              <div key={k}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold">{HOME_CATEGORIES[k as keyof typeof HOME_CATEGORIES]?.label || k}</span>
                  <span className="tabular text-stone-600">{fmtCLP(v)}</span>
                </div>
                <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

function HogarEgresos({ expenses, onSelect }: {
  expenses: ReturnType<typeof useApp>['homeExpenses']
  onSelect: (e: ReturnType<typeof useApp>['homeExpenses'][0]) => void
}) {
  if (expenses.length === 0) return (
    <EmptyState icon={<DollarSign size={32} strokeWidth={1.5} />} text="Sin gastos este mes" subtext="Toca + para registrar uno" />
  )
  return (
    <div className="space-y-2 pb-20">
      {expenses.map(e => (
        <button key={e.id} onClick={() => onSelect(e)}
          className="w-full bg-white border border-stone-200 rounded-xl p-3 text-left hover:border-stone-300 transition flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center shrink-0">
            <TrendingDown size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{HOME_CATEGORIES[e.category as keyof typeof HOME_CATEGORIES]?.label || e.category}</p>
            <p className="text-xs text-stone-500 truncate">{e.description || fmtDateShort(e.date)}</p>
          </div>
          <p className="font-bold text-indigo-700 tabular text-sm shrink-0">−{fmtCLP(e.amount)}</p>
        </button>
      ))}
    </div>
  )
}
