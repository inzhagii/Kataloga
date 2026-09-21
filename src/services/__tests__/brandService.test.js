import { beforeEach, describe, expect, it } from 'vitest'
import {
  countBrandProducts,
  createBrand,
  deleteBrand,
  ensureBrand,
  listBrands,
  updateBrand,
} from '../brandService'
import { actAsStoreA, actAsStoreB, beforeEachScenario } from './setup'

beforeEach(() => {
  beforeEachScenario()
})

describe('listBrands isolation', () => {
  it('returns only Store A brands for Store A, never Store B brands', async () => {
    actAsStoreA()
    const names = (await listBrands()).map((brand) => brand.name)
    expect(names).toContain('Asus')
    expect(names).toContain('TP-Link')
    expect(names).not.toContain('Zara')
  })

  it('returns only Store B brands for Store B, never Store A brands', async () => {
    actAsStoreB()
    const names = (await listBrands()).map((brand) => brand.name)
    expect(names).toContain('Zara')
    expect(names).not.toContain('Asus')
  })
})

describe('createBrand', () => {
  it('creates a brand scoped to the current store', async () => {
    actAsStoreB()
    const brand = await createBrand({ name: 'H&M' })
    expect(brand).toMatchObject({ name: 'H&M', storeId: 'toko-agung-fashion' })
  })

  it('allows the same name across stores', async () => {
    actAsStoreA()
    await createBrand({ name: 'Nike' })
    actAsStoreB()
    await expect(createBrand({ name: 'Nike' })).resolves.toMatchObject({ name: 'Nike' })
  })

  it('rejects a duplicate name within the same store (case-insensitive)', async () => {
    actAsStoreA()
    await expect(createBrand({ name: 'asuS' })).rejects.toThrow('sudah digunakan')
  })

  it('rejects an empty name', async () => {
    actAsStoreA()
    await expect(createBrand({ name: '   ' })).rejects.toThrow('wajib diisi')
  })
})

describe('updateBrand', () => {
  it('renames a brand and propagates to the owning store products only', async () => {
    actAsStoreA()
    await updateBrand(1, { name: 'ASUS ROG' })
    const { products } = await import('../../data/mock')
    const owned = products.filter((product) => product.storeId === 'toko-komputer-jaya')
    expect(owned.some((product) => product.brand === 'Asus')).toBe(false)
    expect(owned.filter((product) => product.brand === 'ASUS ROG').length).toBeGreaterThan(0)
  })

  it('rejects renaming to a duplicate brand name', async () => {
    actAsStoreA()
    await expect(updateBrand(1, { name: 'Lenovo' })).rejects.toThrow('sudah digunakan')
  })

  it('cannot see or edit another store brand', async () => {
    actAsStoreA()
    await expect(updateBrand(100, { name: 'Hacked' })).rejects.toThrow('Brand tidak ditemukan')
    await expect(deleteBrand(100)).rejects.toThrow('Brand tidak ditemukan')
  })
})

describe('deleteBrand', () => {
  it('blocks deleting a brand still used by a product', async () => {
    actAsStoreA()
    await expect(deleteBrand(1)).rejects.toThrow('masih digunakan oleh')
  })

  it('deletes an unused brand', async () => {
    actAsStoreA()
    const brand = await createBrand({ name: 'Segera Hapus' })
    await expect(deleteBrand(brand.id)).resolves.toEqual({ deleted: true })
    const names = (await listBrands()).map((item) => item.name)
    expect(names).not.toContain('Segera Hapus')
  })
})

describe('countBrandProducts', () => {
  it('counts the current store products referencing the brand name', async () => {
    actAsStoreA()
    const asus = (await listBrands()).find((brand) => brand.name === 'Asus')
    expect(countBrandProducts(asus)).toBeGreaterThan(0)
  })
})

describe('ensureBrand', () => {
  it('reuses an existing brand case-insensitively', async () => {
    actAsStoreA()
    const brand = await ensureBrand('asus')
    expect(brand).toMatchObject({ id: 1, name: 'Asus' })
  })

  it('creates a missing brand for the current store', async () => {
    actAsStoreA()
    await expect(ensureBrand('Framework')).resolves.toMatchObject({
      name: 'Framework',
      storeId: 'toko-komputer-jaya',
    })
  })

  it('returns null for an empty name', async () => {
    actAsStoreA()
    await expect(ensureBrand('  ')).resolves.toBeNull()
  })
})
