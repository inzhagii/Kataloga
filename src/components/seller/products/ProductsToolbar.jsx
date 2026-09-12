import FilterPopover from './FilterPopover'

/**
 * Products list controls: search, filter popover and sort. All UI state on
 * the same route. @param {{
 *   search: string,
 *   onSearch: (value: string) => void,
 *   filters: { category: string, condition: string, status: string },
 *   onFilterChange: (next: { category: string, condition: string, status: string }) => void,
 *   resetFilters: () => void,
 *   hasActiveFilters: boolean,
 *   sort: string,
 *   onSort: (value: string) => void,
 *   categories: { id: number, name: string, parentId: number|null }[],
 * }}} props
 */
function ProductsToolbar({
  search,
  onSearch,
  filters,
  onFilterChange,
  resetFilters,
  hasActiveFilters,
  sort,
  onSort,
  categories,
}) {
  const activeFilterCount =
    (filters.category ? 1 : 0) + (filters.condition ? 1 : 0) + (filters.status ? 1 : 0)

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'relevance', label: 'Relevansi' },
    { value: 'priceAsc', label: 'Harga: Rendah ke Tinggi' },
    { value: 'priceDesc', label: 'Harga: Tinggi ke Rendah' },
  ]

  return (
    <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative max-w-xl flex-1">
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
          className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-4 text-sm text-on-surface shadow-sm placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 rounded-xl bg-surface-container-low px-2.5 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container"
            aria-label="Reset filter dan pencarian"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              refresh
            </span>
            Reset
          </button>
        ) : null}
        <FilterPopover
          filters={filters}
          onChange={onFilterChange}
          resetFilters={resetFilters}
          categories={categories}
          activeCount={activeFilterCount}
        />
        <div className="inline-flex items-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3 py-2 shadow-sm">
          <span className="text-xs font-medium text-secondary">Urutkan:</span>
          <select
            value={sort}
            onChange={(event) => onSort(event.target.value)}
            className="cursor-pointer appearance-none bg-transparent p-0 pr-6 text-xs font-semibold text-on-surface focus:ring-0"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined -ml-5 text-[16px] text-outline"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>
      </div>
    </div>
  )
}

export default ProductsToolbar