import { Link } from 'react-router-dom'
import DashboardSectionHeading from './DashboardSectionHeading'
import RecentActivityList from '../activities/RecentActivityList'

/**
 * Dashboard section 3: Recent Activity timeline.
 * Only PRODUCT_PUBLISHED, PRODUCT_EDITED and STORE_UPDATED events.
 * "Lihat Semua" opens the full activity list on /seller/activities.
 * @param {{ activities: import('../../../data/models.js').RecentActivity[] }} props
 */
function RecentActivity({ activities }) {
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

        <RecentActivityList activities={activities} />
      </div>
    </section>
  )
}

export default RecentActivity