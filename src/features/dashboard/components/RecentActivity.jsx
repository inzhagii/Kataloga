import { Link } from 'react-router-dom'
import EmptyState from '../../../components/ui/EmptyState'
import DashboardSectionHeading from './DashboardSectionHeading'
import RecentActivityList from '../../activities/components/RecentActivityList'

/**
 * Dashboard section 3: Recent Activity timeline — a compact preview, not the
 * full list. Shows the 4 most recent activities (docs/UI_RULES.md §20), the
 * same count as the Customer Interest preview so the two sections stay
 * visually balanced; "Lihat Semua" opens the full activity list on
 * /seller/activities. When the activity request fails this section shows its
 * own error state (with retry) instead of the empty state.
 * @param {{
 *   activities: import('../../../data/models.js').RecentActivity[],
 *   error?: string,
 *   onRetry?: () => void,
 * }} props
 */
function RecentActivity({ activities, error = '', onRetry }) {
  const latest = (activities ?? []).slice(0, 4)

  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="flex flex-col justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm sm:p-6"
    >
      <div>
        <div className="mb-4 flex items-center justify-between border-b border-outline-variant/60 pb-4">
          <div id="recent-activity-heading">
            <DashboardSectionHeading
              eyebrow="Recent Activity"
              description="Aktivitas manajemen toko terbaru"
            />
          </div>
          <Link
            to="/seller/activities"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary transition-colors hover:text-primary-container"
          >
            Lihat Semua
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {error ? (
          <EmptyState
            icon="error"
            title="Gagal memuat aktivitas"
            description={error}
            action={
              onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center justify-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition-all hover:brightness-110"
                >
                  Coba Lagi
                </button>
              ) : null
            }
          />
        ) : (
          <RecentActivityList activities={latest} />
        )}
      </div>
    </section>
  )
}

export default RecentActivity