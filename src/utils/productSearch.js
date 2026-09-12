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
 * @param {import('../data/models.js').Product[]} products
 * @param {{
 *   query?: string,
 *   category?: string,
 *   condition?: 'ALL'|'NEW'|'SECOND',
 *   sort?: string,
 * }} options
 * @returns {import('../data/models.js').Product[]}
 */
export function filterAndSortProducts(products, { query = '', category = 'all', condition = 'all', sort = 'relevance' }) {
  const scored = products
    .map((product) => ({ product, score: scoreProduct(product, query) }))
    .filter((entry) => entry.score > 0)

  const categoryFiltered =
    category && category !== 'all' ? scored.filter((entry) => entry.product.category === category) : scored

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