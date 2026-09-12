import { Link } from 'react-router-dom'

/**
 * Dashboard section 4: Quick Actions. Shortcuts only, no new business flows.
 * Minimum targets: Add Product, Products, My Store.
 */
function QuickActions() {
  const actions = [
    {
      to: '/seller/products/new',
      label: 'Add Product',
      description: 'Tambahkan produk baru',
      icon: 'add',
      primary: true,
    },
    {
      to: '/seller/products',
      label: 'Products',
      description: 'Kelola produk',
      icon: 'inventory_2',
      primary: false,
    },
    {
      to: '/seller/my-store',
      label: 'My Store',
      description: 'Kelola toko',
      icon: 'storefront',
      primary: false,
    },
  ]

  return (
    <section aria-labelledby="quick-actions-heading">
      <h2
        id="quick-actions-heading"
        className="mb-4 text-base font-bold tracking-tight text-on-surface"
      >
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {actions.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className="group flex items-center gap-3.5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-4 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${
                action.primary
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container text-secondary group-hover:bg-primary group-hover:text-on-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                {action.icon}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-on-surface transition-colors group-hover:text-primary">
                {action.label}
              </h3>
              <p className="truncate text-xs text-secondary">{action.description}</p>
            </div>
            <span
              className="material-symbols-outlined text-[18px] text-primary group-hover:translate-x-0.5 transition-all"
              aria-hidden="true"
            >
              chevron_right
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default QuickActions