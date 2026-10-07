/**
 * Customer Interest service.
 * Records only meaningful channel intents: WHATSAPP_CLICK and MARKETPLACE_CLICK.
 * Product views, shares, login/logout and browsing never create an interest.
 */

import { customerInterests } from '../data/mock'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import { getActiveUser } from './authService'
import { interestTotalClicks } from '../utils/customerInterest'
import * as customerInterestApi from './adapters/api/customerInterestApi'

const INVALID_INTEREST_MESSAGE =
  'Jenis aktivitas pelanggan tidak valid. Hanya mendukung WhatsApp click dan Marketplace click.'

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
 *
 * A click is folded into the existing logical record when one already exists
 * for the same store + customer identity + product + context + channel
 * (docs/AGENTS.md §19): `totalClicks` is incremented, `firstActivityAt` is
 * preserved, and `lastActivityAt`/`date` move to the new click. A genuinely
 * different context creates a new record; records whose owner cannot be
 * identified (no customer id and no name/email/phone) are never merged.
 *
 * Identity (name/email/phone) mirrors the session: the API contract makes the
 * authenticated session the source of truth, so the mock derives any identity
 * the caller omits from the active session (self-store exclusion below already
 * resolves ownership from the same session). The storefront context (`STORE`
 * vs `PRODUCT`) is stored with the event; it is never inferred later from the
 * current route. External channels are snapshotted by name+URL so records still
 * render after a channel is removed from the store configuration.
 *
 * MOCK LIMITATION: an explicitly supplied identity still wins over the session
 * because the acceptance of identity snapshots on the aggregate endpoint is
 * `API DEPENDENCY / CONFIRMATION REQUIRED` (docs/API-CONTRACT.md §7); in API
 * mode the request body carries no identity at all (the backend resolves it
 * from the session). The frontend never fabricates an identity for a guest:
 * guest actions are routed to Login before any record is attempted.
 *
 * There is no `channel_type`: `channel` is the destination/action string, and
 * WhatsApp is derived from it. In API mode the backend resolves identity from
 * the session (the adapter sends no identity fields).
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
 *   channel: string,
 *   externalUrl?: string|null,
 *   context?: 'STORE'|'PRODUCT'|null,
 * }} payload
 * @returns {Promise<import('../data/models.js').CustomerInterest|null>}
 *   The new/updated record, or null when the record is skipped because the
 *   acting account is the owner of the target store (mock mode).
 */
export function recordInterest(payload) {
  if (isApiMode()) {
    return customerInterestApi.recordInterest(payload)
  }
  if (!String(payload.channel ?? '').trim()) {
    return Promise.reject(new Error(INVALID_INTEREST_MESSAGE))
  }
  if (isStoreOwner(payload.storeId)) {
    return withLatency(null)
  }
  const sessionUser = getActiveUser()
  const resolved = {
    ...payload,
    customerName: payload.customerName ?? sessionUser?.name ?? null,
    customerId: payload.customerId ?? sessionUser?.id ?? null,
    customerEmail: payload.customerEmail ?? sessionUser?.email ?? null,
    customerPhone: payload.customerPhone ?? sessionUser?.phone ?? null,
  }
  const now = new Date().toISOString()
  const existing = findAggregationTarget(resolved)
  if (existing) {
    existing.totalClicks = interestTotalClicks(existing) + 1
    existing.lastActivityAt = now
    existing.date = now
    return withLatency(existing)
  }
  const interest = {
    id: customerInterests.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    storeId: resolved.storeId,
    customerName: resolved.customerName,
    customerId: resolved.customerId,
    customerEmail: resolved.customerEmail,
    customerPhone: resolved.customerPhone,
    productId: resolved.productId ?? null,
    productName: resolved.productName ?? null,
    channel: resolved.channel,
    externalUrl: resolved.externalUrl ?? null,
    context: resolved.context ?? null,
    totalClicks: 1,
    firstActivityAt: now,
    lastActivityAt: now,
    date: now,
  }
  customerInterests.push(interest)
  return withLatency(interest)
}

/**
 * Find the logical record a click folds into (same store + customer identity +
 * product + context + channel). Returns undefined when there is no match, when
 * the owner is unidentifiable (never merged), or when the channel differs.
 * @param {{
 *   storeId: string,
 *   customerName?: string|null,
 *   customerId?: number|null,
 *   customerEmail?: string|null,
 *   customerPhone?: string|null,
 *   productId?: number|null,
 *   channel: string,
 *   context?: 'STORE'|'PRODUCT'|null,
 * }} payload
 * @returns {import('../data/models.js').CustomerInterest|undefined}
 */
function findAggregationTarget(payload) {
  const ownerKey = ownerIdentityKey(payload)
  if (!ownerKey) {
    return undefined
  }
  const productId = payload.productId ?? null
  const context = payload.context ?? null
  const channel = String(payload.channel).trim().toLowerCase()
  return customerInterests.find(
    (item) =>
      item.storeId === payload.storeId &&
      ownerIdentityKey(item) === ownerKey &&
      (item.productId ?? null) === productId &&
      (item.context ?? null) === context &&
      String(item.channel ?? '').trim().toLowerCase() === channel,
  )
}

/**
 * Aggregation owner key: the account id when present, otherwise the strongest
 * identity snapshot (name > email > phone). Returns null when the record
 * carries no identity, so anonymous clicks are never merged with each other.
 * @param {{ customerId?: number|null, customerName?: string|null, customerEmail?: string|null, customerPhone?: string|null }} record
 * @returns {string|null}
 */
function ownerIdentityKey(record) {
  if (record.customerId != null) {
    return `u-${record.customerId}`
  }
  const value = record.customerName || record.customerEmail || record.customerPhone
  return value == null || !String(value).trim()
    ? null
    : `n-${String(value).trim().toLowerCase()}`
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