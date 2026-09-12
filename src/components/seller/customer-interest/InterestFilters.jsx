import { ACTIVITY_FILTERS } from './activityFilters'

/**
 * Search + activity filter + reset controls for the Customer Interest page.
 * Search matches customer name, product name and channel (case insensitive).
 * @param {{
 *   query: string,
 *   onQueryChange: (value: string) => void,
 *   activityFilter: string,
 *   onActivityFilterChange: (value: string) => void,
 *   onReset: () => void,
 *   canReset: boolean,
 * }} props
 */
function InterestFilters({
  query,
  onQueryChange,
  activityFilter,
  onActivityFilterChange,
  onReset,
  canReset,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative w-full min-w-0 sm:w-72">
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

      <div className="relative w-full min-w-0 sm:w-auto sm:min-w-[180px]">
        <select
          value={activityFilter}
          onChange={(event) => onActivityFilterChange(event.target.value)}
          aria-label="Filter aktivitas"
          className="h-11 w-full cursor-pointer appearance-none rounded-xl border border-outline-variant/50 bg-surface pr-9 pl-3 text-sm text-on-surface shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          {ACTIVITY_FILTERS.map((filter) => (
            <option key={filter.value} value={filter.value}>
              {filter.label}
            </option>
          ))}
        </select>
        <span
          className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-outline"
          aria-hidden="true"
        >
          expand_more
        </span>
      </div>

      {canReset ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center gap-1.5 self-start rounded-lg bg-surface-container px-4 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-error-container/40 hover:text-error sm:self-auto"
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