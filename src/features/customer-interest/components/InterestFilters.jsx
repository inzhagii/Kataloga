import InterestFilterPopover from './InterestFilterPopover'

/**
 * Search + filter controls for the Customer Interest page.
 * Search matches customer identity and product data (case insensitive, partial
 * match, store-scoped — docs/PRODUCT.md §27); advanced filters live in the
 * popover. Reset appears whenever any filter or the query is active.
 * @param {{
 *   query: string,
 *   onQueryChange: (value: string) => void,
 *   filters: object,
 *   onFilterChange: (key: string, value: string|number|null) => void,
 *   onReset: () => void,
 *   canReset: boolean,
 *   activeFilterCount: number,
 *   activityFilterOptions: { value: string, label: string }[],
 *   channelOptions: { id: string, name: string, isHistorical?: boolean }[],
 *   categoryOptions: string[],
 *   brands: string[],
 *   products: { id: number, name: string }[],
 * }} props
 */
function InterestFilters({
  query,
  onQueryChange,
  filters,
  onFilterChange,
  onReset,
  canReset,
  activeFilterCount,
  activityFilterOptions,
  channelOptions,
  categoryOptions,
  brands,
  products,
}) {
  return (
    <div className="grid w-full grid-cols-2 items-stretch gap-2 sm:flex sm:items-center sm:gap-3">
      <div className="relative min-w-0 sm:w-72">
        <span
          className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline"
          aria-hidden="true"
        >
          search
        </span>
        <input
          type="text"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Cari customer / produk..."
          aria-label="Cari customer atau produk"
          className="h-11 w-full rounded-xl border border-outline-variant/50 bg-surface pr-9 pl-10 text-sm text-on-surface shadow-sm outline-none placeholder:text-outline focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label="Bersihkan pencarian"
            className="absolute right-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-highest text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
              close
            </span>
          </button>
        ) : null}
      </div>

      <InterestFilterPopover
        filters={filters}
        onChange={onFilterChange}
        onReset={onReset}
        activityFilterOptions={activityFilterOptions}
        channelOptions={channelOptions}
        categoryOptions={categoryOptions}
        brands={brands}
        products={products}
        activeCount={activeFilterCount}
      />

      {canReset ? (
        <button
          type="button"
          onClick={onReset}
          className="col-span-2 inline-flex h-10 items-center gap-1.5 self-start justify-center rounded-lg bg-surface-container px-4 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-error-container/40 hover:text-error sm:col-span-1 sm:justify-start sm:self-auto"
        >
          <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
            restart_alt
          </span>
          Reset
        </button>
      ) : null}
    </div>
  )
}

export default InterestFilters