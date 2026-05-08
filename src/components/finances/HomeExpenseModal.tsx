'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppProvider'
import { ModalShell } from '@/components/ui'
import { HOME_CATEGORIES } from '@/lib/constants'
import type { HomeExpense } from '@/lib/types'

interface Props { initial: Partial<HomeExpense> | null; onClose: () => void }

export function HomeExpenseModal({ initial, onClose }: Props) {
  const { upsertHomeExpense, deleteHomeExpense, showToast } = useApp()
  const isEdit = !!initial?.id

  const [data, setData] = useState({
    date:        initial?.date ? initial.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
    category:    initial?.category    || 'mercado',
    amount:      String(initial?.amount || ''),
    description: initial?.description || '',
  })

  const handleSubmit = async () => {
    if (!data.amount || parseInt(data.amount) <= 0) { showToast('Falta el monto', 'error'); return }
    await upsertHomeExpense({
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
      title={isEdit ? 'Editar gasto' : 'Nuevo gasto del hogar'}
      onClose={onClose}
      footer={
        <div className="space-y-2">
          <button onClick={handleSubmit} className="w-full bg-indigo-700 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-600 transition">
            {isEdit ? 'Guardar' : 'Registrar gasto'}
          </button>
          {isEdit && (
            <button onClick={async () => { await deleteHomeExpense(initial!.id!); onClose() }}
              className="w-full text-red-600 text-sm font-semibold py-2 hover:bg-red-50 rounded-xl transition">
              Eliminar gasto
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Home badge */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4338ca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <p className="text-xs font-semibold text-indigo-800">Gasto del hogar — separado del negocio</p>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Fecha</label>
          <input type="date" value={data.date} onChange={e => setData({ ...data, date: e.target.value })}
            className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400" />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-2 block">Categoría</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(HOME_CATEGORIES).map(([k, v]) => (
              <button key={k} onClick={() => setData({ ...data, category: k })}
                className={`p-3 rounded-xl border text-left transition ${
                  data.category === k ? 'border-indigo-700 bg-indigo-700 text-white' : 'border-stone-200 bg-white hover:border-stone-300'
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
