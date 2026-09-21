/**
 * Pure helpers for filtering the Customer Interest list.
 *
 * Kept side-effect free and fully unit-testable. All filters compose:
 * Aktivitas, Channel, single date (DD.MM.YYYY), Kategori (Utama includes its
 * Sub Kategori), Brand and Produk behave AND-wise against search.
 */

import { INTEREST_TYPE } from '../constants/enums'
import { isSameCalendarDate, toDMY } from './datetime'

export const FILTER_ALL = 'all'

/**
 * Lower-cased search corpus for an interest record: customer name, email,
 * phone, product name and channel snapshot (M5: identity/product data).
 * @param {import('../data/models.js').CustomerInterest} interest
 * @returns {string}
 */
export function interestSearchText(interest) {
  return ['customerName', 'customerEmail', 'customerPhone', 'productName', 'channel']
    .map((key) => interest[key])
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/**
 * True when the interest matches a case-insensitive, partial-match query.
 * An empty/whitespace query matches everything.
 * @param {import('../data/models.js').CustomerInterest} interest
 * @param {string} query
 * @returns {boolean}
 */
export function matchesQuery(interest, query) {
  const normalized = String(query || '').trim().toLowerCase()
  if (!normalized) {
    return true
  }
  return interestSearchText(interest).includes(normalized)
}

/**
 * Resolve the set of category names covered by a selected category option.
 *
 * Returns null when no category filter applies. A "Kategori Utama" covers
 * itself plus the Sub Kategori that actually carry interested products;
 * a Sub Kategori covers only itself. Matching uses the product's snapshot
 * category on the interest-carrying product (products own one category).
 *
 * @param {string} value
 * @param {import('../data/models.js').Category[]} categories
 * @param {string[]} productCategories - categories present on interested products.
 * @returns {Set<string>|null}
 */
export function categoryAllowedNames(value, categories = [], productCategories = []) {
  if (!value || value === FILTER_ALL) {
    return null
  }
  const allowed = new Set([String(value)])
  const parent = categories.find((category) => String(category.name) === String(value))
  if (parent) {
    for (const child of categories) {
      if (
        String(child.parentId ?? '') === String(parent.id) &&
        productCategories.includes(String(child.name))
      ) {
        allowed.add(String(child.name))
      }
    }
  }
  return allowed
}

/**
 * True when the interest's product belongs to one of `allowedCategories`.
 * Interests without a resolvable product never match an active category filter.
 * @param {import('../data/models.js').CustomerInterest} interest
 * @param {Map<number, object>} productById
 * @param {Set<string>|null} allowedCategories
 * @returns {boolean}
 */
function matchesCategory(interest, productById, allowedCategories) {
  if (!allowedCategories) {
    return true
  }
  const product = interest.productId != null ? productById.get(interest.productId) : undefined
  return product != null && allowedCategories.has(String(product.category))
}

/**
 * Filter the Customer Interest list by every active filter. All filters
 * compose AND-wise; missing/invalid date input is ignored (no empty result
 * from a typo). `productById`/`categories`/`productCategories` only have to be
 * provided when the category/brand/product filters are used.
 * @param {import('../data/models.js').CustomerInterest[]} interests
 * @param {{
 *   query?: string,
 *   activity?: string,
 *   channel?: string,
 *   date?: string,
 *   category?: string,
 *   brand?: string,
 *   productId?: number|null,
 *   productById?: Map<number, object>,
 *   categories?: import('../data/models.js').Category[],
 *   productCategories?: string[],
 * }} [options]
 * @returns {import('../data/models.js').CustomerInterest[]}
 */
export function filterCustomerInterests(interests, options = {}) {
  const {
    query = '',
    activity = FILTER_ALL,
    channel = FILTER_ALL,
    date = '',
    category = FILTER_ALL,
    brand = FILTER_ALL,
    productId = null,
    productById = new Map(),
    categories = [],
    productCategories = [],
  } = options

  const hasDate = toDMY(date) !== null
  const allowedCategories = categoryAllowedNames(category, categories, productCategories)

  return interests.filter((interest) => {
    if (activity !== FILTER_ALL && interest.channelType !== activity) {
      return false
    }
    if (channel !== FILTER_ALL && String(interest.channel || '').trim() !== channel) {
      return false
    }
    if (hasDate && !isSameCalendarDate(interest.date, date)) {
      return false
    }
    const product = interest.productId != null ? productById.get(interest.productId) : undefined
    if (!matchesCategory(interest, productById, allowedCategories)) {
      return false
    }
    if (brand !== FILTER_ALL) {
      if (!product || String(product.brand || '') !== brand) {
        return false
      }
    }
    if (productId != null && interest.productId !== productId) {
      return false
    }
    return matchesQuery(interest, query)
  })
}

/**
 * Map a product's category name to the selectable Kategori option: the root
 * of its two-level tree when the record is a Sub Kategori, otherwise the leaf
 * itself. Roots that wrap subcategories are offered once so their selection
 * covers every descendant (docs/PRODUCT.md §14).
 * @param {string} name
 * @param {import('../data/models.js').Category[]} categories
 * @returns {string}
 */
function resolveCategoryOption(name, categories) {
  if (!name) {
    return ''
  }
  const record = categories.find((category) => String(category.name) === String(name))
  if (!record || record.parentId == null) {
    return String(name)
  }
  const parent = categories.find((category) => category.id === record.parentId)
  return parent ? String(parent.name) : String(name)
}

/**
 * Derive the filter select options from the interests currently listed:
 * the Kategori options (roots covering their Sub Kategori), the brands and
 * products touched by those interests. Values mirror the canonical category
 * names so the filter can match both roots and leaves.
 * @param {{
 *   interests: import('../data/models.js').CustomerInterest[],
 *   productById: Map<number, object>,
 *   categories?: import('../data/models.js').Category[],
 * }} params
 * @returns {{
 *   categories: string[],
 *   categoryOptions: string[],
 *   brands: string[],
 *   products: object[],
 * }}
 */
export function buildFilterOptions({ interests = [], productById = new Map(), categories = [] }) {
  const productCategoryNames = []
  const brands = []
  const products = []
  const seenCategory = new Set()
  const seenBrand = new Set()
  const seenProduct = new Set()

  for (const interest of interests) {
    const product = interest.productId != null ? productById.get(interest.productId) : undefined
    if (!product) {
      continue
    }
    if (product.category && !seenCategory.has(String(product.category))) {
      seenCategory.add(String(product.category))
      productCategoryNames.push(String(product.category))
    }
    if (product.brand && !seenBrand.has(String(product.brand))) {
      seenBrand.add(String(product.brand))
      brands.push(String(product.brand))
    }
    if (product.id != null && !seenProduct.has(product.id)) {
      seenProduct.add(product.id)
      products.push({ id: product.id, name: product.name })
    }
  }

  const categoryOptions = []
  const seenOption = new Set()
  for (const name of productCategoryNames) {
    const option = resolveCategoryOption(name, categories)
    if (!option || seenOption.has(option)) {
      continue
    }
    seenOption.add(option)
    categoryOptions.push(option)
  }

  return {
    categories: productCategoryNames,
    categoryOptions,
    brands,
    products,
  }
}

export { INTEREST_TYPE }