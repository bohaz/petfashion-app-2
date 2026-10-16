'use client'

import { useState } from 'react'
import { useApp } from '@/components/AppProvider'
import { SERVICES } from '@/lib/constants'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Download, LogOut } from 'lucide-react'

export default function MasPage() {
  const { settings, saveSettings, appointments, dogs, businessExpenses, showToast } = useApp()
  const supabase = createClient()
  const router = useRouter()

  const [tab, setTab] = useState<'precios' | 'mensajes' | 'negocio' | 'datos'>('precios')
  const [s, setS] = useState(settings)

  const handleSave = async () => {
    await saveSettings(s)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const exportCSV = () => {
    const rows: string[] = []
    rows.push('=== CITAS ===')
    rows.push('Fecha,Hora,Perro,Dueño,Teléfono,Servicio,Precio,Estado')
    appointments.forEach((a) => {
      const dog = dogs.find((d) => d.id === a.dog_id)
      const name = a.client_name || dog?.name || ''
      const d = new Date(a.start_time)
      rows.push(
        [
          d.toLocaleDateString('es-CL'),
          d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          name,
          a.owner_name || dog?.owner_name || '',
          a.phone || dog?.phone || '',
          SERVICES[a.service]?.label || a.service,
          a.price,
          a.status,
        ].join(','),
      )
    })
    rows.push('')
    rows.push('=== PERROS ===')
    rows.push('Nombre,Raza,Peso,Talla,Manto,Dueño,Teléfono,Visitas')
    dogs.forEach((d) => {
      rows.push(
        [
          d.name,
          d.breed || '',
          d.weight || '',
          d.size,
          d.coat,
          d.owner_name || '',
          d.phone || '',
          d.visit_count,
        ].join(','),
      )
    })
    rows.push('')
    rows.push('=== EGRESOS NEGOCIO ===')
    rows.push('Fecha,Categoría,Monto,Descripción')
    businessExpenses.forEach((e) => {
      rows.push([e.date, e.category, e.amount, e.description || ''].join(','))
    })
    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `petfashion_backup_${new Date().toISOString().slice(0, 10)}.csv`
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
    <div>
      <header className="mb-6">
        <div className="section-label">Configuración</div>
        <h1 className="display">Ajustes</h1>
      </header>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'var(--pf-bg3)' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-1 py-2 px-2 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
            style={
              tab === t.id
                ? {
                    background: 'var(--pf-bg2)',
                    color: 'var(--pf-gold-l)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }
                : { color: 'rgba(245,240,232,0.4)' }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* PRECIOS */}
      {tab === 'precios' && (
        <div className="space-y-5">
          <PriceGroup
            title="Corte y Baño"
            fields={[
              {
                label: 'XS (0–5 kg)',
                value: s.prices.corte_bano.XS,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, corte_bano: { ...s.prices.corte_bano, XS: v } },
                  }),
              },
              {
                label: 'S (5–10 kg)',
                value: s.prices.corte_bano.S,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, corte_bano: { ...s.prices.corte_bano, S: v } },
                  }),
              },
              {
                label: 'M (10–20 kg)',
                value: s.prices.corte_bano.M,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, corte_bano: { ...s.prices.corte_bano, M: v } },
                  }),
              },
              {
                label: 'L (20–30 kg)',
                value: s.prices.corte_bano.L,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, corte_bano: { ...s.prices.corte_bano, L: v } },
                  }),
              },
            ]}
          />
          <PriceGroup
            title="Solo Baño"
            fields={[
              {
                label: 'XS',
                value: s.prices.solo_bano.XS,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, XS: v } },
                  }),
              },
              {
                label: 'S',
                value: s.prices.solo_bano.S,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, S: v } },
                  }),
              },
              {
                label: 'M',
                value: s.prices.solo_bano.M,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, M: v } },
                  }),
              },
              {
                label: 'L corto',
                value: s.prices.solo_bano.L_corto,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, L_corto: v } },
                  }),
              },
              {
                label: 'L doble',
                value: s.prices.solo_bano.L_doble,
                onChange: (v) =>
                  setS({
                    ...s,
                    prices: { ...s.prices, solo_bano: { ...s.prices.solo_bano, L_doble: v } },
                  }),
              },
            ]}
          />
          <PriceGroup
            title="Corte de Uñas"
            fields={[
              {
                label: 'XS',
                value: s.prices.unas.XS,
                onChange: (v) =>
                  setS({ ...s, prices: { ...s.prices, unas: { ...s.prices.unas, XS: v } } }),
              },
              {
                label: 'S',
                value: s.prices.unas.S,
                onChange: (v) =>
                  setS({ ...s, prices: { ...s.prices, unas: { ...s.prices.unas, S: v } } }),
              },
              {
                label: 'M',
                value: s.prices.unas.M,
                onChange: (v) =>
                  setS({ ...s, prices: { ...s.prices, unas: { ...s.prices.unas, M: v } } }),
              },
              {
                label: 'L',
                value: s.prices.unas.L,
                onChange: (v) =>
                  setS({ ...s, prices: { ...s.prices, unas: { ...s.prices.unas, L: v } } }),
              },
            ]}
          />
          <div className="card">
            <div className="section-label">Afilado (por cuchilla)</div>
            <NumberInput
              value={s.prices.afilado_unidad}
              onChange={(v) => setS({ ...s, prices: { ...s.prices, afilado_unidad: v } })}
            />
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
            onChange={(v) => setS({ ...s, templates: { ...s.templates, confirmation: v } })}
          />
          <TemplateField
            title="Recordatorio"
            hint="Variables: {dueño} {perro} {fecha} {hora} {servicio}"
            value={s.templates.reminder}
            onChange={(v) => setS({ ...s, templates: { ...s.templates, reminder: v } })}
          />
          <TemplateField
            title="Pedir reseña"
            hint="Variables: {dueño} {perro} {link_reseña}"
            value={s.templates.review}
            onChange={(v) => setS({ ...s, templates: { ...s.templates, review: v } })}
          />
          <SaveButton onSave={handleSave} />
        </div>
      )}

      {/* NEGOCIO */}
      {tab === 'negocio' && (
        <div className="space-y-4">
          <div className="card">
            <div className="section-label">Información del negocio</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block mb-1.5">Nombre del negocio</label>
                <input
                  type="text"
                  value={s.business.name}
                  onChange={(e) =>
                    setS({ ...s, business: { ...s.business, name: e.target.value } })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1.5">Dirección</label>
                <input
                  type="text"
                  value={s.business.address}
                  onChange={(e) =>
                    setS({ ...s, business: { ...s.business, address: e.target.value } })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block mb-1.5">Link Google Reviews</label>
                <input
                  type="url"
                  value={s.business.googleReviewLink}
                  onChange={(e) =>
                    setS({ ...s, business: { ...s.business, googleReviewLink: e.target.value } })
                  }
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <SaveButton onSave={handleSave} />
        </div>
      )}

      {/* DATOS */}
      {tab === 'datos' && (
        <div className="space-y-4">
          <div className="card">
            <div className="section-label">Estadísticas</div>
            <div className="space-y-3">
              {[
                { label: 'Perros registrados', value: dogs.length },
                { label: 'Citas totales', value: appointments.length },
                { label: 'Egresos del negocio', value: businessExpenses.length },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex justify-between py-2"
                  style={{ borderBottom: '1px solid var(--pf-border)' }}
                >
                  <span className="text-sm" style={{ color: 'rgba(245,240,232,0.5)' }}>
                    {item.label}
                  </span>
                  <span className="font-bold tabular text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={exportCSV}
            className="w-full card text-left transition-all"
            style={{ cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--pf-gold-border)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--pf-border)')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-white">Exportar a CSV</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(245,240,232,0.4)' }}>
                  Descarga todos los datos como backup
                </p>
              </div>
              <Download size={17} style={{ color: 'var(--pf-gold)' }} />
            </div>
          </button>

          <button
            onClick={handleLogout}
            className="w-full card text-left transition-all"
            style={{ cursor: 'pointer', borderColor: 'rgba(239,68,68,0.2)' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--pf-bg2)')}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-sm" style={{ color: '#f87171' }}>
                  Cerrar sesión
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(239,68,68,0.5)' }}>
                  Volver a la pantalla de inicio
                </p>
              </div>
              <LogOut size={17} style={{ color: '#f87171' }} />
            </div>
          </button>
        </div>
      )}
    </div>
  )
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function PriceGroup({
  title,
  fields,
}: {
  title: string
  fields: { label: string; value: number; onChange: (v: number) => void }[]
}) {
  return (
    <div className="card">
      <div className="section-label">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        {fields.map((f) => (
          <div key={f.label}>
            <label className="block mb-1">{f.label}</label>
            <NumberInput value={f.value} onChange={f.onChange} />
          </div>
        ))}
      </div>
    </div>
  )
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div
      className="flex items-center gap-1 rounded-lg px-3 py-2"
      style={{ background: 'var(--pf-bg3)', border: '1px solid var(--pf-border)' }}
    >
      <span className="text-sm" style={{ color: 'var(--pf-gold)' }}>
        $
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value) || 0)}
        className="w-full bg-transparent text-sm font-bold tabular text-white focus:outline-none"
        style={{ border: 'none', padding: 0, borderRadius: 0 }}
      />
    </div>
  )
}

function TemplateField({
  title,
  hint,
  value,
  onChange,
}: {
  title: string
  hint: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="card">
      <div className="section-label">{title}</div>
      <p className="text-xs mb-2.5" style={{ color: 'rgba(245,240,232,0.3)' }}>
        {hint}
      </p>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={5}
        className="w-full resize-none"
        style={{ fontSize: '13px' }}
      />
    </div>
  )
}

function SaveButton({ onSave }: { onSave: () => void }) {
  return (
    <button onClick={onSave} className="btn-gold w-full">
      Guardar cambios
    </button>
  )
}
