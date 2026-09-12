import { describe, expect, it } from 'vitest'
import { validateStoreLocation } from '../storeValidation'

describe('validateStoreLocation', () => {
  it('requires a province', () => {
    const result = validateStoreLocation({ province: '', city: '', fullAddress: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.province).toBe('Provinsi wajib dipilih.')
  })

  it('requires a city once a province is selected', () => {
    const result = validateStoreLocation({ province: 'Jawa Barat', city: '', fullAddress: '' })
    expect(result.valid).toBe(false)
    expect(result.errors.city).toBe('Kota/Kabupaten wajib dipilih.')
  })

  it('rejects a city that does not belong to the selected province', () => {
    const result = validateStoreLocation({ province: 'Jawa Barat', city: 'Kota Surabaya' })
    expect(result.valid).toBe(false)
    expect(result.errors.city).toContain('tidak sesuai')
  })

  it('accepts a city that belongs to the selected province', () => {
    const result = validateStoreLocation({ province: 'Jawa Barat', city: 'Kota Bandung' })
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('flags the same city as incompatible after a province change', () => {
    expect(validateStoreLocation({ province: 'Jawa Barat', city: 'Kota Bandung' }).valid).toBe(true)
    expect(
      validateStoreLocation({ province: 'DI Yogyakarta', city: 'Kota Bandung' }).valid,
    ).toBe(false)
  })

  it('treats full address as optional', () => {
    const withAddress = validateStoreLocation({
      province: 'Jawa Barat',
      city: 'Kota Bandung',
      fullAddress: 'Jalan Raya No. 1',
    })
    const withoutAddress = validateStoreLocation({ province: 'Jawa Barat', city: 'Kota Bandung' })
    expect(withAddress.valid).toBe(true)
    expect(withoutAddress.valid).toBe(true)
  })
})