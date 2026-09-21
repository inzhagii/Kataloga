/**
 * Auth service.
 *
 * Mock implementation used until the Authentication API lands (Phase 14).
 * When VITE_DATA_SOURCE=api every function delegates to the proposed API
 * adapter. The backend always owns credentials, sessions, OTP expiry/attempts
 * and cooldown; the mock enforces the same LOCKED rules locally so the UX can
 * be validated before the API exists.
 *
 * The frontend never stores passwords, OTP codes or tokens in the browser.
 * The in-memory credential/challenge maps below exist ONLY for the demo mock
 * and are cleared by resetAuthFlowState() between tests.
 */

import { users, currentUserId } from '../data/mock'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as authApi from './adapters/api/authApi'
import { AuthError, AUTH_ERROR_CODE } from './authErrors'
import {
  MIN_PASSWORD_LENGTH,
  OTP_EXPIRY_MS,
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_COOLDOWN_MS,
  OTP_VERIFICATION_TTL_MS,
  OTP_PURPOSE,
} from '../constants/auth'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^62\d{8,13}$/
const OTP_CODE_PATTERN = /^\d{6}$/

/** Demo-only fixed OTP code. Never sent to the API and never logged. */
export const DEMO_OTP_CODE = '123456'

/** @type {Map<string, { code: string, expiresAt: number, attempts: number, lastSentAt: number }>} */
const otpChallenges = new Map()

/** @type {Map<string, string>} Demo-only userId -> password (never serialized). */
const mockCredentials = new Map()

/** @type {Map<string, number>} Short-lived proof that an OTP was verified. */
const verifiedProofs = new Map()

/**
 * The currently signed-in account, mirrored from AuthProvider so the mock
 * services can resolve the store owned by the authenticated account.
 * @type {import('../data/models.js').User | null}
 */
let activeUser = null

/**
 * @param {import('../data/models.js').User | null} user
 */
export function setActiveUser(user) {
  activeUser = user ?? null
}

/**
 * @returns {import('../data/models.js').User | null}
 */
export function getActiveUser() {
  return activeUser
}

/** Clear demo-only OTP/credential state. Called by the shared test setup. */
export function resetAuthFlowState() {
  otpChallenges.clear()
  mockCredentials.clear()
  verifiedProofs.clear()
}

/**
 * Normalize a phone number to the 62 format used by the backend contract.
 * @param {string} value
 * @returns {string}
 */
