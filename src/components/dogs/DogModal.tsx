'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppProvider'
import { ModalShell } from '@/components/ui'
import { sizeFromWeight } from '@/lib/utils'
import type { Dog, DogSize, DogCoat } from '@/lib/types'

interface Props {
  dog?: Partial<Dog> | null
  onClose: () => void
}

export function DogModal({ dog, onClose }: Props) {
  const { saveDog } = useApp()
  const isEdit = !!dog?.id
  const [saving, setSaving] = useState(false)

  const [name, setName] = useState(dog?.name || '')
  const [breed, setBreed] = useState(dog?.breed || '')
  const [weight, setWeight] = useState(String(dog?.weight || ''))
  const [size, setSize] = useState<DogSize>((dog?.size as DogSize) || 'S')
  const [coat, setCoat] = useState<DogCoat>((dog?.coat as DogCoat) || 'corto')
  const [ownerName, setOwnerName] = useState(dog?.owner_name || '')
  const [phone, setPhone] = useState(dog?.phone || '')
  const [notes, setNotes] = useState(dog?.notes || '')

  const handleWeightChange = (v: string) => {
    setWeight(v)
    const kg = parseFloat(v)
    if (!isNaN(kg) && kg > 0) setSize(sizeFromWeight(kg))
  }

  const handleSave = async () => {
    if (!name.trim()) return

    setSaving(true)

    const data: Partial<Dog> & { name: string } = {
      ...(dog || {}),
      name: name.trim(),
      breed: breed.trim() || undefined,
      weight: weight ? parseFloat(weight) : undefined,
      size,
      coat,
      owner_name: ownerName.trim() || undefined,
      phone: phone.trim() || undefined,
      notes: notes.trim() || undefined,
    }

    await saveDog(data)

    setSaving(false)
    onClose()
  }

  const SIZE_OPTIONS: DogSize[] = ['XS', 'S', 'M', 'L']

  const SIZE_LABELS: Record<DogSize, string> = {
    XS: 'XS · 0–5 kg',
    S: 'S · 5–10 kg',
    M: 'M · 10–20 kg',
    L: 'L · 20+ kg',
  }

  const COAT_OPTIONS: { value: DogCoat; label: string }[] = [
    { value: 'corto', label: 'Corto' },
    { value: 'doble', label: 'Doble capa' },
  ]

  return (
    <ModalShell
      title={isEdit ? 'Editar perro' : 'Nuevo perro'}
      onClose={onClose}
      footer={
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="btn-gold w-full"
        >
          {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Agregar perro'}
        </button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5">Nombre *</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Max"
              className="w-full"
            />
          </div>

          <div>
            <label className="block mb-1.5">Raza</label>
            <input
              value={breed}
              onChange={e => setBreed(e.target.value)}
              placeholder="Golden retriever"
              className="w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5">Peso (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={weight}
              onChange={e => handleWeightChange(e.target.value)}
              placeholder="0.0"
              className="w-full"
            />

            <p className="text-xs mt-1" style={{ color: 'rgba(245,240,232,0.3)' }}>
              Se sugiere la talla automáticamente
            </p>
          </div>

          <div>
            <label className="block mb-1.5">Talla</label>
            <select
              value={size}
              onChange={e => setSize(e.target.value as DogSize)}
              className="w-full"
            >
              {SIZE_OPTIONS.map(s => (
                <option key={s} value={s}>
                  {SIZE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-1.5">Tipo de manto</label>

          <div className="flex gap-2">
            {COAT_OPTIONS.map(o => (
              <button
                key={o.value}
                type="button"
                onClick={() => setCoat(o.value)}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                style={
                  coat === o.value
                    ? {
                        background: 'var(--pf-gold)',
                        color: 'var(--pf-bg)',
                      }
                    : {
                        background: 'var(--pf-bg3)',
                        color: 'rgba(245,240,232,0.5)',
                        border: '1px solid var(--pf-border)',
                      }
                }
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1.5">Nombre del dueño/a</label>
          <input
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
            placeholder="María González"
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1.5">Teléfono</label>
          <input
            type="tel"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder="+56912345678"
            className="w-full"
          />
        </div>

        <div>
          <label className="block mb-1.5">Notas internas</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Alergias, comportamiento, instrucciones…"
            rows={3}
            className="w-full resize-none"
          />
        </div>
      </div>
    </ModalShell>
  )
}