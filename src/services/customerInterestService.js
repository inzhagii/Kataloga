/**
 * Customer Interest service.
 * Records only meaningful channel intents: WHATSAPP_CLICK and MARKETPLACE_CLICK.
 * Product views, shares, login/logout and browsing never create an interest.
 */

import { customerInterests } from '../data/mock'
import { INTEREST_TYPE } from '../constants/enums'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import { getActiveUser } from './authService'
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
    .sort(sortNewestFirst)
  return withLatency(result)
}

/**
 * Record a customer interest activity.
 * Products are null for store-level activity (Store Landing WhatsApp/
 * Marketplace), and set for product-level activity (Product Detail).
 * Repeated actions create individual records (no dedup) so every click stays
 * visible to the seller.
 *
 * Identity (name/email/phone) is snapshotted from the authenticated customer.
 * The storefront context (Store Landing vs Product Detail) is stored with the
 * event; it is never inferred later from the current route. External channels
 * are snapshotted by name+URL so records still render after a channel is
 * removed from the store configuration.
 *
 * Self-store exclusion: activity on the owner's own storefront by the store
 * owner does NOT create a Customer Interest. In API mode the event is still
 * POSTed as-is per the contract (the backend is the source of truth for
 * ownership); in mock mode the record is skipped proactively.
 *
 * If the store owner's own storefront is opened by a different account
 * (including an authenticated logged-in customer), the activity IS recorded.
 *
 * @param {{
 *   storeId: string,
 *   customerName: string|null,
 *   customerId?: number|null,
 *   customerEmail?: string|null,
 *   customerPhone?: string|null,
 *   productId?: number|null,
 *   productName?: string|null,
 *   channelType: 'WHATSAPP_CLICK'|'MARKETPLACE_CLICK',
 *   channel: string,
 *   externalUrl?: string|null,
 *   context?: 'Store Landing'|'Product Detail'|null,
 * }} payload
 * @returns {Promise<import('../data/models.js').CustomerInterest|null>}
 *   The new record, or null when the record is skipped because the acting
 *   account is the owner of the target store (mock mode).
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
  if (isStoreOwner(payload.storeId)) {
    return withLatency(null)
  }
  const interest = {
    id: customerInterests.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    storeId: payload.storeId,
    customerName: payload.customerName ?? null,
    customerId: payload.customerId ?? null,
    customerEmail: payload.customerEmail ?? null,
    customerPhone: payload.customerPhone ?? null,
    productId: payload.productId ?? null,
    productName: payload.productName ?? null,
    channelType: payload.channelType,
    channel: payload.channel,
    externalUrl: payload.externalUrl ?? null,
    context: payload.context ?? null,
    date: new Date().toISOString(),
  }
  customerInterests.push(interest)
  return withLatency(interest)
}

/**
 * Whether the currently authenticated account owns the target store.
 * Ownership is resolved from the authenticated session (user.storeId), never
 * from the mock store list, so the rule stays correct for any store.
 * @param {string} storeId
 * @returns {boolean}
 */
export function isStoreOwner(storeId) {
  const user = getActiveUser()
  return Boolean(user?.storeId && user.storeId === storeId)
}

function sortNewestFirst(a, b) {
  return new Date(b.date).getTime() - new Date(a.date).getTime()
}