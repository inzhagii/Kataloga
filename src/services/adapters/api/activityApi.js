/**
 * Recent Activity API adapter.
 *
 * Implements the PROPOSED activity contract (docs/API-CONTRACT.md). Only used
 * when VITE_DATA_SOURCE=api. Activity is restricted to seller management
 * events: PRODUCT_PUBLISHED, PRODUCT_EDITED, STORE_UPDATED. Customer interest
 * belongs to a separate domain and must never appear here.
 */

import { request } from '../../apiClient'
import { toRecentActivity, toList } from './mappers'

const toActivityList = toList(toRecentActivity)

/**
 * @returns {Promise<import('../../../data/models.js').RecentActivity[]>}
 */
export function listRecentActivities() {
  return request({ path: '/activities' }).then(toActivityList)
}

/**
 * @param {'PRODUCT_PUBLISHED'|'PRODUCT_EDITED'|'STORE_UPDATED'} type
 * @param {string} message
 * @returns {Promise<import('../../../data/models.js').RecentActivity>}
 */
export function recordActivity(type, message) {
  return request({
    method: 'POST',
    path: '/activities',
    body: { type, message },
  }).then(toRecentActivity)
}