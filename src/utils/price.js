/**
 * Price helpers for the seller product form and list.
 * Product stores both a formatted display string and a numeric value.
 */

/**
 * Format a numeric price as "Rp 12.850.000".
 * @param {number} priceValue
 * @returns {string}
 */
export function formatPrice(priceValue) {
  if (!Number.isFinite(priceValue) || priceValue <= 0) {
    return 'Rp 0'
  }
  return `Rp ${priceValue.toLocaleString('id-ID')}`
}

/**
 * Parse a price input into a numeric value, ignoring non-digit characters.
 * @param {string|number} value
 * @returns {number}
 */
export function parsePriceInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  return digits === '' ? 0 : Number(digits)
}

/**
 * Format a raw price input for display while typing, e.g. "12850000" -> "12.850.000".
 * @param {string|number} value
 * @returns {string}
 */
export function formatPriceInput(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits === '') {
    return ''
  }
  return Number(digits).toLocaleString('id-ID')
}