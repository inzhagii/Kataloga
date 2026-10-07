import FilterPopover from './FilterPopover'

/**
 * Products list controls: search and filter. All UI state on the same route.
 * Locked rules:
 * - Desktop (sm+): Search is flexible but not full-width (capped at max-w-xl)
 *   and sits beside Filter on this row. The "+ Tambah Product" action lives in
 *   the page header title row / under the title on mobile, never in this row.
 *   The Archive nav item lives in the StatusTabs row (desktop).
 * - Mobile: Search is full-width on its own row; Filter and the mobile Archive
 *   nav item (archiveLink slot) are side-by-side on the next row.
 * - No Sort exists on the seller Products page.
 * - Archive is rendered exactly once per breakpoint: desktop via StatusTabs,
 *   mobile here via the archiveLink slot.
 * The optional Reset chip appears while filters are active.
 * @param {{
 *   search: string,
 *   onSearch: (value: string) => void,
 *   filters: { category: string, condition: string, brand: string, featured: string },
 *   onFilterChange: (next: { category: string, condition: string, brand: string, featured: string }) => void,
 *   resetFilters: () => void,
 *   hasActiveFilters: boolean,
 *   categories: { id: number, name: string, parentId: number|null }[],
 *   brands: { id: number, name: string }[],
 *   archiveLink?: import('react').ReactNode,
 *   autoArchive?: import('react').ReactNode,
 * }} props
 */
function ProductsToolbar({
  search,
  onSearch,
  filters,
  onFilterChange,
  resetFilters,
  hasActiveFilters,
  categories,
  brands = [],
  archiveLink = null,
  autoArchive = null,
}) {
  const activeFilterCount =
    (filters.category ? 1 : 0) +
    (filters.condition ? 1 : 0) +
    (filters.brand ? 1 : 0) +
    (filters.featured ? 1 : 0)

  return (
    <div className="mb-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
      <div className="relative w-full sm:max-w-xl sm:flex-1">
        <span
          className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline"
          aria-hidden="true"
        >
          search
        </span>
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Cari produk (nama, brand, kategori, deskripsi)..."
          aria-label="Cari produk"
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-sm text-on-surface shadow-sm placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
        />
      </div>

      <div className="flex flex-row items-center gap-2.5 sm:w-auto sm:shrink-0">
        <FilterPopover
          filters={filters}
          onChange={onFilterChange}
          resetFilters={resetFilters}
          categories={categories}
          brands={brands}
          activeCount={activeFilterCount}
        />

        {archiveLink}

        {autoArchive}

        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-surface-container-low px-2.5 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container"
            aria-label="Reset filter dan pencarian"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              refresh
            </span>
            Reset
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default ProductsToolbar