'use client'

import { SERVICES } from '@/lib/constants'
import { averageNet, monthlySummary, topClients, topService } from '@/lib/finance'
import { fmtCLP } from '@/lib/utils'
import type { Appointment, BusinessExpense, Dog } from '@/lib/types'

const MONTH_SHORT = [
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

/** All-time reports for the business: top service, top clients and the last six months. */
export function BusinessReports({
  appointments,
  expenses,
  dogs,
}: {
  appointments: Appointment[]
  expenses: BusinessExpense[]
  dogs: Dog[]
}) {
  const top = topService(appointments)
  const clients = topClients(appointments)
  const summary = monthlySummary(appointments, expenses, new Date())
  const last6 = summary.map((m) => ({
    label: MONTH_SHORT[m.month],
    in: m.income,
    out: m.expenses,
  }))
  const maxVal = Math.max(...last6.map((m) => Math.max(m.in, m.out)), 1)
  const avgNet = averageNet(summary)

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="section-label">Servicio más vendido</div>
        {top ? (
          <div className="flex items-center justify-between">
            <p className="font-bold text-lg text-white">{SERVICES[top.service]?.label}</p>
            <span className="badge badge-gold">{top.count} servicios</span>
          </div>
        ) : (
          <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
            Aún sin datos
          </p>
        )}
      </div>

      <div className="card">
        <div className="section-label">Top clientes</div>
        {clients.length === 0 ? (
          <p className="text-sm italic" style={{ color: 'rgba(245,240,232,0.3)' }}>
            Aún sin datos
          </p>
        ) : (
          <div className="space-y-2.5">
            {clients.map(({ key: k, visits: count }, i) => {
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
