import { describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './constants'
import { mergeSettings } from './settings'

describe('mergeSettings', () => {
  it('returns the defaults when nothing is stored', () => {
    expect(mergeSettings(null)).toEqual(DEFAULT_SETTINGS)
  })

  it('keeps stored values and fills in what is missing', () => {
    const merged = mergeSettings({
      prices: { afilado_unidad: 6000 },
      business: { name: 'Pet Fashion Isla Negra' },
    })

    expect(merged.prices.afilado_unidad).toBe(6000)
    expect(merged.prices.corte_bano).toEqual(DEFAULT_SETTINGS.prices.corte_bano)
    expect(merged.business.name).toBe('Pet Fashion Isla Negra')
    expect(merged.business.address).toBe(DEFAULT_SETTINGS.business.address)
    expect(merged.templates).toEqual(DEFAULT_SETTINGS.templates)
  })

  it('ignores sections stored as null', () => {
    expect(mergeSettings({ durations: null }).durations).toEqual(DEFAULT_SETTINGS.durations)
  })
})
