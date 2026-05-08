'use client'

import { useState, useMemo } from 'react'
import { useApp } from '@/components/AppProvider'
import { EmptyState } from '@/components/ui'
import { Plus, Search } from 'lucide-react'

export default function PerrosPage() {
  const { dogs, appointments, setModal } = useApp()
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    let list = [...dogs]
    if (q) {
      list = list.filter(d =>
        (d.name || '').toLowerCase().includes(q) ||
        (d.owner_name || '').toLowerCase().includes(q) ||
        (d.breed || '').toLowerCase().includes(q) ||
        (d.phone || '').includes(q)
      )
    }
    return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
  }, [dogs, query])

  const SizeColors: Record<string, string> = {
    XS: 'rgba(201,146,42,0.12)',
    S:  'rgba(56,189,248,0.1)',
    M:  'rgba(74,222,128,0.1)',
    L:  'rgba(251,146,60,0.1)',
  }
  const SizeText: Record<string, string> = {
    XS: '#e8b84b',
    S:  '#7dd3fc',
    M:  '#4ade80',
    L:  '#fb923c',
  }

  return (
    <div>
      {/* Header */}
      <header className="mb-6">
        <div className="section-label">Directorio</div>
        <div className="flex items-center justify-between">
          <h1 className="display">
            Perros{' '}
            <em className="font-display text-xl" style={{ color: 'rgba(245,240,232,0.35)', fontStyle: 'normal' }}>
              ({dogs.length})
            </em>
          </h1>
          <button onClick={() => setModal({ type: 'dog', data: null })}
                  className="btn-gold px-3 py-2 text-xs flex items-center gap-1.5">
            <Plus size={14} /> Agregar
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'rgba(245,240,232,0.3)' }} />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, dueño, raza…"
          className="w-full pl-10" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.96-1.45-2.344-2.5"/><path d="M8 14v.5A3.5 3.5 0 0 0 11.5 18h1a3.5 3.5 0 0 0 3.5-3.5V14a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2z"/><path d="M6.5 17.5c-.875 1.563-1.5 2.5-2 3"/><path d="M17.5 17.5c.875 1.563 1.5 2.5 2 3"/></svg>}
          text={query ? 'Sin resultados' : 'Aún no tienes perros'}
          subtext={query ? 'Intenta con otro nombre' : 'Toca + para agregar el primero'}
        />
      ) : (
        <div className="space-y-2">
          {filtered.map(d => {
            const visits = appointments.filter(a => a.dog_id === d.id && a.status === 'completada').length
            const initial = (d.name || '?').slice(0, 1).toUpperCase()
            return (
              <button key={d.id} onClick={() => setModal({ type: 'dogDetail', data: d.id })}
                className="w-full rounded-xl p-3.5 text-left transition-all active:scale-[0.99]"
                style={{ background: 'var(--pf-bg2)', border: '1px solid var(--pf-border)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--pf-gold-border)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--pf-border)')}>
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-display text-lg font-bold shrink-0"
                       style={{ background: 'rgba(201,146,42,0.12)', color: 'var(--pf-gold-l)' }}>
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm text-white truncate">{d.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                            style={{ background: SizeColors[d.size] || 'rgba(201,146,42,0.1)', color: SizeText[d.size] || 'var(--pf-gold-l)' }}>
                        {d.size}
                      </span>
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>
                      {d.breed || 'Sin raza'} · {d.weight || '?'} kg
                      {d.coat === 'doble' ? ' · doble capa' : ''}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'rgba(245,240,232,0.35)' }}>
                      {d.owner_name && <span className="truncate">{d.owner_name}</span>}
                      {visits > 0 && (
                        <span className="tabular shrink-0" style={{ color: 'var(--pf-gold)' }}>
                          {visits} visita{visits > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}