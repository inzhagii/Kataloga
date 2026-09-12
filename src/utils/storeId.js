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