import { Link } from 'react-router-dom'
import DashboardSectionHeading from './DashboardSectionHeading'

/**
 * Dashboard section 1: Catalog Condition.
 * Active Products = PUBLISHED only. Draft, Sold Out and Archived are
 * counted separately.
 * @param {{
 *   activeCount: number,
 *   draftCount: number,
 *   soldOutCount: number,
 *   archivedCount: number,
 * }} props
 */
function CatalogCondition({ activeCount, draftCount, soldOutCount, archivedCount }) {
  const cards = [
    {
      to: '/seller/products',
      label: 'Active Products',
      count: activeCount,
      subtitle: 'Published',
      icon: 'inventory_2',
      prominent: true,
      iconClass: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      countClass: 'text-blue-600',
    },
    {
      to: '/seller/products',
      label: 'Draft',
      count: draftCount,
      subtitle: 'Belum dipublikasi',
      icon: 'edit_note',
      prominent: false,
      iconClass: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
      countClass: 'text-amber-600',
    },
    {
      to: '/seller/products',
      label: 'Sold Out Products',
      count: soldOutCount,
      subtitle: 'SOLD_OUT dihitung terpisah',
      icon: 'block',
      prominent: false,
      iconClass: 'bg-red-50 text-red-600 group-hover:bg-red-600 group-hover:text-white',
      countClass: 'text-red-600',
    },
    {
      to: '/seller/products/archived',
      label: 'Archived Products',
      count: archivedCount,
      subtitle: 'Produk yang diarsipkan',
      icon: 'archive',
      prominent: false,
      iconClass: 'bg-slate-100 text-slate-600 group-hover:bg-slate-500 group-hover:text-white',
      countClass: 'text-slate-600',
    },
  ]

  return (
    <section aria-labelledby="catalog-condition-heading">
      <div id="catalog-condition-heading" className="mb-4">
        <DashboardSectionHeading
          eyebrow="Catalog Condition"
          description="Kondisi katalog toko kamu saat ini."
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className={`group rounded-xl border bg-surface-container-lowest p-6 shadow-sm transition-shadow hover:shadow-md ${
              card.prominent ? 'border-primary/40' : 'border-outline-variant/60'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {card.label}
                </span>
                <div className={`mt-2 text-3xl font-extrabold tracking-tight ${card.countClass}`}>
                  {card.count}
                </div>
              </div>
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${card.iconClass}`}
              >
                <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
                  {card.icon}
                </span>
              </div>
            </div>
            <p className="mt-4 text-xs text-secondary">{card.subtitle}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default CatalogCondition