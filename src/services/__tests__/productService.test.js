import { beforeEach, describe, expect, it } from 'vitest'
import {
  archiveProduct,
  createProduct,
  getProduct,
  getSellerProduct,
  listArchivedProducts,
  listPublicProducts,
  listSellerProducts,
  markSoldOut,
  publishProduct,
  reactivateProduct,
  restoreProduct,
  toggleFeatured,
  updateProduct,
} from '../productService'
import { PRODUCT_STATUS } from '../../constants/enums'
import { STORE_A_ID, STORE_B_ID, actAsStoreA, actAsStoreB, beforeEachScenario } from './setup'

beforeEach(() => {
  beforeEachScenario()
})

async function createActiveProduct(name = 'Produk Baru') {
  return createProduct({
    name,
    images: ['/img/a.jpg'],
    category: 'Laptop',
    details: [{ label: 'RAM', value: '8 GB' }],
    description: 'Produk baru untuk diuji.',
    condition: 'NEW',
    price: 'Rp 1.000.000',
    priceValue: 1000000,
    status: PRODUCT_STATUS.DRAFT,
  })
}

describe('listSellerProducts (seller management list)', () => {
  it('returns DRAFT + PUBLISHED + SOLD_OUT, excluding ARCHIVED, scoped to the current store', async () => {
    actAsStoreA()
    const active = await listSellerProducts()
    expect(active.length).toBeGreaterThan(0)
    expect(active.every((p) => p.storeId === STORE_A_ID)).toBe(true)
    expect(active.some((p) => p.status === PRODUCT_STATUS.ARCHIVED)).toBe(false)
  })

  it('switching the session switches the store scope', async () => {
    actAsStoreB()
    const active = await listSellerProducts()
    expect(active.every((p) => p.storeId === STORE_B_ID)).toBe(true)
    expect(active.map((p) => p.id).sort((a, b) => a - b)).toEqual([100, 101])
  })

  it('includes SOLD_OUT products in the seller management list, not the public list', async () => {
    actAsStoreB()
    const management = await listSellerProducts()
    const soldOut = management.filter((p) => p.status === PRODUCT_STATUS.SOLD_OUT)
    expect(soldOut.map((p) => p.id)).toEqual([101])

    const publicList = await listPublicProducts(STORE_B_ID)
    expect(publicList.map((p) => p.id)).toEqual([100])
    expect(publicList.some((p) => p.status === PRODUCT_STATUS.SOLD_OUT)).toBe(false)
  })
})

describe('listArchivedProducts', () => {
  it('returns only archived products of the current store', async () => {
    actAsStoreB()
    const archived = await listArchivedProducts()
    expect(archived.map((p) => p.id)).toEqual([102])
    expect(archived.every((p) => p.status === PRODUCT_STATUS.ARCHIVED)).toBe(true)
  })
})

describe('listPublicProducts / getProduct', () => {
  it('returns only PUBLISHED products for the requested store', async () => {
    const published = await listPublicProducts(STORE_B_ID)
    expect(published.map((p) => p.id).sort((a, b) => a - b)).toEqual([100])
  })

  it('is strict about the store context on product lookup', async () => {
    await expect(getProduct(STORE_B_ID, 1)).resolves.toBeUndefined()
    await expect(getProduct(STORE_A_ID, 100)).resolves.toBeUndefined()
    await expect(getProduct(STORE_A_ID, 1)).resolves.toMatchObject({ id: 1 })
  })
})

describe('createProduct', () => {
  it('defaults to DRAFT and assigns the current store', async () => {
    actAsStoreB()
    const product = await createProduct({ name: 'Produk B' })
    expect(product.status).toBe(PRODUCT_STATUS.DRAFT)
    expect(product.storeId).toBe(STORE_B_ID)
  })
})

