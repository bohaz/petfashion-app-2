'use client'

import { useState, useEffect } from 'react'
import { useApp } from '@/components/AppProvider'
import { ModalShell } from '@/components/ui'
import { SERVICES } from '@/lib/constants'
import {
  toLocalInput,
  fromLocalInput,
  addMinutes,
  calcPrice,
  calcDuration,
  sizeFromWeight,
} from '@/lib/utils'
import type { Appointment, ServiceKey, DogSize, DogCoat } from '@/lib/types'

interface Props {
  appointment?: Partial<Appointment> | null
  onClose: () => void
}

const SVC_OPTIONS = Object.entries(SERVICES) as [ServiceKey, { label: string }][]

export function AppointmentModal({ appointment, onClose }: Props) {
  const { dogs, settings, saveAppointment } = useApp()
  const isEdit = !!appointment?.id
  const [saving, setSaving] = useState(false)

  const defaultStart = appointment?.start_time
    ? toLocalInput(appointment.start_time)
    : toLocalInput(new Date())

  const [dogId, setDogId] = useState(appointment?.dog_id || '')
  const [clientName, setClientName] = useState(appointment?.client_name || '')
  const [ownerName, setOwnerName] = useState(appointment?.owner_name || '')
  const [phone, setPhone] = useState(appointment?.phone || '')
  const [service, setService] = useState<ServiceKey>(
    (appointment?.service as ServiceKey) || 'corte_bano',
  )
  const [size, setSize] = useState<DogSize>('S')
  const [coat, setCoat] = useState<DogCoat>('corto')
  const [customPrice, setCustomPrice] = useState<number | null>(
    appointment?.id ? (appointment.price ?? null) : null,
  )
  const [startStr, setStartStr] = useState(defaultStart)
  const [notes, setNotes] = useState(appointment?.notes || '')
  const [status, setStatus] = useState<Appointment['status']>(appointment?.status || 'pendiente')

  useEffect(() => {
    if (!dogId) return

    const dog = dogs.find((d) => d.id === dogId)
    if (!dog) return

    if (!clientName) setClientName(dog.name || '')
    if (!ownerName) setOwnerName(dog.owner_name || '')
    if (!phone) setPhone(dog.phone || '')
    if (dog.weight) setSize(sizeFromWeight(dog.weight))
    if (dog.coat) setCoat(dog.coat)
  }, [dogId]) // eslint-disable-line react-hooks/exhaustive-deps

  const suggestedPrice = calcPrice(settings, service, size, coat, 1)
  const displayPrice = customPrice !== null ? customPrice : suggestedPrice
  const duration = calcDuration(settings, service, size)
  const endStr = addMinutes(fromLocalInput(startStr), duration)

  const STATUS_OPTIONS = [
    { v: 'pendiente', l: 'Pendiente' },
    { v: 'confirmada', l: 'Confirmada' },
    { v: 'completada', l: 'Completada' },
    { v: 'cancelada', l: 'Cancelada' },
    { v: 'no_show', l: 'No asistió' },
  ]

  const handleSave = async () => {
    if (!clientName.trim()) return

    setSaving(true)

    const dog = dogs.find((d) => d.id === dogId)

    const data: Partial<Appointment> = {
      ...(appointment || {}),
      dog_id: dogId || undefined,
      client_name: clientName.trim(),
      owner_name: ownerName.trim() || undefined,
      phone: phone.trim() || dog?.phone || undefined,
      service,
      qty: 1,
      price: displayPrice,
      price_override: customPrice !== null,
      start_time: fromLocalInput(startStr),
      end_time: endStr,
      duration_minutes: duration,
      notes: notes.trim() || undefined,
      status: status as Appointment['status'],
    }

    await saveAppointment(data)

    setSaving(false)
    onClose()
  }

  const selectedDog = dogs.find((d) => d.id === dogId)

  return (
    <ModalShell
      title={isEdit ? 'Editar cita' : 'Nueva cita'}
      onClose={onClose}
      footer={
        <button
          onClick={handleSave}
          disabled={saving || !clientName.trim()}
          className="btn-gold w-full"
        >
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Crear cita'}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block mb-1.5">Perro registrado (opcional)</label>
          <select value={dogId} onChange={(e) => setDogId(e.target.value)} className="w-full">
            <option value="">— Nuevo cliente —</option>
            {dogs.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} {d.owner_name ? `(${d.owner_name})` : ''}
              </option>
            ))}
          </select>

          {selectedDog?.breed && (
            <p className="text-xs mt-1 tabular" style={{ color: 'rgba(245,240,232,0.35)' }}>
              {selectedDog.breed} · {selectedDog.weight} kg · {selectedDog.size}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5">Nombre del perro *</label>
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Max"
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1.5">Dueño/a</label>
            <input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Nombre"
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+569..."
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1.5">Servicio</label>
          <select
            value={service}
            onChange={(e) => setService(e.target.value as ServiceKey)}
            className="w-full"
          >
            {SVC_OPTIONS.map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5">Talla</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as DogSize)}
              className="w-full"
            >
              {(['XS', 'S', 'M', 'L'] as DogSize[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1.5">Manto</label>
            <select
              value={coat}
              onChange={(e) => setCoat(e.target.value as DogCoat)}
              className="w-full"
            >
              <option value="corto">Corto</option>
              <option value="doble">Doble capa</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1.5">Fecha y hora</label>
          <input
            type="datetime-local"
            value={startStr}
            onChange={(e) => setStartStr(e.target.value)}
            className="w-full"
          />

          <p className="text-xs mt-1 tabular" style={{ color: 'rgba(245,240,232,0.35)' }}>
            Duración estimada: {duration} min hasta{' '}
            {new Date(endStr).toLocaleTimeString('es-CL', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div>
          <label className="block mb-1.5">Precio</label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--pf-gold)' }}
              >
                $
              </span>

              <input
                type="number"
                inputMode="numeric"
                value={displayPrice}
                onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                className="w-full pl-8"
              />
            </div>

            {customPrice !== null && customPrice !== suggestedPrice && (
              <button
                type="button"
                onClick={() => setCustomPrice(null)}
                className="btn-ghost px-3 text-xs shrink-0"
              >
                Restablecer (${suggestedPrice.toLocaleString('es-CL')})
              </button>
            )}
          </div>

          {customPrice === null && (
            <p className="text-xs mt-1" style={{ color: 'rgba(245,240,232,0.3)' }}>
              Precio sugerido según tarifa
            </p>
          )}
        </div>

        {isEdit && (
          <div>
            <label className="block mb-1.5">Estado</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Appointment['status'])}
              className="w-full"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.v} value={o.v}>
                  {o.l}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block mb-1.5">Notas internas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Instrucciones especiales, observaciones…"
            rows={3}
            className="w-full resize-none"
          />
        </div>
      </div>
    </ModalShell>
  )
}
