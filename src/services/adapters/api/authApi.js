/**
 * Auth API adapter.
 *
 * Implements the PROPOSED auth contract (docs/API-CONTRACT.md). Only used
 * when VITE_DATA_SOURCE=api. The backend owns credentials/authorization;
 * the frontend never stores passwords or fakes tokens.
 */

import { request } from '../../apiClient'
import { toUser } from './mappers'

/**
 * @param {{ emailOrPhone: string, password: string }} payload
 * @returns {Promise<import('../../../data/models.js').User>}
 */
export function login(payload) {
  return request({
    method: 'POST',
    path: '/auth/login',
    body: {
      email_or_phone: payload.emailOrPhone,
      password: payload.password,
    },
  }).then(toUser)
}

/**
 * @param {{ emailOrPhone: string, password: string, name?: string }} payload
 * @returns {Promise<import('../../../data/models.js').User>}
 */
export function register(payload) {
  return request({
    method: 'POST',
    path: '/auth/register',
    body: {
      email_or_phone: payload.emailOrPhone,
      password: payload.password,
      name: payload.name || undefined,
    },
  }).then(toUser)
}

/**
 * Resolve the authenticated session's account (null when guest).
 * @returns {Promise<import('../../../data/models.js').User | null>}
 */
export function getCurrentUser() {
  return request({ path: '/auth/me', notFoundAsNull: true }).then((dto) =>
    dto ? toUser(dto) : null,
  )
}

/**
 * @param {number|string} userId - Kept for signature parity; the API is session-scoped.
 * @param {Partial<import('../../../data/models.js').User>} payload
 * @returns {Promise<import('../../../data/models.js').User>}
 */
export function updateCurrentUser(userId, payload) {
  return request({
    method: 'PATCH',
    path: '/auth/me',
    body: {
      name: payload.name === undefined ? undefined : payload.name.trim() || undefined,
      email: payload.email === undefined ? undefined : payload.email.trim() || undefined,
      phone: payload.phone === undefined ? undefined : payload.phone.trim() || undefined,
      avatar_url: payload.avatarUrl,
    },
  }).then(toUser)
}

/**
 * @returns {Promise<void>}
 */
export function logout() {
  return request({ method: 'POST', path: '/auth/logout' }).then(() => undefined)
}