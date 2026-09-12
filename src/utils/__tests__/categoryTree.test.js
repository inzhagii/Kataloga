import { describe, expect, it } from 'vitest'
import {
  buildCategoryTree,
  countProductsByCategory,
  hasDuplicateCategoryName,
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