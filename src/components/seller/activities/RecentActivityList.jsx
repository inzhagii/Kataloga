import EmptyState from '../../shared/EmptyState'
import { formatDateTime } from '../../../utils/datetime'
import { ACTIVITY_META } from './activityMeta'

/**
 * Shared Recent Activity timeline used by the Dashboard section and the
 * full /seller/activities page. Each row is a clean timeline entry: a small
 * per-type icon bubble (ACTIVITY_META), a datetime (DD.MM.YYYY · HH:MM) and
 * the short activity message. No wrapped product chips and no separate type
 * label row — the message itself carries the context. Only the locked
 * seller/store activity types are rendered; any non-canonical type passed in
 * is filtered out so it can never surface as Recent Activity (defense in depth
 * with the service).
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
    <ol className="divide-y divide-outline-variant/30">
      {canonical.map((activity) => {
        const meta = ACTIVITY_META[activity.type]
        return (
          <li key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 ${meta.tint}`}
              aria-hidden="true"
            >
              <span className="material-symbols-outlined text-[16px]">{meta.icon}</span>
            </span>
            <div className="min-w-0 flex-1">
              <time className="text-[11px] font-medium text-secondary" dateTime={activity.date}>
                {formatDateTime(activity.date)}
              </time>
              <p className="mt-0.5 text-xs text-on-surface">{activity.message}</p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export default RecentActivityList