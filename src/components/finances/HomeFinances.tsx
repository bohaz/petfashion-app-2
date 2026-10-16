'use client'

import { Plus, TrendingDown } from 'lucide-react'
import { useApp } from '@/components/AppProvider'
import { EmptyState } from '@/components/ui'
import { HOME_CATEGORIES } from '@/lib/constants'
import { expensesByCategory, expensesInMonth, totalExpenses } from '@/lib/finance'
import { fmtCLP, fmtDateShort } from '@/lib/utils'
import type { HomeExpense } from '@/lib/types'
import { BarChart, MonthNav, TabBar, type FinanceTab } from './FinanceControls'

/** Household expenses, kept apart from the business. */
export function HomeFinances({
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
  const { homeExpenses, setModal } = useApp()

  const monthExpenses = expensesInMonth(homeExpenses, monthCursor)
  const totalOut = totalExpenses(monthExpenses)

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

      <TabBar tabs={['resumen', 'egresos']} active={tab} onSelect={setTab} accent="indigo" />

      {tab === 'resumen' && <HomeSummary expenses={monthExpenses} total={totalOut} />}
      {tab === 'egresos' && (
        <HomeExpenses
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

function HomeSummary({ expenses, total }: { expenses: HomeExpense[]; total: number }) {
  const byCategory = expensesByCategory(expenses)

  return (
    <div className="card">
      <div className="section-label">Gastos por categoría</div>
      {byCategory.length === 0 ? (
        <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
          Sin gastos registrados este mes
        </p>
      ) : (
        <div className="space-y-3">
          {byCategory.map(({ category, total: categoryTotal }) => (
            <div key={category}>
              <div className="flex justify-between text-sm mb-0.5">
                <span className="font-medium text-white">
                  {HOME_CATEGORIES[category as keyof typeof HOME_CATEGORIES]?.label || category}
                </span>
                <span className="tabular" style={{ color: '#a5b4fc' }}>
                  {fmtCLP(categoryTotal)}
                </span>
              </div>
              <BarChart value={categoryTotal} max={total} color="#6366f1" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function HomeExpenses({
  expenses,
  onSelect,
}: {
  expenses: HomeExpense[]
  onSelect: (e: HomeExpense) => void
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
