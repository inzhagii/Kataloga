/**
 * Customer Interest filter pipeline (M5).
 * Search by identity/product data (partial, case insensitive), composable
 * filters (Aktivitas, Channel, single Tanggal, Kategori with Sub Kategori,
 * Brand, Produk), and filter-option derivation.
 */

import { describe, expect, it } from 'vitest'
import { INTEREST_TYPE } from '../../constants/enums'
import {
  buildFilterOptions,
  categoryAllowedNames,
  filterCustomerInterests,
  interestSearchText,
  FILTER_ALL,
} from '../customerInterestFilter'

const laptop = {
  id: 1,
  storeId: 'toko-komputer-jaya',
  name: 'Laptop Asus ROG',
  category: 'Laptop',
  brand: 'Asus',
}
const phone = {
  id: 2,
  storeId: 'toko-komputer-jaya',
  name: 'Smartphone Samsung Galaxy',
  category: 'Smartphone',
  brand: 'Samsung',
}

const productById = new Map([
  [1, laptop],
  [2, phone],
])

const categories = [
  { id: 10, name: 'Elektronik', parentId: null },
  { id: 11, name: 'Laptop', parentId: 10 },
  { id: 12, name: 'Smartphone', parentId: 10 },
  { id: 13, name: 'Aksesoris', parentId: null },
]

function interest(overrides = {}) {
  return {
    id: 1,
    customerName: 'Budi Setiawan',
    customerEmail: 'budi@mail.com',
    customerPhone: '081100',
    productId: 1,
    productName: 'Laptop Asus ROG',
    channelType: INTEREST_TYPE.WHATSAPP_CLICK,
    channel: 'WhatsApp',
    context: 'Product Detail',
    date: '2026-09-10T12:00:00.000Z',
    ...overrides,
  }
}

const interests = [
  interest({ id: 100, date: '2026-09-10T12:00:00.000Z' }),
  interest({
    id: 101,
    customerName: 'Ani',
    customerEmail: null,
    customerPhone: null,
    channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
    channel: 'Shopee',
    date: '2026-09-10T14:00:00.000Z',
  }),
  interest({
    id: 102,
    customerName: null,
    customerEmail: 'rudi@mail.com',
    customerPhone: '081200',
    productId: 2,
    productName: 'Smartphone Samsung Galaxy',
    channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
    channel: 'Tokopedia',
    date: '2026-09-11T09:00:00.000Z',
  }),
  interest({
    id: 103,
    customerName: 'Cici',
    customerEmail: null,
    customerPhone: null,
    productId: 2,
    productName: 'Smartphone Samsung Galaxy',
    channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
    channel: 'WhatsApp',
    date: '2026-09-12T10:00:00.000Z',
  }),
  interest({
    id: 104,
    customerName: null,
    customerEmail: null,
    customerPhone: '081300',
    productId: null,
    productName: null,
    channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
    channel: 'Lazada',
    context: 'Store Landing',
    date: '2026-09-13T08:00:00.000Z',
  }),
]

const defaults = {
  query: '',
  activity: FILTER_ALL,
  channel: FILTER_ALL,
  date: '',
  category: FILTER_ALL,
  brand: FILTER_ALL,
  productId: null,
  productById,
  categories,
  productCategories: ['Laptop', 'Smartphone'],
}

const ids = (result) => result.map((item) => item.id)

