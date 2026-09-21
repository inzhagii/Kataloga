import { FILTER_ALL } from '../../../utils/recentActivityFilter'
import { ACTIVITY_FILTER_OPTIONS } from './activityMeta'
import DateFilterPicker from '../../shared/DateFilterPicker'

/**
 * Filter toolbar for /seller/activities: activity type + a single date
 * (TT.BB.TTTT). Immediate-apply style (no Apply button); a Reset button
 * appears while a filter is active. Both filters compose AND-wise.
 * @param {{
 *   filters: { type: string, date: string },
 *   onChange: (key: string, value: string) => void,
 *   onReset: () => void,
 *   active: boolean,
 * }} props
 */
function ActivityFilterBar({ filters, onChange, onReset, active }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="sm:w-60">
        <label
          htmlFor="activity-type-filter"
          className="mb-1.5 block text-xs font-semibold text-on-surface"
        >
          Aktivitas
        </label>
        <select
          id="activity-type-filter"
          value={filters.type}
          onChange={(event) => onChange('type', event.target.value)}
          className="h-11 w-full rounded-xl border border-outline-variant bg-surface-container-low px-3 text-sm font-medium text-on-surface"
        >
          <option value={FILTER_ALL}>Semua Aktivitas</option>
          {ACTIVITY_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sm:w-44">
        <label
          htmlFor="activity-date-filter"
          className="mb-1.5 block text-xs font-semibold text-on-surface"
        >
          Tanggal
        </label>
        <DateFilterPicker
          id="activity-date-filter"
          value={filters.date}
          onChange={(value) => onChange('date', value)}
          aria-label="Filter tanggal"
        />
      </div>

      {active ? (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-xl border border-outline-variant px-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
            refresh
          </span>
          Reset
        </button>
      ) : null}
    </div>
  )
}

export default ActivityFilterBar