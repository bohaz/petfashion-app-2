'use client'

import { useApp } from '@/components/AppProvider'
import { ModalShell } from '@/components/ui'
import { SERVICES } from '@/lib/constants'
import { fmtCLP, fmtDateShort, fmtTime, statusBadge, cleanPhone } from '@/lib/utils'
import { Plus, Edit2, Trash2, Phone } from 'lucide-react'

interface Props { dogId: string; onClose: () => void }

export function DogDetail({ dogId, onClose }: Props) {
  const { dogs, appointments, deleteDog, setModal } = useApp()
  const dog = dogs.find(d => d.id === dogId)

  if (!dog) return (
    <ModalShell title="Perro" onClose={onClose}><p className="text-sm text-stone-500">No encontrado</p></ModalShell>
  )

  const visits = appointments
    .filter(a => a.dog_id === dogId)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
  const completed = visits.filter(a => a.status === 'completada')
  const totalSpent = completed.reduce((s, a) => s + (a.price || 0), 0)

  const handleEdit = () => { onClose(); setTimeout(() => setModal({ type: 'dog', data: dog }), 50) }
  const handleNewApt = () => { onClose(); setTimeout(() => setModal({ type: 'appointment', data: { dog_id: dogId } as never }), 50) }
  const handleDelete = () => {
    setModal({
      type: 'confirm',
      data: {
        title: `¿Eliminar a ${dog.name}?`,
        message: 'Se borrará el perro y se desvincularán sus citas. No se puede deshacer.',
        confirmLabel: 'Eliminar',
        danger: true,
        onConfirm: async () => { await deleteDog(dog.id); onClose() },
      },
    })
  }

  return (
    <ModalShell title={dog.name} onClose={onClose}>
      <div className="space-y-4">

        {/* Header */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-extrabold text-2xl shrink-0">
              {(dog.name || '?').slice(0, 1).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-lg">{dog.name}</p>
              <p className="text-sm text-stone-500">{dog.breed || 'Sin raza'} · {dog.size} · {dog.weight} kg</p>
              {dog.coat === 'doble' && <p className="text-xs text-stone-500">Doble capa</p>}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-stone-100 text-sm">
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Dueño</p>
              <p className="font-semibold mt-0.5">{dog.owner_name || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Teléfono</p>
              {dog.phone
                ? <a href={`tel:${cleanPhone(dog.phone)}`} className="font-semibold mt-0.5 flex items-center gap-1"><Phone size={12} /> {dog.phone}</a>
                : <p className="text-stone-400 mt-0.5">—</p>
              }
            </div>
          </div>
          {dog.notes && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="text-[10px] uppercase font-bold text-stone-500 mb-1">Notas / Alergias</p>
              <p className="text-sm whitespace-pre-wrap">{dog.notes}</p>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-stone-200 rounded-2xl p-3 text-center">
            <p className="text-2xl font-extrabold tabular">{completed.length}</p>
            <p className="text-[10px] uppercase font-semibold text-stone-500">Visitas</p>
          </div>
          <div className="bg-white border border-stone-200 rounded-2xl p-3 text-center">
            <p className="text-lg font-extrabold tabular text-emerald-700">{fmtCLP(totalSpent)}</p>
            <p className="text-[10px] uppercase font-semibold text-stone-500">Total gastado</p>
          </div>
        </div>

        {/* New appointment CTA */}
        <button onClick={handleNewApt}
          className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition">
          <Plus size={18} /> Agendar nueva cita
        </button>

        {/* History */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">Historial</h3>
          {visits.length === 0 ? (
            <p className="text-sm text-stone-500 italic">Aún sin citas registradas</p>
          ) : (
            <div className="space-y-2">
              {visits.map(a => {
                const sb = statusBadge(a.status)
                return (
                  <button key={a.id}
                    onClick={() => { onClose(); setTimeout(() => setModal({ type: 'aptDetail', data: a.id }), 50) }}
                    className="w-full bg-white border border-stone-200 rounded-xl p-3 text-left hover:border-stone-300 transition flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-sm">{SERVICES[a.service]?.label}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${sb.c}`}>{sb.l}</span>
                      </div>
                      <p className="text-xs text-stone-500">{fmtDateShort(a.start_time)} · {fmtTime(a.start_time)}</p>
                    </div>
                    {a.price > 0 && <p className="font-bold tabular text-sm shrink-0">{fmtCLP(a.price)}</p>}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Edit / Delete */}
        <div className="flex gap-2">
          <button onClick={handleEdit}
            className="flex-1 bg-white border border-stone-200 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-stone-50 transition">
            <Edit2 size={14} /> Editar
          </button>
          <button onClick={handleDelete}
            className="flex-1 bg-white border border-red-200 text-red-700 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-red-50 transition">
            <Trash2 size={14} /> Eliminar
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
