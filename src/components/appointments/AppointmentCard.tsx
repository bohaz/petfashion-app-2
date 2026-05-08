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
      className="w-full bg-white border border-stone-200 rounded-2xl p-3.5 text-left hover:border-stone-300 transition active:scale-[0.99]"
    >
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center justify-center bg-stone-100 rounded-xl px-2.5 py-2 min-w-[58px]">
          <span className="text-base font-extrabold tabular">{fmtTime(apt.start_time)}</span>
          <span className="text-[10px] text-stone-500 tabular mt-0.5">→ {fmtTime(apt.end_time)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-bold text-stone-900 truncate">{name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${sb.c}`}>{sb.l}</span>
          </div>
          <p className="text-xs text-stone-600 truncate">
            {SERVICES[apt.service]?.label || apt.service}
            {apt.qty > 1 ? ` × ${apt.qty}` : ''}
          </p>
          {!compact && owner && (
            <p className="text-xs text-stone-500 truncate mt-0.5">{owner}</p>
          )}
          {apt.price > 0 && (
            <p className="text-sm font-bold text-emerald-700 mt-1 tabular">{fmtCLP(apt.price)}</p>
          )}
        </div>
      </div>
    </button>
  )
}
