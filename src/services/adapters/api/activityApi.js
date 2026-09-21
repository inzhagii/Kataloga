/**
 * Recent Activity API adapter.
 *
 * Implements the PROPOSED activity contract (docs/API-CONTRACT.md). Only used
 * when VITE_DATA_SOURCE=api. Activity is restricted to seller management
 * events (the locked seven types, docs/PRODUCT.md). Customer interest belongs
 * to a separate domain and must never appear here.
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
 * Wire body uses snake_case per the API contract; mappers convert to the
 * camelCase frontend model. `context` is the minimal proposal for storing
 * the related product with the event (pending backend confirmation).
 * @param {import('../../../constants/enums.js').ACTIVITY_TYPE} type
 * @param {string} message
 * @param {{ productId?: number|null, productName?: string|null }} [context]
 * @returns {Promise<import('../../../data/models.js').RecentActivity>}
 */
export function recordActivity(type, message, context = {}) {
  return request({
    method: 'POST',
    path: '/activities',
    body: {
      type,
      message,
      product_id: context.productId ?? null,
      product_name: context.productName ?? null,
    },
  }).then(toRecentActivity)
}