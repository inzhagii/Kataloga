/**
 * Build a single lowercase searchable text blob for a product.
 * Covers name, brand, category, product details (attributes) and description.
 * @param {import('../data/models.js').Product} product
 * @returns {string}
 */
function productSearchText(product) {
  const details = (product.details ?? [])
    .map((item) => `${item.label ?? ''} ${item.value ?? ''}`)
    .join(' ')
  return [product.name, product.brand, product.category, details, product.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/**
 * Score a product against a query. Returns 0 when there is no match.
 * Exact/close/partial matches on the name rank highest, then other fields.
 * @param {import('../data/models.js').Product} product
 * @param {string} query
 * @returns {number}
 */
export function scoreProduct(product, query) {
  const q = query.trim().toLowerCase()
  if (!q) {
    return 1
  }
  const name = (product.name ?? '').toLowerCase()
  const haystack = productSearchText(product)

  let score = 0

  if (name === q) score = Math.max(score, 100)
  else if (name.startsWith(q)) score = Math.max(score, 90)
  else if (name.includes(q)) score = Math.max(score, 70)

  if ((product.brand ?? '').toLowerCase().includes(q)) score = Math.max(score, 50)
  if ((product.category ?? '').toLowerCase().includes(q)) score = Math.max(score, 40)

  const detailsText = (product.details ?? [])
    .map((item) => `${item.label ?? ''} ${item.value ?? ''}`)
    .join(' ')
    .toLowerCase()
  if (detailsText.includes(q)) score = Math.max(score, 30)

  if ((product.description ?? '').toLowerCase().includes(q)) score = Math.max(score, 20)

  if (score > 0) {
    return score
  }

  return haystack.includes(q) ? 10 : 0
}

/**
 * Compare two scored entries by the active sort option.
 * When sorting by relevance but no query is active, fall back to newest.
 * @param {'relevance'|'newest'|'price-asc'|'price-desc'} sortBy
 * @param {string} query
 */
function sortComparator(sortBy, query) {
  switch (sortBy) {
    case 'newest':
      return (a, b) => new Date(b.product.createdAt) - new Date(a.product.createdAt)
    case 'price-asc':
      return (a, b) => (a.product.priceValue ?? 0) - (b.product.priceValue ?? 0)
    case 'price-desc':
      return (a, b) => (b.product.priceValue ?? 0) - (a.product.priceValue ?? 0)
    case 'relevance':
    default:
      if (query.trim()) {
        return (a, b) => b.score - a.score
      }
      return (a, b) => new Date(b.product.createdAt) - new Date(a.product.createdAt)
  }
}

/**
 * Pipeline: score → search query filter → category/condition filter → sort.
 * `categoryList` (when given) wins over the single `category` string and lets
 * a Kategori Utama selection include all of its Sub Kategori names.
 * @param {import('../data/models.js').Product[]} products
 * @param {{
 *   query?: string,
 *   category?: string,
 *   categoryList?: string[]|null,
 *   condition?: 'ALL'|'NEW'|'SECOND',
 *   sort?: string,
 * }} options
 * @returns {import('../data/models.js').Product[]}
 */
export function filterAndSortProducts(
  products,
  { query = '', category = 'all', categoryList = null, condition = 'all', sort = 'relevance' },
) {
  const scored = products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((entry) => entry.score > 0)

  const allowedCategories =
    category && category !== 'all' ? categoryList ?? [category] : null

  const categoryFiltered = allowedCategories
    ? scored.filter((entry) => allowedCategories.includes(entry.product.category))
    : scored

  const conditionFiltered =
    condition && condition !== 'all'
      ? categoryFiltered.filter((entry) => entry.product.condition === condition)
      : categoryFiltered

  const comparator = sortComparator(sort, query)

  return conditionFiltered.sort(comparator).map((entry) => entry.product)
}

/**
 * Distinct category names present in the store's published catalog,
 * preserving first-seen order.
 * @param {import('../data/models.js').Product[]} products
 * @returns {string[]}
 */
export function extractCategories(products) {
  const seen = new Set()
  const result = []
  for (const product of products) {
    const name = product.category
    if (name && !seen.has(name)) {
      seen.add(name)
      result.push(name)
    }
  }
  return result
}

/**
 * Build the two-level category tree used by the public catalog filter from the
 * store's category data (Kategori Utama -> Sub Kategori) and the categories
 * actually present in the published catalog. Only roots whose subtree contains
 * at least one catalog category are included; a product category that has no
 * category record is treated as a standalone root so it stays filterable.
 * @param {import('../data/models.js').Product[]} products
 * @param {import('../data/models.js').Category[]} storeCategories
 * @returns {{ roots: string[], childrenByRoot: Record<string, string[]> }}
 */
export function buildCatalogCategoryTree(products, storeCategories) {
  const leafNames = extractCategories(products)
  const childrenByRoot = {}
  const rootNameById = new Map()
  const rootByChild = new Map()

  for (const category of storeCategories) {
    if (category.parentId === null) {
      rootNameById.set(category.id, category.name)
      childrenByRoot[category.name] = []
    }
  }
  for (const category of storeCategories) {
    if (category.parentId !== null) {
      const rootName = rootNameById.get(category.parentId)
      if (rootName) {
        rootByChild.set(category.name, rootName)
        childrenByRoot[rootName].push(category.name)
      }
    }
  }

  const relevantRoots = new Set()
  for (const leaf of leafNames) {
    if (rootByChild.has(leaf)) {
      relevantRoots.add(rootByChild.get(leaf))
    } else {
      relevantRoots.add(leaf)
      childrenByRoot[leaf] = childrenByRoot[leaf] ?? []
    }
  }

  const roots = [...relevantRoots]
  const prunedChildrenByRoot = {}
  roots.forEach((root) => {
    prunedChildrenByRoot[root] = childrenByRoot[root] ?? []
  })

  return { roots, childrenByRoot: prunedChildrenByRoot }
}