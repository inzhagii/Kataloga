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
import { products, stores } from '../../data/mock'
import { STORE_A_ID, STORE_B_ID, actAsStoreA, actAsStoreB, beforeEachScenario, mkProduct } from './setup'

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

  it('includes SOLD_OUT products in the seller management list, and SOLD_OUT within the Auto Archive window in the public list', async () => {
    actAsStoreB()
    const management = await listSellerProducts()
    const soldOut = management.filter((p) => p.status === PRODUCT_STATUS.SOLD_OUT)
    expect(soldOut.map((p) => p.id)).toEqual([101])

    const publicList = await listPublicProducts(STORE_B_ID)
    expect(publicList.map((p) => p.id)).toEqual([100, 101])
    expect(publicList.some((p) => p.status === PRODUCT_STATUS.SOLD_OUT)).toBe(true)
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
  it('returns only publicly visible products for the requested store', async () => {
    const published = await listPublicProducts(STORE_B_ID)
    expect(published.map((p) => p.id).sort((a, b) => a - b)).toEqual([100, 101])
    expect(published.every((p) => [PRODUCT_STATUS.PUBLISHED, PRODUCT_STATUS.SOLD_OUT].includes(p.status))).toBe(true)
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

  it('keeps a SOLD_OUT product public through reactivation', async () => {
    actAsStoreB()
    await markSoldOut(100)
    const publicAfter = await listPublicProducts(STORE_B_ID)
    expect(publicAfter.map((p) => p.id).sort((a, b) => a - b)).toEqual([100, 101])

    const reactivated = await reactivateProduct(100)
    expect(reactivated.status).toBe(PRODUCT_STATUS.PUBLISHED)
    const publicFinal = await listPublicProducts(STORE_B_ID)
    expect(publicFinal.map((p) => p.id).sort((a, b) => a - b)).toEqual([100, 101])
  })
})

describe('SOLD_OUT Auto Archive window (public visibility)', () => {
  it('exposes SOLD_OUT within the store window and hides expired SOLD_OUT', async () => {
    actAsStoreA()
    const publicList = await listPublicProducts(STORE_A_ID)
    const soldOutIds = publicList.filter((p) => p.status === PRODUCT_STATUS.SOLD_OUT).map((p) => p.id)
    expect(soldOutIds).toEqual(expect.arrayContaining([14, 16]))
    expect(soldOutIds).not.toContain(17)
    expect(publicList.some((p) => p.status === PRODUCT_STATUS.DRAFT)).toBe(false)
    expect(publicList.some((p) => p.status === PRODUCT_STATUS.ARCHIVED)).toBe(false)
  })

  it('treats a SOLD_OUT without soldOutAt as still inside the window (conservative)', async () => {
    actAsStoreB()
    const publicList = await listPublicProducts(STORE_B_ID)
    expect(publicList.map((p) => p.id).sort((a, b) => a - b)).toEqual([100, 101])
    expect(await getProduct(STORE_B_ID, 101)).toMatchObject({ id: 101, status: PRODUCT_STATUS.SOLD_OUT })
  })

  it('gates getProduct by public visibility: DRAFT, ARCHIVED and expired SOLD_OUT are hidden', async () => {
    actAsStoreA()
    await expect(getProduct(STORE_A_ID, 14)).resolves.toMatchObject({ id: 14 }) // within window
    await expect(getProduct(STORE_A_ID, 17)).resolves.toBeUndefined() // expired
    await expect(getProduct(STORE_A_ID, 13)).resolves.toBeUndefined() // DRAFT
    await expect(getProduct(STORE_A_ID, 15)).resolves.toBeUndefined() // ARCHIVED
  })

  it('marks SOLD_OUT with a timestamp and clears it on reactivation and restore', async () => {
    actAsStoreB()
    const soldOut = await markSoldOut(100)
    expect(soldOut.soldOutAt).toBeDefined()

    const reactivated = await reactivateProduct(100)
    expect(reactivated.status).toBe(PRODUCT_STATUS.PUBLISHED)
    expect(reactivated.soldOutAt).toBeUndefined()

    const soldOutAgain = await markSoldOut(100)
    expect(soldOutAgain.soldOutAt).toBeDefined()
    const archived = await archiveProduct(100)
    expect(archived.status).toBe(PRODUCT_STATUS.ARCHIVED)
    const restored = await restoreProduct(100)
    expect(restored.status).toBe(PRODUCT_STATUS.DRAFT)
    expect(restored.soldOutAt).toBeUndefined()
  })

  it('hides SOLD_OUT once the store Auto Archive window passes', async () => {
    actAsStoreB()
    const draft = await createActiveProduct('Produk habis')
    const published = await publishProduct(draft.id)
    await markSoldOut(published.id)

    expect((await listPublicProducts(STORE_B_ID)).map((p) => p.id)).toContain(draft.id)

    const stored = products.find((item) => item.id === draft.id)
    stored.soldOutAt = '2020-01-01T00:00:00.000Z'

    expect((await listPublicProducts(STORE_B_ID)).map((p) => p.id)).not.toContain(draft.id)
    await expect(getProduct(STORE_B_ID, draft.id)).resolves.toBeUndefined()
  })

  it('disabled Auto Archive (autoArchiveDays null) keeps SOLD_OUT public regardless of age', async () => {
    actAsStoreB()
    const fixture = {
      ...mkProduct({
        id: 999,
        name: 'Produk Lama',
        status: PRODUCT_STATUS.SOLD_OUT,
        soldOutAt: '2020-01-01T00:00:00.000Z',
      }),
    }
    products.push(fixture)

    const store = stores.find((item) => item.storeId === STORE_B_ID)
    store.autoArchiveDays = null
    expect((await listPublicProducts(STORE_B_ID)).map((p) => p.id)).toContain(999)

    store.autoArchiveDays = 60
    expect((await listPublicProducts(STORE_B_ID)).map((p) => p.id)).not.toContain(999)
  })

  it('orders the public catalog: Featured Published -> published (newest first) -> Sold Out last', async () => {
    actAsStoreA()
    const publicList = await listPublicProducts(STORE_A_ID)
    const rank = (product) => (product.status === PRODUCT_STATUS.SOLD_OUT ? 2 : product.featured ? 0 : 1)

    const lastSoldOutIndex = Math.max(
      -1,
      ...publicList.map((p, i) => (p.status === PRODUCT_STATUS.SOLD_OUT ? i : -1)),
    )
    for (let i = 0; i < publicList.length; i += 1) {
      if (publicList[i].status !== PRODUCT_STATUS.SOLD_OUT) {
        expect(i).toBeLessThan(lastSoldOutIndex === -1 ? publicList.length : lastSoldOutIndex)
      }
    }

    const publishedItems = publicList.filter((p) => p.status !== PRODUCT_STATUS.SOLD_OUT)
    expect(publishedItems.map((p) => p.id)).toEqual(
      [10, 7, 4, 2, 1, 6, 11, 5, 9, 3, 8, 12],
    )
    expect(publicList.every((p, index, list) => {
      if (index === 0) return true
      return rank(list[index - 1]) <= rank(p)
    })).toBe(true)
  })
})

describe('edit form keeps status (locked lifecycle)', () => {
  it('editing a SOLD_OUT product keeps status and soldOutAt', async () => {
    actAsStoreB()
    const updated = await updateProduct(101, { name: 'Jaket Denim Baru' })
    expect(updated.status).toBe(PRODUCT_STATUS.SOLD_OUT)
    expect(updated.soldOutAt).toBeUndefined()
  })

  it('rejects any status change through a generic edit', async () => {
    actAsStoreB()
    await expect(updateProduct(101, { status: PRODUCT_STATUS.DRAFT })).rejects.toThrow(
      'tidak dapat diubah melalui form',
    )
    await expect(updateProduct(101, { status: PRODUCT_STATUS.PUBLISHED })).rejects.toThrow(
      'tidak dapat diubah melalui form',
    )
  })
})

describe('Product Unggulan (featured) rules', () => {
  it('allows toggling featured on a SOLD_OUT product', async () => {
    actAsStoreB()
    const toggled = await toggleFeatured(101)
    expect(toggled.featured).toBe(true)
    expect(toggled.status).toBe(PRODUCT_STATUS.SOLD_OUT)
  })

  it('rejects toggling featured on an ARCHIVED product', async () => {
    actAsStoreB()
    await expect(toggleFeatured(102)).rejects.toThrow('tidak dapat menjadi Featured')
  })

  it('archiving clears the featured flag', async () => {
    actAsStoreB()
    await toggleFeatured(100)
    const archived = await archiveProduct(100)
    expect(archived.featured).toBe(false)
    expect((await listPublicProducts(STORE_B_ID)).map((p) => p.id)).not.toContain(100)
  })

  it('enforces the max-10 Product Unggulan limit per store', async () => {
    actAsStoreB()
    await toggleFeatured(100)
    await toggleFeatured(101)
    for (let i = 0; i < 8; i += 1) {
      const draft = await createProduct({ name: `Draft featured ${i}` })
      await toggleFeatured(draft.id)
    }
    const eleventh = await createProduct({ name: 'Draft kesebelas' })
    await expect(toggleFeatured(eleventh.id)).rejects.toThrow('Maksimal 10')
  })

  it('enforces the max-10 limit through create and update', async () => {
    actAsStoreB()
    for (let i = 0; i < 10; i += 1) {
      const draft = await createProduct({ name: `Draft featured ${i}` })
      await toggleFeatured(draft.id)
    }
    await expect(createProduct({ name: 'Kelebihan', featured: true })).rejects.toThrow(
      'Maksimal 10',
    )
    const extra = await createProduct({ name: 'Tambah satu lagi' })
    await expect(updateProduct(extra.id, { featured: true })).rejects.toThrow('Maksimal 10')
  })

  it('rejects enabling featured on an ARCHIVED product through update', async () => {
    actAsStoreB()
    await expect(updateProduct(102, { featured: true })).rejects.toThrow(
      'tidak dapat menjadi Featured',
    )
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