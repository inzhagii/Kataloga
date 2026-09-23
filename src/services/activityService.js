/**
 * Recent Activity service.
 * Timeline restricted to seller/store activity. The canonical activity types
 * are the eleven documented ones (docs/AGENTS.md §20):
 *
 *   PRODUCT_PUBLISHED, PRODUCT_EDITED, PRODUCT_SOLD_OUT,
 *   PRODUCT_REACTIVATED, PRODUCT_ARCHIVED, PRODUCT_RESTORED,
 *   CATEGORY_CREATED, CATEGORY_UPDATED, ANNOUNCEMENT_CREATED,
 *   ANNOUNCEMENT_UPDATED, STORE_UPDATED
 *
 * Customer activity (WhatsApp/Marketplace clicks, views, shares, category
 * browsing, login/logout) is NEVER part of Recent Activity.
 *
 * Returns mock data now; will call the Activity API later.
 */

import { recentActivities } from '../data/mock'
import { ACTIVITY_TYPE } from '../constants/enums'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import { getCurrentStoreId } from './storeService'
import * as activityApi from './adapters/api/activityApi'

const ALLOWED_TYPES = new Set(Object.values(ACTIVITY_TYPE))

/**
 * List the most recent seller/store activities, newest first.
 * Scoped to the store owned by the acting session (mock mode) and restricted
 * to the canonical activity types in both modes, so a stray legacy record can
 * never surface in Recent Activity.
 * @returns {Promise<import('../data/models.js').RecentActivity[]>}
 */
export function listRecentActivities() {
  if (isApiMode()) {
    return activityApi.listRecentActivities().then(keepCanonical)
  }
  const storeId = getCurrentStoreId()
  const owned = recentActivities.filter((activity) => activity.storeId === storeId)
  return withLatency(keepCanonical([...owned].sort(sortNewestFirst)))
}

function keepCanonical(list) {
  return list.filter((activity) => ALLOWED_TYPES.has(activity.type))
}

/**
 * Record a new recent activity and persist it to the mock timeline.
 * The store is resolved from the authenticated session, and optional product
 * context (productId/productName) is stored with the event so historical
 * records remain self-describing.
 * @param {import('../constants/enums.js').ACTIVITY_TYPE} type
 * @param {string} message
 * @param {{ productId?: number|null, productName?: string|null }} [context]
 * @returns {Promise<import('../data/models.js').RecentActivity>}
 */
export function recordActivity(type, message, context = {}) {
  if (!ALLOWED_TYPES.has(type)) {
    return Promise.reject(new Error(`Activity type tidak dikenali: ${type}`))
  }
  const activity = {
    id: recentActivities.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    storeId: getCurrentStoreId(),
    type,
    message,
    productId: context.productId ?? null,
    productName: context.productName ?? null,
    date: new Date().toISOString(),
  }
  if (isApiMode()) {
    return activityApi.recordActivity(type, message, context)
  }
  recentActivities.unshift(activity)
  return withLatency(activity)
}

export function recordProductPublished(productName, context = {}) {
  return recordActivity(
    ACTIVITY_TYPE.PRODUCT_PUBLISHED,
    `${productName} berhasil dipublikasi ke katalog.`,
    { productName, ...context },
  )
}

export function recordProductEdited(productName, context = {}) {
  return recordActivity(ACTIVITY_TYPE.PRODUCT_EDITED, `${productName} diperbarui.`, {
    productName,
    ...context,
  })
}

export function recordProductSoldOut(productName, context = {}) {
  return recordActivity(ACTIVITY_TYPE.PRODUCT_SOLD_OUT, `${productName} ditandai Sold Out.`, {
    productName,
    ...context,
  })
}

export function recordProductReactivated(productName, context = {}) {
  return recordActivity(ACTIVITY_TYPE.PRODUCT_REACTIVATED, `${productName} kembali aktif di katalog.`, {
    productName,
    ...context,
  })
}

export function recordProductArchived(productName, context = {}) {
  return recordActivity(ACTIVITY_TYPE.PRODUCT_ARCHIVED, `${productName} diarsipkan.`, {
    productName,
    ...context,
  })
}

export function recordProductRestored(productName, context = {}) {
  return recordActivity(ACTIVITY_TYPE.PRODUCT_RESTORED, `${productName} dikembalikan ke draft.`, {
    productName,
    ...context,
  })
}

export function recordStoreUpdated(context = {}) {
  return recordActivity(ACTIVITY_TYPE.STORE_UPDATED, 'Informasi toko diperbarui.', context)
}

function sortNewestFirst(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}