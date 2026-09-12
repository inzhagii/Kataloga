/**
 * Store service.
 * Returns mock data now; will call the Store API later.
 *
 * Mutations persist into the in-memory mock array so cross-page flows
 * (My Store -> storefront, dashboard, products) stay consistent during a
 * session. When the Store ID changes, the owning reference on products,
 * custom categories and the account user is updated together so the public
 * storefront and seller curation do not break.
 */

import { stores } from '../data/mock'
import { products } from '../data/mock'
import { categories } from '../data/mock'
import { users } from '../data/mock'
import { customerInterests } from '../data/mock'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as storeApi from './adapters/api/storeApi'
import { getActiveUser } from './authService'
import { STORE_ID_PATTERN } from '../utils/storeId'

const FALLBACK_STORE_ID = 'toko-komputer-jaya'
const STORE_ID_COOLDOWN_DAYS = 30

/**
 * Resolve the store ID owned by the currently authenticated account.
 * The mock has exactly one default store; the API version will resolve the
 * store owned by the authenticated session.
 * @returns {string}
 */
function resolveActiveStoreId() {
  const user = getActiveUser()
  const owned = user?.storeId ? stores.find((store) => store.storeId === user.storeId) : undefined
  return owned?.storeId ?? stores[0]?.storeId ?? FALLBACK_STORE_ID
}

/**
 * Get the current seller store ID.
 * In API mode the store comes from the authenticated session (backend-scoped),
 * so the synchronous helper reflects the session instead of mock data.
 * @returns {string}
 */
export function getCurrentStoreId() {
  if (isApiMode()) {
    return getActiveUser()?.storeId ?? ''
  }
  return resolveActiveStoreId()
}

/**
 * Get a public store by its store ID.
 * @param {string} storeId
 * @returns {Promise<import('../data/models.js').Store | undefined>}
 */
export function getStore(storeId) {
  if (isApiMode()) {
    return storeApi.getStore(storeId)
  }
  const store = stores.find((item) => item.storeId === storeId)
  return withLatency(store)
}

/**
 * Get the store owned by the current seller.
 * @returns {Promise<import('../data/models.js').Store | undefined>}
 */
export function getMyStore() {
  if (isApiMode()) {
    return storeApi.getMyStore()
  }
  const store = stores.find((item) => item.storeId === resolveActiveStoreId())
  return withLatency(store)
}

/**
 * Check whether a store ID is available (normalized so "TOKO-X" matches
 * "toko-x" exactly like create/update do).
 * @param {string} storeId
 * @returns {Promise<{ available: boolean }>}
 */
export function checkStoreIdAvailable(storeId) {
  if (isApiMode()) {
    return storeApi.checkStoreIdAvailable(storeId)
  }
  const normalized = String(storeId ?? '').trim().toLowerCase()
  const available = !stores.some((store) => store.storeId === normalized)
  return withLatency({ available })
}

/**
 * Check whether the seller is allowed to change the Store ID again.
 * The mock store was last changed freely; the API version will compute this
 * from the backend's own record.
 * @param {import('../data/models.js').Store} store
 * @returns {{ allowed: boolean, nextChangeDate: string | null }}
 */
export function canChangeStoreId(store) {
  if (!store.lastStoreIdChange) {
    return { allowed: true, nextChangeDate: null }
  }
  const lastChange = new Date(store.lastStoreIdChange).getTime()
  const nextChange = lastChange + STORE_ID_COOLDOWN_DAYS * 24 * 60 * 60 * 1000
  return {
    allowed: Date.now() >= nextChange,
    nextChangeDate: new Date(nextChange).toISOString(),
  }
}

/**
 * Update store information and persist the change to the mock catalog.
 * Enforces the 30-day Store ID cooldown and propagates a Store ID change to
 * the products, custom categories and account user that reference the store.
 * @param {string} storeId
 * @param {Partial<import('../data/models.js').Store>} payload
 * @returns {Promise<import('../data/models.js').Store>}
 */
export function updateStore(storeId, payload) {
  if (isApiMode()) {
    return storeApi.updateStore(storeId, payload)
  }
  const store = stores.find((item) => item.storeId === storeId)
  if (!store) {
    return Promise.reject(new Error('Store tidak ditemukan.'))
  }

  const nextStoreId =
    payload.storeId === undefined ? store.storeId : payload.storeId.trim().toLowerCase()

  if (nextStoreId !== store.storeId) {
    if (!STORE_ID_PATTERN.test(nextStoreId)) {
      return Promise.reject(
        new Error('Store ID hanya boleh huruf kecil, angka, dan tanda hubung (-).'),
      )
    }
    if (stores.some((item) => item.storeId === nextStoreId)) {
      return Promise.reject(new Error('Store ID sudah digunakan. Silakan pilih Store ID lain.'))
    }
    const cooldown = canChangeStoreId(store)
    if (!cooldown.allowed) {
      return Promise.reject(
        new Error(
          `Store ID hanya dapat diubah sekali setiap 30 hari. Terakhir diubah pada ${new Date(
            store.lastStoreIdChange,
          ).toLocaleDateString('id-ID')}.`,
        ),
      )
    }
  }

  const previousStoreId = store.storeId
  Object.assign(store, payload, { storeId: nextStoreId })

  if (previousStoreId !== nextStoreId) {
    store.lastStoreIdChange = new Date().toISOString()

    products.forEach((product) => {
      if (product.storeId === previousStoreId) {
        product.storeId = nextStoreId
      }
    })

    categories.forEach((category) => {
      if (category.storeId === previousStoreId) {
        category.storeId = nextStoreId
      }
    })

    users.forEach((user) => {
      if (user.storeId === previousStoreId) {
        user.storeId = nextStoreId
      }
    })

    customerInterests.forEach((interest) => {
      if (interest.storeId === previousStoreId) {
        interest.storeId = nextStoreId
      }
    })
  }

  return withLatency(store)
}

/**
 * Create a new store (Store Name + Store ID only).
 * The mock enforces the documented uniqueness rule and registers the new
 * store so later lookups (getStore/getMyStore) see it.
 * @param {{ name: string, storeId: string }} payload
 * @returns {Promise<import('../data/models.js').Store>}
 */
export function createStore(payload) {
  if (isApiMode()) {
    return storeApi.createStore(payload)
  }
  const active = getActiveUser()
  if (active?.storeId) {
    return Promise.reject(
      new Error('Akun Anda sudah memiliki toko. Satu akun maksimal memiliki satu toko.'),
    )
  }
  const storeId = String(payload.storeId ?? '').trim().toLowerCase()
  if (!STORE_ID_PATTERN.test(storeId)) {
    return Promise.reject(
      new Error('Store ID hanya boleh huruf kecil, angka, dan tanda hubung (-).'),
    )
  }
  const exists = stores.some((store) => store.storeId === storeId)
  if (exists) {
    return Promise.reject(new Error('Store ID sudah digunakan. Silakan pilih Store ID lain.'))
  }
  const store = {
    storeId,
    name: payload.name,
    createdAt: new Date().toISOString(),
  }
  stores.push(store)
  return withLatency(store)
}