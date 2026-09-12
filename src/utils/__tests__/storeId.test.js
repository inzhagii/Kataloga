import { describe, expect, it } from 'vitest'
import { STORE_ID_PATTERN, normalizeStoreId, validateStoreId } from '../storeId'

describe('STORE_ID_PATTERN', () => {
  it('accepts lowercase letters, digits and hyphens', () => {
    expect(STORE_ID_PATTERN.test('toko-komputer-jaya')).toBe(true)
    expect(STORE_ID_PATTERN.test('toko123')).toBe(true)
    expect(STORE_ID_PATTERN.test('toko-123')).toBe(true)
  })

  it('rejects invalid shapes', () => {
    expect(STORE_ID_PATTERN.test('Toko-Komputer')).toBe(false)
    expect(STORE_ID_PATTERN.test('toko_komputer')).toBe(false)
    expect(STORE_ID_PATTERN.test('toko komputer')).toBe(false)
    expect(STORE_ID_PATTERN.test('-toko')).toBe(false)
    expect(STORE_ID_PATTERN.test('toko-')).toBe(false)
    expect(STORE_ID_PATTERN.test('toko--jaya')).toBe(false)
    expect(STORE_ID_PATTERN.test('toko.jaya')).toBe(false)
    expect(STORE_ID_PATTERN.test('')).toBe(false)
  })
})

describe('normalizeStoreId', () => {
  it('trims and lowercases', () => {
    expect(normalizeStoreId('  Toko-Komputer ')).toBe('toko-komputer')
    expect(normalizeStoreId('KATALOGA')).toBe('kataloga')
  })
})

describe('validateStoreId', () => {
  it('returns valid for a clean id', () => {
    const result = validateStoreId(' toko-komputer-jaya ')
    expect(result.valid).toBe(true)
    expect(result.value).toBe('toko-komputer-jaya')
  })

  it('requires a non-empty value', () => {
    const result = validateStoreId('   ')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('wajib diisi')
  })

  it('rejects invalid format with the format message', () => {
    const result = validateStoreId('Toko Komputer')
    expect(result.valid).toBe(false)
    expect(result.message).toContain('huruf kecil, angka, dan tanda hubung')
  })
})