import EmptyState from '../../shared/EmptyState'
import { formatDateTime } from '../../../utils/datetime'
import { ACTIVITY_TYPE } from '../../../constants/enums'
import DashboardSectionHeading from './DashboardSectionHeading'

const ACTIVITY_META = {
  [ACTIVITY_TYPE.PRODUCT_PUBLISHED]: {
    label: 'Produk dipublikasi',
    dotClass: 'bg-primary ring-primary/20',
  },
  [ACTIVITY_TYPE.PRODUCT_EDITED]: {
    label: 'Produk diperbarui',
    dotClass: 'bg-amber-500 ring-amber-500/20',
  },
  [ACTIVITY_TYPE.STORE_UPDATED]: {
    label: 'Informasi toko diperbarui',
    dotClass: 'bg-slate-400 ring-slate-400/20',
  },
}

/**
 * Dashboard section 3: Recent Activity timeline.
 * Only PRODUCT_PUBLISHED, PRODUCT_EDITED and STORE_UPDATED events.
 * @param {{ activities: import('../../../data/models.js').RecentActivity[] }} props
 */
function RecentActivity({ activities }) {
  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="flex flex-col justify-between rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-sm sm:p-6"
    >
      <div>
        <div className="mb-4 border-b border-outline-variant/60 pb-4">
          <div id="recent-activity-heading">
            <DashboardSectionHeading
              eyebrow="Recent Activity"
              description="Aktivitas manajemen toko terbaru"
            />
          </div>
        </div>

        {activities.length > 0 ? (
          <ol className="relative space-y-6 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-0.5 before:bg-outline-variant">
            {activities.map((activity) => {
              const meta = ACTIVITY_META[activity.type] || {
                label: activity.type,
                dotClass: 'bg-slate-400 ring-slate-400/20',
              }
              return (
                <li key={activity.id} className="relative">
                  <span
                    className={`absolute -left-[23px] top-2 h-3 w-3 rounded-full ring-4 ${meta.dotClass}`}
                    aria-hidden="true"
                  />
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                    <p className="text-xs font-semibold text-on-surface">{meta.label}</p>
                    <span className="text-[11px] font-medium text-secondary">
                      {formatDateTime(activity.date)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-secondary">{activity.message}</p>
                </li>
              )
            })}
          </ol>
        ) : (
          <EmptyState
            icon="history"
            title="Belum ada aktivitas"
            description="Produk dipublikasi, produk diperbarui, dan perubahan toko akan muncul di sini."
          />
        )}
      </div>
    </section>
  )
}

export default RecentActivity