import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { listRecentActivities } from '../../services/activityService'
import RecentActivityList from '../../components/seller/activities/RecentActivityList'
import ActivityFilterBar from '../../components/seller/activities/ActivityFilterBar'
import EmptyState from '../../components/shared/EmptyState'
import { filterRecentActivities, FILTER_ALL } from '../../utils/recentActivityFilter'

/**
 * Full Recent Activity list (route /seller/activities), reached from
 * Dashboard → Recent Activity → Lihat Semua. Shows only the locked seven
 * seller/store activity types, filtered by type and a single date. Provides
 * "Kembali" to Dashboard.
 */
function RecentActivitiesPage() {
  const [state, setState] = useState({ status: 'loading', activities: [], error: '' })
  const [reloadKey, setReloadKey] = useState(0)
  const [filters, setFilters] = useState({ type: FILTER_ALL, date: '' })

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

  const visible = useMemo(
    () => filterRecentActivities(state.activities, filters),
    [state.activities, filters],
  )
  const hasActiveFilters = filters.type !== FILTER_ALL || filters.date !== ''

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }))
  }

  function resetFilters() {
    setFilters({ type: FILTER_ALL, date: '' })
  }

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
      <div className="mb-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
            Recent Activity
          </h1>
          <p className="mt-1 text-sm text-secondary">
            Aktivitas manajemen toko terbaru. Filter berdasarkan tipe aktivitas atau tanggal.
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
        <div className="mb-5 border-b border-outline-variant/40 pb-5">
          <ActivityFilterBar
            filters={filters}
            onChange={updateFilter}
            onReset={resetFilters}
            active={hasActiveFilters}
          />
        </div>

        <div className="mb-4 text-xs font-medium text-secondary">
          Menampilkan {visible.length} aktivitas
        </div>

        {hasActiveFilters && visible.length === 0 ? (
          <EmptyState
            icon="filter_list_off"
            title="Belum ada aktivitas yang sesuai filter."
            description="Coba ubah pilihan aktivitas atau tanggal agar hasilnya lebih banyak."
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
              >
                Reset Filter
              </button>
            }
          />
        ) : (
          <RecentActivityList activities={visible} />
        )}
      </div>
    </div>
  )
}

export default RecentActivitiesPage