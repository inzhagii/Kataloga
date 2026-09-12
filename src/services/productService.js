/**
 * Product service.
 * Returns mock data now; will call the Product API later.
 *
 * Mutations persist into the in-memory mock array so that cross-page flows
 * (add -> list, edit -> list, archive -> archived) stay consistent during a
 * session. Once the backend is available these helpers are replaced by real
 * API calls without changing the caller contract.
 */

import { products } from '../data/mock'
import { PRODUCT_STATUS } from '../constants/enums'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as productApi from './adapters/api/productApi'
import { getCurrentStoreId } from './storeService'

const ARCHIVED_PUBLISH_MESSAGE =
  'Product yang diarsipkan tidak dapat dipublikasikan langsung. Pulihkan (Restore) terlebih dahulu, lalu publikasikan.'

const SOLD_OUT_FROM_GUARD_MESSAGE =
  'Product yang berstatus DRAFT atau ARCHIVED tidak dapat ditandai Sold Out. Hanya product PUBLISHED yang dapat menjadi Sold Out.'

/**
 * Find a product by public numeric ID within the current seller's store.
 * @param {number} productId
 * @returns {import('../data/models.js').Product | undefined}
 */
function findProduct(productId) {
  return products.find(
    (item) => item.id === Number(productId) && item.storeId === getCurrentStoreId(),
  )
}

/**
 * Compute the next product id.
 * @returns {number}
 */
