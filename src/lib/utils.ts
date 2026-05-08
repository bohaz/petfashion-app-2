import type { AppSettings, DogSize, ServiceKey } from './types'

// ── Formatting ────────────────────────────────────────────────

export const fmtCLP = (n: number): string =>
  '$' + Math.round(n || 0).toLocaleString('es-CL')

export const fmtDateLong = (iso: string): string => {
  const d = new Date(iso)
  const days = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado']
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
  return `${days[d.getDay()]} ${d.getDate()} de ${months[d.getMonth()]}`
}

export const fmtDateShort = (iso: string): string => {
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`
}

export const fmtTime = (iso: string): string => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

export const fmtMonth = (date: Date): string => {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return `${months[date.getMonth()]} ${date.getFullYear()}`
}

export const toLocalInput = (date?: string | Date | null): string => {
  const d = date ? new Date(date) : new Date()
  const pad = (n: number) => String(n).padStart(2,'0')
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const fromLocalInput = (str: string): string =>
  new Date(str).toISOString()

export const addMinutes = (iso: string, mins: number): string =>
  new Date(new Date(iso).getTime() + mins * 60000).toISOString()

export const sameDay = (a: string | Date, b: string | Date): boolean => {
  const x = new Date(a), y = new Date(b)
  return x.getFullYear() === y.getFullYear() && x.getMonth() === y.getMonth() && x.getDate() === y.getDate()
}

export const startOfDay = (d: Date): Date => {
  const x = new Date(d); x.setHours(0,0,0,0); return x
}

export const cleanPhone = (p: string): string => (p || '').replace(/\D/g,'')

// ── Business logic ────────────────────────────────────────────

export const sizeFromWeight = (kg: string | number): DogSize => {
  const w = parseFloat(String(kg))
  if (!w || w <= 0) return 'XS'
  if (w <= 5)  return 'XS'
  if (w <= 10) return 'S'
  if (w <= 20) return 'M'
  return 'L'
}

export const calcPrice = (
  settings: AppSettings,
  service: ServiceKey,
  size: DogSize,
  coat?: string,
  qty = 1,
): number => {
  if (service === 'afilado') return (settings.prices.afilado_unidad || 0) * qty
  if (service === 'solo_bano' && size === 'L') {
    return coat === 'doble'
      ? settings.prices.solo_bano.L_doble
      : settings.prices.solo_bano.L_corto
  }
  const svc = settings.prices[service] as Record<DogSize, number> | undefined
  return svc?.[size] || 0
}

export const calcDuration = (
  settings: AppSettings,
  service: ServiceKey,
  size: DogSize,
): number => {
  if (service === 'afilado') return settings.durations.afilado
  const svc = settings.durations[service] as Record<DogSize, number> | undefined
  return svc?.[size] || 60
}

// ── WhatsApp / Calendar ───────────────────────────────────────

export const fillTemplate = (tpl: string, vars: Record<string, string>): string =>
  tpl.replace(/\{(\w+)\}/g, (_, k) => vars[k] !== undefined ? vars[k] : `{${k}}`)

export const waLink = (phone: string, message: string): string => {
  const p = cleanPhone(phone)
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`
}

export const gcalLink = (
  start: string,
  end: string,
  title: string,
  details: string,
  location: string,
): string => {
  const fmt = (d: Date) => d.toISOString().replace(/[-:.]/g,'').slice(0,15) + 'Z'
  const s = new Date(start), e = new Date(end)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${fmt(s)}/${fmt(e)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`
}

// ── Status badge ──────────────────────────────────────────────

export const statusBadge = (status: string) => {
  const m: Record<string, { c: string; l: string }> = {
    pendiente:  { c: 'bg-stone-100 text-stone-700',     l: 'Pendiente' },
    confirmada: { c: 'bg-sky-100 text-sky-700',         l: 'Confirmada' },
    completada: { c: 'bg-emerald-100 text-emerald-700', l: 'Completada' },
    cancelada:  { c: 'bg-red-100 text-red-700',         l: 'Cancelada' },
    no_show:    { c: 'bg-amber-100 text-amber-800',     l: 'No asistió' },
  }
  return m[status] ?? m.pendiente
}

// ── New ID (client-side only) ─────────────────────────────────
export const newId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