export function normalizePhone(value) {
  let phone = String(value ?? '').replace(/[\s\-()+]/g, '')
  if (phone.startsWith('0')) {
    phone = '62' + phone.substring(1)
  }
  return phone
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isValidEmail(value) {
  return EMAIL_PATTERN.test(String(value ?? '').trim())
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isValidPhone(value) {
  return PHONE_PATTERN.test(normalizePhone(value))
}

/**
 * Accepts either an email or a phone number.
 * @param {string} value
 * @returns {boolean}
 */
export function isValidIdentifier(value) {
  return isValidEmail(value) || isValidPhone(value)
}

/**
 * Canonical key for OTP challenges: emails are lowercased, phones normalized.
 * @param {string} value
 * @returns {string}
 */
function normalizeIdentifierKey(value) {
  const trimmed = String(value ?? '').trim()
  return isValidEmail(trimmed) ? trimmed.toLowerCase() : normalizePhone(trimmed)
}

function matchesIdentifier(user, identifier) {
  const target = String(identifier ?? '').trim()
  if (user.email && user.email.toLowerCase() === target.toLowerCase()) {
    return true
  }
  if (user.phone && normalizePhone(user.phone) === normalizePhone(target)) {
    return true
  }
  return false
}

function findByIdentifier(identifier) {
  return users.find((item) => matchesIdentifier(item, identifier))
}

function nextUserId() {
  return users.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

function assertPasswordPolicy(password, confirmPassword) {
  if (!password || password.length < MIN_PASSWORD_LENGTH) {
    throw new AuthError({
      code: AUTH_ERROR_CODE.WEAK_PASSWORD,
      message: `Password minimal ${MIN_PASSWORD_LENGTH} karakter.`,
    })
  }
  if (confirmPassword !== undefined && password !== confirmPassword) {
    throw new AuthError({ code: AUTH_ERROR_CODE.PASSWORD_MISMATCH })
  }
}

function assertActiveUser() {
  if (!activeUser) {
    throw new AuthError({ code: AUTH_ERROR_CODE.UNAUTHENTICATED })
  }
  return activeUser
}

/**
 * The email a recovery/change-password code may be delivered to.
 * @param {import('../data/models.js').User} user
 * @returns {string|null}
 */
function deliverableEmail(user) {
  if (user.email && user.emailVerified !== false) {
    return user.email
  }
  if (user.recoveryEmail && user.recoveryEmailVerified) {
    return user.recoveryEmail
  }
  return null
}

/**
 * Issue (or re-issue) an OTP challenge for a purpose/identifier pair.
 * @param {{ identifier: string, purpose: string, enforceCooldown?: boolean }} params
 * @returns {{ expiresAt: string, cooldownSeconds: number }}
 */
function issueOtp({ identifier, purpose, enforceCooldown = true }) {
  const key = `${purpose}:${normalizeIdentifierKey(identifier)}`
  const now = Date.now()
  const existing = otpChallenges.get(key)

  if (enforceCooldown && existing) {
    const elapsed = now - existing.lastSentAt
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const retryAfterSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000)
      throw new AuthError({ code: AUTH_ERROR_CODE.OTP_COOLDOWN, retryAfterSeconds })
    }
  }

  const challenge = {
    code: DEMO_OTP_CODE,
    expiresAt: now + OTP_EXPIRY_MS,
    attempts: 0,
    lastSentAt: now,
  }
  otpChallenges.set(key, challenge)

  return {
    expiresAt: new Date(challenge.expiresAt).toISOString(),
    cooldownSeconds: Math.ceil(OTP_RESEND_COOLDOWN_MS / 1000),
  }
}

/**
 * Verify an OTP challenge. The backend stays authoritative in production;
 * this mirrors expiry, the attempt cap and per-purpose isolation.
 * @param {{ identifier: string, purpose: string, code: string }} params
 * @returns {boolean}
 */
function consumeOtp({ identifier, purpose, code }) {
  const key = `${purpose}:${normalizeIdentifierKey(identifier)}`
  const challenge = otpChallenges.get(key)
  const now = Date.now()

  if (!challenge || now >= challenge.expiresAt) {
    otpChallenges.delete(key)
    throw new AuthError({ code: AUTH_ERROR_CODE.OTP_EXPIRED })
  }

  if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AuthError({ code: AUTH_ERROR_CODE.OTP_ATTEMPTS_EXCEEDED })
  }

  const normalizedCode = String(code ?? '').trim()
  if (!OTP_CODE_PATTERN.test(normalizedCode) || normalizedCode !== challenge.code) {
    challenge.attempts += 1
    if (challenge.attempts >= OTP_MAX_ATTEMPTS) {
      throw new AuthError({ code: AUTH_ERROR_CODE.OTP_ATTEMPTS_EXCEEDED })
    }
    throw new AuthError({
      code: AUTH_ERROR_CODE.OTP_INVALID,
      remainingAttempts: OTP_MAX_ATTEMPTS - challenge.attempts,
    })
  }

  otpChallenges.delete(key)
  return true
}

function grantProof(purpose, userId) {
  verifiedProofs.set(`${purpose}:${userId}`, Date.now() + OTP_VERIFICATION_TTL_MS)
}

function hasValidProof(purpose, userId) {
  const expiresAt = verifiedProofs.get(`${purpose}:${userId}`)
  if (!expiresAt) {
    return false
  }
  if (Date.now() >= expiresAt) {
    verifiedProofs.delete(`${purpose}:${userId}`)
    return false
  }
  return true
}

function clearProof(purpose, userId) {
  verifiedProofs.delete(`${purpose}:${userId}`)
}

/**
 * @returns {Promise<import('../data/models.js').User | undefined>}
 */