function nextProductId() {
  return products.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

/**
 * List public products for a store (PUBLISHED only).
 * @param {string} storeId
 * @returns {Promise<import('../data/models.js').Product[]>}
 */
export function listPublicProducts(storeId) {
  if (isApiMode()) {
    return productApi.listPublicProducts(storeId)
  }
  const result = products.filter(
    (product) => product.storeId === storeId && product.status === PRODUCT_STATUS.PUBLISHED,
  )
  return withLatency(result)
}

/**
 * Get a product scoped to a store by public product ID.
 * Requires the store context: a product must belong to the store.
 * @param {string} storeId
 * @param {number} productId
 * @returns {Promise<import('../data/models.js').Product | undefined>}
 */
export function getProduct(storeId, productId) {
  if (isApiMode()) {
    return productApi.getProduct(storeId, productId)
  }
  const product = products.find(
    (item) => item.id === Number(productId) && item.storeId === storeId,
  )
  return withLatency(product)
}

/**
 * Get a single seller product by ID (any status).
 * @param {number} productId
 * @returns {Promise<import('../data/models.js').Product | undefined>}
 */
export function getSellerProduct(productId) {
  if (isApiMode()) {
    return productApi.getSellerProduct(productId)
  }
  return withLatency(findProduct(productId))
}

/**
 * List all seller products (DRAFT + PUBLISHED = Active Products).
 * @returns {Promise<import('../data/models.js').Product[]>}
 */
export function listSellerProducts() {
  if (isApiMode()) {
    return productApi.listSellerProducts()
  }
  const result = products.filter(
    (product) =>
      product.storeId === getCurrentStoreId() && product.status !== PRODUCT_STATUS.ARCHIVED,
  )
  return withLatency(result)
}

/**
 * List archived products.
 * @returns {Promise<import('../data/models.js').Product[]>}
 */
export function listArchivedProducts() {
  if (isApiMode()) {
    return productApi.listArchivedProducts()
  }
  const result = products.filter(
    (product) => product.storeId === getCurrentStoreId() && product.status === PRODUCT_STATUS.ARCHIVED,
  )
  return withLatency(result)
}

/**
 * Create a product and persist it to the mock catalog.
 * @param {import('../data/models.js').Product} payload
 * @returns {Promise<import('../data/models.js').Product>}
 */
export function createProduct(payload) {
  if (isApiMode()) {
    return productApi.createProduct(payload)
  }
  const now = new Date().toISOString()
  const product = {
    id: nextProductId(),
    storeId: getCurrentStoreId(),
    name: payload.name ?? '',
    images: payload.images ?? [],
    mainImage: payload.images?.[0] ?? '',
    category: payload.category ?? '',
    brand: payload.brand ?? '',
    condition: payload.condition ?? 'NEW',
    price: payload.price ?? 'Rp 0',
    priceValue: payload.priceValue ?? 0,
    details: payload.details ?? [],
    description: payload.description ?? '',
    externalLinks: payload.externalLinks ?? [],
    status: payload.status ?? PRODUCT_STATUS.DRAFT,
    featured: Boolean(payload.featured),
    createdAt: now,
    updatedAt: now,
  }
  products.push(product)
  return withLatency(product)
}

/**
 * Update a product and persist the change to the mock catalog.
 * @param {number} productId
 * @param {Partial<import('../data/models.js').Product>} payload
 * @returns {Promise<import('../data/models.js').Product>}
 */
export function updateProduct(productId, payload) {
  if (isApiMode()) {
    return productApi.updateProduct(productId, payload)
  }
  const product = findProduct(productId)
  if (!product) {
    return Promise.reject(new Error('Product tidak ditemukan.'))
  }
  if (
    product.status === PRODUCT_STATUS.ARCHIVED &&
    payload.status !== undefined &&
    payload.status !== PRODUCT_STATUS.ARCHIVED
  ) {
    return Promise.reject(new Error(ARCHIVED_PUBLISH_MESSAGE))
  }
  if (
    payload.status === PRODUCT_STATUS.SOLD_OUT &&
    product.status !== PRODUCT_STATUS.PUBLISHED
  ) {
    return Promise.reject(new Error(SOLD_OUT_FROM_GUARD_MESSAGE))
  }
  Object.assign(product, {
    ...payload,
    id: product.id,
    storeId: product.storeId,
    createdAt: product.createdAt,
    updatedAt: new Date().toISOString(),
  })
  return withLatency(product)
}

/**
 * Publish a product (DRAFT -> PUBLISHED). Never publishes from ARCHIVED.
 * @param {number} productId
 * @returns {Promise<import('../data/models.js').Product>}
 */
export function publishProduct(productId) {
  if (isApiMode()) {
    return productApi.publishProduct(productId)
  }
  const product = findProduct(productId)
  if (!product) {
    return Promise.reject(new Error('Product tidak ditemukan.'))
  }
  if (product.status === PRODUCT_STATUS.ARCHIVED) {
    return Promise.reject(new Error(ARCHIVED_PUBLISH_MESSAGE))
  }
  product.status = PRODUCT_STATUS.PUBLISHED
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}

/**
 * Toggle the featured flag on an active product.
 * @param {number} productId
 * @returns {Promise<import('../data/models.js').Product>}
 */
export function toggleFeatured(productId) {
  if (isApiMode()) {
    return productApi.toggleFeatured(productId)
  }
  const product = findProduct(productId)
  if (!product) {
    return Promise.reject(new Error('Product tidak ditemukan.'))
  }
  product.featured = !product.featured
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}

/**
 * Archive a product.
 * Archive never publishes a product back; restore always returns to DRAFT.
 * @param {number} productId
 * @returns {Promise<import('../data/models.js').Product>}
 */
export function archiveProduct(productId) {
  if (isApiMode()) {
    return productApi.archiveProduct(productId)
  }
  const product = findProduct(productId)
  if (!product) {
    return Promise.reject(new Error('Product tidak ditemukan.'))
  }
  product.status = PRODUCT_STATUS.ARCHIVED
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}

/**
 * Restore an archived product. Always becomes DRAFT (not PUBLISHED).
 * @param {number} productId
 * @returns {Promise<import('../data/models.js').Product>}
 */
export function restoreProduct(productId) {
  if (isApiMode()) {
    return productApi.restoreProduct(productId)
  }
  const product = findProduct(productId)
  if (!product) {
    return Promise.reject(new Error('Product tidak ditemukan.'))
  }
  product.status = PRODUCT_STATUS.DRAFT
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}

/**
 * Mark a PUBLISHED product as SOLD_OUT (PUBLISHED -> SOLD_OUT).
 * DRAFT and ARCHIVED products are never marked Sold Out directly.
 * @param {number} productId
 * @returns {Promise<import('../data/models.js').Product>}
 */
export function markSoldOut(productId) {
  if (isApiMode()) {
    return productApi.markSoldOut(productId)
  }
  const product = findProduct(productId)
  if (!product) {
    return Promise.reject(new Error('Product tidak ditemukan.'))
  }
  if (product.status !== PRODUCT_STATUS.PUBLISHED) {
    return Promise.reject(new Error(SOLD_OUT_FROM_GUARD_MESSAGE))
  }
  product.status = PRODUCT_STATUS.SOLD_OUT
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}

/**
 * Bring a SOLD_OUT product back to PUBLISHED (SOLD_OUT -> PUBLISHED).
 * @param {number} productId
 * @returns {Promise<import('../data/models.js').Product>}
 */
export function reactivateProduct(productId) {
  if (isApiMode()) {
    return productApi.reactivateProduct(productId)
  }
  const product = findProduct(productId)
  if (!product) {
    return Promise.reject(new Error('Product tidak ditemukan.'))
  }
  if (product.status !== PRODUCT_STATUS.SOLD_OUT) {
    return Promise.reject(new Error('Product tidak berstatus Sold Out dan tidak dapat diaktifkan kembali.'))
  }
  product.status = PRODUCT_STATUS.PUBLISHED
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}