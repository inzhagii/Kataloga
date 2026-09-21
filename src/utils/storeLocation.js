/**
 * Customer-facing store location helpers shared by the storefront navbar,
 * store header and footer. Location is `City, Province` (City first, per
 * docs/UI_RULES.md); the full address is only used for a Google Maps search.
 */

/**
 * Compact "City, Province" label. Falls back to whichever part exists, then
 * to "-" so the UI never renders an empty location.
 * @param {import('../data/models.js').Store | null | undefined} store
 * @returns {string}
 */
export function storeLocationLabel(store) {
  if (!store) {
    return '-'
  }
  if (store.city && store.province) {
    return `${store.city}, ${store.province}`
  }
  return store.city || store.province || '-'
}

/**
 * Build a Google Maps search URL from a free-text address. Returns null when
 * there is no address, so callers can omit the action entirely instead of
 * linking to an empty query.
 * @param {string | null | undefined} address
 * @returns {string | null}
 */
export function buildMapsSearchUrl(address) {
  const query = String(address ?? '').trim()
  if (!query) {
    return null
  }
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
