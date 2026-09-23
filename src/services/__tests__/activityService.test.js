/**
 * Recent Activity service tests (M4 data layer).
 * Coverage: canonical activity set, newest-first ordering, store scoping,
 * product context storage, and the type guard for unknown activity types.
 */

import { beforeEach, describe, expect, it } from 'vitest'
import {
  listRecentActivities,
  recordActivity,
  recordProductPublished,
  recordProductEdited,
  recordProductSoldOut,
  recordProductReactivated,
  recordProductArchived,
  recordProductRestored,
  recordStoreUpdated,
} from '../activityService'
import { recentActivities } from '../../data/mock'
import { ACTIVITY_TYPE } from '../../constants/enums'
import { formatDate } from '../../utils/datetime'
import { beforeEachScenario, actAsStoreA, actAsStoreB, STORE_A_ID, STORE_B_ID } from './setup'

beforeEach(() => {
  beforeEachScenario()
})

describe('recordActivity', () => {
  it('persists store context and product context with the record', async () => {
    actAsStoreA()
    const activity = await recordProductPublished('Laptop Baru', { productId: 200 })
    expect(activity).toMatchObject({
      storeId: STORE_A_ID,
      type: ACTIVITY_TYPE.PRODUCT_PUBLISHED,
      productId: 200,
      productName: 'Laptop Baru',
    })
    expect(activity.message).toContain('Laptop Baru')
    expect(activity.date).toBeTruthy()
  })

  it('rejects an unknown activity type instead of inventing one', async () => {
    await expect(
      recordActivity('CATEGORY_CREATE', 'Kategori dibuat.'),
    ).rejects.toThrow('tidak dikenali')
  })

  it('exposes every locked activity type through the dedicated helpers', async () => {
    actAsStoreA()
    const published = await recordProductPublished('A', { productId: 1 })
    const edited = await recordProductEdited('B', { productId: 2 })
    const soldOut = await recordProductSoldOut('C', { productId: 3 })
    const reactivated = await recordProductReactivated('D', { productId: 4 })
    const archived = await recordProductArchived('E', { productId: 5 })
    const restored = await recordProductRestored('F', { productId: 6 })
    const storeUpdated = await recordStoreUpdated()

    expect(published.type).toBe(ACTIVITY_TYPE.PRODUCT_PUBLISHED)
    expect(edited.type).toBe(ACTIVITY_TYPE.PRODUCT_EDITED)
    expect(soldOut.type).toBe(ACTIVITY_TYPE.PRODUCT_SOLD_OUT)
    expect(reactivated.type).toBe(ACTIVITY_TYPE.PRODUCT_REACTIVATED)
    expect(archived.type).toBe(ACTIVITY_TYPE.PRODUCT_ARCHIVED)
    expect(restored.type).toBe(ACTIVITY_TYPE.PRODUCT_RESTORED)
    expect(storeUpdated.type).toBe(ACTIVITY_TYPE.STORE_UPDATED)
  })
})

describe('listRecentActivities', () => {
  it('is newest-first and store-scoped to the acting seller', async () => {
    actAsStoreA()
    const before = await listRecentActivities()
    expect(before.every((activity) => activity.storeId === STORE_A_ID)).toBe(true)

    await recordProductPublished('Produk Terbaru', { productId: 999 })
    const after = await listRecentActivities()
    expect(after[0].message).toContain('Produk Terbaru')

    const times = after.map((activity) => new Date(activity.date).getTime())
    for (let index = 1; index < times.length; index += 1) {
      expect(times[index - 1]).toBeGreaterThanOrEqual(times[index])
    }
  })

  it('resolves the acting store from the session even for a second store', async () => {
    actAsStoreB()
    const activity = await recordProductPublished('Kaos Baru', { productId: 101 })
    expect(activity.storeId).toBe(STORE_B_ID)
  })

  it("withholds one store's activities from another store", async () => {
    actAsStoreB()
    const before = await listRecentActivities()
    expect(before).toEqual([])

    await recordProductPublished('Kaos Polos Premium', { productId: 101 })
    const after = await listRecentActivities()
    expect(after.every((activity) => activity.storeId === STORE_B_ID)).toBe(true)

    actAsStoreA()
    const storeA = await listRecentActivities()
    expect(storeA.every((activity) => activity.storeId === STORE_A_ID)).toBe(true)
    expect(storeA.some((activity) => activity.productName === 'Kaos Polos Premium')).toBe(false)
  })

  it('never returns non-canonical activity types even if they exist in the timeline', async () => {
    actAsStoreA()
    recentActivities.push({
      id: 999,
      storeId: STORE_A_ID,
      type: 'PRODUCT_VIEW',
      message: 'Melihat produk — bukan activity seller.',
      productId: null,
      productName: null,
      date: '2026-09-12T00:00:00.000Z',
    })
    const list = await listRecentActivities()
    expect(list.some((activity) => activity.type === 'PRODUCT_VIEW')).toBe(false)
    expect(list.every((activity) => Object.values(ACTIVITY_TYPE).includes(activity.type))).toBe(true)
  })

  it('produces the canonical DD.MM.YYYY date at render time', async () => {
    actAsStoreA()
    const list = await listRecentActivities()
    for (const activity of list) {
      expect(formatDate(activity.date)).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
    }
  })

  it('only surfaces documented activity types (mock need not span every canonical type)', async () => {
    actAsStoreA()
    const list = await listRecentActivities()
    const allowed = new Set(Object.values(ACTIVITY_TYPE))
    // The mock exercises the seven product/store events it drives; the eleven
    // canonical types (docs/AGENTS.md §20 incl. category/announcement) are an
    // enum-level contract, and a mock without those records must still pass.
    expect(list.every((activity) => allowed.has(activity.type))).toBe(true)
    expect(list.some((activity) => activity.type === ACTIVITY_TYPE.PRODUCT_PUBLISHED)).toBe(true)
  })
})