describe('product lifecycle', () => {
  it('publishes a draft and keeps a published product published', async () => {
    actAsStoreA()
    const draft = await createActiveProduct()
    expect(draft.status).toBe(PRODUCT_STATUS.DRAFT)

    const published = await publishProduct(draft.id)
    expect(published.status).toBe(PRODUCT_STATUS.PUBLISHED)

    await expect(publishProduct(draft.id)).resolves.toMatchObject({ status: PRODUCT_STATUS.PUBLISHED })
  })

  it('never publishes from ARCHIVED', async () => {
    actAsStoreA()
    const draft = await createActiveProduct()
    await publishProduct(draft.id)
    await archiveProduct(draft.id)

    await expect(publishProduct(draft.id)).rejects.toThrow('diarsipkan')
    const archived = await archiveProduct(draft.id)
    expect(archived.status).toBe(PRODUCT_STATUS.ARCHIVED)
  })

  it('restores an archived product to DRAFT, never PUBLISHED', async () => {
    actAsStoreA()
    const draft = await createActiveProduct()
    await publishProduct(draft.id)
    await archiveProduct(draft.id)
    const restored = await restoreProduct(draft.id)
    expect(restored.status).toBe(PRODUCT_STATUS.DRAFT)
  })

  it('blocks a generic update that would flip ARCHIVED to PUBLISHED', async () => {
    actAsStoreA()
    const draft = await createActiveProduct('Produk yang akan diarsipkan')
    await publishProduct(draft.id)
    await archiveProduct(draft.id)

    await expect(updateProduct(draft.id, { status: PRODUCT_STATUS.PUBLISHED })).rejects.toThrow(
      'diarsipkan',
    )
    await expect(updateProduct(draft.id, { name: 'Nama berubah' })).resolves.toMatchObject({
      name: 'Nama berubah',
    })
  })
it('marks a PUBLISHED product SOLD_OUT and reactivates it back to PUBLISHED', async () => {
    actAsStoreA()
    const draft = await createActiveProduct('Produk sold out')
    const published = await publishProduct(draft.id)
    expect(published.status).toBe(PRODUCT_STATUS.PUBLISHED)

    const soldOut = await markSoldOut(published.id)
    expect(soldOut.status).toBe(PRODUCT_STATUS.SOLD_OUT)
    expect(soldOut.updatedAt).toBeDefined()

    const reactivated = await reactivateProduct(soldOut.id)
    expect(reactivated.status).toBe(PRODUCT_STATUS.PUBLISHED)
  })

  it('rejects marking a non-PUBLISHED product as SOLD_OUT', async () => {
    actAsStoreA()
    const draft = await createActiveProduct('Masih draft')
    await expect(markSoldOut(draft.id)).rejects.toThrow('tidak dapat ditandai Sold Out')
  })

  it('rejects a generic update that would set SOLD_OUT from a non-PUBLISHED status', async () => {
    actAsStoreA()
    const draft = await createActiveProduct('Masih draft')
    await expect(
      updateProduct(draft.id, { status: PRODUCT_STATUS.SOLD_OUT }),
    ).rejects.toThrow('tidak dapat ditandai Sold Out')
  })

  it('rejects reactivating a product that is not SOLD_OUT', async () => {
    actAsStoreA()
    const draft = await createActiveProduct('Masih draft')
    const published = await publishProduct(draft.id)
    await expect(reactivateProduct(published.id)).rejects.toThrow('tidak dapat diaktifkan kembali')
  })

  it('only PUBLISHED products appear in the public list after a SOLD_OUT reaction', async () => {
    actAsStoreB()
    await markSoldOut(100)
    const publicAfter = await listPublicProducts(STORE_B_ID)
    expect(publicAfter).toEqual([])

    const reactivated = await reactivateProduct(100)
    expect(reactivated.status).toBe(PRODUCT_STATUS.PUBLISHED)
    const publicFinal = await listPublicProducts(STORE_B_ID)
    expect(publicFinal.map((p) => p.id)).toEqual([100])
  })
})

describe('cross-store isolation (Phase 10 regression)', () => {
  it("rejects acting on another store's product through every mutator", async () => {
    actAsStoreA()
    await expect(getSellerProduct(100)).resolves.toBeUndefined()
    await expect(updateProduct(100, { name: 'X' })).rejects.toThrow('Product tidak ditemukan')
    await expect(publishProduct(100)).rejects.toThrow('Product tidak ditemukan')
    await expect(archiveProduct(100)).rejects.toThrow('Product tidak ditemukan')
    await expect(restoreProduct(102)).rejects.toThrow('Product tidak ditemukan')
    await expect(toggleFeatured(100)).rejects.toThrow('Product tidak ditemukan')
    await expect(markSoldOut(100)).rejects.toThrow('Product tidak ditemukan')
    await expect(reactivateProduct(101)).rejects.toThrow('Product tidak ditemukan')
  })

  it('allows the owning store to act on its own product', async () => {
    actAsStoreB()
    const toggled = await toggleFeatured(100)
    expect(toggled.featured).toBe(true)
  })
})