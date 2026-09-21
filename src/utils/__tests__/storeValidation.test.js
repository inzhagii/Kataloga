import { describe, expect, it } from 'vitest'
import {
  validateAutoArchiveDays,
  validateStoreInformation,
  validateStoreLocation,
} from '../storeValidation'

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

const completeForm = {
  storeId: 'toko-komputer-jaya',
  name: 'Toko Komputer Jaya',
  logoUrl: 'data:image/svg+xml;base64,abc',
  description: 'Menyediakan kebutuhan komputer.',
  province: 'Jawa Barat',
  city: 'Kota Bandung',
  operatingHours: 'Senin - Sabtu, 09.00 - 18.00',
  whatsapp: '6281234567890',
}

describe('validateStoreInformation', () => {
  it('flags every required field when the form is empty', () => {
    const result = validateStoreInformation({})
    expect(result.valid).toBe(false)
    expect(result.errors.storeId).toBe('Store ID wajib diisi.')
    expect(result.errors.logo).toBe('Logo toko wajib diunggah.')
    expect(result.errors.name).toBe('Nama toko wajib diisi.')
    expect(result.errors.description).toBe('Deskripsi toko wajib diisi.')
    expect(result.errors.province).toBe('Provinsi wajib dipilih.')
    expect(result.errors.operatingHours).toBe('Jam operasional wajib diisi.')
    expect(result.errors.whatsapp).toBe('Nomor WhatsApp wajib diisi.')
  })

  it('accepts a complete form', () => {
    const result = validateStoreInformation(completeForm)
    expect(result.valid).toBe(true)
    expect(result.errors).toEqual({})
  })

  it('rejects an invalid Store ID format', () => {
    const result = validateStoreInformation({ ...completeForm, storeId: 'Toko Komputer!' })
    expect(result.valid).toBe(false)
    expect(result.errors.storeId).toContain('huruf kecil')
  })

  it('rejects an empty WhatsApp and a malformed one', () => {
    expect(validateStoreInformation({ ...completeForm, whatsapp: '' }).valid).toBe(false)
    const malformed = validateStoreInformation({ ...completeForm, whatsapp: 'not-a-number' })
    expect(malformed.valid).toBe(false)
    expect(malformed.errors.whatsapp).toContain('Format')
  })

  it('rejects a city that does not belong to the province', () => {
    const result = validateStoreInformation({ ...completeForm, city: 'Kota Surabaya' })
    expect(result.valid).toBe(false)
    expect(result.errors.city).toContain('tidak sesuai')
  })

  it('accepts the form when optional fields are empty', () => {
    const result = validateStoreInformation({
      ...completeForm,
      fullAddress: '',
    })
    expect(result.valid).toBe(true)
  })
})

describe('validateAutoArchiveDays', () => {
  it('accepts null as disabled ("Tidak ada" / Never)', () => {
    expect(validateAutoArchiveDays(null).valid).toBe(true)
    expect(validateAutoArchiveDays(undefined).valid).toBe(true)
  })

  it('accepts exactly the locked allowed thresholds', () => {
    for (const days of [1, 7, 30, 90, 180, 365]) {
      expect(validateAutoArchiveDays(days).valid).toBe(true)
    }
  })

  it('rejects every threshold outside the locked set', () => {
    expect(validateAutoArchiveDays(0).valid).toBe(false)
    expect(validateAutoArchiveDays(2).valid).toBe(false)
    expect(validateAutoArchiveDays(3).valid).toBe(false)
    expect(validateAutoArchiveDays(14).valid).toBe(false)
    expect(validateAutoArchiveDays(60).valid).toBe(false)
    expect(validateAutoArchiveDays(-1).valid).toBe(false)
    expect(validateAutoArchiveDays(366).valid).toBe(false)
    expect(validateAutoArchiveDays(30.5).valid).toBe(false)
    expect(validateAutoArchiveDays('abc').valid).toBe(false)
    expect(validateAutoArchiveDays('').valid).toBe(false)
    expect(validateAutoArchiveDays(new Date()).valid).toBe(false)
  })

  it('returns a clear message for an invalid value', () => {
    const result = validateAutoArchiveDays(2)
    expect(result.valid).toBe(false)
    expect(result.errors.autoArchiveDays).toContain('1, 7, 30, 90, 180')
  })
})