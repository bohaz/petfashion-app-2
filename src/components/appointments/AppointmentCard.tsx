'use client'

import { SERVICES } from '@/lib/constants'
import { fmtTime, statusBadge, fmtCLP } from '@/lib/utils'
import type { Appointment, Dog } from '@/lib/types'

interface Props {
  apt: Appointment
  dogs: Dog[]
  onClick: () => void
  compact?: boolean
}

export function AppointmentCard({ apt, dogs, onClick, compact }: Props) {
  const dog = dogs.find(d => d.id === apt.dog_id)
  const name = apt.client_name || dog?.name || 'Sin nombre'
  const owner = apt.owner_name || dog?.owner_name || ''
  const sb = statusBadge(apt.status)

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl p-3.5 text-left transition-all active:scale-[0.99]"
      style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--pf-gold-border)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--pf-border)')}>
      <div className="flex items-start gap-3">
        {/* Time block */}
        <div className="flex flex-col items-center justify-center rounded-lg px-2.5 py-2 min-w-[56px] shrink-0"
             style={{ background: 'var(--pf-bg3)', border: '1px solid var(--pf-border)' }}>
          <span className="text-sm font-bold tabular text-white">{fmtTime(apt.start_time)}</span>
          <span className="text-[9px] tabular mt-0.5" style={{ color: 'rgba(245,240,232,0.35)' }}>
            → {fmtTime(apt.end_time)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-semibold text-sm truncate text-white">{name}</p>
            <span className={sb.c}>{sb.l}</span>
          </div>
          <p className="text-xs truncate" style={{ color: 'rgba(245,240,232,0.45)' }}>
            {SERVICES[apt.service]?.label || apt.service}
            {apt.qty > 1 ? ` × ${apt.qty}` : ''}
          </p>
          {!compact && owner && (
            <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(245,240,232,0.3)' }}>{owner}</p>
          )}
          {apt.price > 0 && (
            <p className="text-sm font-bold mt-1.5 tabular" style={{ color: 'var(--pf-gold-l)' }}>
              {fmtCLP(apt.price)}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}
