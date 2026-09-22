/**
 * Product service.
 * Returns mock data now; will call the Product API later.
 *
 * Mutations persist into the in-memory mock array so that cross-page flows
 * (add -> list, edit -> list, archive -> archived) stay consistent during a
 * session. Once the backend is available these helpers are replaced by real
 * API calls without changing the caller contract.
 */

import { products, stores } from '../data/mock'
import { PRODUCT_STATUS } from '../constants/enums'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as productApi from './adapters/api/productApi'
import { getCurrentStoreId } from './storeService'

const DAY_MS = 24 * 60 * 60 * 1000

const ARCHIVED_PUBLISH_MESSAGE =
  'Product yang diarsipkan tidak dapat dipublikasikan langsung. Pulihkan (Restore) terlebih dahulu, lalu publikasikan.'

const SOLD_OUT_FROM_GUARD_MESSAGE =
  'Product yang berstatus DRAFT atau ARCHIVED tidak dapat ditandai Sold Out. Hanya product PUBLISHED yang dapat menjadi Sold Out.'

const STATUS_CHANGE_GUARD_MESSAGE =
  'Status produk tidak dapat diubah melalui form. Gunakan aksi product (Publish, Sold Out, Archive, Restore, Aktifkan Kembali).'

const ARCHIVED_FEATURED_MESSAGE =
  'Product yang diarsipkan tidak dapat menjadi Featured. Restore ke draft terlebih dahulu.'

const FEATURE_PUBLISHED_ONLY_MESSAGE =
  'Product Unggulan hanya dapat diaktifkan pada product yang berstatus PUBLISHED.'

const FEATURED_LIMIT_MESSAGE =
  'Maksimal 10 Product Unggulan per toko. Hapus salah satu Featured terlebih dahulu.'

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
 * The default CTA option for a new product: the store's BUY option (default
 * "Beli"), falling back to a minimal BUY option when the store has no CTA
 * options yet. Products always carry exactly one selected CTA option
 * (docs/PRODUCT.md §23); they never create CTA definitions themselves.
 * @param {string} storeId
 * @returns {import('../data/models.js').ProductCTA}
 */
function defaultCtaOption(storeId) {
  const store = stores.find((item) => item.storeId === storeId)
  const buy = (store?.ctaOptions ?? []).find((option) => option.type === 'BUY')
  return buy ?? { type: 'BUY', label: 'Beli' }
}

/**
 * Compute the next product id.
 * @returns {number}
 */
