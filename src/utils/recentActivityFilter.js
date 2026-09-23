/**
 * Pure helpers for filtering the Recent Activity list (/seller/activities).
 *
 * Side-effect free and unit-testable. Filters compose AND-wise: activity type
 * and a single date (DD.MM.YYYY) — never a date range (locked UI rules).
 * Invalid/empty date input is ignored so a typo cannot wipe the list.
 * The returned list keeps the input order, which the activityService already
 * guarantees to be newest-first (§5 — ordering is the service's job).
 */

import { ACTIVITY_TYPE } from '../constants/enums'
import { isSameCalendarDate } from './datetime'

export const FILTER_ALL = 'all'

/**
 * Canonical activity types in documentation presentation order
 * (docs/AGENTS.md §20). PRODUCT_EDITED is the internal canonical form of the
 * external "PRODUCT_UPDATED" product-update event.
 */
export const ACTIVITY_TYPE_ORDER = [
  ACTIVITY_TYPE.PRODUCT_PUBLISHED,
  ACTIVITY_TYPE.PRODUCT_EDITED,
  ACTIVITY_TYPE.PRODUCT_SOLD_OUT,
  ACTIVITY_TYPE.PRODUCT_REACTIVATED,
  ACTIVITY_TYPE.PRODUCT_ARCHIVED,
  ACTIVITY_TYPE.PRODUCT_RESTORED,
  ACTIVITY_TYPE.CATEGORY_CREATED,
  ACTIVITY_TYPE.CATEGORY_UPDATED,
  ACTIVITY_TYPE.ANNOUNCEMENT_CREATED,
  ACTIVITY_TYPE.ANNOUNCEMENT_UPDATED,
  ACTIVITY_TYPE.STORE_UPDATED,
]

/**
 * True only for a complete, real DD.MM.YYYY value. Partial input (typed but
 * unfinished) and impossible dates (e.g. 31.02 or 99.99.9999) are ignored so
 * a typo can never wipe the list.
 * @param {unknown} value
 * @returns {boolean}
 */
function hasUsableDate(value) {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(String(value ?? '').trim())
  if (!match) {
    return false
  }
  const day = Number(match[1])
  const month = Number(match[2])
  const year = Number(match[3])
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
}

/**
 * Filter the Recent Activity timeline by activity type and/or a single date.
 * Order is preserved (callers rely on the service's newest-first sort).
 * @param {import('../data/models.js').RecentActivity[]} activities
 * @param {{ type?: string, date?: string }} [options]
 * @returns {import('../data/models.js').RecentActivity[]}
 */
export function filterRecentActivities(activities, options = {}) {
  const { type = FILTER_ALL, date = '' } = options
  const hasDate = hasUsableDate(date)

  return activities.filter((activity) => {
    if (type !== FILTER_ALL && activity.type !== type) {
      return false
    }
    if (hasDate && !isSameCalendarDate(activity.date, date)) {
      return false
    }
    return true
  })
}