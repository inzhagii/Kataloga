import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { filterAndSortProducts, buildCatalogCategoryTree } from '../../utils/productSearch'
import SearchBar from './SearchBar'
import FilterControl from './FilterControl'
import SortControl from './SortControl'
import ProductCard from './ProductCard'
import EmptyState from '../shared/EmptyState'

/**
 * "Semua Produk" catalog block: search, filter, sort, product grid and the
 * empty/empty-search recovery states. All state stays local to the page
 * (no separate query-string routes). The category filter is two-level:
 * Kategori Utama (chips + filter step 1) → Sub Kategori (filter step 2),
 * scoped to the selected Kategori Utama. An optional `listingHref` renders
 * a "Lihat Semua" link to the dedicated product listing route.
 */
function CatalogSection({ storeId, storeName, products, categories = [], onShare, listingHref }) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('all')
  const [condition, setCondition] = useState('all')
  const [sort, setSort] = useState('relevance')

  const categoryTree = useMemo(
    () => buildCatalogCategoryTree(products, categories),
    [products, categories],
  )
  const filtered = useMemo(() => {
    const expandedCategory =
      category !== 'all' ? [category, ...(categoryTree.childrenByRoot[category] ?? [])] : null
    return filterAndSortProducts(products, {
      query,
      category,
      categoryList: expandedCategory,
      condition,
      sort,
    })
  }, [products, query, category, categoryTree, condition, sort])

  const hasActiveSearch = query.trim().length > 0
  const hasActiveFilter = category !== 'all' || condition !== 'all'
  const isEmptyResult = filtered.length === 0

  function resetAll() {
    setQuery('')
    setCategory('all')
    setCondition('all')
    setSort('relevance')
  }

  return (
    <section className="flex flex-col gap-4" aria-labelledby="catalog-heading">
      <div className="flex items-center justify-between">
        <h2 id="catalog-heading" className="text-lg font-bold tracking-tight text-on-surface md:text-2xl">
          Semua Produk
        </h2>
        <div className="flex items-center gap-3">
          <span
            className="rounded-full bg-surface-container-high px-3 py-1 text-xs text-on-surface-variant"
            aria-live="polite"
          >
            {filtered.length} Produk
          </span>
          {listingHref ? (
            <Link
              to={listingHref}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-blue-700 sm:text-sm"
            >
              Lihat Semua
              <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
                chevron_right
              </span>
            </Link>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="md:min-w-0 md:flex-1">
          <SearchBar value={query} onChange={setQuery} placeholder="Cari produk di toko ini..." />
        </div>
        <div className="flex items-center gap-3 md:shrink-0">
          <div className="min-w-0 flex-1 md:flex-none">
            <FilterControl
              tree={categoryTree}
              appliedCategory={category}
              appliedCondition={condition}
              sort={sort}
              onSortChange={setSort}
              onApply={(nextCategory, nextCondition) => {
                setCategory(nextCategory)
                setCondition(nextCondition)
              }}
            />
          </div>
          <div className="min-w-0 flex-1 md:hidden">
            <SortControl sort={sort} onChange={setSort} />
          </div>
        </div>
      </div>

      {isEmptyResult ? (
        <EmptyState
          icon={hasActiveSearch || hasActiveFilter ? 'search_off' : 'inventory'}
          title={hasActiveSearch || hasActiveFilter ? 'Produk tidak ditemukan' : 'Belum ada produk'}
          description={
            hasActiveSearch || hasActiveFilter
              ? 'Coba gunakan kata kunci atau filter lain untuk menemukan yang kamu cari.'
              : 'Toko ini belum memiliki produk yang dapat ditampilkan.'
          }
          action={
            hasActiveSearch || hasActiveFilter ? (
              <button
                type="button"
                onClick={resetAll}
                className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-on-primary shadow-sm transition-colors hover:bg-blue-700"
              >
                Reset Pencarian
              </button>
            ) : null
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeId={storeId}
              storeName={storeName}
              onShare={onShare}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default CatalogSection