export function getCurrentUser() {
  if (isApiMode()) {
    return authApi.getCurrentUser()
  }
  const user = users.find((item) => String(item.id) === String(currentUserId))
  return withLatency(user)
}

/**
 * Login with email or phone + password.
 * @param {{ emailOrPhone: string, password: string }} payload
 * @returns {Promise<import('../data/models.js').User>}
 */
export async function login(payload) {
  if (isApiMode()) {
    return authApi.login(payload)
  }
  const identifier = String(payload.emailOrPhone ?? '').trim()
  const user = findByIdentifier(identifier)

  if (!user) {
    throw new AuthError({ code: AUTH_ERROR_CODE.INVALID_CREDENTIALS })
  }

  const stored = mockCredentials.get(String(user.id))
  const password = String(payload.password ?? '')
  if (stored !== undefined ? password !== stored : password.length === 0) {
    throw new AuthError({ code: AUTH_ERROR_CODE.INVALID_CREDENTIALS })
  }

  if (user.email && user.emailVerified === false) {
    try {
      issueOtp({ identifier: user.email, purpose: OTP_PURPOSE.REGISTER, enforceCooldown: true })
    } catch {
      // Cooldown already running: the existing challenge is still usable.
    }
    throw new AuthError({
      code: AUTH_ERROR_CODE.EMAIL_UNVERIFIED,
      message: `Email ${user.email} belum diverifikasi. Verifikasi untuk melanjutkan.`,
    })
  }

  return withLatency(user)
}

/**
 * Register a new account.
 *
 * Email registration returns `{ requiresVerification: true }` and does NOT
 * authenticate the user until the OTP is verified. Phone registration is
 * active immediately but still needs a verified recovery email before email
 * password recovery is possible.
 *
 * @param {{ emailOrPhone: string, password: string, repassword: string, name?: string }} payload
 * @returns {Promise<{ user: import('../data/models.js').User, requiresVerification: boolean, identifier: string|null, channel: 'email'|'phone'|null }>}
 */
export async function register(payload) {
  if (isApiMode()) {
    return authApi.register(payload)
  }

  const identifier = String(payload.emailOrPhone ?? '').trim()
  if (!isValidIdentifier(identifier)) {
    throw new AuthError({ code: AUTH_ERROR_CODE.INVALID_IDENTIFIER })
  }
  assertPasswordPolicy(payload.password, payload.repassword)

  const email = isValidEmail(identifier) ? identifier.toLowerCase() : null
  const phone = isValidPhone(identifier) ? normalizePhone(identifier) : null

  const duplicate = users.some(
    (item) =>
      (email && item.email && item.email.toLowerCase() === email) ||
      (phone && item.phone && normalizePhone(item.phone) === phone),
  )
  if (duplicate) {
    throw new AuthError({ code: AUTH_ERROR_CODE.DUPLICATE_IDENTIFIER })
  }

  const user = {
    id: nextUserId(),
    email,
    phone,
    name: typeof payload.name === 'string' && payload.name.trim() ? payload.name.trim() : '-',
    hasStore: false,
    storeId: null,
    avatarUrl: undefined,
    emailVerified: phone ? true : false,
    recoveryEmail: null,
    recoveryEmailVerified: false,
  }
  users.push(user)
  mockCredentials.set(String(user.id), payload.password)

  if (email) {
    issueOtp({ identifier: email, purpose: OTP_PURPOSE.REGISTER, enforceCooldown: false })
    return { user, requiresVerification: true, identifier: email, channel: 'email' }
  }

  return { user, requiresVerification: false, identifier: phone, channel: 'phone' }
}

/**
 * Verify an email-registration code and activate the account.
 * @param {{ identifier: string, code: string }} payload
 * @returns {Promise<import('../data/models.js').User>}
 */
export async function verifyRegistration({ identifier, code }) {
  if (isApiMode()) {
    return authApi.verifyRegistration({ identifier, code })
  }
  const user = findByIdentifier(identifier)
  if (!user) {
    throw new AuthError({ code: AUTH_ERROR_CODE.INVALID_CREDENTIALS })
  }
  consumeOtp({ identifier, purpose: OTP_PURPOSE.REGISTER, code })
  user.emailVerified = true
  return withLatency(user)
}

