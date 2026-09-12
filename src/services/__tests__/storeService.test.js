import { beforeEach, describe, expect, it } from 'vitest'
import {
  canChangeStoreId,
  checkStoreIdAvailable,
  createStore,
  getCurrentStoreId,
  getMyStore,
  getStore,
  updateStore,
} from '../storeService'
import { setActiveUser } from '../authService'
import {
  STORE_A_ID,
  STORE_B_ID,
  actAsStoreA,
  actAsStoreB,
  beforeEachScenario,
  newSeller,
} from './setup'

beforeEach(() => {
  beforeEachScenario()
})

describe('getStore', () => {
  it('finds a store by public store ID', async () => {
    const store = await getStore(STORE_B_ID)
    expect(store.name).toBe('Toko Agung Fashion')
  })

  it('resolves undefined for an unknown store ID', async () => {
    await expect(getStore('toko-tidak-ada')).resolves.toBeUndefined()
  })
})

describe('current store resolution', () => {
  it('resolves the store owned by the authenticated account', async () => {
    actAsStoreB()
    expect(getCurrentStoreId()).toBe(STORE_B_ID)
    const mine = await getMyStore()
    expect(mine.storeId).toBe(STORE_B_ID)
  })

  it('falls back to the first mock store for an account with no owned store', async () => {
    setActiveUser(newSeller)
    expect(getCurrentStoreId()).toBe(STORE_A_ID)
  })
})

describe('checkStoreIdAvailable', () => {
  it('marks used IDs as taken case-insensitively', async () => {
    await expect(checkStoreIdAvailable(STORE_A_ID)).resolves.toEqual({ available: false })
    await expect(checkStoreIdAvailable('TOKO-KOMPUTER-JAYA')).resolves.toEqual({ available: false })
  })

  it('marks an unused ID as available', async () => {
    await expect(checkStoreIdAvailable('toko-baru')).resolves.toEqual({ available: true })
  })
})

describe('canChangeStoreId', () => {
  it('allows a change when the store has never changed its ID', () => {
    expect(canChangeStoreId({ storeId: 'x', lastStoreIdChange: undefined })).toEqual({
      allowed: true,
      nextChangeDate: null,
    })
  })

  it('blocks a change inside the 30-day window', () => {
    const result = canChangeStoreId({
      storeId: 'x',
      lastStoreIdChange: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    })
    expect(result.allowed).toBe(false)
    expect(result.nextChangeDate).toBeTruthy()
  })

  it('allows a change after the 30-day window', () => {
    const result = canChangeStoreId({
      storeId: 'x',
      lastStoreIdChange: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    })
    expect(result.allowed).toBe(true)
  })
})

describe('createStore', () => {
  it('creates a store for an account without one', async () => {
    setActiveUser(newSeller)
    const store = await createStore({ name: 'Toko Baru', storeId: 'Toko-Baru ' })
    expect(store.storeId).toBe('toko-baru')
    expect(store.name).toBe('Toko Baru')
    const fetched = await getStore('toko-baru')
    expect(fetched.storeId).toBe('toko-baru')
  })

  it('rejects an account that already owns a store (1 account = 1 store)', async () => {
    actAsStoreA()
    await expect(createStore({ name: 'Toko Kedua', storeId: 'toko-kedua' })).rejects.toThrow(
      'sudah memiliki toko',
    )
  })

  it('rejects duplicate and invalid Store IDs', async () => {
    await expect(createStore({ name: 'X', storeId: STORE_A_ID })).rejects.toThrow(
      'Store ID sudah digunakan',
    )
    await expect(createStore({ name: 'X', storeId: 'Toko Buruk!' })).rejects.toThrow(
      'huruf kecil, angka, dan tanda hubung',
    )
  })
})

describe('updateStore Store ID change', () => {
  const NEW_ID = 'toko-komputer-baru'

  it('rejects an invalid format and duplicate IDs', async () => {
    await expect(updateStore(STORE_A_ID, { storeId: 'Bad ID!' })).rejects.toThrow(
      'hanya boleh huruf kecil',
    )
    await expect(updateStore(STORE_A_ID, { storeId: STORE_B_ID })).rejects.toThrow(
      'sudah digunakan',
    )
  })

  it('re-keys products, custom categories, users and interests atomically', async () => {
    const result = await updateStore(STORE_A_ID, { storeId: NEW_ID })
    expect(result.storeId).toBe(NEW_ID)
    expect(result.lastStoreIdChange).toBeTruthy()

    const { products, categories, users, customerInterests } = await import('../../data/mock')

    const orphanProducts = products.filter((p) => p.storeId === STORE_A_ID)
    const orphanCustomCategories = categories.filter((c) => c.storeId === STORE_A_ID)
    const orphanInterests = customerInterests.filter((i) => i.storeId === STORE_A_ID)
    const orphanUser = users.find((u) => u.storeId === STORE_A_ID)

    expect(orphanProducts).toHaveLength(0)
    expect(orphanCustomCategories).toHaveLength(0)
    expect(orphanInterests).toHaveLength(0)
    expect(orphanUser).toBeUndefined()

    expect(products.some((p) => p.storeId === NEW_ID)).toBe(true)
    expect(categories.some((c) => c.storeId === NEW_ID)).toBe(true)
    expect(customerInterests.some((i) => i.storeId === NEW_ID)).toBe(true)
    expect(users.some((u) => u.storeId === NEW_ID)).toBe(true)

    await expect(getStore(STORE_A_ID)).resolves.toBeUndefined()
    await expect(getStore(NEW_ID)).resolves.toMatchObject({ storeId: NEW_ID })
  })

  it('blocks an ID change inside the 30-day cooldown', async () => {
    await updateStore(STORE_A_ID, { storeId: NEW_ID })
    await expect(updateStore(NEW_ID, { storeId: 'toko-komputer-baru-lagi' })).rejects.toThrow(
      '30 hari',
    )
  })
})

describe('Store location updates are isolated per store', () => {
  it('updates only the owning store (Store A location leaves Store B untouched)', async () => {
    actAsStoreA()
    const result = await updateStore(STORE_A_ID, {
      province: 'Jawa Barat',
      city: 'Kota Bandung',
      fullAddress: 'Jl. Raya Merdeka No. 10',
    })
    expect(result).toMatchObject({
      province: 'Jawa Barat',
      city: 'Kota Bandung',
      fullAddress: 'Jl. Raya Merdeka No. 10',
    })

    const storeB = await getStore(STORE_B_ID)
    expect(storeB.province).toBeUndefined()
    expect(storeB.city).toBe('Bandung')
    expect(storeB.fullAddress).toBeUndefined()
  })

  it('updates only the owning store (Store B location is not visible on Store A)', async () => {
    actAsStoreB()
    const result = await updateStore(STORE_B_ID, {
      province: 'DI Yogyakarta',
      city: 'Kota Yogyakarta',
      fullAddress: 'Jl. Malioboro No. 12',
    })
    expect(result).toMatchObject({
      province: 'DI Yogyakarta',
      city: 'Kota Yogyakarta',
      fullAddress: 'Jl. Malioboro No. 12',
    })

    const storeA = await getStore(STORE_A_ID)
    expect(storeA.province).toBe('Jawa Barat')
    expect(storeA.city).toBe('Kota Bandung')
    expect(storeA.fullAddress).toBeUndefined()
  })
})