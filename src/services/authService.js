/**
 * Auth service stub.
 * Will call the Authentication API later (Phase 14). Currently reads mock data.
 * The validation helpers are shared by the Login/Register pages so the
 * frontend validation matches whatever normalization the service applies.
 */

import { users, currentUserId } from '../data/mock'
import { withLatency } from './apiClient'
import { isApiMode } from './apiConfig'
import * as authApi from './adapters/api/authApi'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_PATTERN = /^62\d{8,13}$/

/**
 * The currently signed-in account, mirrored from AuthProvider so the mock
 * services can resolve the store owned by the authenticated account. The API
 * version will read the authenticated session instead.
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

/**
 * Normalize a phone number to the 62 format used by the backend contract.
 * @param {string} value
 * @returns {string}
 */
export function normalizePhone(value) {
  let phone = value.replace(/[\s\-()+]/g, '')
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
  return EMAIL_PATTERN.test(value)
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

function matchesIdentifier(user, identifier) {
  if (user.email && user.email === identifier) {
    return true
  }
  if (user.phone && normalizePhone(user.phone) === normalizePhone(identifier)) {
    return true
  }
  return false
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
export function login(payload) {
  if (isApiMode()) {
    return authApi.login(payload)
  }
  const identifier = payload.emailOrPhone.trim()
  const user = users.find((item) => matchesIdentifier(item, identifier))
  if (!user || payload.password.length === 0) {
    return Promise.reject(new Error('Email / no. HP atau password salah. Silakan periksa kembali data akun Anda.'))
  }
  return withLatency(user)
}

/**
 * Register a new account.
 * @param {{ emailOrPhone: string, password: string, repassword: string, name?: string }} payload
 * @returns {Promise<import('../data/models.js').User>}
 */
export function register(payload) {
  if (isApiMode()) {
    return authApi.register(payload)
  }
  if (payload.password !== payload.repassword) {
    return Promise.reject(new Error('Password dan re-password tidak sama.'))
  }
  const user = {
    id: users.length + 1,
    email: isValidEmail(payload.emailOrPhone) ? payload.emailOrPhone : null,
    phone: isValidPhone(payload.emailOrPhone) ? normalizePhone(payload.emailOrPhone) : null,
    name: payload.name || '-',
    hasStore: false,
    storeId: null,
  }
  users.push(user)
  return withLatency(user)
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