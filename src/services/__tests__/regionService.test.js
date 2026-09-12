import { beforeEach, describe, expect, it } from 'vitest'
import { setMockLatency } from '../apiClient'
import {
  citiesForProvince,
  cityBelongsToProvince,
  isValidLocation,
  listProvinces,
} from '../regionService'

beforeEach(() => {
  setMockLatency(0)
})

describe('listProvinces', () => {
  it('returns all Indonesian provinces', async () => {
    const provinces = await listProvinces()
    expect(provinces).toHaveLength(38)
    expect(provinces).toEqual(
      expect.arrayContaining([
        'Jawa Barat',
        'DKI Jakarta',
        'DI Yogyakarta',
        'Jawa Timur',
        'Papua',
      ]),
    )
  })
})

describe('citiesForProvince', () => {
  it('returns city/regency choices scoped to the province', async () => {
    const cities = await citiesForProvince('Jawa Barat')
    expect(cities).toContain('Kota Bandung')
    expect(cities).toContain('Kabupaten Bandung')
    expect(cities).toContain('Kabupaten Bandung Barat')
  })

  it('returns an empty list for an unknown or empty province', async () => {
    await expect(citiesForProvince('Provinsi Fiktif')).resolves.toEqual([])
    await expect(citiesForProvince('')).resolves.toEqual([])
  })
})

describe('cityBelongsToProvince', () => {
  it('accepts a city/regency that belongs to the province', () => {
    expect(cityBelongsToProvince('Jawa Barat', 'Kota Bandung')).toBe(true)
    expect(cityBelongsToProvince('Jawa Barat', 'Kabupaten Bandung')).toBe(true)
  })

  it('rejects a city from another province and missing values', () => {
    expect(cityBelongsToProvince('Jawa Barat', 'Kota Surabaya')).toBe(false)
    expect(cityBelongsToProvince('DKI Jakarta', 'Kota Bandung')).toBe(false)
    expect(cityBelongsToProvince('', 'Kota Bandung')).toBe(false)
    expect(cityBelongsToProvince('Jawa Barat', '')).toBe(false)
  })
})

describe('isValidLocation', () => {
  it('is true only for a complete, consistent location pair', () => {
    expect(isValidLocation({ province: 'Jawa Barat', city: 'Kota Bandung' })).toBe(true)
    expect(isValidLocation({ province: 'Jawa Barat', city: '' })).toBe(false)
    expect(isValidLocation({ province: 'Jawa Barat', city: 'Kota Surabaya' })).toBe(false)
    expect(isValidLocation({})).toBe(false)
  })
})