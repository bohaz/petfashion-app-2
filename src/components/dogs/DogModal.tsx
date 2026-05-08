'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppProvider'
import { ModalShell, Field } from '@/components/ui'
import { sizeFromWeight } from '@/lib/utils'
import type { Dog } from '@/lib/types'

interface Props { initial: Partial<Dog> | null; onClose: () => void }

export function DogModal({ initial, onClose }: Props) {
  const { upsertDog, showToast } = useApp()
  const isEdit = !!initial?.id

  const [data, setData] = useState({
    name:       initial?.name       || '',
    breed:      initial?.breed      || '',
    weight:     String(initial?.weight || ''),
    size:       initial?.size       || '',
    coat:       initial?.coat       || 'corto' as 'corto' | 'doble',
    owner_name: initial?.owner_name || '',
    phone:      initial?.phone      || '',
    notes:      initial?.notes      || '',
  })

  const autoSize = sizeFromWeight(data.weight)

  const handleSubmit = async () => {
    if (!data.name.trim()) { showToast('Falta el nombre', 'error'); return }
    if (!data.owner_name.trim()) { showToast('Falta el nombre del dueño', 'error'); return }
    await upsertDog({
      ...(isEdit ? { id: initial!.id! } : {}),
      ...data,
      weight: parseFloat(data.weight) || 0,
      size: (data.size || autoSize) as Dog['size'],
    })
    onClose()
  }

  const SIZES_LABELS = [
    { v: 'XS', l: 'XS (0–5 kg)' },
    { v: 'S',  l: 'S (5–10 kg)' },
    { v: 'M',  l: 'M (10–20 kg)' },
    { v: 'L',  l: 'L (20–30 kg)' },
  ]

  return (
    <ModalShell
      title={isEdit ? 'Editar perro' : 'Nuevo perro'}
      onClose={onClose}
      footer={
        <button onClick={handleSubmit} className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold hover:bg-stone-800 transition">
          {isEdit ? 'Guardar cambios' : 'Crear perro'}
        </button>
      }
    >
      <div className="space-y-3">
        <Field label="Nombre del perro *" value={data.name} onChange={v => setData({ ...data, name: v })} />
        <Field label="Raza" value={data.breed} onChange={v => setData({ ...data, breed: v })} />

        <div className="grid grid-cols-2 gap-2">
          <Field label="Peso (kg)" value={data.weight} onChange={v => setData({ ...data, weight: v })} type="number" inputMode="decimal" />
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">
              Talla {data.weight && <span className="text-emerald-700">(auto: {autoSize})</span>}
            </label>
            <select
              value={data.size || autoSize}
              onChange={e => setData({ ...data, size: e.target.value })}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400"
            >
              {SIZES_LABELS.map(s => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
        </div>

        {/* Coat type */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Tipo de manto</label>
          <div className="flex gap-2">
            {(['corto', 'doble'] as const).map(c => (
              <button key={c} onClick={() => setData({ ...data, coat: c })}
                className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition ${
                  data.coat === c ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white hover:border-stone-300'
                }`}>
                {c === 'corto' ? 'Manto corto' : 'Doble capa'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-stone-500 mt-1">Afecta el precio en Solo Baño talla L</p>
        </div>

        <div className="pt-3 border-t border-stone-200 space-y-3">
          <Field label="Nombre del dueño *" value={data.owner_name} onChange={v => setData({ ...data, owner_name: v })} />
          <Field label="Teléfono WhatsApp" value={data.phone} onChange={v => setData({ ...data, phone: v })}
            inputMode="tel" hint="Incluye 56 (ej: 56945570410)" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Notas / Alergias</label>
          <textarea value={data.notes} onChange={e => setData({ ...data, notes: e.target.value })} rows={3}
            placeholder="Alergias, comportamiento, preferencias…"
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400 resize-none" />
        </div>
      </div>
    </ModalShell>
  )
}
