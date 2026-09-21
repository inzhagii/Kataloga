/**
 * Product API adapter.
 *
 * Implements the PROPOSED product contract (docs/API-CONTRACT.md). Only used
 * when VITE_DATA_SOURCE=api. Seller endpoints are store-scoped by the backend
 * session. The lifecycle rules are enforced server-side:
 * DRAFT -> PUBLISHED -> ARCHIVED, ARCHIVED -> DRAFT (never ARCHIVED -> PUBLISHED).
 */

import { request } from '../../apiClient'
import { toProduct, toList } from './mappers'

const toProductList = toList(toProduct)

/**
 * Map a partial frontend Product to the proposed product DTO.
 * @param {Partial<import('../../../data/models.js').Product>} product
 * @returns {object}
 */
function productToDto(product) {
  const dto = {}
  const fields = {
    storeId: 'store_id',
    name: 'name',
    images: 'images',
    mainImage: 'main_image',
    category: 'category',
    brand: 'brand',
    condition: 'condition',
    price: 'price',
    priceValue: 'price_value',
    details: 'details',
    description: 'description',
    externalLinks: 'external_links',
    status: 'status',
    featured: 'featured',
    soldOutAt: 'sold_out_at',
  }
  Object.entries(fields).forEach(([frontKey, apiKey]) => {
    if (product[frontKey] !== undefined) {
      dto[apiKey] = product[frontKey]
    }
  })
  return dto
}

/**
 * @param {string} storeId
 * @returns {Promise<import('../../../data/models.js').Product[]>}
 */
export function listPublicProducts(storeId) {
  return request({
    path: `/stores/${encodeURIComponent(storeId)}/products`,
  }).then(toProductList)
}

/**
 * @param {string} storeId
 * @param {number} productId
 * @returns {Promise<import('../../../data/models.js').Product | undefined>}
 */
export function getProduct(storeId, productId) {
  return request({
    path: `/stores/${encodeURIComponent(storeId)}/products/${productId}`,
    notFoundAsNull: true,
  }).then((dto) => (dto ? toProduct(dto) : undefined))
}

/**
 * @param {number} productId
 * @returns {Promise<import('../../../data/models.js').Product | undefined>}
 */
export function getSellerProduct(productId) {
  return request({
    path: `/products/${productId}`,
    notFoundAsNull: true,
  }).then((dto) => (dto ? toProduct(dto) : undefined))
}

/**
 * @returns {Promise<import('../../../data/models.js').Product[]>}
 */
export function listSellerProducts() {
  return request({ path: '/products', query: { status: 'active' } }).then(toProductList)
}

/**
 * @returns {Promise<import('../../../data/models.js').Product[]>}
 */
export function listArchivedProducts() {
  return request({ path: '/products', query: { status: 'archived' } }).then(toProductList)
}

/**
 * @param {import('../../../data/models.js').Product} payload
 * @returns {Promise<import('../../../data/models.js').Product>}
 */
export function createProduct(payload) {
  return request({
    method: 'POST',
    path: '/products',
    body: productToDto(payload),
  }).then(toProduct)
}

/**
 * @param {number} productId
 * @param {Partial<import('../../../data/models.js').Product>} payload
 * @returns {Promise<import('../../../data/models.js').Product>}
 */
export function updateProduct(productId, payload) {
  return request({
    method: 'PATCH',
    path: `/products/${productId}`,
    body: productToDto(payload),
  }).then(toProduct)
}

/**
 * @param {number} productId
 * @returns {Promise<import('../../../data/models.js').Product>}
 */
export function publishProduct(productId) {
  return request({ method: 'POST', path: `/products/${productId}/publish` }).then(toProduct)
}

/**
 * @param {number} productId
 * @returns {Promise<import('../../../data/models.js').Product>}
 */
export function toggleFeatured(productId) {
  return request({ method: 'PATCH', path: `/products/${productId}/featured` }).then(toProduct)
}

/**
 * @param {number} productId
 * @returns {Promise<import('../../../data/models.js').Product>}
 */
export function archiveProduct(productId) {
  return request({ method: 'POST', path: `/products/${productId}/archive` }).then(toProduct)
}

/**
 * @param {number} productId
 * @returns {Promise<import('../../../data/models.js').Product>}
 */
export function restoreProduct(productId) {
  return request({ method: 'POST', path: `/products/${productId}/restore` }).then(toProduct)
}

/**
 * Mark a PUBLISHED product as SOLD_OUT. The transport for SOLD_OUT ↔ PUBLISHED
 * still needs backend confirmation (docs/API-CONTRACT.md): for now this rides
 * on the existing PATCH endpoint with a status change.
 * @param {number} productId
 * @returns {Promise<import('../../../data/models.js').Product>}
 */
export function markSoldOut(productId) {
  return request({
    method: 'PATCH',
    path: `/products/${productId}`,
    body: { status: 'SOLD_OUT' },
  }).then(toProduct)
}

/**
 * Bring a SOLD_OUT product back to PUBLISHED. Same transport note as above.
 * @param {number} productId
 * @returns {Promise<import('../../../data/models.js').Product>}
 */
export function reactivateProduct(productId) {
  return request({
    method: 'PATCH',
    path: `/products/${productId}`,
    body: { status: 'PUBLISHED' },
  }).then(toProduct)
}