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
  getCurrentStoreId,
} from '../storeService'
import {
  listPublicProducts,
  listSellerProducts,
} from '../productService'
import { buildCatalogCategoryTree, filterAndSortProducts } from '../../utils/productSearch'
import { countByChannel, buildChannelOptions, FILTER_ALL } from '../../utils/customerInterestChannels'
import { countCustomerActivities, customerActivities } from '../../utils/customerInterest'
import { filterCustomerInterests } from '../../utils/customerInterestFilter'
import {
  PRODUCT_STATUS,
  CONDITION,
  INTEREST_TYPE,
  INTEREST_CONTEXT,
  ACTIVITY_TYPE,
} from '../../constants/enums'
import { products, customerInterests, recentActivities } from '../../data/mock'
import { isApiMode } from '../apiConfig'
import { login, setActiveUser, DEMO_EMAIL, DEMO_PASSWORD } from '../authService'
import { STORE_A_ID, actAsStoreA, actAsStoreB, beforeEachScenario } from './setup'

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
    expect(
      published.every((p) => [PRODUCT_STATUS.PUBLISHED, PRODUCT_STATUS.SOLD_OUT].includes(p.status)),
    ).toBe(true)
    expect(
      published.some((p) => p.status === PRODUCT_STATUS.SOLD_OUT),
    ).toBe(true)
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
    actAsStoreB()
    const storeA = await getStore(STORE_A_ID)
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

describe('demo account (TechSpace Bandung)', () => {
  it('logs in only with the enforced demo password', async () => {
    await expect(
      login({ emailOrPhone: DEMO_EMAIL, password: 'wrong-password' }),
    ).rejects.toThrow()

    const user = await login({ emailOrPhone: DEMO_EMAIL, password: DEMO_PASSWORD })
    expect(user.storeId).toBe('techspace-bandung')
    expect(user.hasStore).toBe(true)
    expect(user.emailVerified).toBe(true)
  })

  it('owns an independent storefront with featured published and sold-out products', async () => {
    const store = await getStore('techspace-bandung')
    expect(store).toMatchObject({
      storeId: 'techspace-bandung',
      name: 'TechSpace Bandung',
      province: 'Jawa Barat',
      city: 'Kota Bandung',
      whatsapp: '6281234567890',
    })
    expect(store.channels.map((channel) => channel.name)).toEqual(['Tokopedia', 'Shopee'])

    const published = await listPublicProducts('techspace-bandung')
    expect(published.length).toBeGreaterThanOrEqual(7)
    expect(published.filter((p) => p.featured).length).toBeGreaterThanOrEqual(3)
    const soldOutFeatured = published.find(
      (p) => p.status === PRODUCT_STATUS.SOLD_OUT && p.featured,
    )
    expect(soldOutFeatured).toBeTruthy()
  })

  it('keeps TechSpace products out of the store A listing', async () => {
    actAsStoreA()
    const publishedA = await listPublicProducts(STORE_A_ID)
    expect(publishedA.some((p) => p.storeId === 'techspace-bandung')).toBe(false)
  })
})