/**
 * Resend the email-registration code (subject to the resend cooldown).
 * @param {{ identifier: string }} payload
 */
export async function resendRegistrationOtp({ identifier }) {
  if (isApiMode()) {
    return authApi.resendRegistrationOtp({ identifier })
  }
  const user = findByIdentifier(identifier)
  if (!user || !user.email) {
    throw new AuthError({ code: AUTH_ERROR_CODE.INVALID_CREDENTIALS })
  }
  return {
    ...issueOtp({ identifier: user.email, purpose: OTP_PURPOSE.REGISTER }),
    demoCode: DEMO_OTP_CODE,
  }
}

/**
 * Step 1 of change password: send a code to the account's verified email.
 * @param {{ email: string }} payload
 */
export async function requestChangePasswordOtp({ email }) {
  if (isApiMode()) {
    return authApi.requestChangePasswordOtp({ email })
  }
  const user = assertActiveUser()
  const target = String(email ?? '').trim().toLowerCase()
  const allowed = [user.email, user.recoveryEmailVerified ? user.recoveryEmail : null]
    .filter(Boolean)
    .map((value) => value.toLowerCase())
  if (!allowed.includes(target)) {
    throw new AuthError({ code: AUTH_ERROR_CODE.EMAIL_MISMATCH })
  }
  return {
    ...issueOtp({ identifier: target, purpose: OTP_PURPOSE.CHANGE_PASSWORD }),
    demoCode: DEMO_OTP_CODE,
  }
}

/**
 * Step 2 of change password: verify the code, granting a short-lived proof.
 * @param {{ email: string, code: string }} payload
 */
export async function verifyChangePasswordOtp({ email, code }) {
  if (isApiMode()) {
    return authApi.verifyChangePasswordOtp({ email, code })
  }
  const user = assertActiveUser()
  const target = String(email ?? '').trim().toLowerCase()
  consumeOtp({ identifier: target, purpose: OTP_PURPOSE.CHANGE_PASSWORD, code })
  grantProof(OTP_PURPOSE.CHANGE_PASSWORD, user.id)
  return withLatency({ verified: true })
}

/**
 * Step 3 of change password: requires the OTP proof from step 2.
 * @param {{ currentPassword: string, newPassword: string, confirmPassword?: string }} payload
 */
export async function changePassword({ currentPassword, newPassword, confirmPassword }) {
  if (isApiMode()) {
    return authApi.changePassword({ currentPassword, newPassword })
  }
  const user = assertActiveUser()
  if (!hasValidProof(OTP_PURPOSE.CHANGE_PASSWORD, user.id)) {
    throw new AuthError({ code: AUTH_ERROR_CODE.OTP_NOT_VERIFIED })
  }
  assertPasswordPolicy(newPassword, confirmPassword)

  const stored = mockCredentials.get(String(user.id))
  if (stored !== undefined ? String(currentPassword ?? '') !== stored : !currentPassword) {
    throw new AuthError({ code: AUTH_ERROR_CODE.INVALID_CURRENT_PASSWORD })
  }

  mockCredentials.set(String(user.id), newPassword)
  clearProof(OTP_PURPOSE.CHANGE_PASSWORD, user.id)
  return withLatency({ ok: true })
}

/**
 * Request a password-reset code. Always resolves with a generic result so the
 * response never reveals whether the identifier belongs to an account.
 * @param {{ identifier: string }} payload
 */
export async function requestPasswordReset({ identifier }) {
  if (isApiMode()) {
    return authApi.requestPasswordReset({ identifier })
  }
  const user = findByIdentifier(identifier)
  const target = user ? deliverableEmail(user) : null
  if (target) {
    try {
      issueOtp({ identifier, purpose: OTP_PURPOSE.RECOVERY, enforceCooldown: false })
    } catch {
      // Defensive: recovery re-requests are allowed from the reset page.
    }
  }
  return { requested: true, demoCode: target ? DEMO_OTP_CODE : null }
}

