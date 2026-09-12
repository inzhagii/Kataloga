/**
 * Customer Interest API adapter.
 *
 * Implements the PROPOSED customer interest contract (docs/API-CONTRACT.md).
 * Only used when VITE_DATA_SOURCE=api. Only WHATSAPP_CLICK and
 * MARKETPLACE_CLICK are recorded. The backend resolves the customer identity
 * from the session; the frontend sends customer_id when available.
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
 * Record a customer interest. The backend derives customer_name from the
 * session and returns it in the response.
 * @param {{
 *   storeId: string,
 *   customerId?: number|null,
 *   productId?: number|null,
 *   channelType: 'WHATSAPP_CLICK'|'MARKETPLACE_CLICK',
 *   channel: string,
 *   externalUrl?: string|null,
 * }} payload
 * @returns {Promise<import('../../../data/models.js').CustomerInterest>}
 */
export function recordInterest(payload) {
  return request({
    method: 'POST',
    path: '/customer-interests',
    body: {
      store_id: payload.storeId,
      customer_id: payload.customerId ?? null,
      product_id: payload.productId ?? null,
      channel_type: payload.channelType,
      channel: payload.channel,
      external_url: payload.externalUrl ?? null,
    },
  }).then(toCustomerInterest)
}