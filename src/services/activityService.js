/**
 * Recent Activity service.
 * Dashboard-only timeline restricted to seller/store activity:
 * PRODUCT_PUBLISHED, PRODUCT_EDITED, STORE_UPDATED.
 * Returns mock data now; will call the Activity API later.
 */

import { recentActivities } from '../data/mock'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as activityApi from './adapters/api/activityApi'

/**
 * List the most recent seller/store activities, newest first.
 * @returns {Promise<import('../data/models.js').RecentActivity[]>}
 */
export function listRecentActivities() {
  if (isApiMode()) {
    return activityApi.listRecentActivities()
  }
  const sorted = [...recentActivities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )
  return withLatency(sorted)
}

/**
 * Record a new recent activity and persist it to the mock timeline.
 * @param {'PRODUCT_PUBLISHED'|'PRODUCT_EDITED'|'STORE_UPDATED'} type
 * @param {string} message
 * @returns {Promise<import('../data/models.js').RecentActivity>}
 */
export function recordActivity(type, message) {
  if (isApiMode()) {
    return activityApi.recordActivity(type, message)
  }
  const activity = {
    id: recentActivities.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    type,
    message,
    date: new Date().toISOString(),
  }
  recentActivities.unshift(activity)
  return withLatency(activity)
}

/**
 * Record a product publish activity.
 * @param {string} productName
 * @returns {Promise<import('../data/models.js').RecentActivity>}
 */
export function recordProductPublished(productName) {
  return recordActivity('PRODUCT_PUBLISHED', `${productName} berhasil dipublikasi ke katalog.`)
}

/**
 * Record a product edit activity.
 * @param {string} productName
 * @returns {Promise<import('../data/models.js').RecentActivity>}
 */
export function recordProductEdited(productName) {
  return recordActivity('PRODUCT_EDITED', `${productName} diperbarui.`)
}

/**
 * Record a store update activity (My Store save).
 * @returns {Promise<import('../data/models.js').RecentActivity>}
 */
export function recordStoreUpdated() {
  return recordActivity('STORE_UPDATED', 'Informasi toko diperbarui.')
}