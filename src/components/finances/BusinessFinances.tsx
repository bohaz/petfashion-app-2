'use client'

import { Plus, TrendingDown, TrendingUp } from 'lucide-react'
import { useApp } from '@/components/AppProvider'
import { EmptyState } from '@/components/ui'
import { BUSINESS_CATEGORIES, SERVICES } from '@/lib/constants'
import {
  expensesByCategory,
  expensesInMonth,
  incomeByService,
  incomeDate,
  incomesInMonth,
  totalExpenses,
  totalIncome,
} from '@/lib/finance'
import { fmtCLP, fmtDateShort } from '@/lib/utils'
import type { Appointment, BusinessExpense, Dog } from '@/lib/types'
import { BarChart, MonthNav, TabBar, type FinanceTab } from './FinanceControls'
import { BusinessReports } from './BusinessReports'

export function BusinessFinances({
  monthCursor,
  monthMove,
  tab,
  setTab,
}: {
  monthCursor: Date
  monthMove: (n: number) => void
  tab: FinanceTab
  setTab: (t: FinanceTab) => void
}) {
  const { appointments, businessExpenses, dogs, setModal } = useApp()

  const monthIncomes = incomesInMonth(appointments, monthCursor)
  const monthExpenses = expensesInMonth(businessExpenses, monthCursor)
  const totalIn = totalIncome(monthIncomes)
  const totalOut = totalExpenses(monthExpenses)
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
        onSelect={setTab}
      />

      {tab === 'resumen' && (
        <BusinessSummary
          incomes={monthIncomes}
          expenses={monthExpenses}
          totalIn={totalIn}
          totalOut={totalOut}
        />
      )}
      {tab === 'ingresos' && (
        <BusinessIncomes
          incomes={monthIncomes}
          dogs={dogs}
          onSelect={(id) => setModal({ type: 'aptDetail', data: id })}
        />
      )}
      {tab === 'egresos' && (
        <BusinessExpenses
          expenses={monthExpenses}
          onSelect={(e) => setModal({ type: 'businessExpense', data: e })}
        />
      )}
      {tab === 'reportes' && (
        <BusinessReports appointments={appointments} expenses={businessExpenses} dogs={dogs} />
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

function BusinessSummary({
  incomes,
  expenses,
  totalIn,
  totalOut,
}: {
  incomes: Appointment[]
  expenses: BusinessExpense[]
  totalIn: number
  totalOut: number
}) {
  const byService = incomeByService(incomes)
  const byCategory = expensesByCategory(expenses)

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="section-label">Ingresos por servicio</div>
        {byService.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
            Sin servicios este mes
          </p>
        ) : (
          <div className="space-y-3">
            {byService.map((v) => (
              <div key={v.service}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="font-medium text-white">
                    {SERVICES[v.service]?.label || v.service}
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
        {byCategory.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
            Sin egresos este mes
          </p>
        ) : (
          <div className="space-y-3">
            {byCategory.map(({ category, total }) => (
              <div key={category}>
                <div className="flex justify-between text-sm mb-0.5">
                  <span className="font-medium text-white">
                    {BUSINESS_CATEGORIES[category as keyof typeof BUSINESS_CATEGORIES]?.label ||
                      category}
                  </span>
                  <span className="tabular" style={{ color: '#f87171' }}>
                    {fmtCLP(total)}
                  </span>
                </div>
                <BarChart value={total} max={totalOut} color="#f87171" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BusinessIncomes({
  incomes,
  dogs,
  onSelect,
}: {
  incomes: Appointment[]
  dogs: Dog[]
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
                {SERVICES[a.service]?.label} · {fmtDateShort(incomeDate(a))}
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

function BusinessExpenses({
  expenses,
  onSelect,
}: {
  expenses: BusinessExpense[]
  onSelect: (e: BusinessExpense) => void
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
