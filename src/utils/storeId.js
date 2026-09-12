/**
 * Shared Store ID validation helpers.
 * Used by both Create Store and My Store so the normalization and format
 * rules are defined in exactly one place (frontend validation follows the
 * backend contract even before the API exists).
 */

export const STORE_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const STORE_ID_FORMAT_MESSAGE =
  'Store ID hanya boleh huruf kecil, angka, dan tanda hubung (-). Contoh: toko-komputer-jaya'

/**
 * Normalize a Store ID candidate: trim and lowercase.
 * @param {string} value
 * @returns {string}
 */
export function normalizeStoreId(value) {
  return value.trim().toLowerCase()
}

/**
 * Validate a raw Store ID candidate.
 * @param {string} value
 * @returns {{ valid: boolean, value: string, message: string }}
 */
export function validateStoreId(value) {
  const formatted = normalizeStoreId(value)
  if (!formatted) {
    return { valid: false, value: formatted, message: 'Store ID wajib diisi.' }
  }
  if (!STORE_ID_PATTERN.test(formatted)) {
    return { valid: false, value: formatted, message: STORE_ID_FORMAT_MESSAGE }
  }
  return { valid: true, value: formatted, message: '' }
}

/**
 * Build the public store URL from the current origin and store ID.
 * Keeps every store URL preview free of hardcoded production domains.
 * The origin is derived from the browser when not provided.
 * @param {string} storeId
 * @param {string} [origin]
 * @returns {string}
 */
export function buildStoreUrl(storeId, origin) {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  const value = String(storeId ?? '').trim()
  return value ? `${base}/${value}` : base
}