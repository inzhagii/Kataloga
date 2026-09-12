import { Link } from 'react-router-dom'
import FilterPopover from './FilterPopover'

/**
 * Products list controls: search, filter popover, sort and "+ Tambah Produk".
 * All UI state on the same route. The page header is title-only; the add
 * action lives here so mobile always shows a single proportional control row
 * ([ Filter ] [ Urutkan ] [ + Tambah Produk ]), stacking below the search.
 * The optional Reset chip appears above that row only while filters are
 * active. The row layout only kicks in from lg up, so tablet widths never
 * squeeze the controls together with the search box.
 * @param {{
 *   search: string,
 *   onSearch: (value: string) => void,
 *   filters: { category: string, condition: string },
 *   onFilterChange: (next: { category: string, condition: string }) => void,
 *   resetFilters: () => void,
 *   hasActiveFilters: boolean,
 *   sort: string,
 *   onSort: (value: string) => void,
 *   categories: { id: number, name: string, parentId: number|null }[],
 *   addHref: string,
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
  addHref,
}) {
  const activeFilterCount = (filters.category ? 1 : 0) + (filters.condition ? 1 : 0)

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'relevance', label: 'Relevansi' },
    { value: 'priceAsc', label: 'Harga: Rendah ke Tinggi' },
    { value: 'priceDesc', label: 'Harga: Tinggi ke Rendah' },
  ]

  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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

      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2.5">
        {hasActiveFilters ? (
          <button
            type="button"
            onClick={resetFilters}
            className="inline-flex items-center gap-2 self-start rounded-xl bg-surface-container-low px-2.5 py-2 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container lg:self-auto"
            aria-label="Reset filter dan pencarian"
          >
            <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
              refresh
            </span>
            Reset
          </button>
        ) : null}

        <div className="grid w-full min-w-0 grid-cols-3 items-stretch gap-1.5 sm:gap-2 lg:w-auto lg:flex lg:items-center lg:justify-end lg:gap-2.5">
          <FilterPopover
            filters={filters}
            onChange={onFilterChange}
            resetFilters={resetFilters}
            categories={categories}
            activeCount={activeFilterCount}
          />

          <div className="relative flex w-full min-w-0 items-center rounded-xl border border-outline-variant bg-surface-container-lowest px-1.5 py-2 shadow-sm sm:px-2.5 lg:w-auto lg:gap-1.5 lg:px-3">
            <span className="hidden text-xs font-medium text-secondary lg:mr-1 lg:inline">
              Urutkan:
            </span>
            <select
              value={sort}
              onChange={(event) => onSort(event.target.value)}
              className="w-full min-w-0 cursor-pointer appearance-none truncate bg-transparent p-0 pr-5 text-xs font-semibold text-on-surface focus:ring-0 sm:text-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span
              className="material-symbols-outlined pointer-events-none absolute right-1.5 text-[16px] text-outline"
              aria-hidden="true"
            >
              expand_more
            </span>
          </div>

          <Link
            to={addHref}
            className="inline-flex w-full min-w-0 items-center justify-center gap-1 rounded-xl bg-primary px-1.5 py-2.5 text-center text-xs font-semibold leading-tight text-on-primary shadow-sm transition-all hover:brightness-110 sm:gap-2 sm:px-4 sm:text-sm lg:w-auto lg:px-5 lg:py-2.5"
          >
            <span className="material-symbols-outlined shrink-0 text-[18px]" aria-hidden="true">
              add
            </span>
            Tambah Produk
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductsToolbar