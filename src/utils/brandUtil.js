/**
 * Brand helpers for the seller Brand Management area.
 *
 * Brands are store-scoped and join to products by NAME through
 * `product.brand`, mirroring how categories join products by name. These
 * helpers derive the product usage count and the duplicate-name check used
 * when creating/editing a brand.
 *
 * @import { import('../data/models.js').Brand } from '../data/models.js'
 * @import { import('../data/models.js').Product } from '../data/models.js'
 */

/**
 * Count products per brand name. Products without a brand are ignored.
 * @param {import('../data/models.js').Product[]} products
 * @returns {Record<string, number>}
 */
export function countProductsByBrand(products) {
  const counts = {}
  products.forEach((product) => {
    if (!product.brand) {
      return
    }
    counts[product.brand] = (counts[product.brand] ?? 0) + 1
  })
  return counts
}

/**
 * True when another brand in the same store already uses the name
 * (case-insensitive, trimmed). Used to prevent duplicate names scoped to a
 * store.
 * @param {import('../data/models.js').Brand[]} brands
 * @param {string} name - Trimmed brand name.
 * @param {number} [excludeId] - Brand id to ignore while editing.
 * @returns {boolean}
 */
export function hasDuplicateBrandName(brands, name, excludeId) {
  const target = name.trim().toLowerCase()
  return brands.some(
    (brand) => brand.id !== excludeId && brand.name.trim().toLowerCase() === target,
  )
}