describe('demo customer interest dataset (TechSpace Bandung)', () => {
  it('keeps store isolation, documented types, contexts and no self-store records', async () => {
    const interests = await listCustomerInterests('techspace-bandung')
    expect(interests.every((i) => i.storeId === 'techspace-bandung')).toBe(true)
    expect(interests).toHaveLength(22)
    expect(new Set(interests.map((i) => i.channelType))).toEqual(
      new Set(Object.values(INTEREST_TYPE)),
    )
    expect(new Set(interests.map((i) => i.context))).toEqual(
      new Set(Object.values(INTEREST_CONTEXT)),
    )
    expect(interests.some((i) => i.customerEmail === 'demo@kataloga.test')).toBe(false)
    expect(interests.every((i) => i.channel !== 'Lazada')).toBe(true)
  })

  it('summarizes into the target channel counts computed from the records', async () => {
    const interests = await listCustomerInterests('techspace-bandung')
    expect(countByChannel(interests, 'WhatsApp')).toBe(9)
    expect(countByChannel(interests, 'Tokopedia')).toBe(6)
    expect(countByChannel(interests, 'Shopee')).toBe(7)
  })

  it('references only existing techspace products and keeps filters composable', async () => {
    const interests = await listCustomerInterests('techspace-bandung')
    const storeProducts = products.filter((p) => p.storeId === 'techspace-bandung')
    const ids = new Set(storeProducts.map((p) => p.id))
    const productInterests = interests.filter((i) => i.productId != null)
    expect(productInterests.length).toBeGreaterThan(0)
    for (const interest of productInterests) {
      expect(ids.has(interest.productId)).toBe(true)
    }

    const productById = new Map(storeProducts.map((p) => [p.id, p]))
    expect(filterCustomerInterests(interests, { channel: 'WhatsApp', productById })).toHaveLength(9)
    expect(
      filterCustomerInterests(interests, { channel: 'Tokopedia', productById }),
    ).toHaveLength(6)
    expect(filterCustomerInterests(interests, { channel: 'Shopee', productById })).toHaveLength(7)
    expect(
      filterCustomerInterests(interests, {
        channel: 'Tokopedia',
        query: 'keychron',
        productById,
      }),
    ).toHaveLength(0)
    expect(
      filterCustomerInterests(interests, { activity: INTEREST_TYPE.MARKETPLACE_CLICK, productById }),
    ).toHaveLength(13)
  })

  it('produces meaningful per-customer histories with multiple dates', async () => {
    const interests = await listCustomerInterests('techspace-bandung')

    const andi = interests.find((i) => i.customerEmail === 'andi.pratama@example.com')
    const nabila = interests.find((i) => i.customerEmail === 'nabila.putri@example.com')
    expect(countCustomerActivities(interests, andi)).toBe(4)
    expect(countCustomerActivities(interests, nabila)).toBe(1)

    const andiHistory = customerActivities(interests, andi)
    expect(
      andiHistory.some((i) => i.productName === 'ASUS ROG Strix G22CH Gaming Desktop'),
    ).toBe(true)
    expect(andiHistory.some((i) => i.channel === 'WhatsApp')).toBe(true)
    expect(andiHistory.some((i) => i.channel === 'Tokopedia')).toBe(true)
    expect(andiHistory.some((i) => i.context === INTEREST_CONTEXT.STORE_LANDING)).toBe(true)
    expect(andiHistory.some((i) => i.context === INTEREST_CONTEXT.PRODUCT_DETAIL)).toBe(true)

    const dateSet = new Set(andiHistory.map((i) => i.date.slice(0, 10)))
    expect(dateSet.size).toBeGreaterThan(2)
    expect(new Date(andiHistory[0].date) > new Date(andiHistory[andiHistory.length - 1].date)).toBe(
      true,
    )
  })
})

describe('active store resolution & single-source customer interest flow (audit)', () => {
  it('keeps the whole Customer Interest UI scoped to the demo store after login', async () => {
    const user = await login({ emailOrPhone: DEMO_EMAIL, password: DEMO_PASSWORD })
    setActiveUser(user) // AuthProvider.applyUser() mirrors this on every login.

    expect(getCurrentStoreId()).toBe('techspace-bandung')
    expect((await getMyStore()).name).toBe('TechSpace Bandung')

    const storeId = getCurrentStoreId()
    const interests = await listCustomerInterests(storeId)
    expect(interests).toHaveLength(22)

    const store = await getStore(storeId)
    const channelCards = buildChannelOptions({ interests, channels: store.channels })
    const cardCounts = Object.fromEntries(
      channelCards.current.map((channel) => [channel.name, countByChannel(interests, channel.name)]),
    )
    expect(cardCounts).toEqual({ WhatsApp: 9, Tokopedia: 6, Shopee: 7 })

    // Default filters + empty query pass the full dataset through, so the
    // initial Total Interest equals both the record total and the list length.
    const defaultList = filterCustomerInterests(interests, {
      query: '',
      activity: 'ALL',
      channel: FILTER_ALL,
      date: '',
      category: FILTER_ALL,
      brand: FILTER_ALL,
      productId: null,
    })
    expect(defaultList).toHaveLength(interests.length)
  })

  it('keeps demo interests free of store A records while the guest fallback stays on store A', async () => {
    setActiveUser(null)
    expect(getCurrentStoreId()).toBe(STORE_A_ID)

    const user = await login({ emailOrPhone: DEMO_EMAIL, password: DEMO_PASSWORD })
    setActiveUser(user)

    const storeAProductIds = new Set(
      products.filter((p) => p.storeId === STORE_A_ID).map((p) => p.id),
    )
    const interests = await listCustomerInterests(getCurrentStoreId())
    expect(interests.length).toBeGreaterThan(0)
    for (const interest of interests) {
      expect(interest.storeId).toBe('techspace-bandung')
      expect(storeAProductIds.has(interest.productId)).toBe(false)
    }
  })
})