import { describe, expect, it } from 'vitest'
import { DESTINATION_PRESETS, destinationIcon, isDestinationPreset } from '../destinationPresets'

describe('destinationPresets', () => {
  it('exposes the locked V1 preset list', () => {
    expect(DESTINATION_PRESETS).toEqual([
      'Shopee',
      'Tokopedia',
      'Lazada',
      'TikTok Shop',
      'Blibli',
      'Custom',
    ])
  })

  it('resolves preset icons case-insensitively (frontend-owned mapping)', () => {
    expect(destinationIcon('Shopee')).toBe('shopping_bag')
    expect(destinationIcon('shopeE')).toBe('shopping_bag')
    expect(destinationIcon('TikTok Shop')).toBe('music_note')
  })

  it('falls back to the generic link icon for unknown channel names', () => {
    expect(destinationIcon('Website')).toBe('link')
    expect(destinationIcon('')).toBe('link')
    expect(destinationIcon(undefined)).toBe('link')
  })

  it('detects presets case-insensitively and rejects unknown names', () => {
    expect(isDestinationPreset('tokopedia')).toBe(true)
    expect(isDestinationPreset('Shopee')).toBe(true)
    expect(isDestinationPreset('Instagram')).toBe(false)
  })
})