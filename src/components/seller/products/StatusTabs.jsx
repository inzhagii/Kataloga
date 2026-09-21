import ArchivedProductsLink from './ArchivedProductsLink'

/**
 * Status tabs for /seller/products: Active (PUBLISHED only), Draft and
 * Sold Out as segmented tabs. Archive access lives on the right of the tab row
 * on desktop (and next to Filter on mobile); archived products have their own
 * page.
 * @param {{
 *   tab: 'active'|'draft'|'soldOut',
 *   onTabChange: (tab: 'active'|'draft'|'soldOut') => void,
 *   counts: { active: number, drafts: number, soldOut: number },
 *   archivedCount: number,
 * }} props
 */
function StatusTabs({ tab, onTabChange, counts, archivedCount }) {
  const tabs = [
    { key: 'active', label: 'Active', count: counts.active, chip: 'bg-primary/10 text-primary' },
    { key: 'draft', label: 'Draft', count: counts.drafts, chip: 'bg-amber-100 text-amber-800' },
    { key: 'soldOut', label: 'Sold Out', count: counts.soldOut, chip: 'bg-error/10 text-error' },
  ]

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40">
      <div className="flex gap-6" role="tablist" aria-label="Status produk">
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => onTabChange(item.key)}
            className={`relative flex items-center gap-2 pb-3 text-sm font-semibold transition-all ${
              tab === item.key
                ? 'border-b-2 border-primary font-bold text-primary'
                : 'border-b-2 border-transparent text-secondary hover:text-on-surface'
            }`}
          >
            {item.label}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${item.chip}`}
            >
              {item.count}
            </span>
          </button>
        ))}
      </div>

      <ArchivedProductsLink
        count={archivedCount}
        className="mb-2 hidden lg:inline-flex"
      />
    </div>
  )
}

export default StatusTabs