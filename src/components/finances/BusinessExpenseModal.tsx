'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppProvider'
import { ModalShell } from '@/components/ui'
import { BUSINESS_CATEGORIES } from '@/lib/constants'
import type { BusinessExpense } from '@/lib/types'

interface Props { initial: Partial<BusinessExpense> | null; onClose: () => void }

export function BusinessExpenseModal({ initial, onClose }: Props) {
  const { upsertBusinessExpense, deleteBusinessExpense, showToast } = useApp()
  const isEdit = !!initial?.id

  const [data, setData] = useState({
    date:        initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    category:    initial?.category    || 'insumos',
    amount:      String(initial?.amount || ''),
    description: initial?.description || '',
  })

  const handleSubmit = async () => {
    if (!data.amount || parseInt(data.amount) <= 0) { showToast('Falta el monto', 'error'); return }
    await upsertBusinessExpense({
      ...(isEdit ? { id: initial!.id } : {}),
      date: data.date,
      category: data.category,
      amount: parseInt(data.amount),
      description: data.description,
    })
    onClose()
  }

  return (
    <ModalShell
      title={isEdit ? 'Editar egreso' : 'Nuevo egreso'}
      onClose={onClose}
      footer={
        <div className="space-y-2">
          <button onClick={handleSubmit} className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold hover:bg-stone-800 transition">
            {isEdit ? 'Guardar' : 'Registrar egreso'}
          </button>
          {isEdit && (
            <button onClick={async () => { await deleteBusinessExpense(initial!.id!); onClose() }}
              className="w-full text-red-600 text-sm font-semibold py-2 hover:bg-red-50 rounded-xl transition">
              Eliminar egreso
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Fecha</label>
          <input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })}
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Categoría</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(BUSINESS_CATEGORIES).map(([k, v]) => (
              <button key={k} onClick={() => setData({ ...data, category: k })}
                className={`p-3 rounded-xl border text-left transition ${
                  data.category === k ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white hover:border-stone-300'
                }`}>
                <p className="font-bold text-sm">{v.label}</p>
                {v.desc && <p className={`text-[10px] mt-0.5 ${data.category === k ? 'text-white/70' : 'text-stone-500'}`}>{v.desc}</p>}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Monto</label>
          <div className="flex items-baseline gap-1 bg-white border border-stone-200 rounded-xl px-3 py-2">
            <span className="text-stone-400 text-xl">$</span>
            <input type="number" inputMode="numeric" value={data.amount} onChange={e => setData({ ...data, amount: e.target.value })}
              placeholder="0"
              className="w-full text-2xl font-extrabold tabular bg-transparent focus:outline-none" />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Descripción</label>
          <input type="text" value={data.description} onChange={e => setData({ ...data, description: e.target.value })}
            placeholder="Detalle opcional"
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400" />
        </div>
      </div>
    </ModalShell>
  )
}
