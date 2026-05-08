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

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-extrabold">
          Perros <span className="text-stone-400 font-medium tabular">({dogs.length})</span>
        </h1>
        <button onClick={() => setModal({ type: 'dog', data: null })}
          className="bg-stone-900 text-white p-2.5 rounded-xl hover:bg-stone-800 transition active:scale-95">
          <Plus size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
        <input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, dueño, raza…"
          className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-3 text-sm focus:outline-none focus:border-stone-400" />
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
            return (
              <button key={d.id} onClick={() => setModal({ type: 'dogDetail', data: d.id })}
                className="w-full bg-white border border-stone-200 rounded-2xl p-3.5 text-left hover:border-stone-300 transition active:scale-[0.99]">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                    {(d.name || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold truncate">{d.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 shrink-0">{d.size}</span>
                    </div>
                    <p className="text-xs text-stone-600 truncate">{d.breed || 'Sin raza'} · {d.weight || '?'} kg</p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-stone-500">
                      {d.owner_name && <span className="truncate">{d.owner_name}</span>}
                      {visits > 0 && <span className="tabular shrink-0">{visits} visita{visits > 1 ? 's' : ''}</span>}
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
