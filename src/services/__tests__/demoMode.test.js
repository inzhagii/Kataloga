/**
 * Demo-mode verification.
 *
 * Guarantees that the enriched demo dataset (used for DEMO readiness) is:
 * - complete enough to walk through every seller/public flow convincingly,
 * - isolated to the mock data layer (no HTTP calls, no API/DTO changes),
 * - compliant with locked model rules (no stock/availability reintroduced,
 *   one category per product, two-level categories, only {name,url} channels,
 *   only the documented interest/activity types).
 */

import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest'
import {
  listCategories,
} from '../categoryService'
import {
  listCustomerInterests,
  recordInterest,
} from '../customerInterestService'
import { listRecentActivities } from '../activityService'
import {
  getMyStore,
  getStore,
} from '../storeService'
import {
  listPublicProducts,
  listSellerProducts,
} from '../productService'
import { buildCatalogCategoryTree, filterAndSortProducts } from '../../utils/productSearch'
import { PRODUCT_STATUS, CONDITION, INTEREST_TYPE, ACTIVITY_TYPE } from '../../constants/enums'
import { products, customerInterests, recentActivities } from '../../data/mock'
import { isApiMode } from '../apiConfig'
import { STORE_A_ID, actAsStoreA, beforeEachScenario } from './setup'

