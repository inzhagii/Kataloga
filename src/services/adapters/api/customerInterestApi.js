/**
 * Customer Interest API adapter.
 *
 * Implements the PROPOSED customer interest contract (docs/API-CONTRACT.md).
 * Only used when VITE_DATA_SOURCE=api. Only explicit channel intents are
 * recorded. The backend resolves the customer identity from the session, so the
 * wire body carries no identity fields. There is no `channel_type` on the
 * contract: `channel` is the destination/action string and `context` is
 * `STORE` | `PRODUCT`.
 */

import { request } from '../../apiClient'
import { toCustomerInterest, toList } from './mappers'

const toInterestList = toList(toCustomerInterest)

/**
 * @param {string} storeId
 * @returns {Promise<import('../../../data/models.js').CustomerInterest[]>}
 */
export function listCustomerInterests(storeId) {
  return request({
    path: `/stores/${encodeURIComponent(storeId)}/customer-interests`,
  }).then(toInterestList)
}

/**
 * Record a customer interest. The backend derives the customer identity from
 * the session, so the body carries only the contract fields (no
 * `customer_id`/`customer_email`/`customer_phone`, no `channel_type`).
 * Ownership is not filtered here — API mode posts per contract and the backend
 * enforces the self-store exclusion.
 * @param {{
 *   storeId: string,
 *   productId?: number|null,
 *   channel: string,
 *   context?: 'STORE'|'PRODUCT'|null,
 * }} payload
 * @returns {Promise<import('../../../data/models.js').CustomerInterest>}
 */
export function recordInterest(payload) {
  return request({
    method: 'POST',
    path: '/customer-interests',
    body: {
      store_id: payload.storeId,
      product_id: payload.productId ?? null,
      context: payload.context ?? null,
      channel: payload.channel,
    },
  }).then(toCustomerInterest)
}