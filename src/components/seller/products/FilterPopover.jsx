import { useRef, useState } from 'react'
import { useClickOutside } from '../../../hooks/useClickOutside'

/**
 * Filter popover triggered from the ProductsToolbar. Immediate-apply style
 * (no Apply button): selecting a filter updates the list in real-time.
 * @param {{
 *   filters: { category: string, condition: string, status: string },
 *   onChange: (next: { category: string, condition: string, status: string }) => void,
 *   resetFilters: () => void,
 *   categories: { id: number, name: string, parentId: number|null }[],
 *   activeCount: number,
 * }} props
 */
function FilterPopover({ filters, onChange, resetFilters, categories, activeCount = 0 }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  useClickOutside(panelRef, () => setOpen(false), open)

  function setFilter(key, value) {
    onChange({ ...filters, [key]: value })
  }

  const leaves = categories.filter(
    (category) =>
      !categories.some((other) => other.parentId === category.id),
  )

  return (
    <div ref={panelRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 py-2.5 text-sm font-semibold text-on-surface shadow-sm transition-all hover:border-outline"
      >
        <span className="material-symbols-outlined text-[18px] text-outline" aria-hidden="true">
          tune
        </span>
        Filter
        {activeCount > 0 ? (
          <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] font-bold text-on-primary">
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-72 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xl sm:right-auto sm:left-0">
          <div className="mb-3 flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Filter Produk
            </span>
            <button
              type="button"
              onClick={() => {
                resetFilters()
                setOpen(false)
              }}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="mb-3.5">
            <label className="mb-1.5 block text-xs font-semibold text-on-surface">
              Kategori
            </label>
            <select
              value={filters.category}
              onChange={(event) => setFilter('category', event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface"
            >
              <option value="">Semua Kategori</option>
              {leaves.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3.5">
            <label className="mb-1.5 block text-xs font-semibold text-on-surface">
              Kondisi
            </label>
            <select
              value={filters.condition}
              onChange={(event) => setFilter('condition', event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface"
            >
              <option value="">Semua Kondisi</option>
              <option value="NEW">New</option>
              <option value="SECOND">Second</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-semibold text-on-surface">
              Status Produk
            </label>
            <select
              value={filters.status}
              onChange={(event) => setFilter('status', event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface"
            >
              <option value="">Semua Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="sold_out">Sold Out</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-lg bg-primary py-1.5 text-xs font-semibold text-on-primary transition-colors hover:brightness-110"
          >
            Terapkan
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default FilterPopover