import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRecentActivities } from '../../services/activityService'
import RecentActivityList from '../../components/seller/activities/RecentActivityList'
import EmptyState from '../../components/shared/EmptyState'

/**
 * Full Recent Activity list (route /seller/activities), reached from
 * Dashboard → Recent Activity → Lihat Semua. Only PRODUCT_PUBLISHED,
 * PRODUCT_EDITED and STORE_UPDATED events. Provides "Kembali" to Dashboard.
 */
function RecentActivitiesPage() {
  const [state, setState] = useState({ status: 'loading', activities: [], error: '' })
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let active = true
    listRecentActivities()
      .then((value) => {
        if (active) {
          setState({ status: 'ready', activities: value, error: '' })
        }
      })
      .catch((error) => {
        if (active) {
          setState({
            status: 'error',
            activities: [],
            error:
              error instanceof Error ? error.message : 'Gagal memuat aktivitas. Silakan coba lagi.',
          })
        }
      })
    return () => {
      active = false
    }
  }, [reloadKey])

  if (state.status === 'loading') {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="h-10 w-56 animate-pulse rounded-xl bg-surface-container-high/60" />
        <div className="h-64 w-full animate-pulse rounded-2xl bg-surface-container-high/60" />
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
          Recent Activity
        </h1>
        <div className="mt-6">
          <EmptyState
            icon="error"
            title="Gagal memuat aktivitas"
            description={state.error}
            action={
              <button
                type="button"
                onClick={() => setReloadKey((value) => value + 1)}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
              >
                Coba Lagi
              </button>
            }
          />
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Recent Activity
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Aktivitas manajemen toko terbaru: publikasi, perubahan produk, dan perubahan toko.
          </p>
        </div>
        <Link
          to="/seller/dashboard"
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-outline-variant px-5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            arrow_back
          </span>
          Kembali ke Dashboard
        </Link>
      </div>

      <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-sm p-5 sm:p-6">
        <RecentActivityList activities={state.activities} />
      </div>
    </div>
  )
}

export default RecentActivitiesPage