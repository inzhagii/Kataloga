/**
 * Customer Interest service.
 * Records only meaningful channel intents: WHATSAPP_CLICK, MARKETPLACE_CLICK.
 */

import { customerInterests } from '../data/mock'
import { INTEREST_TYPE } from '../constants/enums'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as customerInterestApi from './adapters/api/customerInterestApi'

const ALLOWED_INTEREST_TYPES = new Set(Object.values(INTEREST_TYPE))

/**
 * List recorded customer interest activities for a store, newest first.
 * Store ID is required so the seller page (and dashboard) never mix records
 * from other stores.
 * @param {string} storeId
 * @returns {Promise<import('../data/models.js').CustomerInterest[]>}
 */
export function listCustomerInterests(storeId) {
  if (isApiMode()) {
    return customerInterestApi.listCustomerInterests(storeId)
  }
  const result = customerInterests
    .filter((interest) => interest.storeId === storeId)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
  return withLatency(result)
}

/**
 * Record a customer interest activity.
 * Products are null for store-level activity (Store Landing WhatsApp/
 * Marketplace), and set for product-level activity (Product Detail).
 * Repeated actions create individual records (no dedup) so every click stays
 * visible to the seller.
 * @param {{
 *   storeId: string,
 *   customerName: string,
 *   customerId?: number|null,
 *   productId?: number|null,
 *   productName?: string|null,
 *   channelType: 'WHATSAPP_CLICK'|'MARKETPLACE_CLICK',
 *   channel: string,
 *   externalUrl?: string|null,
 * }} payload
 * @returns {Promise<import('../data/models.js').CustomerInterest>}
 */
export function recordInterest(payload) {
  if (isApiMode()) {
    return customerInterestApi.recordInterest(payload)
  }
  if (!ALLOWED_INTEREST_TYPES.has(payload.channelType)) {
    return Promise.reject(
      new Error('Jenis aktivitas pelanggan tidak valid. Hanya mendukung WhatsApp click dan Marketplace click.'),
    )
  }
  const interest = {
    id: customerInterests.length + 1,
    storeId: payload.storeId,
    customerName: payload.customerName,
    customerId: payload.customerId ?? null,
    productId: payload.productId ?? null,
    productName: payload.productName ?? null,
    channelType: payload.channelType,
    channel: payload.channel,
    externalUrl: payload.externalUrl ?? null,
    date: new Date().toISOString(),
  }
  customerInterests.push(interest)
  return withLatency(interest)
}