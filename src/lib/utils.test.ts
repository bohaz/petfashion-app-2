import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from './constants'
import {
  addMinutes,
  calcDuration,
  calcPrice,
  cleanPhone,
  fillTemplate,
  fmtCLP,
  fmtDateLong,
  fmtDateShort,
  gcalLink,
  parseDate,
  sameDay,
  sizeFromWeight,
  toDateKey,
  toLocalInput,
  waLink,
} from './utils'

afterEach(() => {
  vi.unstubAllGlobals()
})

// Tests run with TZ=America/Santiago, see vitest.config.mts.
describe('dates', () => {
  it('reads date-only values as local dates, not UTC midnight', () => {
    const d = parseDate('2026-10-01')
    expect([d.getFullYear(), d.getMonth(), d.getDate()]).toEqual([2026, 9, 1])
  })

  it('formats an expense date on the day it was recorded', () => {
    expect(fmtDateShort('2026-10-01')).toBe('01/10/2026')
    expect(fmtDateLong('2026-10-01')).toBe('jueves 1 de octubre')
  })

  it('formats timestamps in local time', () => {
    // 01:30 UTC on 16 Oct is still 15 Oct in Chile (UTC-3).
    expect(fmtDateShort('2026-10-16T01:30:00.000Z')).toBe('15/10/2026')
  })

  it('toDateKey returns the local date', () => {
    expect(toDateKey(new Date('2026-10-16T01:30:00.000Z'))).toBe('2026-10-15')
  })

  it('compares days in local time', () => {
    expect(sameDay('2026-10-16T01:30:00.000Z', '2026-10-15')).toBe(true)
    expect(sameDay('2026-10-16T03:30:00.000Z', '2026-10-15')).toBe(false)
  })

  it('round-trips datetime-local input values', () => {
    expect(toLocalInput('2026-10-15T13:00:00.000Z')).toBe('2026-10-15T10:00')
  })

  it('adds minutes to a timestamp', () => {
    expect(addMinutes('2026-10-15T13:00:00.000Z', 90)).toBe('2026-10-15T14:30:00.000Z')
  })
})

describe('fmtCLP', () => {
  it('formats pesos with dot separators and no decimals', () => {
    expect(fmtCLP(1234567.6)).toBe('$1.234.568')
    expect(fmtCLP(0)).toBe('$0')
  })

  it('puts the minus sign before the currency symbol', () => {
    expect(fmtCLP(-255000)).toBe('-$255.000')
  })

  it('treats missing values as zero', () => {
    expect(fmtCLP(undefined as unknown as number)).toBe('$0')
  })
})

describe('sizeFromWeight', () => {
  it.each([
    [3, 'XS'],
    [5, 'XS'],
    [5.1, 'S'],
    [10, 'S'],
    [20, 'M'],
    [20.1, 'L'],
    ['12', 'M'],
  ] as const)('%s kg is %s', (kg, size) => {
    expect(sizeFromWeight(kg)).toBe(size)
  })

  it('defaults to XS when the weight is missing or invalid', () => {
    expect(sizeFromWeight('')).toBe('XS')
    expect(sizeFromWeight(-2)).toBe('XS')
  })
})

describe('calcPrice', () => {
  const s = DEFAULT_SETTINGS

  it('uses the price for the service and size', () => {
    expect(calcPrice(s, 'corte_bano', 'M')).toBe(s.prices.corte_bano.M)
    expect(calcPrice(s, 'unas', 'XS')).toBe(s.prices.unas.XS)
  })

  it('prices a large dog bath by coat type', () => {
    expect(calcPrice(s, 'solo_bano', 'L', 'corto')).toBe(s.prices.solo_bano.L_corto)
    expect(calcPrice(s, 'solo_bano', 'L', 'doble')).toBe(s.prices.solo_bano.L_doble)
  })

  it('charges sharpening per unit', () => {
    expect(calcPrice(s, 'afilado', 'XS', undefined, 3)).toBe(s.prices.afilado_unidad * 3)
  })
})

describe('calcDuration', () => {
  it('uses the duration for the service and size', () => {
    expect(calcDuration(DEFAULT_SETTINGS, 'corte_bano', 'L')).toBe(
      DEFAULT_SETTINGS.durations.corte_bano.L,
    )
    expect(calcDuration(DEFAULT_SETTINGS, 'afilado', 'M')).toBe(DEFAULT_SETTINGS.durations.afilado)
  })

  it('falls back to one hour when a duration is missing', () => {
    const settings = { ...DEFAULT_SETTINGS, durations: { ...DEFAULT_SETTINGS.durations, unas: {} } }
    expect(calcDuration(settings as typeof DEFAULT_SETTINGS, 'unas', 'M')).toBe(60)
  })
})

describe('fillTemplate', () => {
  it('replaces known variables and keeps unknown ones visible', () => {
    expect(fillTemplate('Hola {dueño}, {perro} {otro}', { dueño: 'Camila', perro: 'Luna' })).toBe(
      'Hola Camila, Luna {otro}',
    )
  })

  it('tolerates spaces inside the braces', () => {
    expect(fillTemplate('{ perro }', { perro: 'Luna' })).toBe('Luna')
  })
})

describe('links', () => {
  it('keeps only digits in phone numbers', () => {
    expect(cleanPhone('+56 9 1234-5678')).toBe('56912345678')
  })

  it('uses wa.me on phones and WhatsApp Web on desktop', () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)' })
    expect(waLink('+56 9 1234 5678', 'Hola ñ')).toBe('https://wa.me/56912345678?text=Hola%20%C3%B1')

    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0)' })
    expect(waLink('+56912345678', 'Hola')).toBe(
      'https://web.whatsapp.com/send?phone=56912345678&text=Hola',
    )
  })

  it('builds a Google Calendar link with UTC times', () => {
    const link = gcalLink(
      '2026-10-15T13:00:00.000Z',
      '2026-10-15T15:00:00.000Z',
      'Luna · Corte',
      'Detalle',
      'Isla Negra',
    )
    expect(link).toContain('dates=20261015T130000Z/20261015T150000Z')
    expect(link).toContain('text=Luna%20%C2%B7%20Corte')
    expect(link).toContain('location=Isla%20Negra')
  })
})
