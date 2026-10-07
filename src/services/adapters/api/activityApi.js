/**
 * Recent Activity API adapter.
 *
 * Implements the PROPOSED activity contract (docs/API-CONTRACT.md). Only used
 * when VITE_DATA_SOURCE=api. Activity is restricted to seller management
 * events (docs/AGENTS.md §20). Customer interest belongs to a separate domain
 * and must never appear here.
 *
 * Recent Activity is **backend-created** (docs/AGENTS.md §20): the frontend
 * only reads it, so this adapter exposes no POST. The backend records the
 * event as a side effect of the seller mutation; API mode never writes an
 * activity.
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