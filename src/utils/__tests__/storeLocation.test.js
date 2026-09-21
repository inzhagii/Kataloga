/**
 * Unit test for the shared storefront location helpers. Pure functions, no
 * DOM: Vitest discovers *.test.js only.
 */

import { describe, expect, it } from 'vitest'
import { buildMapsSearchUrl, storeLocationLabel } from '../storeLocation'

describe('storeLocationLabel', () => {
  it('formats City, Province in that order', () => {
    expect(storeLocationLabel({ city: 'Bandung', province: 'Jawa Barat' })).toBe(
      'Bandung, Jawa Barat',
    )
  })

  it('falls back to whichever part exists', () => {
    expect(storeLocationLabel({ city: 'Bandung' })).toBe('Bandung')
    expect(storeLocationLabel({ province: 'Jawa Barat' })).toBe('Jawa Barat')
  })

  it('returns a dash when the store or location is missing', () => {
    expect(storeLocationLabel({})).toBe('-')
    expect(storeLocationLabel(null)).toBe('-')
    expect(storeLocationLabel(undefined)).toBe('-')
  })
})

describe('buildMapsSearchUrl', () => {
  it('builds an encoded Google Maps search URL', () => {
    expect(buildMapsSearchUrl('Jl. Merdeka 1')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Jl.%20Merdeka%201',
    )
  })

  it('encodes reserved characters', () => {
    expect(buildMapsSearchUrl('Jl. A & B')).toBe(
      'https://www.google.com/maps/search/?api=1&query=Jl.%20A%20%26%20B',
    )
  })

  it('returns null for empty or missing addresses', () => {
    expect(buildMapsSearchUrl('')).toBeNull()
    expect(buildMapsSearchUrl('   ')).toBeNull()
    expect(buildMapsSearchUrl(undefined)).toBeNull()
  })
})
