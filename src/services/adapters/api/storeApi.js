/**
 * Store API adapter.
 *
 * Implements the PROPOSED store contract (docs/API-CONTRACT.md). Only used
 * when VITE_DATA_SOURCE=api. Ownership and the 30-day Store ID cooldown are
 * enforced by the backend; the frontend keeps its current pre-validation.
 */

import { request } from '../../apiClient'
import { toStore } from './mappers'

/**
 * Map a partial frontend Store to the proposed store DTO.
 * @param {Partial<import('../../../data/models.js').Store>} store
 * @returns {object}
 */
function storeToDto(store) {
  const dto = {}
  const fields = {
    storeId: 'store_id',
    name: 'name',
    logoUrl: 'logo_url',
    description: 'description',
    city: 'city',
    operatingHours: 'operating_hours',
    whatsapp: 'whatsapp',
    channels: 'channels',
    announcement: 'announcement',
  }
  Object.entries(fields).forEach(([frontKey, apiKey]) => {
    if (store[frontKey] !== undefined) {
      dto[apiKey] = store[frontKey]
    }
  })
  return dto
}

/**
 * @returns {Promise<import('../../../data/models.js').Store | undefined>}
 */
export function getMyStore() {
  return request({ path: '/stores/me', notFoundAsNull: true }).then((dto) =>
    dto ? toStore(dto) : undefined,
  )
}

/**
 * @param {string} storeId
 * @returns {Promise<import('../../../data/models.js').Store | undefined>}
 */
export function getStore(storeId) {
  return request({
    path: `/stores/${encodeURIComponent(storeId)}`,
    notFoundAsNull: true,
  }).then((dto) => (dto ? toStore(dto) : undefined))
}

/**
 * @param {string} storeId
 * @returns {Promise<{ available: boolean }>}
 */
export function checkStoreIdAvailable(storeId) {
  return request({
    path: '/stores/availability',
    query: { store_id: storeId },
  }).then((result) => ({ available: Boolean(result && result.available) }))
}

/**
 * @param {string} storeId - Kept for signature parity; the API is session-scoped.
 * @param {Partial<import('../../../data/models.js').Store>} payload
 * @returns {Promise<import('../../../data/models.js').Store>}
 */
export function updateStore(storeId, payload) {
  return request({
    method: 'PATCH',
    path: '/stores/me',
    body: storeToDto(payload),
  }).then(toStore)
}

/**
 * @param {{ name: string, storeId: string }} payload
 * @returns {Promise<import('../../../data/models.js').Store>}
 */
export function createStore(payload) {
  return request({
    method: 'POST',
    path: '/stores',
    body: {
      name: payload.name,
      store_id: payload.storeId,
    },
  }).then(toStore)
}