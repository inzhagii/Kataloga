import { describe, expect, it } from 'vitest'
import { filterAndSortProducts, scoreProduct, extractCategories } from '../productSearch'

const baseProduct = {
  id: 0,
  storeId: 'store',
  name: '',
  images: [],
  category: '',
  condition: 'NEW',
  price: 'Rp 0',
  priceValue: 0,
  details: [],
  description: '',
  status: 'PUBLISHED',
  createdAt: '2026-01-01T00:00:00.000Z',
}

function product(name, overrides = {}) {
  return { ...baseProduct, name, ...overrides }
}

describe('scoreProduct', () => {
  it('returns 1 for an empty query', () => {
    expect(scoreProduct(product('Anything'), '   ')).toBe(1)
  })

  it('ranks exact name above starts-with, which ranks above includes', () => {
    const exact = scoreProduct(product('Laptop Asus VivoBook'), 'laptop asus vivobook')
    const starts = scoreProduct(product('Laptop Gaming X'), 'laptop')
    const includes = scoreProduct(product('My Laptop Pro'), 'laptop')
    expect(exact).toBeGreaterThan(starts)
    expect(starts).toBeGreaterThan(includes)
  })

  it('scores brand, category, details and description matches', () => {
    const brand = scoreProduct(product('Something', { brand: 'Logitech' }), 'logitech')
    const category = scoreProduct(product('Something', { category: 'Aksesoris' }), 'aksesoris')
    const details = scoreProduct(product('Something', { details: [{ label: 'RAM', value: '16 GB' }] }), '16 gb')
    const description = scoreProduct(product('Something', { description: 'keyboard mekanik tenang' }), 'mekanik')
    expect(brand).toBeGreaterThan(category)
    expect(category).toBeGreaterThan(details)
    expect(details).toBeGreaterThan(description)
    expect(description).toBeGreaterThan(0)
  })

  it('returns 0 when nothing matches', () => {
    expect(scoreProduct(product('Keyboard', { brand: 'Rexus' }), 'televisi')).toBe(0)
  })
})

describe('filterAndSortProducts', () => {
  const catalog = [
    product('Keyboard Rexus', {
      id: 1,
      category: 'Gadget Gaming',
      brand: 'Rexus',
      priceValue: 350000,
      createdAt: '2026-01-01T00:00:00.000Z',
    }),
    product('Mouse Logitech G304', {
      id: 2,
      category: 'Gadget Gaming',
      brand: 'Logitech',
      priceValue: 450000,
      createdAt: '2026-01-02T00:00:00.000Z',
    }),
    product('Monitor LG 24', {
      id: 3,
      category: 'Aksesoris',
      priceValue: 1200000,
      createdAt: '2026-01-03T00:00:00.000Z',
    }),
    product('Mouse Gaming Start', {
      id: 4,
      category: 'Gadget Gaming',
      priceValue: 100000,
      createdAt: '2026-01-04T00:00:00.000Z',
    }),
  ]

  it('is case-insensitive and partial', () => {
    const result = filterAndSortProducts(catalog, { query: 'MOUSE' })
    expect(result.map((p) => p.name)).toEqual(['Mouse Logitech G304', 'Mouse Gaming Start'])
  })

  it('searches across details', () => {
    const withDetails = catalog.map((p) =>
      p.id === 1 ? { ...p, details: [{ label: 'Switch', value: 'Outemu Blue' }] } : p,
    )
    const result = filterAndSortProducts(withDetails, { query: 'outemu' })
    expect(result.map((p) => p.id)).toEqual([1])
  })

  it('filters by category', () => {
    const result = filterAndSortProducts(catalog, { category: 'Aksesoris' })
    expect(result.map((p) => p.id)).toEqual([3])
  })

  it('filters by condition', () => {
    const secondHand = catalog.map((p) => (p.id === 2 ? { ...p, condition: 'SECOND' } : p))
    const result = filterAndSortProducts(secondHand, { condition: 'SECOND' })
    expect(result.map((p) => p.id)).toEqual([2])
  })

  it('sorts by price ascending across the whole catalog', () => {
    const result = filterAndSortProducts(catalog, { sort: 'price-asc' })
    expect(result.map((p) => p.id)).toEqual([4, 1, 2, 3])
  })

  it('sorts by price descending across the whole catalog', () => {
    const result = filterAndSortProducts(catalog, { sort: 'price-desc' })
    expect(result.map((p) => p.id)).toEqual([3, 2, 1, 4])
  })

  it('sorts by newest across the whole catalog', () => {
    const result = filterAndSortProducts(catalog, { sort: 'newest' })
    expect(result.map((p) => p.id)).toEqual([4, 3, 2, 1])
  })

  it('ranks better matches ahead of weaker ones under relevance sort', () => {
    const result = filterAndSortProducts(catalog, { query: 'mouse', sort: 'relevance' })
    expect(result.map((p) => p.id)).toEqual([2, 4])
  })
})

describe('extractCategories', () => {
  it('returns distinct category names preserving first-seen order', () => {
    const result = extractCategories([
      product('A', { category: 'Laptop' }),
      product('B', { category: 'Aksesoris' }),
      product('C', { category: 'Laptop' }),
    ])
    expect(result).toEqual(['Laptop', 'Aksesoris'])
  })
})