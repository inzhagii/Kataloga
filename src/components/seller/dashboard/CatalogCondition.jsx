import { Link } from 'react-router-dom'
import DashboardSectionHeading from './DashboardSectionHeading'

/**
 * Dashboard section 1: Catalog Condition.
 * Active Products = PUBLISHED only. Draft, Sold Out and Archived are
 * counted separately. Cards stay white with a subtle semantic accent:
 * blue = Active, amber = Draft, gray = Sold Out, gray = Archived.
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
      accentClass: 'border-t-4 border-t-blue-200',
      iconClass: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
      countClass: 'text-blue-600',
    },
    {
      to: '/seller/products',
      label: 'Draft',
      count: draftCount,
      subtitle: 'Belum dipublikasi',
      icon: 'edit_note',
      accentClass: 'border-t-4 border-t-amber-200',
      iconClass: 'bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white',
      countClass: 'text-amber-600',
    },
    {
      to: '/seller/products',
      label: 'Sold Out Products',
      count: soldOutCount,
      subtitle: 'SOLD_OUT dihitung terpisah',
      icon: 'block',
      accentClass: 'border-t-4 border-t-slate-200',
      iconClass: 'bg-slate-100 text-slate-600 group-hover:bg-slate-500 group-hover:text-white',
      countClass: 'text-slate-600',
    },
    {
      to: '/seller/products/archived',
      label: 'Archived Products',
      count: archivedCount,
      subtitle: 'Produk yang diarsipkan',
      icon: 'archive',
      accentClass: 'border-t-4 border-t-slate-200',
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
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            to={card.to}
            className={`group rounded-xl border border-outline-variant/60 bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md ${card.accentClass}`}
          >
            <div className="flex items-start justify-between p-4 sm:p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-secondary">
                  {card.label}
                </span>
                <div className={`mt-1.5 text-2xl font-extrabold tracking-tight sm:mt-2 sm:text-3xl ${card.countClass}`}>
                  {card.count}
                </div>
              </div>
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:h-11 sm:w-11 ${card.iconClass}`}
              >
                <span className="material-symbols-outlined text-[20px] sm:text-[24px]" aria-hidden="true">
                  {card.icon}
                </span>
              </div>
            </div>
            <p className="px-4 pb-4 text-xs leading-snug text-secondary sm:px-6 sm:pb-6">
              {card.subtitle}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default CatalogCondition