/**
 * Complete a password reset with the recovery code.
 * @param {{ identifier: string, code: string, newPassword: string, confirmPassword?: string }} payload
 */
export async function resetPassword({ identifier, code, newPassword, confirmPassword }) {
  if (isApiMode()) {
    return authApi.resetPassword({ identifier, code, newPassword })
  }
  assertPasswordPolicy(newPassword, confirmPassword)
  const user = findByIdentifier(identifier)
  if (!user) {
    throw new AuthError({ code: AUTH_ERROR_CODE.OTP_EXPIRED })
  }
  consumeOtp({ identifier, purpose: OTP_PURPOSE.RECOVERY, code })
  mockCredentials.set(String(user.id), newPassword)
  return withLatency({ ok: true })
}

/**
 * Send a code to a new recovery email for the authenticated account.
 * @param {{ email: string }} payload
 */
export async function sendRecoveryEmailOtp({ email }) {
  if (isApiMode()) {
    return authApi.sendRecoveryEmailOtp({ email })
  }
  assertActiveUser()
  const target = String(email ?? '').trim().toLowerCase()
  if (!isValidEmail(target)) {
    throw new AuthError({ code: AUTH_ERROR_CODE.INVALID_IDENTIFIER })
  }
  return {
    ...issueOtp({ identifier: target, purpose: OTP_PURPOSE.RECOVERY_EMAIL }),
    demoCode: DEMO_OTP_CODE,
  }
}

/**
 * Verify a recovery-email code and persist it on the authenticated account.
 * @param {{ email: string, code: string }} payload
 * @returns {Promise<import('../data/models.js').User>}
 */
export async function verifyRecoveryEmail({ email, code }) {
  if (isApiMode()) {
    return authApi.verifyRecoveryEmail({ email, code })
  }
  const active = assertActiveUser()
  const target = String(email ?? '').trim().toLowerCase()
  consumeOtp({ identifier: target, purpose: OTP_PURPOSE.RECOVERY_EMAIL, code })

  const index = users.findIndex((item) => String(item.id) === String(active.id))
  const updated = {
    ...(index === -1 ? active : users[index]),
    recoveryEmail: target,
    recoveryEmailVerified: true,
  }
  if (index !== -1) {
    users[index] = updated
  }
  return withLatency(updated)
}

/**
 * Update the authenticated account's profile fields and persist to the mock.
 * Email/phone are the login identifiers, so they are re-validated with the
 * same normalization used by the rest of the auth flow.
 * @param {number|string} userId
 * @param {Partial<import('../data/models.js').User>} payload
 * @returns {Promise<import('../data/models.js').User>}
 */
export function updateCurrentUser(userId, payload) {
  if (isApiMode()) {
    return authApi.updateCurrentUser(userId, payload)
  }
  const index = users.findIndex((item) => String(item.id) === String(userId))
  if (index === -1) {
    return Promise.reject(new Error('Akun tidak ditemukan.'))
  }

  const email = payload.email === undefined ? undefined : payload.email.trim()
  if (email !== undefined && email && !isValidEmail(email)) {
    return Promise.reject(new Error('Format email tidak valid.'))
  }

  const rawPhone = payload.phone === undefined ? undefined : payload.phone.trim()
  if (rawPhone !== undefined && rawPhone && !isValidPhone(rawPhone)) {
    return Promise.reject(new Error('Format nomor HP tidak valid.'))
  }

  const updated = {
    ...users[index],
    name: payload.name === undefined ? users[index].name : payload.name.trim() || '-',
    email: email === undefined ? users[index].email : email,
    phone: rawPhone === undefined ? users[index].phone : rawPhone ? normalizePhone(rawPhone) : '',
    avatarUrl: payload.avatarUrl === undefined ? users[index].avatarUrl : payload.avatarUrl,
  }
  users[index] = updated
  return withLatency(updated)
}

/**
 * @returns {Promise<void>}
 */
export function logout() {
  if (isApiMode()) {
    return authApi.logout()
  }
  return withLatency(undefined)
}
