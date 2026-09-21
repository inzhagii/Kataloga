/**
 * Brand service.
 * Returns mock data now; will call the Brand API later.
 *
 * Brands are store-scoped and join products by NAME (`product.brand`), the
 * same name-keyed convention used by categories. Mutations persist into the
 * in-memory mock array so Brand Management, Add/Edit Product and the Products
 * brand filter stay consistent during a session.
 */

import { brands, products } from '../data/mock'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as brandApi from './adapters/api/brandApi'
import { getCurrentStoreId } from './storeService'
import { hasDuplicateBrandName } from '../utils/brandUtil'

/**
 * Compute the next brand id (avoids collisions after deletions).
 * @returns {number}
 */
function nextBrandId() {
  return brands.reduce((max, brand) => Math.max(max, brand.id), 0) + 1
}

/**
 * Brands belonging to the current store. Cross-store brands never appear, so
 * lookup, naming, product counting and deletion stay isolated.
 * @returns {import('../data/models.js').Brand[]}
 */
function visibleBrands() {
  const currentStoreId = getCurrentStoreId()
  return brands.filter((brand) => brand.storeId === currentStoreId)
}

/**
 * Number of current-store products referencing a brand by name. Counts every
 * status (including ARCHIVED) so a brand can never be deleted while any
 * product still points at it.
 * @param {import('../data/models.js').Brand} brand
 * @returns {number}
 */
export function countBrandProducts(brand) {
  const currentStoreId = getCurrentStoreId()
  return products.filter(
    (product) => product.storeId === currentStoreId && product.brand === brand.name,
  ).length
}

/**
 * List brands for the current store, ordered by name.
 * @returns {Promise<import('../data/models.js').Brand[]>}
 */
export function listBrands() {
  if (isApiMode()) {
    return brandApi.listBrands()
  }
  const result = [...visibleBrands()].sort((a, b) => a.name.localeCompare(b.name))
  return withLatency(result)
}

/**
 * Create a brand scoped to the current store.
 * @param {{ name: string }} payload
 * @returns {Promise<import('../data/models.js').Brand>}
 */
export function createBrand(payload) {
  if (isApiMode()) {
    return brandApi.createBrand(payload)
  }
  const name = (payload.name ?? '').trim()
  if (!name) {
    return Promise.reject(new Error('Nama brand wajib diisi.'))
  }
  if (hasDuplicateBrandName(visibleBrands(), name)) {
    return Promise.reject(new Error('Nama brand sudah digunakan. Gunakan nama lain.'))
  }

  const brand = {
    id: nextBrandId(),
    name,
    storeId: getCurrentStoreId(),
  }
  brands.push(brand)
  return withLatency(brand)
}

/**
 * Update a brand (rename). Renaming propagates to the current store's products
 * that reference the brand by name so product curation stays consistent.
 * @param {number} brandId
 * @param {{ name?: string }} payload
 * @returns {Promise<import('../data/models.js').Brand>}
 */
export function updateBrand(brandId, payload) {
  if (isApiMode()) {
    return brandApi.updateBrand(brandId, payload)
  }
  const brand = visibleBrands().find((item) => item.id === Number(brandId))
  if (!brand) {
    return Promise.reject(new Error('Brand tidak ditemukan.'))
  }

  const nextName = payload.name === undefined ? brand.name : payload.name.trim()
  if (!nextName) {
    return Promise.reject(new Error('Nama brand wajib diisi.'))
  }
  if (hasDuplicateBrandName(visibleBrands(), nextName, brand.id)) {
    return Promise.reject(new Error('Nama brand sudah digunakan. Gunakan nama lain.'))
  }

  if (nextName !== brand.name) {
    const currentStoreId = getCurrentStoreId()
    products.forEach((product) => {
      if (product.storeId === currentStoreId && product.brand === brand.name) {
        product.brand = nextName
      }
    })
  }

  brand.name = nextName
  return withLatency(brand)
}

/**
 * Delete a brand. Blocked while any current-store product still uses it
 * (no cascade delete, no silent detach).
 * @param {number} brandId
 * @returns {Promise<{ deleted: boolean }>}
 */
export function deleteBrand(brandId) {
  if (isApiMode()) {
    return brandApi.deleteBrand(brandId)
  }
  const brand = visibleBrands().find((item) => item.id === Number(brandId))
  if (!brand) {
    return Promise.reject(new Error('Brand tidak ditemukan.'))
  }
  const used = countBrandProducts(brand)
  if (used > 0) {
    return Promise.reject(
      new Error(`Brand tidak dapat dihapus karena masih digunakan oleh ${used} produk.`),
    )
  }
  const index = brands.findIndex((item) => item.id === brand.id)
  if (index !== -1) {
    brands.splice(index, 1)
  }
  return withLatency({ deleted: true })
}

/**
 * Ensure a brand with the given name exists for the current store. Used when a
 * seller types a new brand from Add/Edit Product: an existing brand is reused
 * (case-insensitive), otherwise it is created through the same brand service.
 * Returns null for an empty name.
 * @param {string} name
 * @returns {Promise<import('../data/models.js').Brand | null>}
 */
export function ensureBrand(name) {
  const trimmed = (name ?? '').trim()
  if (!trimmed) {
    return withLatency(null)
  }
  if (isApiMode()) {
    return brandApi.listBrands().then((list) => {
      const existing = list.find(
        (brand) => brand.name.trim().toLowerCase() === trimmed.toLowerCase(),
      )
      return existing ?? brandApi.createBrand({ name: trimmed })
    })
  }
  const existing = visibleBrands().find(
    (brand) => brand.name.trim().toLowerCase() === trimmed.toLowerCase(),
  )
  if (existing) {
    return withLatency(existing)
  }
  return createBrand({ name: trimmed })
}
