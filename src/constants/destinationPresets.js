/**
 * Product external destination presets (V1).
 *
 * Presets determine the icon and label rendered in the UI; the icon -> preset
 * mapping is frontend-owned. The backend never sends or stores icon assets on
 * V1. A destination that matches no preset (or a seller-typed custom name) is
 * rendered with the generic "custom" icon.
 *
 * Store external channels and Product external links share the same generic
 * { name, url } model; presets are only a display helper on top of it.
 */

export const DESTINATION_PRESETS = [
  'Shopee',
  'Tokopedia',
  'Lazada',
  'TikTok Shop',
  'Blibli',
  'Custom',
]

/**
 * Material symbol assigned to each preset (frontend-owned). Unknown channel
 * names fall back to the generic "link" icon.
 */
const PRESET_ICONS = {
  Shopee: 'shopping_bag',
  Tokopedia: 'storefront',
  Lazada: 'local_mall',
  'TikTok Shop': 'music_note',
  Blibli: 'shopping_cart',
  Custom: 'link',
}

const DEFAULT_ICON = 'link'

/**
 * Resolve the display icon for a destination/channel name.
 * @param {string} name - Destination/channel name (case-insensitive match).
 * @returns {string} Material symbol name.
 */
export function destinationIcon(name) {
  const preset = Object.keys(PRESET_ICONS).find(
    (key) => key.toLowerCase() === String(name ?? '').trim().toLowerCase(),
  )
  return preset ? PRESET_ICONS[preset] : DEFAULT_ICON
}

/**
 * Whether a destination name matches one of the V1 presets.
 * @param {string} name
 * @returns {boolean}
 */
export function isDestinationPreset(name) {
  return DESTINATION_PRESETS.some(
    (preset) => preset.toLowerCase() === String(name ?? '').trim().toLowerCase(),
  )
}