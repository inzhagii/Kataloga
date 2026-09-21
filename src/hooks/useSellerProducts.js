import { useEffect, useMemo, useState } from 'react'
import { listSellerProducts, listArchivedProducts } from '../services/productService'
import { PRODUCT_STATUS } from '../constants/enums'
import { resolveCategoryScope } from '../utils/categoryTree'

/**
 * Relevance rank for a search query, lower is better.
 * @param {import('../data/models.js').Product} product
 * @param {string} query
 * @returns {number}
 */
function relevanceScore(product, query) {
  const name = product.name.toLowerCase()
  const brand = (product.brand || '').toLowerCase()
  const category = product.category.toLowerCase()
  const detailText = (product.details || [])
    .map((detail) => `${detail.label} ${detail.value}`)
    .join(' ')
    .toLowerCase()
  const description = (product.description || '').toLowerCase()

  if (name.includes(query)) {
    return name.startsWith(query) ? 0 : 1
  }
  if (brand.includes(query)) {
    return 2
  }
  if (category.includes(query)) {
    return 3
  }
  if (detailText.includes(query)) {
    return 4
  }
  if (description.includes(query)) {
    return 5
  }
  return Number.POSITIVE_INFINITY
}

/**
 * Filter the seller product list. UI state only, stays on the
 * same route (search / filter are not separate routes, and there is
 * no Sort on the seller Products page).
 * With `{ archived: true }` it loads the archived list instead and skips the
 * Active/Draft tab and status filter (archived products have their own route).
 *
 * `initialCategory` seeds the active category filter (category NAME, the join
 * key used by `product.category`), so callers can drive it from the URL query
 * (?category=...) as the source of truth.
 *
 * `initialBrand` seeds the active brand filter (brand NAME, the join key used
 * by `product.brand`), so callers can drive it from the URL query (?brand=...).
 *
 * `categories` lets a Kategori Utama selection include its descendant Sub
 * Kategori products (docs/UI_RULES.md).
 *
 * @param {{ archived?: boolean, initialCategory?: string, initialBrand?: string,
 *   categories?: import('../data/models.js').Category[] }} [options]
 */
export function useSellerProducts({
  archived = false,
  initialCategory = '',
  initialBrand = '',
  categories = [],
} = {}) {
  const [state, setState] = useState({
    status: 'loading',
    products: [],
    archivedCount: 0,
    error: '',
  })
  const [reloadKey, setReloadKey] = useState(0)
  const [tab, setTab] = useState('active')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    category: initialCategory,
    condition: '',
    brand: initialBrand,
    featured: '',
  })

  useEffect(() => {
    let active = true

    async function load() {
      setState({ status: 'loading', products: [], archivedCount: 0, error: '' })
      try {
        if (archived) {
          const archivedProducts = await listArchivedProducts()
          if (!active) {
            return
          }
          setState({ status: 'ready', products: archivedProducts, archivedCount: 0, error: '' })
          return
        }
        const [products, archivedProducts] = await Promise.all([
          listSellerProducts(),
          listArchivedProducts(),
        ])
        if (!active) {
          return
        }
        setState({ status: 'ready', products, archivedCount: archivedProducts.length, error: '' })
      } catch (error) {
        if (!active) {
          return
        }
        setState((current) => ({
          ...current,
          status: 'error',
          error:
            error instanceof Error ? error.message : 'Gagal memuat produk. Silakan coba lagi.',
        }))
      }
    }

    load()

    return () => {
      active = false
    }
  }, [reloadKey, archived])

  const query = search.trim().toLowerCase()

  const categoryScope = useMemo(
    () => resolveCategoryScope(categories, filters.category),
    [categories, filters.category],
  )

  const visibleProducts = useMemo(() => {
    let list = [...state.products]

    if (!archived && tab === 'active') {
      list = list.filter((product) => product.status === PRODUCT_STATUS.PUBLISHED)
    } else if (!archived && tab === 'draft') {
      list = list.filter((product) => product.status === PRODUCT_STATUS.DRAFT)
    } else if (!archived && tab === 'soldOut') {
      list = list.filter((product) => product.status === PRODUCT_STATUS.SOLD_OUT)
    }

    if (categoryScope.length > 0) {
      list = list.filter((product) => categoryScope.includes(product.category))
    }
    if (filters.condition) {
      list = list.filter((product) => product.condition === filters.condition)
    }
    if (filters.brand) {
      list = list.filter((product) => (product.brand || '') === filters.brand)
    }
    if (filters.featured === 'featured') {
      list = list.filter((product) => product.featured)
    }

    if (query) {
      const scored = list
        .map((product) => ({ product, score: relevanceScore(product, query) }))
        .filter((item) => Number.isFinite(item.score))
      scored.sort(
        (a, b) => a.score - b.score || new Date(b.product.createdAt) - new Date(a.product.createdAt),
      )
      return scored.map((item) => item.product)
    }

    // Seller management ordering (docs/PRODUCT.md): Product Unggulan first,
    // then newer products before older ones.
    list.sort((a, b) => {
      const featuredDiff = (b.featured ? 1 : 0) - (a.featured ? 1 : 0)
      if (featuredDiff !== 0) {
        return featuredDiff
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return list
  }, [state.products, tab, filters, query, archived, categoryScope])

  const counts = useMemo(() => {
    if (archived) {
      return { active: 0, published: 0, drafts: 0, soldOut: 0 }
    }
    const published = state.products.filter(
      (product) => product.status === PRODUCT_STATUS.PUBLISHED,
    ).length
    const drafts = state.products.filter(
      (product) => product.status === PRODUCT_STATUS.DRAFT,
    ).length
    const soldOut = state.products.filter(
      (product) => product.status === PRODUCT_STATUS.SOLD_OUT,
    ).length
    return {
      active: published,
      published,
      drafts,
      soldOut,
    }
  }, [state.products, archived])

  const hasActiveFilters = Boolean(
    query || filters.category || filters.condition || filters.brand || filters.featured,
  )

  function resetFilters() {
    setSearch('')
    if (!archived) {
      setTab('active')
    }
    setFilters({ category: '', condition: '', brand: '', featured: '' })
  }

  return {
    status: state.status,
    products: visibleProducts,
    counts,
    archivedCount: state.archivedCount,
    error: state.error,
    reload: () => setReloadKey((value) => value + 1),
    tab,
    setTab,
    search,
    setSearch,
    filters,
    setFilters,
    hasActiveFilters,
    resetFilters,
  }
}