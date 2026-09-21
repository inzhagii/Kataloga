/**
 * Category tree helpers for the seller Categories page.
 * Builds the two-level hierarchy (parent + subcategory) and provides the
 * duplicate-name check used when creating/editing a custom category.
 *
 * @import { import('../data/models.js').Category } from '../data/models.js'
 */

/**
 * Build parent groups with their children for the category tree.
 * @param {import('../data/models.js').Category[]} categories
 * @returns {{
 *   parents: import('../data/models.js').Category[],
 *   childrenByParent: Record<number, import('../data/models.js').Category[]>,
 * }}
 */
export function buildCategoryTree(categories) {
  const parents = categories.filter((category) => category.parentId === null)
  const childrenByParent = {}
  parents.forEach((parent) => {
    childrenByParent[parent.id] = categories.filter(
      (category) => category.parentId === parent.id,
    )
  })
  return { parents, childrenByParent }
}

/**
 * Resolve the product-category names covered by a selected category.
 * Selecting a Kategori Utama includes its descendant Sub Kategori products;
 * selecting a Sub Kategori covers only itself. Unknown names fall back to an
 * exact match so an invalid URL id never fabricates a category.
 * @param {import('../data/models.js').Category[]} categories
 * @param {string} name - Selected category name.
 * @returns {string[]} Category names to include.
 */
export function resolveCategoryScope(categories, name) {
  if (!name) {
    return []
  }
  const selected = categories.find((category) => category.name === name)
  if (!selected) {
    return [name]
  }
  const children = categories
    .filter((category) => category.parentId === selected.id)
    .map((category) => category.name)
  return [selected.name, ...children]
}

/**
 * Ordered category options for the Products filter: each Kategori Utama
 * followed by its Sub Kategori (max two levels).
 * @param {import('../data/models.js').Category[]} categories
 * @returns {import('../data/models.js').Category[]}
 */
export function buildCategoryFilterOptions(categories) {
  const parents = categories.filter((category) => category.parentId === null)
  return parents.flatMap((parent) => [
    parent,
    ...categories.filter((category) => category.parentId === parent.id),
  ])
}

/**
 * Count products per category name.
 * @param {import('../data/models.js').Product[]} products
 * @returns {Record<string, number>}
 */
export function countProductsByCategory(products) {
  const counts = {}
  products.forEach((product) => {
    counts[product.category] = (counts[product.category] ?? 0) + 1
  })
  return counts
}

/**
 * True when another category at the same level already uses the name
 * (case-insensitive). Used to prevent duplicate names scoped to a store.
 * @param {import('../data/models.js').Category[]} categories
 * @param {string} name - Trimmed category name.
 * @param {number|null} levelParentId - null to compare against parent categories,
 *   or a parent id to compare against that parent's subcategories.
 * @param {number} [excludeId] - Category id to ignore while editing.
 * @returns {boolean}
 */
export function hasDuplicateCategoryName(categories, name, levelParentId, excludeId) {
  return categories.some(
    (category) =>
      category.id !== excludeId &&
      category.parentId === levelParentId &&
      category.name.toLowerCase() === name.toLowerCase(),
  )
}