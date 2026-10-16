import { DEFAULT_SETTINGS } from './constants'
import type { AppSettings } from './types'

type StoredSettings = Partial<{ [K in keyof AppSettings]: Partial<AppSettings[K]> | null }>

/**
 * Combines the settings row stored in Supabase with the defaults, section by
 * section, so a value added in a newer version of the app is never missing.
 */
export function mergeSettings(stored: StoredSettings | null | undefined): AppSettings {
  if (!stored) return DEFAULT_SETTINGS
  return {
    prices: { ...DEFAULT_SETTINGS.prices, ...stored.prices },
    durations: { ...DEFAULT_SETTINGS.durations, ...stored.durations },
    templates: { ...DEFAULT_SETTINGS.templates, ...stored.templates },
    business: { ...DEFAULT_SETTINGS.business, ...stored.business },
  }
}
