'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppProvider'
import { SERVICES } from '@/lib/constants'
import { fmtCLP } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function MasPage() {
  const { settings, saveSettings, appointments, dogs, businessExpenses, showToast } = useApp()
  const supabase = createClient()
  const router = useRouter()

  const [tab, setTab] = useState<'precios' | 'mensajes' | 'negocio' | 'datos'>('precios')
  const [s, setS] = useState(settings)

  const handleSave = async () => { await saveSettings(s) }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const exportCSV = () => {
    const rows: string[] = []
    // Appointments
    rows.push('=== CITAS ===')
    rows.push('Fecha,Hora,Perro,Dueño,Teléfono,Servicio,Precio,Estado')
    appointments.forEach(a => {
      const dog = dogs.find(d => d.id === a.dog_id)
      const name = a.client_name || dog?.name || ''
      const d = new Date(a.start_time)
      rows.push([
        d.toLocaleDateString('es-CL'),
        d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        name,
        a.owner_name || dog?.owner_name || '',
        a.phone || dog?.phone || '',
        SERVICES[a.service]?.label || a.service,
        a.price,
        a.status,
      ].join(','))
    })
    rows.push('')
    // Dogs
    rows.push('=== PERROS ===')
    rows.push('Nombre,Raza,Peso,Talla,Manto,Dueño,Teléfono,Visitas')
    dogs.forEach(d => {
      rows.push([d.name, d.breed || '', d.weight || '', d.size, d.coat, d.owner_name || '', d.phone || '', d.visit_count].join(','))
    })
    rows.push('')
    // Expenses
    rows.push('=== EGRESOS NEGOCIO ===')
    rows.push('Fecha,Categoría,Monto,Descripción')
    businessExpenses.forEach(e => {
      rows.push([e.date, e.category, e.amount, e.description || ''].join(','))
    })

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `petfashion_backup_${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV exportado')
  }

  const TABS = [
    { id: 'precios', label: 'Precios' },
    { id: 'mensajes', label: 'Mensajes' },
    { id: 'negocio', label: 'Negocio' },
    { id: 'datos', label: 'Datos' },
  ] as const

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-extrabold mb-4">Configuración</h1>

      {/* Tab bar */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1 mb-5 overflow-x-auto">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition whitespace-nowrap ${tab === t.id ? 'bg-white shadow-sm text-stone-900' : 'text-stone-600'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* PRECIOS */}
      {tab === 'precios' && (
        <div className="space-y-5">
          {/* Corte y Baño */}
          <PriceGroup
            title="Corte y Baño"
            fields={[
              { label: 'XS (0–5 kg)', value: s.prices.corte_bano.XS, onChange: v => setS({ ...s, prices: { ...s.prices, corte_bano: { ...s.prices.corte_bano, XS: v } } }) },
              { label: 'S (5–10 kg)', value: s.prices.corte_bano.S, onChange: v => setS({ ...s, prices: { ...s.prices, corte_bano: { ...s.prices.corte_bano, S: v } } }) },
              { label: 'M (10–20 kg)', value: s.prices.corte_bano.M, onChange: v => setS({ ...s, prices: { ...s.prices, corte_bano: { ...s.prices.corte_bano, M: v } } }) },
              { label: 'L (20–30 kg)', value: s.prices.corte_bano.L, onChange: v => setS({ ...s, prices: { ...s.prices, corte_bano: { ...s.prices.corte_bano, L: v } } }) },
            ]}
          />
          <PriceGroup
            title="Solo Baño"
            fields={[
              { label: 'XS', value: s.prices.solo_bano.XS, onChange: v => setS({ ...s, prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, XS: v } } }) },
              { label: 'S', value: s.prices.solo_bano.S, onChange: v => setS({ ...s, prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, S: v } } }) },
              { label: 'M', value: s.prices.solo_bano.M, onChange: v => setS({ ...s, prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, M: v } } }) },
              { label: 'L corto', value: s.prices.solo_bano.L_corto, onChange: v => setS({ ...s, prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, L_corto: v } } }) },
              { label: 'L doble', value: s.prices.solo_bano.L_doble, onChange: v => setS({ ...s, prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, L_doble: v } } }) },
            ]}
          />
          <PriceGroup
            title="Corte de Uñas"
            fields={[
              { label: 'XS', value: s.prices.unas.XS, onChange: v => setS({ ...s, prices: { ...s.prices, unas: { ...s.prices.unas, XS: v } } }) },
              { label: 'S', value: s.prices.unas.S, onChange: v => setS({ ...s, prices: { ...s.prices, unas: { ...s.prices.unas, S: v } } }) },
              { label: 'M', value: s.prices.unas.M, onChange: v => setS({ ...s, prices: { ...s.prices, unas: { ...s.prices.unas, M: v } } }) },
              { label: 'L', value: s.prices.unas.L, onChange: v => setS({ ...s, prices: { ...s.prices, unas: { ...s.prices.unas, L: v } } }) },
            ]}
          />
          <div className="bg-white border border-stone-200 rounded-2xl p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">Afilado (por cuchilla)</h3>
            <NumberInput value={s.prices.afilado_unidad}
              onChange={v => setS({ ...s, prices: { ...s.prices, afilado_unidad: v } })} />
          </div>
          <SaveButton onSave={handleSave} />
        </div>
      )}

      {/* MENSAJES */}
      {tab === 'mensajes' && (
        <div className="space-y-4">
          <TemplateField
            title="Confirmación"
            hint="Variables: {dueño} {perro} {fecha} {hora} {servicio} {precio}"
            value={s.templates.confirmation}
            onChange={v => setS({ ...s, templates: { ...s.templates, confirmation: v } })}
          />
          <TemplateField
            title="Recordatorio"
            hint="Variables: {dueño} {perro} {fecha} {hora} {servicio}"
            value={s.templates.reminder}
            onChange={v => setS({ ...s, templates: { ...s.templates, reminder: v } })}
          />
          <TemplateField
            title="Pedir reseña"
            hint="Variables: {dueño} {perro} {link_reseña}"
            value={s.templates.review}
            onChange={v => setS({ ...s, templates: { ...s.templates, review: v } })}
          />
          <SaveButton onSave={handleSave} />
        </div>
      )}

      {/* NEGOCIO */}
      {tab === 'negocio' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Nombre del negocio</label>
            <input type="text" value={s.business.name}
              onChange={e => setS({ ...s, business: { ...s.business, name: e.target.value } })}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Dirección</label>
            <input type="text" value={s.business.address}
              onChange={e => setS({ ...s, business: { ...s.business, address: e.target.value } })}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1.5 block">Link Google Reviews</label>
            <input type="url" value={s.business.googleReviewLink}
              onChange={e => setS({ ...s, business: { ...s.business, googleReviewLink: e.target.value } })}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-stone-400" />
          </div>
          <SaveButton onSave={handleSave} />
        </div>
      )}

      {/* DATOS */}
      {tab === 'datos' && (
        <div className="space-y-4">
          <div className="bg-white border border-stone-200 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500">Estadísticas</h3>
            {[
              { label: 'Perros registrados', value: dogs.length },
              { label: 'Citas totales', value: appointments.length },
              { label: 'Egresos del negocio', value: businessExpenses.length },
            ].map(item => (
              <div key={item.label} className="flex justify-between">
                <span className="text-sm text-stone-600">{item.label}</span>
                <span className="font-bold tabular text-sm">{item.value}</span>
              </div>
            ))}
          </div>

          <button onClick={exportCSV}
            className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-left hover:bg-stone-50 transition flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Exportar a CSV</p>
              <p className="text-xs text-stone-500 mt-0.5">Descarga todos los datos como backup</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </button>

          <button onClick={handleLogout}
            className="w-full bg-white border border-red-200 text-red-700 rounded-2xl p-4 text-left hover:bg-red-50 transition flex items-center justify-between">
            <div>
              <p className="font-bold text-sm">Cerrar sesión</p>
              <p className="text-xs text-red-500 mt-0.5">Volver a la pantalla de inicio</p>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Helper components ─────────────────────────────────────────

function PriceGroup({ title, fields }: { title: string; fields: { label: string; value: number; onChange: (v: number) => void }[] }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-2">
        {fields.map(f => (
          <div key={f.label}>
            <label className="text-[10px] font-semibold text-stone-500 block mb-1">{f.label}</label>
            <NumberInput value={f.value} onChange={f.onChange} />
          </div>
        ))}
      </div>
    </div>
  )
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1 bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5">
      <span className="text-stone-400 text-sm">$</span>
      <input type="number" inputMode="numeric" value={value}
        onChange={e => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-transparent text-sm font-bold tabular focus:outline-none" />
    </div>
  )
}

function TemplateField({ title, hint, value, onChange }: { title: string; hint: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">{title}</h3>
      <p className="text-[10px] text-stone-400 mb-2">{hint}</p>
      <textarea value={value} onChange={e => onChange(e.target.value)} rows={5}
        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-stone-400 resize-none" />
    </div>
  )
}

function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <button onClick={onSave} className="w-full bg-stone-900 text-white py-3.5 rounded-xl font-bold hover:bg-stone-800 transition">
      Guardar cambios
    </button>
  )
}
