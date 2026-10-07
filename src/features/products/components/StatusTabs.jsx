/**
 * Status tabs for /seller/products: Active (PUBLISHED only), Draft and
 * Sold Out as segmented tabs. Sold Out carries the red seller-warning chip
 * (customer storefront uses gray instead). Archive is a navigation item shown
 * right-aligned on desktop via the optional archiveLink slot; on mobile it
 * lives beside Filter in the ProductsToolbar. Exactly one Archive per
 * breakpoint, never in the sidebar or the mobile bottom navigation.
 * @param {{
 *   tab: 'active'|'draft'|'soldOut',
 *   onTabChange: (tab: 'active'|'draft'|'soldOut') => void,
 *   counts: { active: number, drafts: number, soldOut: number },
 *   archiveLink?: import('react').ReactNode,
 * }} props
 */
function StatusTabs({ tab, onTabChange, counts, archiveLink = null }) {
  const tabs = [
    { key: 'active', label: 'Active', count: counts.active, chip: 'bg-primary/10 text-primary' },
    { key: 'draft', label: 'Draft', count: counts.drafts, chip: 'bg-amber-100 text-amber-800' },
    { key: 'soldOut', label: 'Sold Out', count: counts.soldOut, chip: 'bg-red-50 text-red-600' },
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
      {archiveLink ? <div className="hidden pb-3 sm:block">{archiveLink}</div> : null}
    </div>
  )
}

export default StatusTabs