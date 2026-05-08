'use client'

import { useState, useEffect, useMemo } from 'react'
import { Search, Plus, X, Check, ChevronDown } from 'lucide-react'
import { useApp } from '@/components/AppProvider'
import { ModalShell, Field } from '@/components/ui'
import { SERVICES, SIZES, SERVICE_INCLUDES } from '@/lib/constants'
import { sizeFromWeight, calcPrice, calcDuration, toLocalInput, fromLocalInput, addMinutes, fmtCLP } from '@/lib/utils'
import type { Appointment, Dog, ServiceKey } from '@/lib/types'

interface Props {
  initial: Partial<Appointment> | null
  onClose: () => void
}

type NewDogForm = {
  name: string; weight: string; breed: string
  owner_name: string; phone: string; notes: string; coat: 'corto' | 'doble'
}

export function AppointmentModal({ initial, onClose }: Props) {
  const { dogs, settings, upsertAppointment, upsertDog, showToast } = useApp()
  const isEdit = !!initial?.id

  const [service, setService] = useState<ServiceKey>((initial?.service as ServiceKey) || 'corte_bano')
  const [dogId, setDogId] = useState(initial?.dog_id || '')
  const [creatingNewDog, setCreatingNewDog] = useState(false)
  const [newDog, setNewDog] = useState<NewDogForm>({ name: '', weight: '', breed: '', owner_name: '', phone: '', notes: '', coat: 'corto' })
  const [clientName, setClientName] = useState(initial?.client_name || '')
  const [clientPhone, setClientPhone] = useState(initial?.phone || '')
  const [qty, setQty] = useState(initial?.qty || 1)
  const [startTime, setStartTime] = useState(toLocalInput(initial?.start_time || (initial as { defaultDate?: string })?.defaultDate))
  const [duration, setDuration] = useState(initial?.duration_minutes || 120)
  const [overridePrice, setOverridePrice] = useState(initial?.price_override || false)
  const [customPrice, setCustomPrice] = useState(initial?.price || 0)
  const [status, setStatus] = useState(initial?.status || 'pendiente')
  const [notes, setNotes] = useState(initial?.notes || '')
  const [dogQuery, setDogQuery] = useState('')

  const selectedDog = dogs.find(d => d.id === dogId)

  // Auto-recalc
  useEffect(() => {
    if (service === 'afilado') {
      setDuration(settings.durations.afilado)
      if (!overridePrice) setCustomPrice(calcPrice(settings, 'afilado', 'XS', undefined, qty || 1))
      return
    }
    const targetDog = selectedDog || (creatingNewDog && newDog.weight ? { size: sizeFromWeight(newDog.weight), coat: newDog.coat } as Dog : null)
    if (targetDog) {
      setDuration(calcDuration(settings, service, targetDog.size))
      if (!overridePrice) setCustomPrice(calcPrice(settings, service, targetDog.size, targetDog.coat))
    }
  }, [service, dogId, qty, creatingNewDog, newDog.weight, newDog.coat]) // eslint-disable-line react-hooks/exhaustive-deps

  const filteredDogs = useMemo(() => {
    const q = dogQuery.toLowerCase()
    if (!q) return dogs.slice(0, 8)
    return dogs.filter(d =>
      (d.name || '').toLowerCase().includes(q) ||
      (d.owner_name || '').toLowerCase().includes(q)
    ).slice(0, 8)
  }, [dogs, dogQuery])

  const handleSubmit = async () => {
    let finalDogId = dogId
    let finalClientName = clientName
    let finalPhone = clientPhone
    let finalOwnerName = ''

    if (service === 'afilado') {
      if (!clientName.trim()) { showToast('Falta el nombre del cliente', 'error'); return }
    } else {
      if (!dogId && !creatingNewDog) { showToast('Selecciona o crea un perro', 'error'); return }
      if (creatingNewDog) {
        if (!newDog.name.trim() || !newDog.owner_name.trim()) {
          showToast('Nombre del perro y dueño son obligatorios', 'error'); return
        }
        const created = await upsertDog({
          ...newDog,
          weight: parseFloat(newDog.weight) || 0,
          size: sizeFromWeight(newDog.weight),
        })
        if (!created) return
        finalDogId = created.id
      }
      const d = dogs.find(x => x.id === finalDogId)
      finalClientName = d?.name || newDog.name
      finalOwnerName = d?.owner_name || newDog.owner_name
      finalPhone = d?.phone || newDog.phone
    }

    if (!startTime) { showToast('Falta fecha y hora', 'error'); return }

    const startISO = fromLocalInput(startTime)
    const endISO = addMinutes(startISO, duration)

    await upsertAppointment({
      ...(isEdit ? { id: initial!.id } : {}),
      dog_id: service === 'afilado' ? undefined : (finalDogId || undefined),
      client_name: finalClientName,
      owner_name: finalOwnerName,
      phone: finalPhone,
      service,
      qty: service === 'afilado' ? (parseInt(String(qty)) || 1) : 1,
      start_time: startISO,
      end_time: endISO,
      duration_minutes: duration,
      price: customPrice,
      price_override: overridePrice,
      status: status as Appointment['status'],
      notes,
      ...(isEdit ? {
        reminder_sent: initial!.reminder_sent,
        confirmation_sent: initial!.confirmation_sent,
        review_requested: initial!.review_requested,
        completed_at: initial!.completed_at,
      } : {}),
    })
    onClose()
  }

  return (
    <ModalShell
      title={isEdit ? 'Editar cita' : 'Nueva cita'}
      onClose={onClose}
      footer={
        <button onClick={handleSubmit} className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold hover:bg-stone-800 transition">
          {isEdit ? 'Guardar cambios' : 'Crear cita'}
        </button>
      }
    >
      {/* Service selector */}
      <div>
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Servicio</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(SERVICES).map(([k, v]) => (
            <button key={k} onClick={() => setService(k as ServiceKey)}
              className={`p-3 rounded-xl border text-left transition ${service === k ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white hover:border-stone-300'}`}>
              <p className="font-bold text-sm">{v.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* What's included */}
      <details className="bg-white border border-stone-200 rounded-xl mt-3">
        <summary className="px-3 py-2.5 text-xs font-bold text-stone-700 cursor-pointer flex items-center justify-between">
          <span>¿Qué incluye?</span>
          <ChevronDown size={14} />
        </summary>
        <ul className="px-3 pb-3 pt-1 space-y-1">
          {SERVICE_INCLUDES[service]?.map((it, i) => (
            <li key={i} className="text-xs text-stone-600 flex items-start gap-2">
              <Check size={12} className="text-emerald-600 mt-0.5 shrink-0" /> {it}
            </li>
          ))}
        </ul>
      </details>

      {/* Dog / Client selector */}
      {service === 'afilado' ? (
        <div className="mt-5 space-y-3">
          <Field label="Cliente / Peluquería" value={clientName} onChange={setClientName} />
          <Field label="Teléfono" value={clientPhone} onChange={setClientPhone} inputMode="tel" hint="Incluye 56 (ej: 56945570410)" />
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Cantidad de cuchillas</label>
            <input type="number" inputMode="numeric" value={qty} min={1}
              onChange={e => setQty(parseInt(e.target.value) || 1)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400" />
          </div>
        </div>
      ) : (
        <div className="mt-5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Perro</label>

          {!creatingNewDog && !dogId && (
            <>
              <div className="relative mb-2">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input value={dogQuery} onChange={e => setDogQuery(e.target.value)}
                  placeholder="Buscar perro existente…"
                  className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-stone-400" />
              </div>
              <div className="space-y-1 mb-2 max-h-48 overflow-y-auto">
                {filteredDogs.length === 0
                  ? <p className="text-xs text-stone-500 italic px-2 py-3">Sin coincidencias</p>
                  : filteredDogs.map(d => (
                    <button key={d.id} onClick={() => setDogId(d.id)}
                      className="w-full bg-white border border-stone-200 rounded-xl p-2.5 flex items-center gap-2 text-left hover:border-stone-300 transition">
                      <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                        {(d.name || '?').slice(0, 1).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{d.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{d.owner_name} · {d.size} · {d.weight} kg</p>
                      </div>
                    </button>
                  ))
                }
              </div>
              <button onClick={() => setCreatingNewDog(true)}
                className="w-full border-2 border-dashed border-stone-300 rounded-xl p-3 text-sm font-semibold text-stone-700 hover:bg-white hover:border-stone-400 transition flex items-center justify-center gap-1.5">
                <Plus size={16} /> Crear perro nuevo
              </button>
            </>
          )}

          {!creatingNewDog && dogId && selectedDog && (
            <div className="bg-white border border-stone-200 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold">
                {selectedDog.name?.slice(0, 1).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{selectedDog.name}</p>
                <p className="text-xs text-stone-500 truncate">
                  {selectedDog.owner_name} · {selectedDog.size} · {selectedDog.weight} kg
                  {selectedDog.coat === 'doble' ? ' · Doble capa' : ''}
                </p>
              </div>
              <button onClick={() => setDogId('')} className="text-stone-500 p-1.5 -m-1.5 rounded-lg hover:bg-stone-100">
                <X size={16} />
              </button>
            </div>
          )}

          {creatingNewDog && (
            <div className="bg-white border border-stone-200 rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Datos del nuevo perro</p>
              <input value={newDog.name} onChange={e => setNewDog({ ...newDog, name: e.target.value })} placeholder="Nombre del perro *"
                className="w-full bg-stone-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-stone-200" />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" inputMode="decimal" value={newDog.weight} onChange={e => setNewDog({ ...newDog, weight: e.target.value })} placeholder="Peso (kg)"
                  className="bg-stone-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-stone-200" />
                <select value={newDog.coat} onChange={e => setNewDog({ ...newDog, coat: e.target.value as 'corto' | 'doble' })}
                  className="bg-stone-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-stone-200">
                  <option value="corto">Manto corto</option>
                  <option value="doble">Doble capa</option>
                </select>
              </div>
              <input value={newDog.breed} onChange={e => setNewDog({ ...newDog, breed: e.target.value })} placeholder="Raza"
                className="w-full bg-stone-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-stone-200" />
              <input value={newDog.owner_name} onChange={e => setNewDog({ ...newDog, owner_name: e.target.value })} placeholder="Nombre del dueño *"
                className="w-full bg-stone-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-stone-200" />
              <input inputMode="tel" value={newDog.phone} onChange={e => setNewDog({ ...newDog, phone: e.target.value })} placeholder="Teléfono (ej: 56945570410)"
                className="w-full bg-stone-50 rounded-lg px-3 py-2.5 text-sm focus:outline-none border border-stone-200" />
              <button onClick={() => { setCreatingNewDog(false); setNewDog({ name: '', weight: '', breed: '', owner_name: '', phone: '', notes: '', coat: 'corto' }) }}
                className="text-xs text-stone-500 underline">Cancelar</button>
            </div>
          )}
        </div>
      )}

      {/* Date / Duration */}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Fecha y hora</label>
          <input type="datetime-local" value={startTime} onChange={e => setStartTime(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400" />
        </div>
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Duración (min)</label>
          <input type="number" inputMode="numeric" value={duration} onChange={e => setDuration(parseInt(e.target.value) || 0)}
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400 tabular" />
        </div>
      </div>

      {/* Price */}
      <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-900">Precio</p>
          <label className="flex items-center gap-1.5 text-xs text-emerald-900 cursor-pointer">
            <input type="checkbox" checked={overridePrice} onChange={e => setOverridePrice(e.target.checked)} />
            Editar manualmente
          </label>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-emerald-700 font-bold text-lg">$</span>
          <input type="number" inputMode="numeric" value={customPrice} disabled={!overridePrice}
            onChange={e => setCustomPrice(parseInt(e.target.value) || 0)}
            className="text-2xl font-extrabold tabular bg-transparent w-full focus:outline-none disabled:opacity-100" />
        </div>
        {!overridePrice && <p className="text-[11px] text-emerald-700 mt-1">Auto · según talla y servicio</p>}
      </div>

      {/* Status (edit only) */}
      {isEdit && (
        <div className="mt-5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Estado</label>
          <select value={status} onChange={e => setStatus(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400">
            <option value="pendiente">Pendiente</option>
            <option value="confirmada">Confirmada</option>
            <option value="completada">Completada</option>
            <option value="cancelada">Cancelada</option>
            <option value="no_show">No asistió</option>
          </select>
        </div>
      )}

      {/* Notes */}
      <div className="mt-5">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Notas</label>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
          placeholder="Observaciones, preferencias del cliente, etc."
          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400 resize-none" />
      </div>
    </ModalShell>
  )
}
