'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppProvider'
import { ModalShell } from '@/components/ui'
import { HOME_CATEGORIES } from '@/lib/constants'
import type { HomeExpense } from '@/lib/types'

interface Props {
  expense?: Partial<HomeExpense> | null
  onClose: () => void
}

export function HomeExpenseModal({ expense, onClose }: Props) {
  const { saveHomeExpense, deleteHomeExpense, setModal } = useApp()

  const isEdit = !!expense?.id
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const [category, setCategory] = useState(expense?.category || Object.keys(HOME_CATEGORIES)[0])

  const [amount, setAmount] = useState(String(expense?.amount || ''))

  const [date, setDate] = useState(expense?.date ? expense.date.slice(0, 10) : today)

  const [description, setDescription] = useState(expense?.description || '')

  const handleSave = async () => {
    const parsedAmount = parseFloat(amount)

    if (!date || !amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      return
    }

    setSaving(true)

    const data: Partial<HomeExpense> = {
      ...(expense || {}),
      category,
      amount: parsedAmount,
      date,
      description: description.trim() || undefined,
    }

    await saveHomeExpense(data)

    setSaving(false)
    onClose()
  }

  const handleDelete = () => {
    if (!expense?.id) return

    setModal({
      type: 'confirm',
      data: {
        title: '¿Eliminar gasto?',
        message: 'Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
        danger: true,
        onConfirm: async () => {
          await deleteHomeExpense(expense.id!)
          onClose()
        },
      },
    })
  }

  return (
    <ModalShell
      title={isEdit ? 'Editar gasto' : 'Nuevo gasto del hogar'}
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
            className="flex-1 py-2.5 rounded-xl font-bold text-sm"
            style={{
              background: 'rgba(99,102,241,0.9)',
              color: 'white',
            }}
          >
            {saving ? 'Guardando…' : isEdit ? 'Guardar cambios' : 'Registrar gasto'}
          </button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div
          className="rounded-xl p-3 flex items-center gap-2"
          style={{
            background: 'rgba(99,102,241,0.07)',
            border: '1px solid rgba(99,102,241,0.2)',
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#a5b4fc"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>

          <p className="text-xs font-medium" style={{ color: '#a5b4fc' }}>
            Gasto del hogar — no afecta las finanzas del negocio
          </p>
        </div>

        <div>
          <label className="block mb-1.5">Categoría</label>

          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full">
            {Object.entries(HOME_CATEGORIES).map(([key, value]) => (
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
                style={{ color: '#a5b4fc' }}
              >
                $
              </span>

              <input
                type="number"
                inputMode="numeric"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1.5">Descripción (opcional)</label>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="¿En qué se gastó?"
            className="w-full"
          />
        </div>
      </div>
    </ModalShell>
  )
}