describe('filterCustomerInterests', () => {
  it('returns everything when no filter is active', () => {
    expect(ids(filterCustomerInterests(interests, defaults))).toEqual([100, 101, 102, 103, 104])
  })

  it('searches customer name with partial, case-insensitive match', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, query: 'budi' }))).toEqual([100])
    expect(ids(filterCustomerInterests(interests, { ...defaults, query: 'ANI' }))).toEqual([101])
    expect(ids(filterCustomerInterests(interests, { ...defaults, query: 'udi set' }))).toEqual([100])
  })

  it('searches email and phone as part of the identity corpus', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, query: 'mail.com' }))).toEqual([
      100, 102,
    ])
    expect(ids(filterCustomerInterests(interests, { ...defaults, query: '0813' }))).toEqual([104])
  })

  it('searches product name', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, query: 'rog' }))).toEqual([100, 101])
    expect(ids(filterCustomerInterests(interests, { ...defaults, query: 'smartphone' }))).toEqual([
      102, 103,
    ])
  })

  it('filters by channel snapshot (WhatsApp and external channels)', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, channel: 'WhatsApp' }))).toEqual([
      100, 103,
    ])
    expect(ids(filterCustomerInterests(interests, { ...defaults, channel: 'Lazada' }))).toEqual([
      104,
    ])
  })

  it('filters by activity type', () => {
    expect(
      ids(filterCustomerInterests(interests, { ...defaults, activity: INTEREST_TYPE.WHATSAPP_CLICK })),
    ).toEqual([100])
    expect(
      ids(
        filterCustomerInterests(interests, {
          ...defaults,
          activity: INTEREST_TYPE.MARKETPLACE_CLICK,
        }),
      ),
    ).toEqual([101, 102, 103, 104])
  })

  it('filters by a single date in DD.MM.YYYY', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, date: '10.09.2026' }))).toEqual([
      100, 101,
    ])
    expect(ids(filterCustomerInterests(interests, { ...defaults, date: '13.09.2026' }))).toEqual([
      104,
    ])
  })

  it('ignores an invalid or empty date instead of returning an empty result', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, date: 'sekarang' }))).toHaveLength(5)
    expect(ids(filterCustomerInterests(interests, { ...defaults, date: '' }))).toHaveLength(5)
  })

  it('filters by brand via the interest product', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, brand: 'Asus' }))).toEqual([
      100, 101,
    ])
    expect(ids(filterCustomerInterests(interests, { ...defaults, brand: 'Samsung' }))).toEqual([
      102, 103,
    ])
  })

  it('filters by product id', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, productId: 1 }))).toEqual([100, 101])
    expect(ids(filterCustomerInterests(interests, { ...defaults, productId: 2 }))).toEqual([102, 103])
  })

  it('a Kategori Utama covers its Sub Kategori products', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, category: 'Elektronik' }))).toEqual(
      [100, 101, 102, 103],
    )
  })

  it('a Sub Kategori only covers itself', () => {
    expect(ids(filterCustomerInterests(interests, { ...defaults, category: 'Laptop' }))).toEqual([
      100, 101,
    ])
  })

  it('composes multiple filters AND-wise', () => {
    expect(
      ids(
        filterCustomerInterests(interests, {
          ...defaults,
          channel: 'WhatsApp',
          brand: 'Asus',
          date: '10.09.2026',
        }),
      ),
    ).toEqual([100])
  })

  it('a store-level record (no product) matches non-product filters only', () => {
    expect(
      ids(filterCustomerInterests(interests, { ...defaults, query: 'lazada' })),
    ).toEqual([104])
    expect(
      ids(filterCustomerInterests(interests, { ...defaults, query: '0813' })),
    ).toEqual([104])
  })
})

describe('interestSearchText', () => {
  it('includes identity, product name and channel', () => {
    const text = interestSearchText(
      interest({ channel: 'Shopee', productName: 'Laptop X' }),
    )
    expect(text).toContain('budi')
    expect(text).toContain('budi@mail.com')
    expect(text).toContain('081100')
    expect(text).toContain('laptop x')
    expect(text).toContain('shopee')
  })
})

describe('categoryAllowedNames', () => {
  it('returns null for the no-filter value', () => {
    expect(categoryAllowedNames('', categories, [])).toBeNull()
    expect(categoryAllowedNames(FILTER_ALL, categories, [])).toBeNull()
  })

  it('covers a root plus the subcategories that carry interested products', () => {
    const allowed = categoryAllowedNames('Elektronik', categories, ['Laptop', 'Smartphone'])
    expect([...allowed]).toEqual(expect.arrayContaining(['Elektronik', 'Laptop', 'Smartphone']))
    expect(allowed.has('Aksesoris')).toBe(false)
  })

  it('a subcategory covers only itself', () => {
    expect([...categoryAllowedNames('Laptop', categories, ['Laptop', 'Smartphone'])].sort()).toEqual(
      ['Laptop'],
    )
  })
})

describe('buildFilterOptions', () => {
  it('derives categories, brands and products from interests with products', () => {
    const options = buildFilterOptions({ interests, productById, categories })
    expect(options.categories.sort()).toEqual(['Laptop', 'Smartphone'])
    expect(options.brands.sort()).toEqual(['Asus', 'Samsung'])
    expect(options.products.map((product) => product.id)).toEqual([1, 2])
  })

  it('resolves selectable category options to their Kategori Utama', () => {
    const options = buildFilterOptions({ interests, productById, categories })
    expect(options.categoryOptions).toEqual(['Elektronik'])
  })

  it('keeps a standalone leaf as its own option when it has no root', () => {
    const options = buildFilterOptions({ interests, productById, categories: categories.slice(1) })
    expect(options.categoryOptions.sort()).toEqual(['Laptop', 'Smartphone'])
  })

  it('skips store-level records without a product', () => {
    const onlyStoreLevel = [interests[4]]
    const options = buildFilterOptions({ interests: onlyStoreLevel, productById, categories })
    expect(options.products).toEqual([])
    expect(options.brands).toEqual([])
  })
})