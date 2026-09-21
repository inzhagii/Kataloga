import { useRef, useState } from 'react'
import { useClickOutside } from '../../../hooks/useClickOutside'
import { FILTER_ALL } from '../../../utils/customerInterestFilter'
import DateFilterPicker from '../../shared/DateFilterPicker'

/**
 * Filter popover for the Customer Interest page. Immediate-apply style
 * (no Apply button): every control updates the list in real-time.
 *
 * Controls compose AND-wise:
 * - Aktivitas (WhatsApp Click / Marketplace Click) — locked UI rule.
 * - Channel — WhatsApp + current and historical external channels.
 * - Tanggal — single date only, canonical DD.MM.YYYY (no range).
 * - Kategori / Brand / Produk — derived from products that carry interests.
 *
 * @param {{
 *   filters: { activity: string, channel: string, date: string, category: string, brand: string, productId: number|null },
 *   onChange: (key: string, value: string|number|null) => void,
 *   onReset: () => void,
 *   activityFilterOptions: { value: string, label: string }[],
 *   channelOptions: { id: string, name: string, isHistorical?: boolean }[],
 *   categoryOptions: string[],
 *   brands: string[],
 *   products: { id: number, name: string }[],
 *   activeCount: number,
 * }} props
 */
function InterestFilterPopover({
  filters,
  onChange,
  onReset,
  activityFilterOptions,
  channelOptions,
  categoryOptions,
  brands,
  products,
  activeCount = 0,
}) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  useClickOutside(panelRef, () => setOpen(false), open)

  function resetAll() {
    onReset()
    setOpen(false)
  }

  return (
    <div ref={panelRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-outline-variant bg-surface-container-lowest px-3.5 text-sm font-semibold text-on-surface shadow-sm transition-all hover:border-outline"
      >
        <span className="material-symbols-outlined text-[18px] text-outline" aria-hidden="true">
          tune
        </span>
        Filter
        {activeCount > 0 ? (
          <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-on-primary">
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[19rem] rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between border-b border-outline-variant/30 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-secondary">
              Filter Minat
            </span>
            <button
              type="button"
              onClick={resetAll}
              className="text-xs font-semibold text-primary hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface">Aktivitas</label>
              <select
                value={filters.activity}
                onChange={(event) => onChange('activity', event.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface"
              >
                {activityFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface">Channel</label>
              <select
                value={filters.channel}
                onChange={(event) => onChange('channel', event.target.value)}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface"
              >
                <option value={FILTER_ALL}>Semua Channel</option>
                {channelOptions.map((option) => {
                  const label =
                    option.name +
                    (option.isHistorical ? ' (sebelumnya)' : '')
                  return (
                    <option key={option.id} value={option.name}>
                      {label}
                    </option>
                  )
                })}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface">Tanggal</label>
              <DateFilterPicker
                id="interest-date-filter"
                value={filters.date}
                onChange={(value) => onChange('date', value)}
                aria-label="Filter tanggal"
                size="sm"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface">Kategori</label>
              <select
                value={filters.category}
                onChange={(event) => onChange('category', event.target.value)}
                disabled={categoryOptions.length === 0}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={FILTER_ALL}>Semua Kategori</option>
                {categoryOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface">Brand</label>
              <select
                value={filters.brand}
                onChange={(event) => onChange('brand', event.target.value)}
                disabled={brands.length === 0}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={FILTER_ALL}>Semua Brand</option>
                {brands.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-on-surface">Produk</label>
              <select
                value={filters.productId == null ? FILTER_ALL : String(filters.productId)}
                onChange={(event) =>
                  onChange('productId', event.target.value === FILTER_ALL ? null : Number(event.target.value))
                }
                disabled={products.length === 0}
                className="w-full rounded-lg border border-outline-variant bg-surface-container-low p-2 text-xs font-medium text-on-surface disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={FILTER_ALL}>Semua Produk</option>
                {products.map((product) => (
                  <option key={product.id} value={String(product.id)}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full rounded-lg border border-outline-variant bg-surface-container-low px-3 py-1.5 text-xs font-semibold text-on-surface transition-colors hover:bg-surface-container"
          >
            Tutup
          </button>
        </div>
      ) : null}
    </div>
  )
}

export default InterestFilterPopover