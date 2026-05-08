'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppProvider'
import { ModalShell } from '@/components/ui'
import { BUSINESS_CATEGORIES } from '@/lib/constants'
import type { BusinessExpense } from '@/lib/types'

interface Props {
  expense?: Partial<BusinessExpense> | null
  onClose: () => void
}

export function BusinessExpenseModal({ expense, onClose }: Props) {
  const { saveBusinessExpense, deleteBusinessExpense, setModal } = useApp()

  const isEdit = !!expense?.id
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const [category, setCategory] = useState(
    expense?.category || Object.keys(BUSINESS_CATEGORIES)[0]
  )
  const [amount, setAmount] = useState(String(expense?.amount || ''))
  const [date, setDate] = useState(
    expense?.date ? expense.date.slice(0, 10) : today
  )
  const [description, setDescription] = useState(expense?.description || '')

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount)

    if (!date || !amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) return

    setSaving(true)

    const data: Partial<BusinessExpense> = {
      ...(expense || {}),
      category,
      amount: parsedAmount,
      date,
      description: description.trim() || undefined,
    }

    await saveBusinessExpense(data)

    setSaving(false)
    onClose()
  }

  const handleDelete = () => {
    if (!expense?.id) return

    setModal({
      type: 'confirm',
      data: {
        title: '¿Eliminar egreso?',
        message: 'Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        danger: true,
        onConfirm: async () => {
          await deleteBusinessExpense(expense.id!)
          onClose()
        },
      },
    })
  }

  return (
    <ModalShell
      title={isEdit ? 'Editar egreso' : 'Nuevo egreso'}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          {isEdit && (
            <button
              onClick={handleDelete}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold"
              style={{
                background: 'rgba(239,68,68,0.08)',
                color: '#f87171',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              Eliminar
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving || !amount || !date}
            className="flex-1 btn-gold"
          >
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar egreso'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="block mb-1.5">Categoría</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full"
          >
            {Object.entries(BUSINESS_CATEGORIES).map(([key, value]) => (
              <option key={key} value={key}>
                {(value as { label: string }).label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block mb-1.5">Monto</label>

            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: 'var(--pf-gold)' }}
              >
                $
              </span>

              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-8"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1.5">Fecha</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5">Descripción (opcional)</label>
          <input
            type="text"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Detalle del gasto…"
            className="w-full"
          />
        </div>
      </div>
    </ModalShell>
  )
}