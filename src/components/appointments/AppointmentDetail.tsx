'use client'

import { useApp } from '@/components/AppProvider'
import { ModalShell, ActionButton } from '@/components/ui'
import { SERVICES, SERVICE_INCLUDES } from '@/lib/constants'
import {
  fmtDateLong,
  fmtTime,
  fmtCLP,
  statusBadge,
  cleanPhone,
  fillTemplate,
  waLink,
  gcalLink,
  sameDay,
} from '@/lib/utils'
import {
  Edit2,
  Trash2,
  Check,
  MessageCircle,
  Bell,
  Star,
  Calendar,
  Phone,
  AlertCircle,
} from 'lucide-react'
import type { Appointment } from '@/lib/types'

interface Props {
  aptId: string
  onClose: () => void
}

export function AppointmentDetail({ aptId, onClose }: Props) {
  const {
    appointments,
    dogs,
    settings,
    completeAppointment,
    deleteAppointment,
    markFlag,
    setModal,
  } = useApp()
  const apt = appointments.find((a) => a.id === aptId)

  if (!apt)
    return (
      <ModalShell title="Cita" onClose={onClose}>
        <p className="text-sm" style={{ color: 'rgba(245,240,232,0.4)' }}>
          Cita no encontrada
        </p>
      </ModalShell>
    )

  const dog = dogs.find((d) => d.id === apt.dog_id)
  const sb = statusBadge(apt.status)
  const phone = apt.phone || dog?.phone || ''
  const ownerName = apt.owner_name || dog?.owner_name || 'amig@'

  // ── Helpers ─────────────────────────────────────────────────────────────

  const getPhone = (a: Appointment) => a.phone || dogs.find((d) => d.id === a.dog_id)?.phone || ''

  /** Returns unsent sibling appointments (same phone, same day / criteria) */
  const getSiblings = (tplKey: 'confirmation' | 'reminder' | 'review'): Appointment[] => {
    if (!phone) return [apt]

    let filtered: Appointment[]

    if (tplKey === 'confirmation') {
      filtered = appointments.filter(
        (a) =>
          getPhone(a) === phone &&
          sameDay(a.start_time, apt.start_time) &&
          !['cancelada', 'completada'].includes(a.status) &&
          !a.confirmation_sent,
      )
    } else if (tplKey === 'reminder') {
      filtered = appointments.filter(
        (a) =>
          getPhone(a) === phone &&
          sameDay(a.start_time, apt.start_time) &&
          a.status !== 'cancelada' &&
          !a.reminder_sent,
      )
    } else {
      // review: all completed & unrequested in last 2 days
      filtered = appointments.filter(
        (a) =>
          getPhone(a) === phone &&
          a.status === 'completada' &&
          !a.review_requested &&
          a.completed_at != null &&
          Date.now() - new Date(a.completed_at).getTime() < 1000 * 60 * 60 * 24 * 2,
      )
    }

    return filtered.sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )
  }

  // ── Message builders ─────────────────────────────────────────────────────

  /** Builds the detail block for one appointment (used in both single and grouped) */
  const aptBlock = (a: Appointment): string => {
    const aDog = dogs.find((d) => d.id === a.dog_id)
    const name = a.client_name || aDog?.name || 'Cliente'
    const svcLabel = SERVICES[a.service]?.label + (a.qty > 1 ? ` × ${a.qty}` : '')
    const items = (SERVICE_INCLUDES[a.service] || []).map((i) => `• ${i}`).join('\n')
    return `🐶 ${name} — ${svcLabel}\n📅 ${fmtDateLong(a.start_time)} · ⏰ ${fmtTime(a.start_time)}\n${items}\n💵 ${fmtCLP(a.price)}`
  }

  const buildConfirmation = (apts: Appointment[]): string => {
    const blocks = apts.map(aptBlock).join('\n\n')
    const footer = `\n\n📍 ${settings.business.address}\nCualquier cambio nos avisas. ¡Gracias!`

    if (apts.length === 1) {
      const petName =
        apts[0].client_name || dogs.find((d) => d.id === apts[0].dog_id)?.name || 'tu mascota'
      return `¡Hola ${ownerName}! 🐾 Confirmamos la hora en Pet Fashion para ${petName}:\n\n${blocks}${footer}`
    }

    const total = apts.reduce((s, a) => s + (a.price || 0), 0)
    return `¡Hola ${ownerName}! 🐾 Confirmamos las horas en Pet Fashion:\n\n${blocks}\n\n💰 Total: ${fmtCLP(total)}${footer}`
  }

  const buildReminder = (apts: Appointment[]): string => {
    if (apts.length === 1) {
      const vars = {
        dueño: ownerName,
        perro: apts[0].client_name || dog?.name || 'tu mascota',
        fecha: fmtDateLong(apts[0].start_time),
        hora: fmtTime(apts[0].start_time),
        servicio: SERVICES[apts[0].service]?.label + (apts[0].qty > 1 ? ` × ${apts[0].qty}` : ''),
      }
      return fillTemplate(settings.templates.reminder, vars)
    }

    let msg = `¡Hola ${ownerName}! 🐾 Te recordamos que mañana tienes citas en Pet Fashion:\n\n`
    apts.forEach((a) => {
      const aDog = dogs.find((d) => d.id === a.dog_id)
      const name = a.client_name || aDog?.name || 'Cliente'
      msg += `🐶 ${name} — ${SERVICES[a.service]?.label || a.service} · ⏰ ${fmtTime(a.start_time)}\n`
    })
    return msg + '\n¿Confirmas tu asistencia?'
  }

  const buildReview = (apts: Appointment[]): string => {
    if (apts.length === 1) {
      const vars = {
        dueño: ownerName,
        perro: apts[0].client_name || dog?.name || 'tu mascota',
        link_reseña: settings.business.googleReviewLink,
      }
      return fillTemplate(settings.templates.review, vars)
    }

    const names = apts.map((a) => {
      const aDog = dogs.find((d) => d.id === a.dog_id)
      return a.client_name || aDog?.name || 'tu mascota'
    })
    const nameStr =
      names.length === 2
        ? names.join(' y ')
        : names.slice(0, -1).join(', ') + ' y ' + names[names.length - 1]

    return (
      `¡Hola ${ownerName}! 🐾 Esperamos que ${nameStr} hayan quedado felices con sus servicios.\n\n` +
      `Si tienes un momento, nos ayudaría mucho dejarnos una reseña en Google: ${settings.business.googleReviewLink}\n\n` +
      `¡Mil gracias!`
    )
  }

  // ── Send ─────────────────────────────────────────────────────────────────

  const flagMap = {
    confirmation: 'confirmation_sent',
    reminder: 'reminder_sent',
    review: 'review_requested',
  } as const

  const openWa = (tplKey: 'confirmation' | 'reminder' | 'review') => {
    const siblings = getSiblings(tplKey)
    // If current apt was already sent (resend case), siblings won't contain it — send solo
    const toSend = siblings.some((a) => a.id === apt.id) ? siblings : [apt]

    let message: string
    if (tplKey === 'confirmation') message = buildConfirmation(toSend)
    else if (tplKey === 'reminder') message = buildReminder(toSend)
    else message = buildReview(toSend)

    window.open(waLink(phone, message), '_blank')
    toSend.forEach((a) => markFlag(a.id, flagMap[tplKey]))
  }

  // ── Calendar ─────────────────────────────────────────────────────────────

  const handleAddCalendar = () => {
    const title = `${apt.client_name || dog?.name || 'Cliente'} – ${SERVICES[apt.service]?.label}`
    const details = [
      apt.owner_name && `Dueño: ${apt.owner_name}`,
      phone && `Tel: ${phone}`,
      `Servicio: ${SERVICES[apt.service]?.label}`,
      apt.price && `Precio: ${fmtCLP(apt.price)}`,
      apt.notes && `Notas: ${apt.notes}`,
    ]
      .filter(Boolean)
      .join('\n')
    window.open(
      gcalLink(apt.start_time, apt.end_time, title, details, settings.business.address),
      '_blank',
    )
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
        onConfirm: async () => {
          await deleteAppointment(apt.id)
          onClose()
        },
      },
    })
  }

  const isActive = apt.status !== 'completada' && apt.status !== 'cancelada'

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <ModalShell title="Detalle de cita" onClose={onClose}>
      <div className="space-y-4">
        {/* Header card */}
        <div
          className="rounded-xl p-4"
          style={{ background: 'var(--pf-bg3)', border: '1px solid var(--pf-border)' }}
        >
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
            <a
              href={`tel:${cleanPhone(phone)}`}
              className="text-sm flex items-center gap-1.5 mt-1"
              style={{ color: 'rgba(245,240,232,0.5)' }}
            >
              <Phone size={12} /> {phone}
            </a>
          )}

          <div
            className="mt-3 pt-3 grid grid-cols-2 gap-3 text-sm"
            style={{ borderTop: '1px solid var(--pf-border)' }}
          >
            <div>
              <p className="section-label" style={{ marginBottom: '4px', fontSize: '9px' }}>
                Servicio
              </p>
              <p className="font-semibold text-white">
                {SERVICES[apt.service]?.label}
                {apt.qty > 1 ? ` × ${apt.qty}` : ''}
              </p>
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '4px', fontSize: '9px' }}>
                Precio
              </p>
              <p className="font-bold tabular" style={{ color: 'var(--pf-gold-l)' }}>
                {fmtCLP(apt.price)}
              </p>
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '4px', fontSize: '9px' }}>
                Cuándo
              </p>
              <p className="font-semibold text-white capitalize text-xs">
                {fmtDateLong(apt.start_time)}
              </p>
              <p className="text-xs tabular mt-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>
                {fmtTime(apt.start_time)} – {fmtTime(apt.end_time)}
              </p>
            </div>
            <div>
              <p className="section-label" style={{ marginBottom: '4px', fontSize: '9px' }}>
                Duración
              </p>
              <p className="font-semibold text-white tabular">{apt.duration_minutes} min</p>
            </div>
          </div>

          {apt.notes && (
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--pf-border)' }}>
              <p className="section-label" style={{ marginBottom: '6px', fontSize: '9px' }}>
                Notas
              </p>
              <p className="text-sm whitespace-pre-wrap" style={{ color: 'rgba(245,240,232,0.6)' }}>
                {apt.notes}
              </p>
            </div>
          )}
        </div>

        {/* Complete */}
        {isActive && (
          <button
            onClick={() => completeAppointment(apt.id)}
            className="w-full btn-gold py-3.5 flex items-center justify-center gap-2"
          >
            <Check size={16} /> Marcar como completada
          </button>
        )}

        {/* WhatsApp */}
        {phone ? (
          <div className="space-y-2">
            <p className="section-label" style={{ marginBottom: '6px' }}>
              Mensajes WhatsApp
            </p>

            {isActive && !apt.confirmation_sent && (
              <ActionButton
                color="green"
                icon={<MessageCircle size={17} />}
                label="Enviar confirmación"
                desc="Con detalle del servicio y precio"
                onClick={() => openWa('confirmation')}
              />
            )}
            {isActive && apt.confirmation_sent && (
              <ActionButton
                color="green-soft"
                icon={<Check size={17} />}
                label="Confirmación enviada"
                desc="Tocar para reenviar"
                onClick={() => openWa('confirmation')}
              />
            )}
            {isActive && (
              <ActionButton
                color={apt.reminder_sent ? 'green-soft' : 'amber'}
                icon={apt.reminder_sent ? <Check size={17} /> : <Bell size={17} />}
                label={apt.reminder_sent ? 'Recordatorio enviado' : 'Enviar recordatorio'}
                desc="Mensaje 24h antes de la cita"
                onClick={() => openWa('reminder')}
              />
            )}
            {apt.status === 'completada' && (
              <ActionButton
                color={apt.review_requested ? 'green-soft' : 'amber'}
                icon={apt.review_requested ? <Check size={17} /> : <Star size={17} />}
                label={apt.review_requested ? 'Reseña pedida' : 'Pedir reseña Google'}
                desc="Mensaje post-servicio"
                onClick={() => openWa('review')}
              />
            )}
          </div>
        ) : (
          <div
            className="rounded-xl p-3 flex items-start gap-2"
            style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)' }}
          >
            <AlertCircle size={15} className="mt-0.5 shrink-0" style={{ color: '#fbbf24' }} />
            <p className="text-xs" style={{ color: 'rgba(234,179,8,0.8)' }}>
              Sin teléfono asociado. Edita el perro para agregar uno y poder enviar mensajes.
            </p>
          </div>
        )}

        {/* Google Calendar */}
        <ActionButton
          color="sky"
          icon={<Calendar size={17} />}
          label="Agregar a Google Calendar"
          desc="Abre el calendario con la cita"
          onClick={handleAddCalendar}
        />

        {/* Edit / Delete */}
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
