import { Link } from 'react-router-dom'

/**
 * Dashboard Quick Actions. Shortcuts only, no new business flows. The
 * prominent "+ Tambah Produk" action lives in the Dashboard header; this
 * section keeps the three management shortcuts.
 */
function QuickActions() {
  const actions = [
    {
      to: '/seller/products',
      label: 'Manage Products',
      description: 'Kelola produk',
      icon: 'inventory_2',
    },
    {
      to: '/seller/categories',
      label: 'Manage Categories',
      description: 'Kelola Kategori Utama & Sub Kategori',
      icon: 'category',
    },
    {
      to: '/seller/my-store',
      label: 'Manage Store',
      description: 'Kelola toko',
      icon: 'storefront',
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
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-container text-secondary transition-colors group-hover:bg-primary group-hover:text-on-primary">
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