import { slugify } from './slugify'

/**
 * Build a storefront path for a store.
 * @param {string} storeId
 * @returns {string}
 */
export function buildStoreUrl(storeId) {
  const value = String(storeId ?? '').trim()
  return value ? `/${value}` : '/'
}

/**
 * Build a storefront product-listing path.
 * @param {string} storeId
 * @returns {string}
 */
export function buildStoreListingUrl(storeId) {
  const storePath = buildStoreUrl(storeId)
  return storePath === '/' ? '/products' : `${storePath}/products`
}

/**
 * Build a canonical storefront product-detail path.
 * Slug is sanitised with slugify; when the slug is empty the helper
 * falls back to `product-{productId}` so the URL always contains four
 * segments (required by the route `/:storeId/product/:productId/:slug`).
 *
 * @param {string}  storeId
 * @param {string|number} productId
 * @param {string}  [slug]
 * @returns {string}
 */
export function buildStoreProductUrl(storeId, productId, slug) {
  const storePath = buildStoreUrl(storeId)
  const id = encodeURIComponent(String(productId ?? '').trim())
  const slugPart = slugify(slug) || `product-${id}`
  return `${storePath}/product/${id}/${slugPart}`
}

/**
 * Derive the canonical slug for a product object.
 * Prefers an API-provided `slug` when present; otherwise generates a
 * fallback from the product name via `slugify`. Empty products produce
 * `product-{id}`.
 *
 * @param {import('../data/models.js').Product} product
 * @returns {string}
 */
export function resolveProductSlug(product) {
  const entity = product ?? {}
  const provided =
    typeof entity.slug === 'string' ? entity.slug.trim() : ''
  if (provided) {
    return provided
  }
  const generated = slugify(entity.name)
  return generated || `product-${String(entity.id ?? '').trim() || '0'}`
}
