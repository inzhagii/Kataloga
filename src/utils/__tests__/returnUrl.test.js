import { describe, expect, it } from 'vitest'
import { sanitizeReturnPath } from '../returnUrl'

describe('sanitizeReturnPath', () => {
  it('accepts internal single-slash paths with query and hash', () => {
    expect(sanitizeReturnPath('/seller/dashboard')).toBe('/seller/dashboard')
    expect(sanitizeReturnPath('/toko-komputer-jaya/products?category=Laptop')).toBe(
      '/toko-komputer-jaya/products?category=Laptop',
    )
    expect(sanitizeReturnPath('/toko-a/product/20/laptop#detail')).toBe(
      '/toko-a/product/20/laptop#detail',
    )
  })

  it('trims surrounding whitespace', () => {
    expect(sanitizeReturnPath('  /seller/products  ')).toBe('/seller/products')
  })

  it('rejects absolute and protocol-relative URLs (no open redirect)', () => {
    expect(sanitizeReturnPath('https://evil.example.com')).toBeNull()
    expect(sanitizeReturnPath('http://evil.example.com/path')).toBeNull()
    expect(sanitizeReturnPath('//evil.example.com')).toBeNull()
    expect(sanitizeReturnPath('///evil.example.com')).toBeNull()
  })

  it('rejects script and data schemes', () => {
    expect(sanitizeReturnPath('javascript:alert(1)')).toBeNull()
    expect(sanitizeReturnPath('/javascript:alert(1)')).toBeNull()
    expect(sanitizeReturnPath('data:text/html,<script>')).toBeNull()
  })

  it('rejects percent-encoded bypass attempts', () => {
    expect(sanitizeReturnPath('/%2f%2fevil.example.com')).toBeNull()
    expect(sanitizeReturnPath('/%6aavascript:alert(1)')).toBeNull()
    expect(sanitizeReturnPath('/%5cevil')).toBeNull()
  })

  it('rejects backslashes and control characters', () => {
    expect(sanitizeReturnPath('/path\\to')).toBeNull()
    expect(sanitizeReturnPath('/path\u0000')).toBeNull()
    expect(sanitizeReturnPath('/path\nnext')).toBeNull()
  })

  it('rejects empty and non-string values', () => {
    expect(sanitizeReturnPath('')).toBeNull()
    expect(sanitizeReturnPath('   ')).toBeNull()
    expect(sanitizeReturnPath(null)).toBeNull()
    expect(sanitizeReturnPath(undefined)).toBeNull()
    expect(sanitizeReturnPath(42)).toBeNull()
    expect(sanitizeReturnPath({})).toBeNull()
    expect(sanitizeReturnPath('seller/dashboard')).toBeNull()
  })
})
