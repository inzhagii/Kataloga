/**
 * Brand API adapter.
 *
 * Implements the PROPOSED brand contract (docs/API-CONTRACT.md). Only used
 * when VITE_DATA_SOURCE=api. The backend is expected to enforce:
 * - store-scoped brand lists
 * - duplicate name rejection within a store
 * - product usage before delete (no cascade, no silent detach)
 *
 * The backend contract is not finalized yet (M11); the mock service is the
 * only fully working path today.
 */

import { request } from '../../apiClient'
import { toBrand, toList } from './mappers'

const toBrandList = toList(toBrand)

/**
 * @returns {Promise<import('../../../data/models.js').Brand[]>}
 */
export function listBrands() {
  return request({ path: '/brands' }).then(toBrandList)
}

/**
 * @param {{ name: string }} payload
 * @returns {Promise<import('../../../data/models.js').Brand>}
 */
export function createBrand(payload) {
  return request({
    method: 'POST',
    path: '/brands',
    body: { name: payload.name },
  }).then(toBrand)
}

/**
 * @param {number} brandId
 * @param {{ name?: string }} payload
 * @returns {Promise<import('../../../data/models.js').Brand>}
 */
export function updateBrand(brandId, payload) {
  return request({
    method: 'PATCH',
    path: `/brands/${brandId}`,
    body: { name: payload.name === undefined ? undefined : payload.name.trim() },
  }).then(toBrand)
}

/**
 * @param {number} brandId
 * @returns {Promise<{ deleted: boolean }>}
 */
export function deleteBrand(brandId) {
  return request({ method: 'DELETE', path: `/brands/${brandId}` }).then((result) => ({
    deleted: result && typeof result.deleted === 'boolean' ? result.deleted : true,
  }))
}
