/**
 * Category service.
 * Returns mock data now; will call the Category API later.
 *
 * Mutations persist into the in-memory mock array so that cross-page flows
 * (categories -> products, storefront) stay consistent during a session.
 * Once the backend is available these helpers are replaced by real API calls
 * without changing the caller contract.
 */

import { categories } from '../data/mock'
import { products } from '../data/mock'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as categoryApi from './adapters/api/categoryApi'
import { getCurrentStoreId } from './storeService'
import { hasDuplicateCategoryName } from '../utils/categoryTree'

/**
 * Compute the next category id (avoids collisions after deletions).
 * @returns {number}
 */
function nextCategoryId() {
  return categories.reduce((max, category) => Math.max(max, category.id), 0) + 1
}

/**
 * Categories visible to the current store: built-in/default categories plus
 * the custom categories scoped to this store. Cross-store custom categories
 * never appear, so lookup, naming, parenting and deletion stay isolated.
 * @returns {import('../data/models.js').Category[]}
 */
function visibleCategories() {
  const currentStoreId = getCurrentStoreId()
  return categories.filter(
    (category) => !category.custom || !category.storeId || category.storeId === currentStoreId,
  )
}

/**
 * List categories for the current store: built-in/default categories plus
 * the custom categories scoped to this store, so category data from another
 * store never appears.
 * @returns {Promise<import('../data/models.js').Category[]>}
 */
export function listCategories() {
  if (isApiMode()) {
    return categoryApi.listCategories()
  }
  return withLatency(visibleCategories())
}

/**
 * Resolve the parent a new/edited category belongs to. Only Level-1 parents
 * may contain subcategories (max two levels on V1), and only parents visible
 * to the current store can be used.
 * @param {number|null} parentId
 * @returns {import('../data/models.js').Category | undefined}
 */
function resolveParent(parentId) {
  if (parentId === null) {
    return null
  }
  const parent = visibleCategories().find((category) => category.id === Number(parentId))
  if (!parent || parent.parentId !== null) {
    return undefined
  }
  return parent
}

/**
 * Create a custom category scoped to the current store.
 * @param {{ name: string, parentId?: number|null }} payload
 * @returns {Promise<import('../data/models.js').Category>}
 */
export function createCategory(payload) {
  if (isApiMode()) {
    return categoryApi.createCategory(payload)
  }
  const name = payload.name.trim()
  if (!name) {
    return Promise.reject(new Error('Nama category wajib diisi.'))
  }

  const parent = resolveParent(payload.parentId ?? null)
  if (parent === undefined) {
    return Promise.reject(new Error('Parent category tidak valid.'))
  }

  if (
    hasDuplicateCategoryName(visibleCategories(), name, payload.parentId ?? null)
  ) {
    return Promise.reject(new Error('Nama category sudah digunakan. Gunakan nama lain.'))
  }

  const category = {
    id: nextCategoryId(),
    name,
    parentId: payload.parentId ?? null,
    storeId: getCurrentStoreId(),
    custom: true,
  }
  categories.push(category)
  return withLatency(category)
}

/**
 * Update a custom category (rename and/or move a subcategory between Level-1
 * parents). Renaming propagates to the products that reference the category
 * so product curation and the storefront stay consistent.
 * @param {number} categoryId
 * @param {{ name?: string, parentId?: number|null }} payload
 * @returns {Promise<import('../data/models.js').Category>}
 */
export function updateCategory(categoryId, payload) {
  if (isApiMode()) {
    return categoryApi.updateCategory(categoryId, payload)
  }
  const category = visibleCategories().find(
    (item) => item.id === Number(categoryId) && item.custom,
  )
  if (!category) {
    return Promise.reject(new Error('Category tidak ditemukan.'))
  }

  const nextName = payload.name === undefined ? category.name : payload.name.trim()
  if (!nextName) {
    return Promise.reject(new Error('Nama category wajib diisi.'))
  }

  const nextParentId = payload.parentId === undefined ? category.parentId : payload.parentId
  if (nextParentId !== category.parentId) {
    const parent = resolveParent(nextParentId)
    if (parent === undefined) {
      return Promise.reject(new Error('Parent category tidak valid.'))
    }
  }

  if (
    hasDuplicateCategoryName(visibleCategories(), nextName, nextParentId, category.id)
  ) {
    return Promise.reject(new Error('Nama category sudah digunakan. Gunakan nama lain.'))
  }

  if (nextName !== category.name) {
    const currentStoreId = getCurrentStoreId()
    products.forEach((product) => {
      if (product.storeId === currentStoreId && product.category === category.name) {
        product.category = nextName
      }
    })
  }

  Object.assign(category, { name: nextName, parentId: nextParentId })
  return withLatency(category)
}

/**
 * Delete a custom category. Blocked when a product still uses it or when it
 * still has subcategories (deleting them would orphan or silently remove
 * custom child categories).
 * @param {number} categoryId
 * @returns {Promise<{ deleted: boolean }>}
 */
export function deleteCategory(categoryId) {
  if (isApiMode()) {
    return categoryApi.deleteCategory(categoryId)
  }
  const category = visibleCategories().find(
    (item) => item.id === Number(categoryId) && item.custom,
  )
  if (!category) {
    return Promise.reject(new Error('Category tidak ditemukan.'))
  }
  const currentStoreId = getCurrentStoreId()
  const used = products.some(
    (product) => product.storeId === currentStoreId && product.category === category.name,
  )
  if (used) {
    return Promise.reject(
      new Error(
        `Category "${category.name}" masih digunakan oleh product dan tidak dapat dihapus. Pindahkan product ke category lain terlebih dahulu.`,
      ),
    )
  }
  const hasChildren = visibleCategories().some((item) => item.parentId === category.id)
  if (hasChildren) {
    return Promise.reject(
      new Error(
        `Category "${category.name}" masih memiliki subcategory. Hapus atau pindahkan subcategory terlebih dahulu.`,
      ),
    )
  }
  const index = categories.findIndex((item) => item.id === category.id)
  if (index !== -1) {
    categories.splice(index, 1)
  }
  return withLatency({ deleted: true })
}