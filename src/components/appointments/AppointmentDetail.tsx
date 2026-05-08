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
      <p className="text-sm text-stone-500">Cita no encontrada</p>
    </ModalShell>
  )

  const dog = dogs.find(d => d.id === apt.dog_id)
  const sb = statusBadge(apt.status)
  const phone = apt.phone || dog?.phone || ''

  const vars = {
    dueño: apt.owner_name || dog?.owner_name || 'amig@',
    perro: apt.client_name || dog?.name || 'tu mascota',
    fecha: fmtDateLong(apt.start_time),
    hora: fmtTime(apt.start_time),
    servicio: SERVICES[apt.service]?.label + (apt.qty > 1 ? ` × ${apt.qty}` : ''),
    precio: fmtCLP(apt.price),
    link_reseña: settings.business.googleReviewLink,
  }

  const openWa = (tplKey: 'confirmation' | 'reminder' | 'review') => {
    const url = waLink(phone, fillTemplate(settings.templates[tplKey], vars))
    window.open(url, '_blank')
    const flagMap = { confirmation: 'confirmation_sent', reminder: 'reminder_sent', review: 'review_requested' } as const
    markFlag(apt.id, flagMap[tplKey])
  }

  const handleAddCalendar = () => {
    const dogOrClient = apt.client_name || dog?.name || 'Cliente'
    const title = `${dogOrClient} – ${SERVICES[apt.service]?.label}`
    const details = [
      apt.owner_name && `Dueño: ${apt.owner_name}`,
      phone && `Tel: ${phone}`,
      `Servicio: ${SERVICES[apt.service]?.label}`,
      apt.price && `Precio: ${fmtCLP(apt.price)}`,
      apt.notes && `Notas: ${apt.notes}`,
    ].filter(Boolean).join('\n')
    window.open(gcalLink(apt.start_time, apt.end_time, title, details, settings.business.address), '_blank')
  }

  const handleEdit = () => {
    onClose()
    setTimeout(() => setModal({ type: 'appointment', data: apt }), 50)
  }

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

        {/* Header */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-xl font-extrabold">{apt.client_name || dog?.name}</p>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full shrink-0 ${sb.c}`}>{sb.l}</span>
          </div>
          {(apt.owner_name || dog?.owner_name) && (
            <p className="text-sm text-stone-600">{apt.owner_name || dog?.owner_name}</p>
          )}
          {phone && (
            <a href={`tel:${cleanPhone(phone)}`} className="text-sm text-stone-600 flex items-center gap-1.5 mt-1">
              <Phone size={13} /> {phone}
            </a>
          )}
          <div className="mt-3 pt-3 border-t border-stone-100 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Servicio</p>
              <p className="font-semibold mt-0.5">
                {SERVICES[apt.service]?.label}{apt.qty > 1 ? ` × ${apt.qty}` : ''}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Precio</p>
              <p className="font-semibold text-emerald-700 mt-0.5 tabular">{fmtCLP(apt.price)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Cuándo</p>
              <p className="font-semibold mt-0.5 capitalize">{fmtDateLong(apt.start_time)}</p>
              <p className="text-xs text-stone-500 tabular">{fmtTime(apt.start_time)} – {fmtTime(apt.end_time)}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-stone-500">Duración</p>
              <p className="font-semibold mt-0.5 tabular">{apt.duration_minutes} min</p>
            </div>
          </div>
          {apt.notes && (
            <div className="mt-3 pt-3 border-t border-stone-100">
              <p className="text-[10px] uppercase font-bold text-stone-500 mb-1">Notas</p>
              <p className="text-sm text-stone-700 whitespace-pre-wrap">{apt.notes}</p>
            </div>
          )}
        </div>

        {/* Complete */}
        {isActive && (
          <button onClick={() => completeAppointment(apt.id)}
            className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 transition">
            <Check size={18} /> Marcar como completada
          </button>
        )}

        {/* WhatsApp */}
        {phone ? (
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Mensajes WhatsApp</p>
            {isActive && !apt.confirmation_sent && (
              <ActionButton color="green" icon={<MessageCircle size={18} />}
                label="Enviar confirmación" desc="Confirma fecha, hora y precio"
                onClick={() => openWa('confirmation')} />
            )}
            {isActive && apt.confirmation_sent && (
              <ActionButton color="green-soft" icon={<Check size={18} />}
                label="Confirmación enviada" desc="Tocar para reenviar"
                onClick={() => openWa('confirmation')} />
            )}
            {isActive && (
              <ActionButton
                color={apt.reminder_sent ? 'green-soft' : 'amber'}
                icon={apt.reminder_sent ? <Check size={18} /> : <Bell size={18} />}
                label={apt.reminder_sent ? 'Recordatorio enviado' : 'Enviar recordatorio'}
                desc="Mensaje 24h antes de la cita"
                onClick={() => openWa('reminder')} />
            )}
            {apt.status === 'completada' && (
              <ActionButton
                color={apt.review_requested ? 'green-soft' : 'amber'}
                icon={apt.review_requested ? <Check size={18} /> : <Star size={18} />}
                label={apt.review_requested ? 'Reseña pedida' : 'Pedir reseña Google'}
                desc="Mensaje post-servicio"
                onClick={() => openWa('review')} />
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-700 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-900">Sin teléfono asociado. Edita el perro para agregar uno y poder enviar mensajes.</p>
          </div>
        )}

        {/* Google Calendar */}
        <ActionButton color="sky" icon={<Calendar size={18} />}
          label="Agregar a Google Calendar" desc="Abre el calendario con la cita"
          onClick={handleAddCalendar} />

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
