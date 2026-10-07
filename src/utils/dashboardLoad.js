/**
 * Dashboard load helpers.
 *
 * The seller Dashboard fans out to independent sources (store, products,
 * archived products, customer interest, recent activity). They must not share
 * one fate: a single failing request must never blank the whole dashboard, so
 * the hook settles every request and this helper maps the settled results into
 * a partial-failure-safe state. Successful sections stay usable and each
 * failed source exposes its own error message for a per-widget error state.
 */

import { PRODUCT_STATUS } from '../constants/enums'

/** Generic fallback shown on the full-page error when every source fails. */
export const DASHBOARD_GENERIC_ERROR = 'Gagal memuat dashboard. Silakan coba lagi.'

/** @param {PromiseSettledResult<unknown>|undefined} result */
function settledMessage(result) {
  if (!result || result.status !== 'rejected') {
    return ''
  }
  return result.reason instanceof Error ? result.reason.message : ''
}

/** @param {PromiseSettledResult<*>|undefined} result @param {*} fallback */
function settledValue(result, fallback) {
  return result && result.status === 'fulfilled' ? result.value : fallback
}

/**
 * Map settled dashboard source results into a state slice that distinguishes
 * per-source failure from overall failure (`status: 'error'` only when every
 * source failed).
 *
 * @param {{
 *   store?: PromiseSettledResult<import('../data/models.js').Store>,
 *   products?: PromiseSettledResult<import('../data/models.js').Product[]>,
 *   archivedProducts?: PromiseSettledResult<import('../data/models.js').Product[]>,
 *   interests?: PromiseSettledResult<import('../data/models.js').CustomerInterest[]>,
 *   activities?: PromiseSettledResult<import('../data/models.js').RecentActivity[]>,
 * }} results
 */
export function deriveDashboardState(results = {}) {
  const sources = [
    results.store,
    results.products,
    results.archivedProducts,
    results.interests,
    results.activities,
  ]
  const anyFulfilled = sources.some((result) => result && result.status === 'fulfilled')
  const status = anyFulfilled ? 'ready' : 'error'

  const errors = {
    store: settledMessage(results.store),
    products: settledMessage(results.products),
    archived: settledMessage(results.archivedProducts),
    interests: settledMessage(results.interests),
    activities: settledMessage(results.activities),
  }

  const products = settledValue(results.products, [])
  const archivedProducts = settledValue(results.archivedProducts, [])

  return {
    status,
    store: settledValue(results.store, null),
    activeProducts: products.filter((product) => product.status === PRODUCT_STATUS.PUBLISHED),
    draftProducts: products.filter((product) => product.status === PRODUCT_STATUS.DRAFT),
    soldOutProducts: products.filter((product) => product.status === PRODUCT_STATUS.SOLD_OUT),
    archivedProducts,
    interests: settledValue(results.interests, []),
    activities: settledValue(results.activities, []),
    errors,
    error:
      status === 'error'
        ? errors.store || errors.products || errors.archived || errors.interests || errors.activities || DASHBOARD_GENERIC_ERROR
        : '',
  }
}
