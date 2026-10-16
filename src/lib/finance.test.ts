import { describe, expect, it } from 'vitest'
import {
  averageNet,
  expensesByCategory,
  expensesInMonth,
  incomeByService,
  incomesInMonth,
  isInMonth,
  monthlySummary,
  startOfMonth,
  topClients,
  topService,
  totalExpenses,
  totalIncome,
} from './finance'
import type { Appointment } from './types'

// Tests run with TZ=America/Santiago (UTC-3 in October).
const OCTOBER = new Date(2026, 9, 1)

const apt = (overrides: Partial<Appointment>): Appointment => ({
  id: Math.random().toString(36).slice(2),
  created_at: '2026-01-01T12:00:00.000Z',
  service: 'corte_bano',
  qty: 1,
  start_time: '2026-10-10T13:00:00.000Z',
  end_time: '2026-10-10T15:00:00.000Z',
  duration_minutes: 120,
  price: 20000,
  price_override: false,
  status: 'completada',
  reminder_sent: false,
  confirmation_sent: false,
  review_requested: false,
  ...overrides,
})

const expense = (date: string, category: string, amount: number) => ({
  id: date + category,
  created_at: date,
  date,
  category,
  amount,
})

describe('months', () => {
  it('places date-only values in their own month', () => {
    // As UTC midnight, 1 October would fall in September in Chile.
    expect(isInMonth('2026-10-01', OCTOBER)).toBe(true)
    expect(isInMonth('2026-09-30', OCTOBER)).toBe(false)
  })

  it('places timestamps by local time', () => {
    // 1 Nov 01:00 UTC is still 31 October in Chile.
    expect(isInMonth('2026-11-01T01:00:00.000Z', OCTOBER)).toBe(true)
  })

  it('moves between months across years', () => {
    expect(startOfMonth(new Date(2026, 0, 31), -1)).toEqual(new Date(2025, 11, 1))
    expect(startOfMonth(new Date(2026, 11, 15), 1)).toEqual(new Date(2027, 0, 1))
  })
})

describe('monthly lists', () => {
  it('counts only completed appointments, by completion date, newest first', () => {
    const a = apt({ id: 'a', completed_at: '2026-10-03T15:00:00.000Z' })
    const b = apt({ id: 'b', completed_at: '2026-10-20T15:00:00.000Z' })
    const pending = apt({ id: 'c', status: 'confirmada' })
    const september = apt({ id: 'd', completed_at: '2026-09-28T15:00:00.000Z' })

    expect(incomesInMonth([a, b, pending, september], OCTOBER).map((x) => x.id)).toEqual(['b', 'a'])
  })

  it('falls back to the appointment time for older records without completed_at', () => {
    const legacy = apt({
      id: 'old',
      completed_at: undefined,
      start_time: '2026-10-05T13:00:00.000Z',
    })
    expect(incomesInMonth([legacy], OCTOBER)).toHaveLength(1)
  })

  it('lists the month expenses newest first, including the 1st of the month', () => {
    const list = expensesInMonth(
      [
        expense('2026-10-01', 'insumos', 1000),
        expense('2026-10-15', 'arriendo', 2000),
        expense('2026-09-30', 'otros', 500),
      ],
      OCTOBER,
    )
    expect(list.map((e) => e.date)).toEqual(['2026-10-15', '2026-10-01'])
  })
})

describe('totals and groups', () => {
  it('adds up income and expenses, ignoring missing amounts', () => {
    expect(totalIncome([apt({ price: 20000 }), apt({ price: 0 }), apt({ price: 15000 })])).toBe(
      35000,
    )
    expect(
      totalExpenses([expense('2026-10-01', 'a', 1000), expense('2026-10-02', 'b', 2500)]),
    ).toBe(3500)
  })

  it('groups income by service, highest total first', () => {
    const groups = incomeByService([
      apt({ service: 'unas', price: 7000 }),
      apt({ service: 'corte_bano', price: 26000 }),
      apt({ service: 'unas', price: 5000 }),
    ])
    expect(groups).toEqual([
      { service: 'corte_bano', count: 1, total: 26000 },
      { service: 'unas', count: 2, total: 12000 },
    ])
  })

  it('groups expenses by category, highest total first', () => {
    expect(
      expensesByCategory([
        expense('2026-10-01', 'insumos', 1000),
        expense('2026-10-02', 'arriendo', 250000),
        expense('2026-10-03', 'insumos', 3000),
      ]),
    ).toEqual([
      { category: 'arriendo', total: 250000 },
      { category: 'insumos', total: 4000 },
    ])
  })
})

describe('reports', () => {
  const history = [
    apt({ dog_id: 'luna', service: 'corte_bano' }),
    apt({ dog_id: 'luna', service: 'unas' }),
    apt({ dog_id: 'toby', service: 'corte_bano' }),
    apt({ client_name: 'Walk-in', service: 'corte_bano' }),
    apt({ dog_id: 'luna', service: 'corte_bano', status: 'cancelada' }),
  ]

  it('finds the most frequent completed service', () => {
    expect(topService(history)).toEqual({ service: 'corte_bano', count: 3 })
    expect(topService([])).toBeNull()
  })

  it('ranks clients by completed visits, by dog or by name', () => {
    expect(topClients(history)).toEqual([
      { key: 'luna', visits: 2 },
      { key: 'toby', visits: 1 },
      { key: 'Walk-in', visits: 1 },
    ])
    expect(topClients(history, 1)).toHaveLength(1)
  })

  it('summarizes the last six months, ending with the current one', () => {
    const now = new Date(2026, 9, 15)
    const summary = monthlySummary(
      [
        apt({ completed_at: '2026-10-02T15:00:00.000Z', price: 30000 }),
        apt({ completed_at: '2026-05-20T15:00:00.000Z', price: 10000 }),
        apt({ completed_at: '2026-04-20T15:00:00.000Z', price: 99999 }),
      ],
      [expense('2026-10-01', 'insumos', 5000), expense('2026-08-31', 'arriendo', 8000)],
      now,
    )

    expect(summary.map((m) => [m.year, m.month])).toEqual([
      [2026, 4],
      [2026, 5],
      [2026, 6],
      [2026, 7],
      [2026, 8],
      [2026, 9],
    ])
    expect(summary[0]).toMatchObject({ income: 10000, expenses: 0 })
    expect(summary[3]).toMatchObject({ income: 0, expenses: 8000 })
    expect(summary[5]).toMatchObject({ income: 30000, expenses: 5000 })
  })

  it('crosses the year boundary', () => {
    const summary = monthlySummary([], [], new Date(2027, 1, 10))
    expect(summary.map((m) => `${m.year}-${m.month}`)).toEqual([
      '2026-8',
      '2026-9',
      '2026-10',
      '2026-11',
      '2027-0',
      '2027-1',
    ])
  })

  it('averages the net result of the closed months only', () => {
    const summary = [
      { year: 2026, month: 5, income: 100, expenses: 50 },
      { year: 2026, month: 6, income: 100, expenses: 150 },
      { year: 2026, month: 7, income: 999, expenses: 0 },
    ]
    expect(averageNet(summary)).toBe(0)
    expect(averageNet([])).toBe(0)
  })
})
