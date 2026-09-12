import { beforeEach, describe, expect, it } from 'vitest'
import {
  createCategory,
  deleteCategory,
  listCategories,
  updateCategory,
} from '../categoryService'
import { actAsStoreA, actAsStoreB, beforeEachScenario } from './setup'

beforeEach(() => {
  beforeEachScenario()
})

describe('listCategories isolation', () => {
  it('returns defaults plus own customs for Store A, never Store B customs', async () => {
    actAsStoreA()
    const result = await listCategories()
    const names = result.map((c) => c.name)
    expect(names).toContain('Elektronik')
    expect(names).toContain('Gaming')
    expect(names).not.toContain('Fashion Branded')
  })

  it('returns defaults plus Store B customs for Store B, never Store A customs', async () => {
    actAsStoreB()
    const result = await listCategories()
    const names = result.map((c) => c.name)
    expect(names).toContain('Fashion Branded')
    expect(names).not.toContain('Gaming')
    expect(names).not.toContain('Gadget Gaming')
  })
})

describe('createCategory', () => {
  it('creates a custom category scoped to the current store', async () => {
    actAsStoreB()
    const category = await createCategory({ name: 'Sport', parentId: null })
    expect(category).toMatchObject({
      name: 'Sport',
      parentId: null,
      custom: true,
      storeId: 'toko-agung-fashion',
    })
  })

  it('allows the same name across stores (custom namespaces are per-store)', async () => {
    actAsStoreA()
    await createCategory({ name: 'Lifestyle', parentId: null })
    actAsStoreB()
    await expect(createCategory({ name: 'Lifestyle', parentId: null })).resolves.toMatchObject({
      name: 'Lifestyle',
    })
  })

  it('rejects a duplicate name within the same store and same level', async () => {
    actAsStoreB()
    await createCategory({ name: 'Sport', parentId: null })
    await expect(createCategory({ name: 'sporT', parentId: null })).rejects.toThrow('sudah digunakan')
  })

  it('rejects a custom name that collides with a default category', async () => {
    actAsStoreB()
    await expect(createCategory({ name: 'Elektronik', parentId: null })).rejects.toThrow(
      'sudah digunakan',
    )
  })

  it('rejects an empty name', async () => {
    actAsStoreB()
    await expect(createCategory({ name: '  ' })).rejects.toThrow('wajib diisi')
  })

  it('supports one level of subcategory only', async () => {
    actAsStoreB()
    const parent = await createCategory({ name: 'Sport', parentId: null })
    const child = await createCategory({ name: 'Lari', parentId: parent.id })
    expect(child.parentId).toBe(parent.id)
  })

  it('rejects an invalid or invisible parent', async () => {
    actAsStoreB()
    await expect(createCategory({ name: 'X', parentId: 999 })).rejects.toThrow('Parent category')
    await expect(createCategory({ name: 'X', parentId: 7 })).rejects.toThrow('Parent category')
  })

  it('rejects parenting a subcategory under another subcategory', async () => {
    actAsStoreB()
    const parent = await createCategory({ name: 'Sport', parentId: null })
    const child = await createCategory({ name: 'Lari', parentId: parent.id })
    await expect(createCategory({ name: 'Roda', parentId: child.id })).rejects.toThrow(
      'Parent category',
    )
  })
})

describe('updateCategory', () => {
  it('cannot see or edit another store custom category', async () => {
    actAsStoreA()
    await expect(updateCategory(100, { name: 'Hacked' })).rejects.toThrow('Category tidak ditemukan')
    await expect(deleteCategory(100)).rejects.toThrow('Category tidak ditemukan')
  })

  it('renames a category and propagates to the owning store products only', async () => {
    actAsStoreB()
    await updateCategory(100, { name: 'Fashion Premium' })
    const { products } = await import('../../data/mock')

    const ownedByB = products.filter((p) => p.storeId === 'toko-agung-fashion')
    const ownedByA = products.filter((p) => p.storeId === 'toko-komputer-jaya')
    expect(ownedByB.every((p) => p.category !== 'Fashion Branded')).toBe(true)
    expect(ownedByA.some((p) => p.category === 'Fashion Branded')).toBe(false)
  })

  it('rejects renaming to a duplicate sibling name', async () => {
    actAsStoreB()
    await createCategory({ name: 'Sport', parentId: null })
    await expect(updateCategory(100, { name: 'sport' })).rejects.toThrow('sudah digunakan')
  })

  it('rejects editing a default category', async () => {
    actAsStoreA()
    await expect(updateCategory(1, { name: 'Digital' })).rejects.toThrow('Category tidak ditemukan')
  })
})

describe('deleteCategory', () => {
  it('blocks deleting a category still used by a product', async () => {
    actAsStoreA()
    await expect(deleteCategory(8)).rejects.toThrow('masih digunakan')
  })

  it('blocks deleting a parent that still has subcategories', async () => {
    actAsStoreA()
    await expect(deleteCategory(7)).rejects.toThrow('masih memiliki subcategory')
  })

  it('deletes an unused custom category', async () => {
    actAsStoreB()
    const category = await createCategory({ name: 'Segera Hapus', parentId: null })
    await expect(deleteCategory(category.id)).resolves.toEqual({ deleted: true })
  })

  it('cannot delete a default category', async () => {
    actAsStoreA()
    await expect(deleteCategory(1)).rejects.toThrow('Category tidak ditemukan')
  })
})