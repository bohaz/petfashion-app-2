'use client'

import { useApp } from '@/components/AppProvider'
import { ModalShell, ActionButton } from '@/components/ui'
import { SERVICES } from '@/lib/constants'
import { fmtDateLong, fmtDateShort, fmtTime, fmtCLP, statusBadge, cleanPhone, fillTemplate, waLink, gcalLink } from '@/lib/utils'
import { Edit2, Trash2, Check, MessageCircle, Bell, Star, Calendar, Phone, AlertCircle } from 'lucide-react'

interface Props { aptId: string; onClose: () => void }

export function AppointmentDetail({ aptId, onClose }: Props) {
  const { appointments, dogs, settings, completeAppointment, deleteAppointment, markFlag, setModal } = useApp()
  const apt = appointments.find(a => a.id === aptId)

  if (!apt) return (
    <ModalShell title="Cita" onClose={onClose}>
      <p className="text-sm" style={{ color: 'rgba(245,240,232,0.4)' }}>Cita no encontrada</p>
    </ModalShell>
  )

  const dog = dogs.find(d => d.id === apt.dog_id)
  const sb = statusBadge(apt.status)
  const phone = apt.phone || dog?.phone || ''

  const vars = {
    dueño:    apt.owner_name || dog?.owner_name || 'amig@',
    perro:    apt.client_name || dog?.name || 'tu mascota',
    fecha:    fmtDateLong(apt.start_time),
    hora:     fmtTime(apt.start_time),
    servicio: SERVICES[apt.service]?.label + (apt.qty > 1 ? ` × ${apt.qty}` : ''),
    precio:   fmtCLP(apt.price),
    link_reseña: settings.business.googleReviewLink,
  }

  const openWa = (tplKey: 'confirmation' | 'reminder' | 'review') => {
    const url = waLink(phone, fillTemplate(settings.templates[tplKey], vars))
    window.open(url, '_blank')
    const flagMap = { confirmation: 'confirmation_sent', reminder: 'reminder_sent', review: 'review_requested' } as const
    markFlag(apt.id, flagMap[tplKey])
  }

  const handleAddCalendar = () => {
    const title = `${apt.client_name || dog?.name || 'Cliente'} – ${SERVICES[apt.service]?.label}`
    const details = [
      apt.owner_name && `Dueño: ${apt.owner_name}`,
      phone && `Tel: ${phone}`,
      `Servicio: ${SERVICES[apt.service]?.label}`,
      apt.price && `Precio: ${fmtCLP(apt.price)}`,
      apt.notes && `Notas: ${apt.notes}`,
    ].filter(Boolean).join('\n')
    window.open(gcalLink(apt.start_time, apt.end_time, title, details, settings.business.address), '_blank')
  }

  const handleEdit = () => { onClose(); setTimeout(() => setModal({ type: 'appointment', data: apt }), 50) }

  const handleDelete = () => {
    setModal({
      type: 'confirm',
      data: {
        title: '¿Eliminar cita?',
        message: 'Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        danger: true,
        onConfirm: async () => { await deleteAppointment(apt.id); onClose() },
      },
    })
  }

  const isActive = apt.status !== 'completada' && apt.status !== 'cancelada'

  return (
    <ModalShell title="Detalle de cita" onClose={onClose}>
      <div className="space-y-4">

        {/* Header card */}
        <div className="rounded-xl p-4" style={{ background: 'var(--pf-bg3)', border: '1px solid var(--pf-border)' }}>
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="font-display text-xl text-white">{apt.client_name || dog?.name}</p>
            <span className={sb.c}>{sb.l}</span>
          </div>
          {(apt.owner_name || dog?.owner_name) && (
            <p className="text-sm" style={{ color: 'rgba(245,240,232,0.5)' }}>
              {apt.owner_name || dog?.owner_name}
            </p>
          )}
          {phone && (
            <a href={`tel:${cleanPhone(phone)}`}
               className="text-sm flex items-center gap-1.5 mt-1"
               style={{ color: 'rgba(245,240,232,0.5)' }}>
              <Phone size={12} /> {phone}
            </a>
          )}

          <div className="mt-3 pt-3 grid grid-cols-2 gap-3 text-sm"
               style={{ borderTop: '1px solid var(--pf-border)' }}>
            <div>
              <p className="section-label" style={{ marginBottom: '4px', fontSize: '9px' }}>Servicio</p>
              <p className="font-semibold text-white">
                {SERVICES[apt.service]?.label}{apt.qty > 1 ? ` × ${apt.qty}` : ''}
              </p>
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '4px', fontSize: '9px' }}>Precio</p>
              <p className="font-bold tabular" style={{ color: 'var(--pf-gold-l)' }}>{fmtCLP(apt.price)}</p>
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '4px', fontSize: '9px' }}>Cuándo</p>
              <p className="font-semibold text-white capitalize text-xs">{fmtDateLong(apt.start_time)}</p>
              <p className="text-xs tabular mt-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>
                {fmtTime(apt.start_time)} – {fmtTime(apt.end_time)}
              </p>
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '4px', fontSize: '9px' }}>Duración</p>
              <p className="font-semibold text-white tabular">{apt.duration_minutes} min</p>
            </div>
          </div>

          {apt.notes && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--pf-border)' }}>
              <p className="section-label" style={{ marginBottom: '6px', fontSize: '9px' }}>Notas</p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgba(245,240,232,0.6)' }}>{apt.notes}</p>
            </div>
          )}
        </div>

        {/* Complete button */}
        {isActive && (
          <button onClick={() => completeAppointment(apt.id)}
            className="w-full btn-gold py-3.5 flex items-center justify-center gap-2">
            <Check size={16} /> Marcar como completada
          </button>
        )}

        {/* WhatsApp */}
        {phone ? (
          <div className="space-y-2">
            <p className="section-label" style={{ marginBottom: '6px' }}>Mensajes WhatsApp</p>
            {isActive && !apt.confirmation_sent && (
              <ActionButton color="green" icon={<MessageCircle size={17} />}
                label="Enviar confirmación" desc="Confirma fecha, hora y precio"
                onClick={() => openWa('confirmation')} />
            )}
            {isActive && apt.confirmation_sent && (
              <ActionButton color="green-soft" icon={<Check size={17} />}
                label="Confirmación enviada" desc="Tocar para reenviar"
                onClick={() => openWa('confirmation')} />
            )}
            {isActive && (
              <ActionButton
                color={apt.reminder_sent ? 'green-soft' : 'amber'}
                icon={apt.reminder_sent ? <Check size={17} /> : <Bell size={17} />}
                label={apt.reminder_sent ? 'Recordatorio enviado' : 'Enviar recordatorio'}
                desc="Mensaje 24h antes de la cita"
                onClick={() => openWa('reminder')} />
            )}
            {apt.status === 'completada' && (
              <ActionButton
                color={apt.review_requested ? 'green-soft' : 'amber'}
                icon={apt.review_requested ? <Check size={17} /> : <Star size={17} />}
                label={apt.review_requested ? 'Reseña pedida' : 'Pedir reseña Google'}
                desc="Mensaje post-servicio"
                onClick={() => openWa('review')} />
            )}
          </div>
        ) : (
          <div className="rounded-xl p-3 flex items-start gap-2"
               style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}>
            <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
            <p className="text-xs" style={{ color: 'rgba(234,179,8,0.8)' }}>
              Sin teléfono asociado. Edita el perro para agregar uno y poder enviar mensajes.
            </p>
          </div>
        )}

        {/* Google Calendar */}
        <ActionButton color="sky" icon={<Calendar size={17} />}
          label="Agregar a Google Calendar" desc="Abre el calendario con la cita"
          onClick={handleAddCalendar} />

        {/* Edit / Delete */}
        <div className="flex gap-2">
          <button onClick={handleEdit}
            className="flex-1 btn-ghost py-3 flex items-center justify-center gap-1.5">
            <Edit2 size={13} /> Editar
          </button>
          <button onClick={handleDelete}
            className="flex-1 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all"
            style={{ background: 'rgba(239,68,68,0.08)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Trash2 size={13} /> Eliminar
          </button>
        </div>

      </div>
    </ModalShell>
  )
}