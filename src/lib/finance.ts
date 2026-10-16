import { parseDate } from './utils'
import type { Appointment, ServiceKey } from './types'

interface Expense {
  date: string
  category: string
  amount: number
}

// ── Months ────────────────────────────────────────────────────

export interface YearMonth {
  year: number
  /** 0-based, like Date#getMonth */
  month: number
}

export const monthOf = (value: string | Date): YearMonth => {
  const d = parseDate(value)
  return { year: d.getFullYear(), month: d.getMonth() }
}

export const isInMonth = (value: string | Date, cursor: Date): boolean => {
  const { year, month } = monthOf(value)
  return year === cursor.getFullYear() && month === cursor.getMonth()
}

/** First day of the month `offset` months away from `date`, at local midnight. */
export const startOfMonth = (date: Date, offset = 0): Date =>
  new Date(date.getFullYear(), date.getMonth() + offset, 1)

// ── Selections ────────────────────────────────────────────────

/** When the income was earned: completion time, or the appointment time for older records. */
export const incomeDate = (a: Appointment): string => a.completed_at || a.start_time

const newestFirst = (a: string, b: string) => parseDate(b).getTime() - parseDate(a).getTime()

/** Completed appointments whose income falls in the cursor's month, newest first. */
export function incomesInMonth(appointments: Appointment[], cursor: Date): Appointment[] {
  return appointments
    .filter((a) => a.status === 'completada' && isInMonth(incomeDate(a), cursor))
    .sort((a, b) => newestFirst(incomeDate(a), incomeDate(b)))
}

export function expensesInMonth<T extends Expense>(expenses: T[], cursor: Date): T[] {
  return expenses
    .filter((e) => isInMonth(e.date, cursor))
    .sort((a, b) => newestFirst(a.date, b.date))
}

// ── Totals ────────────────────────────────────────────────────

export const totalIncome = (appointments: Appointment[]): number =>
  appointments.reduce((sum, a) => sum + (a.price || 0), 0)

export const totalExpenses = (expenses: Expense[]): number =>
  expenses.reduce((sum, e) => sum + (e.amount || 0), 0)

export interface ServiceIncome {
  service: ServiceKey
  count: number
  total: number
}

/** Income grouped by service, highest total first. */
export function incomeByService(incomes: Appointment[]): ServiceIncome[] {
  const groups = new Map<ServiceKey, ServiceIncome>()
  for (const a of incomes) {
    const group = groups.get(a.service) ?? { service: a.service, count: 0, total: 0 }
    group.count++
    group.total += a.price || 0
    groups.set(a.service, group)
  }
  return [...groups.values()].sort((a, b) => b.total - a.total)
}

/** Expenses grouped by category, highest total first. */
export function expensesByCategory(expenses: Expense[]): { category: string; total: number }[] {
  const totals = new Map<string, number>()
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + (e.amount || 0))
  return [...totals.entries()]
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total)
}

// ── Reports ───────────────────────────────────────────────────

const completed = (appointments: Appointment[]) =>
  appointments.filter((a) => a.status === 'completada')

/** Most frequent completed service, or null when there are none. */
export function topService(
  appointments: Appointment[],
): { service: ServiceKey; count: number } | null {
  const counts = new Map<ServiceKey, number>()
  for (const a of completed(appointments)) counts.set(a.service, (counts.get(a.service) ?? 0) + 1)
  const [best] = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return best ? { service: best[0], count: best[1] } : null
}

/**
 * Clients with the most completed visits. A client is the dog when the
 * appointment has one, otherwise the free-text client name.
 */
export function topClients(
  appointments: Appointment[],
  limit = 5,
): { key: string; visits: number }[] {
  const visits = new Map<string, number>()
  for (const a of completed(appointments)) {
    const key = a.dog_id || a.client_name
    if (key) visits.set(key, (visits.get(key) ?? 0) + 1)
  }
  return [...visits.entries()]
    .map(([key, count]) => ({ key, visits: count }))
    .sort((a, b) => b.visits - a.visits)
    .slice(0, limit)
}

export interface MonthSummary extends YearMonth {
  income: number
  expenses: number
}

/** Income and expenses for the last `count` months, oldest first, ending with the current one. */
export function monthlySummary(
  appointments: Appointment[],
  expenses: Expense[],
  now: Date,
  count = 6,
): MonthSummary[] {
  const months: MonthSummary[] = Array.from({ length: count }, (_, i) => {
    const start = startOfMonth(now, i - (count - 1))
    return { year: start.getFullYear(), month: start.getMonth(), income: 0, expenses: 0 }
  })
  const find = ({ year, month }: YearMonth) =>
    months.find((m) => m.year === year && m.month === month)

  for (const a of completed(appointments)) {
    const m = find(monthOf(incomeDate(a)))
    if (m) m.income += a.price || 0
  }
  for (const e of expenses) {
    const m = find(monthOf(e.date))
    if (m) m.expenses += e.amount || 0
  }
  return months
}

/** Average monthly net result of the closed months (all but the last one in the summary). */
export function averageNet(summary: MonthSummary[]): number {
  const closed = summary.slice(0, -1)
  if (closed.length === 0) return 0
  return closed.reduce((sum, m) => sum + (m.income - m.expenses), 0) / closed.length
}
