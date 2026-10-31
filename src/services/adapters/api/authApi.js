/**
 * Auth API adapter.
 *
 * Implements the finalized auth contract (docs/API-CONTRACT.md). Only used
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
    unwrapEnvelope: true,
  }).then(toUser)
}

/**
 * Backend returns `requires_verification` for email signups; the account is not
 * authenticated until the email OTP is verified. Phone signups start a session.
 * @param {{
 *   email?: string|null,
 *   phone?: string|null,
 *   password: string,
 *   passwordConfirmation: string,
 *   name?: string|null,
 * }} payload
 * @returns {Promise<{
 *   user: import('../../../data/models.js').User,
 *   requiresVerification: boolean,
 *   identifier: string|null,
 *   channel: string|null,
 *   expiresAt?: string|null,
 *   cooldownSeconds?: number|null,
 * }>}
 */
export function register(payload) {
  const email = typeof payload.email === 'string' ? payload.email.trim() : ''
  const phone = typeof payload.phone === 'string' ? payload.phone.trim() : ''
  const name = typeof payload.name === 'string' ? payload.name.trim() : ''

  return request({
    method: 'POST',
    path: '/auth/register',
    body: {
      email: email || undefined,
      phone: phone || undefined,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
      name: name || undefined,
    },
    unwrapEnvelope: true,
  }).then((dto) => ({
    user: toUser(dto.user),
    requiresVerification: Boolean(dto.requires_verification),
    identifier: dto.identifier ?? null,
    channel: dto.channel ?? null,
    expiresAt: dto.expires_at ?? null,
    cooldownSeconds: dto.cooldown_seconds ?? null,
  }))
}

/**
 * Verify the email-registration OTP. The backend does not start a session.
 * @param {{ identifier: string, code: string }} payload
 * @returns {Promise<import('../../../data/models.js').User>}
 */
export function verifyRegistration({ identifier, code }) {
  return request({
    method: 'POST',
    path: '/auth/email/verify',
    body: { email: identifier, code },
    unwrapEnvelope: true,
  }).then(toUser)
}

/**
 * Resend the email-registration OTP (backend owns the cooldown).
 * @param {{ identifier: string }} payload
 */
export function resendRegistrationOtp({ identifier }) {
  return request({
    method: 'POST',
    path: '/auth/email/verify/resend',
    body: { email: identifier },
    unwrapEnvelope: true,
  }).then((dto) => ({
    expiresAt: dto?.expires_at ?? null,
    cooldownSeconds: dto?.cooldown_seconds ?? null,
  }))
}

/**
 * PROPOSED. Send a change-password OTP to the account's verified email.
 * @param {{ email: string }} payload
 */
export function requestChangePasswordOtp({ email }) {
  return request({
    method: 'POST',
    path: '/auth/password/otp',
    body: { email },
  }).then((dto) => ({
    expiresAt: dto?.expires_at ?? null,
    cooldownSeconds: dto?.cooldown_seconds ?? null,
  }))
}

/**
 * PROPOSED. Verify the change-password OTP (returns a short-lived proof token
 * owned by the backend/session, never persisted by the frontend).
 * @param {{ email: string, code: string }} payload
 */
export function verifyChangePasswordOtp({ email, code }) {
  return request({
    method: 'POST',
    path: '/auth/password/otp/verify',
    body: { email, code },
  }).then((dto) => ({ verified: Boolean(dto?.verified ?? true) }))
}

/**
 * PROPOSED. Change the authenticated account's password.
 * @param {{ currentPassword: string, newPassword: string }} payload
 */
export function changePassword({ currentPassword, newPassword }) {
  return request({
    method: 'POST',
    path: '/auth/password',
    body: { current_password: currentPassword, new_password: newPassword },
  }).then((dto) => ({ ok: Boolean(dto?.ok ?? true) }))
}

/**
 * PROPOSED. Request a password-reset code. Must always return a generic
 * response so the endpoint never reveals whether the identifier exists.
 * @param {{ identifier: string }} payload
 */
export function requestPasswordReset({ identifier }) {
  return request({
    method: 'POST',
    path: '/auth/password/forgot',
    body: { email_or_phone: identifier },
  }).then(() => ({ requested: true }))
}

/**
 * PROPOSED. Complete a password reset with the recovery code.
 * @param {{ identifier: string, code: string, newPassword: string }} payload
 */
export function resetPassword({ identifier, code, newPassword }) {
  return request({
    method: 'POST',
    path: '/auth/password/reset',
    body: { email_or_phone: identifier, code, password: newPassword },
  }).then((dto) => ({ ok: Boolean(dto?.ok ?? true) }))
}

/**
 * PROPOSED. Send a verification code to a new recovery email.
 * @param {{ email: string }} payload
 */
export function sendRecoveryEmailOtp({ email }) {
  return request({
    method: 'POST',
    path: '/auth/recovery-email/otp',
    body: { email },
  }).then((dto) => ({
    expiresAt: dto?.expires_at ?? null,
    cooldownSeconds: dto?.cooldown_seconds ?? null,
  }))
}

/**
 * PROPOSED. Verify a recovery email and persist it on the account.
 * @param {{ email: string, code: string }} payload
 * @returns {Promise<import('../../../data/models.js').User>}
 */
export function verifyRecoveryEmail({ email, code }) {
  return request({
    method: 'POST',
    path: '/auth/recovery-email/verify',
    body: { email, code },
  }).then(toUser)
}

/**
 * Resolve the authenticated session's account (null when guest).
 * @returns {Promise<import('../../../data/models.js').User | null>}
 */
export function getCurrentUser() {
  return request({
    path: '/auth/me',
    notFoundAsNull: true,
    unauthorizedAsNull: true,
    unwrapEnvelope: true,
  }).then((dto) => (dto ? toUser(dto) : null))
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
  return request({
    method: 'POST',
    path: '/auth/logout',
    unwrapEnvelope: true,
  }).then(() => undefined)
}