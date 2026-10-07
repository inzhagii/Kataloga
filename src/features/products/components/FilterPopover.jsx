import { useRef, useState } from 'react'
import { useClickOutside } from '../../../hooks/useClickOutside'
import { buildCategoryFilterOptions } from '../../../utils/categoryTree'

/**
 * Filter popover triggered from the ProductsToolbar. Immediate-apply style
 * (no Apply button): selecting a filter updates the list in real-time.
 * Filters are limited to Category, Brand, Condition and Product Unggulan;
 * status is handled by the Active/Draft/Sold Out tabs.
 * @param {{
 *   filters: { category: string, condition: string, brand: string, featured: string },
 *   onChange: (next: { category: string, condition: string, brand: string, featured: string }) => void,
 *   resetFilters: () => void,
 *   categories: { id: number, name: string, parentId: number|null }[],
 *   brands: { id: number, name: string }[],
 *   activeCount: number,
 * }} props
 */
function FilterPopover({
  filters,
  onChange,
  resetFilters,
  categories,
  brands = [],
  activeCount = 0,
}) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  useClickOutside(panelRef, () => setOpen(false), open)

  function setFilter(key, value) {
    onChange({ ...filters, [key]: value })
  }

  const categoryOptions = buildCategoryFilterOptions(categories)

  return (
    <div ref={panelRef} className="relative w-full lg:w-auto">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-1.5 py-2.5 text-xs font-semibold whitespace-nowrap text-on-surface shadow-sm transition-all hover:border-outline lg:w-auto lg:gap-2 lg:px-3.5 lg:text-sm"
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
        <div className="absolute left-0 z-50 mt-2 w-72 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xl sm:left-0">
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
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.parentId === null ? category.name : `— ${category.name}`}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3.5">
            <label className="mb-1.5 block text-xs font-semibold text-on-surface">
              Brand
            </label>
            <select
              value={filters.brand || ''}
              onChange={(event) => setFilter('brand', event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface"
            >
              <option value="">Semua Brand</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.name}>
                  {brand.name}
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

          <div className="mb-3.5">
            <label className="mb-1.5 block text-xs font-semibold text-on-surface">
              Product Unggulan
            </label>
            <select
              value={filters.featured || ''}
              onChange={(event) => setFilter('featured', event.target.value)}
              className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface"
            >
              <option value="">Semua Produk</option>
              <option value="featured">Product Unggulan</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container"
          >
            Tutup
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default FilterPopover