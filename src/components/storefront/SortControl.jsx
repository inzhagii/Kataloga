import { useState } from 'react'
import { SORT_OPTIONS } from '../../constants/storefront'
import BottomSheet from './BottomSheet'

/**
 * Catalog sort control. Desktop uses a compact native select; mobile uses a
 * bottom sheet. Both share the same SORT_OPTIONS and apply changes
 * immediately (no explicit apply step).
 */
function SortControl({ sort, onChange }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Desktop select */}
      <div className="hidden items-center gap-2 md:flex">
        <label
          htmlFor="catalog-sort"
          className="whitespace-nowrap text-xs text-on-surface-variant"
        >
          Urutkan:
        </label>
        <div className="relative">
          <select
            id="catalog-sort"
            value={sort}
            onChange={(event) => onChange(event.target.value)}
            className="cursor-pointer appearance-none rounded-xl border border-outline-variant/30 bg-surface-container-lowest py-2 pl-3.5 pr-8 text-xs font-medium text-on-surface shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span
            className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[16px] text-on-surface-variant"
            aria-hidden="true"
          >
            expand_more
          </span>
        </div>
      </div>

      {/* Mobile trigger + sheet */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3.5 py-2.5 text-xs font-medium text-on-surface shadow-sm transition-colors hover:bg-surface-container md:hidden"
      >
        <span className="material-symbols-outlined text-[18px] text-primary" aria-hidden="true">
          sort
        </span>
        <span>Urutkan</span>
      </button>

      <div className="md:hidden">
        <BottomSheet open={open} onClose={() => setOpen(false)} title="Urutkan" icon="sort">
          <div className="flex flex-col gap-1">
            {SORT_OPTIONS.map((option) => {
              const active = option.value === sort
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm transition-colors ${
                    active
                      ? 'bg-primary/10 font-semibold text-on-surface'
                      : 'text-on-surface hover:bg-surface-container'
                  }`}
                >
                  <span>{option.label}</span>
                  {active ? (
                    <span
                      className="material-symbols-outlined text-[20px] text-primary"
                      aria-hidden="true"
                    >
                      check
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
          <p className="mt-4 text-[11px] text-on-surface-variant">
            Sort diterapkan pada seluruh katalog aktif.
          </p>
        </BottomSheet>
      </div>
    </>
  )
}

export default SortControl