import { describe, expect, it } from 'vitest'
import {
  buildCategoryFilterOptions,
  buildCategoryTree,
  buildCategoryUsageCounts,
  countProductsByCategory,
  hasDuplicateCategoryName,
  resolveCategoryScope,
} from '../categoryTree'

const categories = [
  { id: 1, name: 'Elektronik', parentId: null, custom: false },
  { id: 2, name: 'Laptop', parentId: 1, custom: false },
  { id: 3, name: 'Fashion', parentId: null, custom: false },
  { id: 4, name: 'Gaming', parentId: null, custom: true, storeId: 'store-a' },
  { id: 5, name: 'Gadget Gaming', parentId: 4, custom: true, storeId: 'store-a' },
]

describe('buildCategoryTree', () => {
  it('builds parents and children, skipping subcategories with no parent id mismatch', () => {
    const tree = buildCategoryTree(categories)
    expect(tree.parents.map((c) => c.name)).toEqual(['Elektronik', 'Fashion', 'Gaming'])
    expect(tree.childrenByParent[1].map((c) => c.name)).toEqual(['Laptop'])
    expect(tree.childrenByParent[4].map((c) => c.name)).toEqual(['Gadget Gaming'])
  })
})

describe('countProductsByCategory', () => {
  it('counts products per category name', () => {
    const counts = countProductsByCategory([
      { category: 'Laptop' },
      { category: 'Laptop' },
      { category: 'Aksesoris' },
    ])
    expect(counts).toEqual({ Laptop: 2, Aksesoris: 1 })
  })
})

describe('buildCategoryUsageCounts', () => {
  const tree = [
    { id: 1, name: 'Computer', parentId: null, custom: true },
    { id: 2, name: 'Laptop', parentId: 1, custom: true },
    { id: 3, name: 'Desktop', parentId: 1, custom: true },
    { id: 4, name: 'Elektronik', parentId: null, custom: false },
    { id: 5, name: 'Fashion', parentId: null, custom: false },
  ]

  it('aggregates a Kategori Utama from its descendant Sub Kategori', () => {
    const usage = buildCategoryUsageCounts(tree, [
      { category: 'Laptop' },
      { category: 'Laptop' },
      { category: 'Laptop' },
      { category: 'Desktop' },
      { category: 'Desktop' },
    ])
    expect(usage[1]).toBe(5)
    expect(usage[2]).toBe(3)
    expect(usage[3]).toBe(2)
  })

  it('includes products assigned directly to the Kategori Utama', () => {
    const usage = buildCategoryUsageCounts(tree, [
      { category: 'Computer' },
      { category: 'Laptop' },
    ])
    expect(usage[1]).toBe(2)
    expect(usage[2]).toBe(1)
  })

  it('leaves categories with no products at zero and is safe with no children', () => {
    const usage = buildCategoryUsageCounts(tree, [])
    expect(usage[1]).toBe(0)
    expect(usage[4]).toBe(0)
    expect(usage[5]).toBe(0)
  })

  it('rolls up deeper hierarchies without double counting', () => {
    const deep = [
      { id: 1, name: 'Root', parentId: null, custom: true },
      { id: 2, name: 'Mid', parentId: 1, custom: true },
      { id: 3, name: 'Leaf', parentId: 2, custom: true },
    ]
    const usage = buildCategoryUsageCounts(deep, [{ category: 'Leaf' }, { category: 'Mid' }])
    expect(usage[3]).toBe(1)
    expect(usage[2]).toBe(2)
    expect(usage[1]).toBe(2)
  })

  it('does not leak counts across stores by name collision in disjoint trees', () => {
    const usage = buildCategoryUsageCounts(tree, [{ category: 'Aksesoris' }])
    expect(usage[1]).toBe(0)
    expect(usage[4]).toBe(0)
  })
})

describe('hasDuplicateCategoryName', () => {
  it('detects duplicates at the same level, case-insensitively', () => {
    expect(hasDuplicateCategoryName(categories, 'LAPTOP', 1)).toBe(true)
    expect(hasDuplicateCategoryName(categories, 'Laptop', null)).toBe(false)
  })

  it('ignores the category being edited', () => {
    expect(hasDuplicateCategoryName(categories, 'Laptop', 1, 2)).toBe(false)
  })

  it('compares only against the given level', () => {
    expect(hasDuplicateCategoryName(categories, 'Gaming', null)).toBe(true)
    expect(hasDuplicateCategoryName(categories, 'Gaming', 1)).toBe(false)
  })
})

describe('resolveCategoryScope', () => {
  it('includes descendant subcategories when a Kategori Utama is selected', () => {
    expect(resolveCategoryScope(categories, 'Elektronik')).toEqual(['Elektronik', 'Laptop'])
  })

  it('covers only the subcategory itself when a Sub Kategori is selected', () => {
    expect(resolveCategoryScope(categories, 'Laptop')).toEqual(['Laptop'])
  })

  it('falls back to an exact match for an unknown name', () => {
    expect(resolveCategoryScope(categories, 'Tidak Ada')).toEqual(['Tidak Ada'])
  })

  it('returns nothing for an empty selection', () => {
    expect(resolveCategoryScope(categories, '')).toEqual([])
  })
})

describe('buildCategoryFilterOptions', () => {
  it('lists each Kategori Utama followed by its Sub Kategori', () => {
    expect(buildCategoryFilterOptions(categories).map((category) => category.name)).toEqual([
      'Elektronik',
      'Laptop',
      'Fashion',
      'Gaming',
      'Gadget Gaming',
    ])
  })
})