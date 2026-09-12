/**
 * Category API adapter.
 *
 * Implements the PROPOSED category contract (docs/API-CONTRACT.md). Only used
 * when VITE_DATA_SOURCE=api. The backend enforces:
 * - max two levels (parent -> subcategory)
 * - product usage before delete
 * - one category per product
 * - store-scoped custom categories
 */

import { request } from '../../apiClient'
import { toCategory, toList } from './mappers'

const toCategoryList = toList(toCategory)

/**
 * @returns {Promise<import('../../../data/models.js').Category[]>}
 */
export function listCategories() {
  return request({ path: '/categories' }).then(toCategoryList)
}

/**
 * @param {{ name: string, parentId?: number|null }} payload
 * @returns {Promise<import('../../../data/models.js').Category>}
 */
export function createCategory(payload) {
  return request({
    method: 'POST',
    path: '/categories',
    body: {
      name: payload.name,
      parent_id: payload.parentId ?? null,
    },
  }).then(toCategory)
}

/**
 * @param {number} categoryId
 * @param {{ name?: string, parentId?: number|null }} payload
 * @returns {Promise<import('../../../data/models.js').Category>}
 */
export function updateCategory(categoryId, payload) {
  return request({
    method: 'PATCH',
    path: `/categories/${categoryId}`,
    body: {
      name: payload.name === undefined ? undefined : payload.name.trim(),
      parent_id: payload.parentId,
    },
  }).then(toCategory)
}

/**
 * @param {number} categoryId
 * @returns {Promise<{ deleted: boolean }>}
 */
export function deleteCategory(categoryId) {
  return request({ method: 'DELETE', path: `/categories/${categoryId}` }).then((result) => ({
    deleted: result && typeof result.deleted === 'boolean' ? result.deleted : true,
  }))
}