import EmptyState from '../../shared/EmptyState'
import { formatDateTime } from '../../../utils/datetime'
import { ACTIVITY_META } from './activityMeta'

/**
 * Shared Recent Activity timeline used by the Dashboard section and the
 * full /seller/activities page. Only the locked seller/store activity types
 * are rendered; any non-canonical type passed in is filtered out so it can
 * never surface as Recent Activity (defense in depth with the service).
 * @param {{ activities: import('../../../data/models.js').RecentActivity[] }} props
 */
function RecentActivityList({ activities }) {
  const canonical = activities.filter((activity) => ACTIVITY_META[activity.type] != null)

  if (canonical.length === 0) {
    return (
      <EmptyState
        icon="history"
        title="Belum ada aktivitas"
        description="Produk dipublikasi, produk diperbarui, dan perubahan toko akan muncul di sini."
      />
    )
  }

  return (
    <ol className="relative space-y-6 pl-9 before:absolute before:bottom-2 before:left-[11px] before:top-2 before:w-0.5 before:bg-outline-variant">
      {canonical.map((activity) => {
        const meta = ACTIVITY_META[activity.type]
        return (
          <li key={activity.id} className="relative">
            <span
              className={`absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ${meta.tint}`}
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-[14px]">{meta.icon}</span>
            </span>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-xs font-semibold text-on-surface">{meta.label}</p>
              <span className="text-[11px] font-medium text-secondary">
                {formatDateTime(activity.date)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-secondary">{activity.message}</p>
            {activity.productName ? (
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-lg bg-surface-container px-2 py-1 text-[11px] font-medium text-on-surface-variant">
                <span className="material-symbols-outlined text-[14px]" aria-hidden="true">
                  inventory_2
                </span>
                {activity.productName}
              </p>
            ) : null}
          </li>
        )
      })}
    </ol>
  )
}

export default RecentActivityList