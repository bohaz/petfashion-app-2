'use client'

import { useApp } from '@/components/AppProvider'
import { ModalShell } from '@/components/ui'
import { SERVICES } from '@/lib/constants'
import { statusBadge, fmtCLP, cleanPhone } from '@/lib/utils'
import { Edit2, Trash2, MessageCircle, Phone } from 'lucide-react'

interface Props {
  dogId: string
  onClose: () => void
}

const SizeColors: Record<string, string> = {
  XS: '#e8b84b',
  S: '#7dd3fc',
  M: '#4ade80',
  L: '#fb923c',
}

const SizeBg: Record<string, string> = {
  XS: 'rgba(232,184,75,0.1)',
  S: 'rgba(56,189,248,0.1)',
  M: 'rgba(74,222,128,0.1)',
  L: 'rgba(251,146,60,0.1)',
}

export function DogDetail({ dogId, onClose }: Props) {
  const { dogs, appointments, setModal, deleteDog } = useApp()
  const dog = dogs.find((d) => d.id === dogId)

  if (!dog) {
    return (
      <ModalShell title="Perro" onClose={onClose}>
        <p className="text-sm" style={{ color: 'rgba(245,240,232,0.4)' }}>
          No encontrado
        </p>
      </ModalShell>
    )
  }

  const dogApts = appointments
    .filter((a) => a.dog_id === dogId)
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())

  const completedApts = dogApts.filter((a) => a.status === 'completada')
  const totalSpent = completedApts.reduce((s, a) => s + (a.price || 0), 0)

  const coatLabel = dog.coat === 'doble' ? 'Doble capa' : 'Corto'

  const handleEdit = () => {
    onClose()
    setTimeout(() => setModal({ type: 'dog', data: dog }), 50)
  }

  const handleDelete = () => {
    setModal({
      type: 'confirm',
      data: {
        title: `¿Eliminar a ${dog.name}?`,
        message: 'Se eliminarán todos sus datos. Las citas no se borran.',
        confirmLabel: 'Eliminar',
        danger: true,
        onConfirm: async () => {
          await deleteDog(dog.id)
          onClose()
        },
      },
    })
  }

  const handleNewAppointment = () => {
    onClose()
    setTimeout(() => {
      setModal({
        type: 'appointment',
        data: { dog_id: dog.id },
      })
    }, 50)
  }

  const handleOpenAppointment = (appointmentId: string) => {
    onClose()
    setTimeout(() => {
      setModal({ type: 'aptDetail', data: appointmentId })
    }, 50)
  }

  return (
    <ModalShell title="Perfil del perro" onClose={onClose}>
      <div className="space-y-4">
        <div
          className="rounded-xl p-4"
          style={{
            background: 'var(--pf-bg3)',
            border: '1px solid var(--pf-border)',
          }}
        >
          <div className="flex items-start gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center font-display text-xl font-bold shrink-0"
              style={{
                background: SizeBg[dog.size] || 'rgba(201,146,42,0.1)',
                color: SizeColors[dog.size] || 'var(--pf-gold-l)',
              }}
            >
              {(dog.name || '?').slice(0, 1).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-xl text-white">{dog.name}</p>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    background: SizeBg[dog.size],
                    color: SizeColors[dog.size],
                    border: `1px solid ${SizeColors[dog.size]}30`,
                  }}
                >
                  {dog.size}
                </span>
              </div>

              {dog.breed && (
                <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.45)' }}>
                  {dog.breed}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            {[
              { l: 'Peso', v: dog.weight ? `${dog.weight} kg` : '—' },
              { l: 'Manto', v: coatLabel },
              { l: 'Dueño/a', v: dog.owner_name || '—' },
              { l: 'Teléfono', v: dog.phone || '—' },
              { l: 'Visitas', v: completedApts.length },
              { l: 'Total gastado', v: fmtCLP(totalSpent) },
            ].map((item) => (
              <div key={item.l}>
                <p className="section-label" style={{ marginBottom: '3px', fontSize: '9px' }}>
                  {item.l}
                </p>
                <p className="font-medium text-white">{String(item.v)}</p>
              </div>
            ))}
          </div>

          {dog.notes && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--pf-border)' }}>
              <p className="section-label" style={{ marginBottom: '6px', fontSize: '9px' }}>
                Notas
              </p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {dog.notes}
              </p>
            </div>
          )}
        </div>

        {dog.phone && (
          <div className="flex gap-2">
            <a
              href={`tel:${cleanPhone(dog.phone)}`}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'rgba(245,240,232,0.05)',
                color: 'rgba(245,240,232,0.7)',
                border: '1px solid var(--pf-border)',
              }}
            >
              <Phone size={14} /> Llamar
            </a>

            <a
              href={`https://wa.me/${cleanPhone(dog.phone)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: 'rgba(37,211,102,0.1)',
                color: '#25D366',
                border: '1px solid rgba(37,211,102,0.2)',
              }}
            >
              <MessageCircle size={14} /> WhatsApp
            </a>
          </div>
        )}

        <button
          onClick={handleNewAppointment}
          className="btn-gold w-full flex items-center justify-center gap-2"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva cita para {dog.name}
        </button>

        {dogApts.length > 0 && (
          <div>
            <div className="section-label mb-3">Historial</div>

            <div className="space-y-2">
              {dogApts.slice(0, 5).map((a) => {
                const sb = statusBadge(a.status)

                return (
                  <button
                    key={a.id}
                    onClick={() => handleOpenAppointment(a.id)}
                    className="w-full rounded-xl p-3 text-left flex items-center gap-3 transition-all"
                    style={{
                      background: 'var(--pf-bg2)',
                      border: '1px solid var(--pf-border)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--pf-gold-border)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--pf-border)'
                    }}
                  >
                    <span className={sb.c}>{sb.l}</span>

                    <div className="flex-1 min-w-0 text-sm">
                      <p className="font-medium text-white">
                        {SERVICES[a.service]?.label || a.service}
                      </p>
                    </div>

                    <p
                      className="text-xs tabular shrink-0 font-bold"
                      style={{ color: 'var(--pf-gold-l)' }}
                    >
                      {fmtCLP(a.price)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleEdit}
            className="flex-1 btn-ghost py-3 flex items-center justify-center gap-1.5"
          >
            <Edit2 size={13} /> Editar
          </button>

          <button
            onClick={handleDelete}
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5"
            style={{
              background: 'rgba(239,68,68,0.08)',
              color: '#f87171',
              border: '1px solid rgba(239,68,68,0.2)',
            }}
          >
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      </div>
    </ModalShell>
  )
}