function nextProductId() {
  return products.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

/**
 * Featured guard: only PUBLISHED products may be Product Unggulan. DRAFT,
 * SOLD_OUT and ARCHIVED are never featured, and a store is capped at 10
 * Product Unggulan among its PUBLISHED products. Returns the conflict
 * message, or null when the target state is allowed. Pass `productId ===
 * null` for creation.
 * @param {string} storeId
 * @param {number | null} productId
 * @param {boolean} nextFeatured
 * @returns {string | null}
 */
function featuredGuardMessage(storeId, productId, nextFeatured) {
  if (!nextFeatured) {
    return null
  }
  const product = productId == null ? null : findProduct(productId)
  if (product) {
    if (product.status === PRODUCT_STATUS.ARCHIVED) {
      return ARCHIVED_FEATURED_MESSAGE
    }
    if (product.status !== PRODUCT_STATUS.PUBLISHED) {
      return FEATURE_PUBLISHED_ONLY_MESSAGE
    }
    if (product.featured) {
      return null
    }
  }
  const featuredCount = products.filter(
    (item) =>
      item.storeId === storeId &&
      item.id !== productId &&
      item.status === PRODUCT_STATUS.PUBLISHED &&
      item.featured,
  ).length
  return featuredCount >= 10 ? FEATURED_LIMIT_MESSAGE : null
}

/**
 * Whether a SOLD_OUT product is still inside its store's Auto Archive window.
 * `null` on the store disables Auto Archive ("Never"), so any SOLD_OUT stays
 * public-visible. Without a `soldOutAt` timestamp the duration is unknown and
 * the product is kept visible (conservative). This is a lazy mock simulation:
 * the real backend owns the scheduled SOLD_OUT -> ARCHIVED transition.
 * @param {import('../data/models.js').Product} product
 * @returns {boolean}
 */
function isSoldOutWithinWindow(product) {
  if (product.status !== PRODUCT_STATUS.SOLD_OUT) {
    return false
  }
  const store = stores.find((item) => item.storeId === product.storeId)
  const autoArchiveDays = store?.autoArchiveDays ?? null
  if (autoArchiveDays === null) {
    return true
  }
  if (!product.soldOutAt) {
    return true
  }
  const elapsed = Date.now() - new Date(product.soldOutAt).getTime()
  return elapsed < autoArchiveDays * DAY_MS
}

/**
 * Public catalog visibility: PUBLISHED, plus SOLD_OUT still within the store
 * Auto Archive window. DRAFT, ARCHIVED and expired SOLD_OUT are never public.
 * @param {import('../data/models.js').Product} product
 * @returns {boolean}
 */
function isPubliclyVisible(product) {
  return product.status === PRODUCT_STATUS.PUBLISHED || isSoldOutWithinWindow(product)
}

/**
 * Locked public catalog order (docs/UI_RULES.md):
 * Featured Published -> newer Published -> older Published -> Sold Out.
 * Within a group newest first.
 * @param {import('../data/models.js').Product} a
 * @param {import('../data/models.js').Product} b
 * @returns {number}
 */
function publicCatalogOrder(a, b) {
  const rank = (product) =>
    product.status === PRODUCT_STATUS.SOLD_OUT ? 2 : product.featured ? 0 : 1
  const rankDiff = rank(a) - rank(b)
  if (rankDiff !== 0) {
    return rankDiff
  }
  return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()
}

/**
 * List public products for a store: PUBLISHED plus SOLD_OUT still within the
 * store-level Auto Archive window, ordered Featured Published -> newer
 * Published -> older Published -> Sold Out. ARCHIVED, DRAFT and expired
 * SOLD_OUT are excluded.
 * @param {string} storeId
 * @returns {Promise<import('../data/models.js').Product[]>}
 */
export function listPublicProducts(storeId) {
  if (isApiMode()) {
    return productApi.listPublicProducts(storeId)
  }
  const result = products
    .filter((product) => product.storeId === storeId && isPubliclyVisible(product))
    .sort(publicCatalogOrder)
  return withLatency(result)
}

/**
 * Get a public product scoped to a store by public product ID.
 * Only returns products the storefront may expose: PUBLISHED or SOLD_OUT still
 * within the Auto Archive window. DRAFT, ARCHIVED and expired SOLD_OUT resolve
 * to undefined. Requires the store context: a product must belong to the store.
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
  return withLatency(product && isPubliclyVisible(product) ? product : undefined)
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
  const initialStatus = payload.status ?? PRODUCT_STATUS.DRAFT
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
    cta: payload.cta ?? defaultCtaOption(getCurrentStoreId()),
    status: initialStatus,
    featured: Boolean(payload.featured) && initialStatus === PRODUCT_STATUS.PUBLISHED,
    createdAt: now,
    updatedAt: now,
  }
  const conflict = featuredGuardMessage(product.storeId, null, product.featured)
  if (conflict) {
    return Promise.reject(new Error(conflict))
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
    payload.status !== product.status &&
    product.status !== PRODUCT_STATUS.PUBLISHED
  ) {
    return Promise.reject(new Error(SOLD_OUT_FROM_GUARD_MESSAGE))
  }
  if (payload.status !== undefined && payload.status !== product.status) {
    return Promise.reject(new Error(STATUS_CHANGE_GUARD_MESSAGE))
  }
  const requestedFeatured =
    payload.featured !== undefined ? Boolean(payload.featured) : product.featured
  const nextFeatured =
    payload.featured !== undefined && product.status === PRODUCT_STATUS.PUBLISHED
      ? requestedFeatured
      : product.featured
  if (payload.featured !== undefined && nextFeatured !== product.featured) {
    const conflict = featuredGuardMessage(product.storeId, productId, nextFeatured)
    if (conflict) {
      return Promise.reject(new Error(conflict))
    }
  }
  Object.assign(product, {
    ...payload,
    id: product.id,
    storeId: product.storeId,
    createdAt: product.createdAt,
    featured: nextFeatured,
    updatedAt: new Date().toISOString(),
  })
  // A product always carries exactly one selected CTA option; an edit that
  // omits/nulls it falls back to the store's default BUY option instead of
  // removing the selection.
  product.cta = payload.cta ?? defaultCtaOption(product.storeId)
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
 * Toggle the featured flag on a product. Enforces the max-10 Product Unggulan
 * limit per store among PUBLISHED products (backend remains the final
 * authority) and only ever promotes a PUBLISHED product: DRAFT, SOLD_OUT and
 * ARCHIVED are never Product Unggulan.
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
  const conflict = featuredGuardMessage(product.storeId, productId, !product.featured)
  if (conflict) {
    return Promise.reject(new Error(conflict))
  }
  product.featured = !product.featured
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}

/**
 * Archive a product. Always returns to a non-published state and clears the
 * Featured status (Product ARCHIVED is never Product Unggulan). Archive never
 * publishes a product back; restore always returns to DRAFT.
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
  product.featured = false
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
  product.soldOutAt = undefined
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}

/**
 * Mark a PUBLISHED product as SOLD_OUT (PUBLISHED -> SOLD_OUT).
 * DRAFT and ARCHIVED products are never marked Sold Out directly. Records the
 * SOLD_OUT timestamp used by the mock Auto Archive simulation. The Featured
 * status is kept: a PUBLISHED Product Unggulan stays featured while SOLD_OUT
 * (docs/PRODUCT.md). Archiving later clears it.
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
  product.soldOutAt = new Date().toISOString()
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}

/**
 * Bring a SOLD_OUT product back to PUBLISHED (SOLD_OUT -> PUBLISHED).
 * Never SOLD_OUT -> DRAFT. Clears the SOLD_OUT timestamp so the Auto Archive
 * window is reset.
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
  product.soldOutAt = undefined
  product.updatedAt = new Date().toISOString()
  return withLatency(product)
}