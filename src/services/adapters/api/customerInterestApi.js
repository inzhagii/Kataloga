/**
 * Customer Interest API adapter.
 *
 * Implements the PROPOSED customer interest contract (docs/API-CONTRACT.md).
 * Only used when VITE_DATA_SOURCE=api. Only WHATSAPP_CLICK and
 * MARKETPLACE_CLICK are recorded. The backend resolves the customer identity
 * from the session; the frontend sends customer_id plus the identity/context
 * snapshots available on the client.
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
 * the session; the identity/context fields below are the client snapshots
 * (proposed contract fields, pending backend confirmation). Ownership is not
 * filtered here — API mode posts per contract and the backend enforces the
 * self-store exclusion.
 * @param {{
 *   storeId: string,
 *   customerId?: number|null,
 *   customerEmail?: string|null,
 *   customerPhone?: string|null,
 *   productId?: number|null,
 *   channelType: 'WHATSAPP_CLICK'|'MARKETPLACE_CLICK',
 *   channel: string,
 *   externalUrl?: string|null,
 *   context?: 'Store Landing'|'Product Detail'|null,
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
      customer_email: payload.customerEmail ?? null,
      customer_phone: payload.customerPhone ?? null,
      product_id: payload.productId ?? null,
      channel_type: payload.channelType,
      channel: payload.channel,
      external_url: payload.externalUrl ?? null,
      context: payload.context ?? null,
    },
  }).then(toCustomerInterest)
}