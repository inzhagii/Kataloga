import { describe, expect, it } from 'vitest'
import {
  buildStoreListingUrl,
  buildStoreProductUrl,
  buildStoreUrl,
  resolveProductSlug,
} from '../storefrontUrl'

describe('buildStoreUrl', () => {
  it('builds the store landing path', () => {
    expect(buildStoreUrl('toko-komputer-jaya')).toBe('/toko-komputer-jaya')
  })

  it('trims the store id', () => {
    expect(buildStoreUrl('  toko-jaya  ')).toBe('/toko-jaya')
  })

  it('degrades to the homepage for an empty store id', () => {
    expect(buildStoreUrl('')).toBe('/')
    expect(buildStoreUrl(null)).toBe('/')
    expect(buildStoreUrl(undefined)).toBe('/')
  })
})

describe('buildStoreListingUrl', () => {
  it('builds the product listing path', () => {
    expect(buildStoreListingUrl('toko-komputer-jaya')).toBe(
      '/toko-komputer-jaya/products',
    )
  })
})

describe('buildStoreProductUrl', () => {
  it('builds the canonical product detail path with a sanitised slug', () => {
    expect(buildStoreProductUrl('toko-jaya', 20, 'Laptop Asus ROG')).toBe(
      '/toko-jaya/product/20/laptop-asus-rog',
    )
  })

  it('keeps an already canonical kebab slug unchanged', () => {
    expect(buildStoreProductUrl('toko-jaya', 20, 'asus-rog-2026')).toBe(
      '/toko-jaya/product/20/asus-rog-2026',
    )
  })

  it('falls back to product-{id} when the slug is empty', () => {
    expect(buildStoreProductUrl('toko-jaya', 20, '')).toBe(
      '/toko-jaya/product/20/product-20',
    )
    expect(buildStoreProductUrl('toko-jaya', 20, '!!!')).toBe(
      '/toko-jaya/product/20/product-20',
    )
    expect(buildStoreProductUrl('toko-jaya', 20, null)).toBe(
      '/toko-jaya/product/20/product-20',
    )
  })

  it('is deterministic for the same inputs', () => {
    const one = buildStoreProductUrl('toko-jaya', 7, 'Mouse Gaming')
    const two = buildStoreProductUrl('toko-jaya', 7, 'Mouse Gaming')
    expect(one).toBe(two)
  })
})

describe('resolveProductSlug', () => {
  it('prefers the API-provided slug when present', () => {
    expect(resolveProductSlug({ id: 20, name: 'Laptop Asus ROG', slug: 'asus-rog-2026' })).toBe(
      'asus-rog-2026',
    )
  })

  it('generates a fallback slug from the product name', () => {
    expect(resolveProductSlug({ id: 20, name: 'Laptop Asus ROG' })).toBe(
      'laptop-asus-rog',
    )
  })

  it('falls back to product-{id} when name cannot be slugified', () => {
    expect(resolveProductSlug({ id: 20, name: '!!!' })).toBe('product-20')
  })

  it('handles missing products without throwing', () => {
    expect(resolveProductSlug(null)).toBe('product-0')
    expect(resolveProductSlug(undefined)).toBe('product-0')
  })
})