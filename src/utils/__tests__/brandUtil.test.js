import { describe, expect, it } from 'vitest'
import { countProductsByBrand, hasDuplicateBrandName } from '../brandUtil'

describe('countProductsByBrand', () => {
  it('counts products per brand name and ignores brands without a value', () => {
    const counts = countProductsByBrand([
      { brand: 'Asus' },
      { brand: 'Asus' },
      { brand: 'Lenovo' },
      { brand: '' },
      {},
    ])
    expect(counts).toEqual({ Asus: 2, Lenovo: 1 })
  })

  it('returns an empty record for no products', () => {
    expect(countProductsByBrand([])).toEqual({})
  })
})

describe('hasDuplicateBrandName', () => {
  const brands = [
    { id: 1, name: 'Asus' },
    { id: 2, name: 'Lenovo' },
  ]

  it('matches case-insensitively and ignores surrounding spaces', () => {
    expect(hasDuplicateBrandName(brands, '  asuS ')).toBe(true)
  })

  it('returns false for a new name', () => {
    expect(hasDuplicateBrandName(brands, 'Apple')).toBe(false)
  })

  it('ignores the edited brand id', () => {
    expect(hasDuplicateBrandName(brands, 'Asus', 1)).toBe(false)
    expect(hasDuplicateBrandName(brands, 'Lenovo', 1)).toBe(true)
  })
})