beforeEach(() => {
  beforeEachScenario()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('demo data source mode', () => {
  it('runs in mock mode by default and never issues HTTP calls', async () => {
    expect(isApiMode()).toBe(false)

    const fetchSpy = vi.fn()
    vi.stubGlobal('fetch', fetchSpy)

    await getStore(STORE_A_ID)
    await listPublicProducts(STORE_A_ID)
    await listCategories()
    const interests = await listCustomerInterests(STORE_A_ID)
    await listRecentActivities()
    actAsStoreA()
    await getMyStore()
    await listSellerProducts()

    expect(interests.length).toBeGreaterThan(0)
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('ships a believable store profile without persisting arbitrary channel fields', async () => {
    const storeA = await getStore(STORE_A_ID)
    expect(storeA).toMatchObject({
      storeId: STORE_A_ID,
      name: 'Toko Komputer Jaya',
      province: 'Jawa Barat',
      city: 'Kota Bandung',
      fullAddress: expect.stringContaining('Bandung'),
      whatsapp: '6281234567890',
      verified: true,
    })
    expect(storeA.logoUrl).toBeTruthy()
    expect(storeA.channels.length).toBeGreaterThan(0)

    const channelKeys = new Set(storeA.channels.flatMap((channel) => Object.keys(channel)).sort())
    expect([...channelKeys]).toEqual(['name', 'url'])
    expect(storeA.channels.some((channel) => channel.name === 'Shopee')).toBe(true)

    const myStore = await (() => {
      actAsStoreA()
      return getMyStore()
    })()
    expect(myStore.storeId).toBe(STORE_A_ID)
  })

  it('provides a rich published catalog that fills the public storefront', async () => {
    const published = await listPublicProducts(STORE_A_ID)
    expect(published.length).toBeGreaterThanOrEqual(10)
    expect(published.every((p) => p.status === PRODUCT_STATUS.PUBLISHED)).toBe(true)
    expect(new Set(published.map((p) => p.category)).size).toBeGreaterThanOrEqual(6)
    expect(published.filter((p) => p.featured).length).toBeGreaterThanOrEqual(3)
  })

  it('keeps lifecycle variety so the seller dashboard has meaningful cards', async () => {
    actAsStoreA()
    const management = await listSellerProducts()
    const statuses = new Set(management.map((p) => p.status))
    expect(statuses.has(PRODUCT_STATUS.PUBLISHED)).toBe(true)
    expect(statuses.has(PRODUCT_STATUS.DRAFT)).toBe(true)
    expect(statuses.has(PRODUCT_STATUS.SOLD_OUT)).toBe(true)

    const interests = await listCustomerInterests(STORE_A_ID)
    expect(interests.length).toBeGreaterThanOrEqual(8)

    const activities = await listRecentActivities()
    expect(activities.length).toBeGreaterThanOrEqual(6)
  })
})

describe('demo data respects locked data models', () => {
  it('never reintroduces stock/availability/skus on demo products', () => {
    for (const product of products) {
      expect(product.status).toBeDefined()
      expect(product).not.toHaveProperty('stock')
      expect(product).not.toHaveProperty('quantity')
      expect(product).not.toHaveProperty('remainingStock')
      expect(product).not.toHaveProperty('availability')
      expect(product).not.toHaveProperty('sku')
    }
  })

  it('gives every product exactly one category', () => {
    for (const product of products) {
      expect(typeof product.category).toBe('string')
      expect(product.category.length).toBeGreaterThan(0)
    }
  })

  it('keeps external links in the generic {name,url} shape', () => {
    const linkedProducts = products.filter((p) => (p.externalLinks ?? []).length > 0)
    expect(linkedProducts.length).toBeGreaterThan(0)
    for (const product of linkedProducts) {
      for (const link of product.externalLinks) {
        expect(Object.keys(link).sort()).toEqual(['name', 'url'])
      }
    }
  })

  it('only records documented customer interest and activity types', () => {
    const allowedTypes = new Set(Object.values(INTEREST_TYPE))
    for (const interest of customerInterests) {
      expect(allowedTypes.has(interest.channelType)).toBe(true)
    }
    expect(new Set(customerInterests.map((i) => i.channelType))).toEqual(
      new Set(Object.values(INTEREST_TYPE)),
    )

    const allowedActivities = new Set(Object.values(ACTIVITY_TYPE))
    for (const activity of recentActivities) {
      expect(allowedActivities.has(activity.type)).toBe(true)
    }
    expect(new Set(recentActivities.map((a) => a.type))).toEqual(
      new Set(Object.values(ACTIVITY_TYPE)),
    )
  })

  it('keeps the category tree at exactly two levels and usable by the catalog filter', async () => {
    const published = await listPublicProducts(STORE_A_ID)
    const categories = await listCategories()
    const tree = buildCatalogCategoryTree(published, categories)

    expect(tree.roots).toEqual(
      expect.arrayContaining(['Elektronik', 'Komponen Komputer', 'Networking']),
    )
    expect(tree.childrenByRoot.Elektronik).toEqual(
      expect.arrayContaining(['Laptop', 'Smartphone', 'Aksesoris']),
    )
    expect(tree.childrenByRoot['Komponen Komputer']).toEqual(
      expect.arrayContaining(['Processor', 'RAM', 'Storage']),
    )
    expect(tree.childrenByRoot.Networking).toEqual(
      expect.arrayContaining(['Router', 'Switch']),
    )
  })

  it('demonstrates search, filter and sort against the demo catalog', () => {
    const published = products.filter((p) => p.status === PRODUCT_STATUS.PUBLISHED)

    const samsung = filterAndSortProducts(published, { query: 'samsung' })
    expect(samsung.length).toBeGreaterThan(0)
    expect(samsung[0].name.toLowerCase()).toContain('samsung')

    const secondHand = filterAndSortProducts(published, { condition: CONDITION.SECOND })
    expect(secondHand.length).toBeGreaterThan(0)
    expect(secondHand.every((p) => p.condition === CONDITION.SECOND)).toBe(true)

    const byCategory = filterAndSortProducts(published, {
      category: 'Elektronik',
      categoryList: ['Laptop', 'Smartphone', 'Aksesoris'],
    })
    expect(byCategory.every((p) => ['Laptop', 'Smartphone', 'Aksesoris'].includes(p.category))).toBe(
      true,
    )

    const cheapestFirst = filterAndSortProducts(published, { sort: 'price-asc' })
    expect(cheapestFirst.map((p) => p.priceValue)[0]).toBe(
      Math.min(...cheapestFirst.map((p) => p.priceValue)),
    )
  })

  it('records demo marketplace interest with the chosen store channel', async () => {
    actAsStoreA()
    const storeA = await getMyStore()
    const chosen = storeA.channels[0]

    await recordInterest({
      storeId: STORE_A_ID,
      customerName: 'Pengunjung Demo',
      customerId: 99,
      productId: 1,
      productName: 'ASUS VivoBook 14',
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: chosen.name,
      externalUrl: chosen.url,
    })

    const interests = await listCustomerInterests(STORE_A_ID)
    expect(interests[0]).toMatchObject({
      channelType: INTEREST_TYPE.MARKETPLACE_CLICK,
      channel: chosen.name,
      externalUrl: chosen.url,
    })
  })
})