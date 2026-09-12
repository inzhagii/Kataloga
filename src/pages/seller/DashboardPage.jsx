import { Link } from 'react-router-dom'
import { useSellerDashboard } from '../../hooks/useSellerDashboard'
import SellerDashboardSkeleton from '../../components/seller/dashboard/SellerDashboardSkeleton'
import CatalogCondition from '../../components/seller/dashboard/CatalogCondition'
import CustomerInterestSummary from '../../components/seller/dashboard/CustomerInterestSummary'
import RecentActivity from '../../components/seller/dashboard/RecentActivity'
import QuickActions from '../../components/seller/dashboard/QuickActions'
import EmptyState from '../../components/shared/EmptyState'

/**
 * Seller Dashboard (control center, not a replacement for management pages).
 * Sections in locked order: Catalog Condition, then Quick Actions, then
 * Customer Interest and Recent Activity side by side.
 */
function DashboardPage() {
  const {
    status,
    store,
    activeProducts,
    draftProducts,
    soldOutProducts,
    archivedProducts,
    interests,
    activities,
    error,
    reload,
  } = useSellerDashboard()

  if (status === 'loading') {
    return <SellerDashboardSkeleton />
  }

  if (status === 'error') {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">Dashboard</h1>
        <EmptyState
          icon="error"
          title="Gagal memuat dashboard"
          description={error}
          action={
            <button
              type="button"
              onClick={reload}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
            >
              Coba Lagi
            </button>
          }
        />
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-col gap-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            {store?.name || 'Dashboard'}
          </h1>
          <p className="mt-1 text-sm text-secondary sm:text-base">
            Selamat datang, kelola toko dan katalog kamu.
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2.5 sm:w-auto sm:flex sm:items-center sm:gap-3">
          {store ? (
            <a
              href={`/${store.storeId}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl border border-outline-variant px-3 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low sm:px-5"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                storefront
              </span>
              Lihat Toko
            </a>
          ) : null}
          <Link
            to="/seller/products/new"
            className={`inline-flex h-11 min-w-0 items-center justify-center gap-2 rounded-xl bg-primary px-3 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110 sm:px-5 ${
              store ? '' : 'col-span-2'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
              add
            </span>
            Tambah Produk
          </Link>
        </div>
      </div>

      <CatalogCondition
        activeCount={activeProducts.length}
        draftCount={draftProducts.length}
        soldOutCount={soldOutProducts.length}
        archivedCount={archivedProducts.length}
      />

      <QuickActions />

      <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-2 lg:flex-1 lg:grid-rows-[minmax(auto,1fr)]">
        <CustomerInterestSummary interests={interests} />
        <RecentActivity activities={activities} />
      </div>
    </div>
  )
}

export default DashboardPage